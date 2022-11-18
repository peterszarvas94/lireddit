import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { myDataSource } from "../utils/myDataSource";

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

@Resolver(() => Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : 0;
		const { userId } = req.session;
		// await Updoot.insert({
		// 	userId,
		// 	postId,
		// 	value: realValue,
		// });
		//await Post.update(...?)

		await myDataSource.query(
			`
				START TRANSACTION;

				insert into updoot ("userId", "postId", value)
				values (${userId},${postId},${realValue});

				update post
				set points = points + ${realValue}
				where id = ${postId};

				COMMIT;
			`
		);

		return true;
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg("limit", () => Int) limit: number,
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		// user asks for 20 -> we check next 21 posts
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;

		const replacements: any[] = [realLimitPlusOne];

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}

		const posts = await myDataSource.query(
			`
				select p.*,
				json_build_object(
					'id', u.id,
					'username', u.username,
					'email', u.email,
					'createdAt', u."createdAt",
					'updatedAt', u."updatedAt"
				) creator
				from post p
				inner join public.user u on u.id = p."creatorId"
				${cursor ? `where p."createdAt" < $2` : ``}
				order by p."createdAt" DESC
				limit $1
			`,
			replacements
		);

		/*
		const qb = myDataSource
			.getRepository(Post)
			.createQueryBuilder("p")
			.leftJoinAndSelect("p.creator", "u", 'u.id = "p.creatorId"')
			.orderBy('p."createdAt"', "DESC")
			.take(realLimitPlusOne);

		if (cursor) {
			qb.where('p."createdAt" < :cursor', {
				cursor: new Date(parseInt(cursor)),
			});
		}

		const posts = await qb.getMany();
		*/

		// console.log(posts);

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id") id: number): Promise<Post | null> {
		return Post.findOne({ where: { id } });
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		return Post.create({
			...input,
			creatorId: req.session.userId,
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title", () => String, { nullable: true }) title: string
	): Promise<Post | null> {
		const post = await Post.findOne({ where: { id } });
		if (!post) {
			return null;
		}
		if (typeof title !== undefined) {
			post.title = title;
			Post.update({ id }, { title });
		}
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id") id: string): Promise<boolean> {
		await Post.delete(id);
		return true;
	}
}
