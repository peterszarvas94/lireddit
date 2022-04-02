import { MyContext } from "../types";
import { Ctx, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {

	//@ts-ignore
	@Query(returns => [Post])
	posts(@Ctx() {em} : MyContext) {
		return em.find(Post, {})
	}
}