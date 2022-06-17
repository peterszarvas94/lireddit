import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";
import {
	COOKIE_NAME,
	FORGET_PASSWORD_PREFIX,
	FRONTEND_SERVER,
} from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { myDataSource } from "../utils/myDataSource";

@ObjectType()
class FieldError {
	@Field()
	field: string;

	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[];

	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Mutation(() => UserResponse)
	async changePassword(
		@Arg("token") token: string,
		@Arg("newPassword") newPassword: string,
		@Ctx() { redis, req }: MyContext
	): Promise<UserResponse> {
		if (newPassword.length <= 2) {
			return {
				errors: [
					{
						field: "newPassword",
						message: "length must be greated than 2",
					},
				],
			};
		}

		const key = FORGET_PASSWORD_PREFIX + token;
		const userId = await redis.get(key);
		if (!userId) {
			return {
				errors: [
					{
						field: "token",
						message: "token expired",
					},
				],
			};
		}

		const userIdNum = parseInt(userId);
		const user = await User.findOne({ where: { id: userIdNum } });

		if (!user) {
			return {
				errors: [
					{
						field: "token",
						message: "user no longer exists",
					},
				],
			};
		}

		await User.update(
			{ id: userIdNum },
			{ password: await argon2.hash(newPassword) }
		);

		await redis.del(key);

		// log in user after change password
		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Arg("email") email: string,
		@Ctx() { redis, res }: MyContext
	) {
		res.clearCookie(COOKIE_NAME);

		const user = await User.findOne({ where: { email } });
		if (!user) {
			//the email is not in the db
			return true;
		}

		const token = v4();

		await redis.set(
			FORGET_PASSWORD_PREFIX + token,
			user.id,
			"EX",
			1000 * 60 * 60 * 24 * 3
		); // 3 days

		sendEmail(
			email,
			`<a href="${FRONTEND_SERVER}/change-password/${token}">reset password</a>`
		);

		return true;
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() { req }: MyContext) {
		// console.log('session: ', req.session);

		if (!req.session.userId) {
			return null;
		}
		return User.findOne({ where: { id: req.session.userId } });
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("options") options: UsernamePasswordInput,
		@Ctx() { req, res }: MyContext
	): Promise<UserResponse> {
		res.clearCookie(COOKIE_NAME);

		const errors = validateRegister(options);
		if (errors) {
			return { errors };
		}

		const hashedPassword = await argon2.hash(options.password);

		let user;
		try {

			// User.create({
			// 	username: options.username,
			// 	email: options.email,
			// 	password: hashedPassword,
			// }).save();

			const result = await myDataSource
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({
					username: options.username,
					email: options.email,
					password: hashedPassword,
				})
				.returning("*")
				.execute();

			console.log("result: ", result);
			user = result.raw[0];
		} catch (err) {
			//duplicate username error
			// || err.detail.includes("already exists")

			if (err.code === "23505") {
				return {
					errors: [
						{
							field: "username",
							message: "username already taken",
						},
					],
				};
			}
		}
		//login the user the same time as they register
		req.session.userId = user.id;

		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("usernameOrEmail") usernameOrEmail: string,
		@Arg("password") password: string,
		@Ctx() { req, res }: MyContext
	): Promise<UserResponse> {
		res.clearCookie(COOKIE_NAME);

		const user = await User.findOne(
			usernameOrEmail.includes("@")
				? { where: { email: usernameOrEmail } }
				: { where: { username: usernameOrEmail } }
		);

		if (!user) {
			return {
				errors: [
					{
						field: "usernameOrEmail",
						message: "that username doesn't exist",
					},
				],
			};
		}
		const valid = await argon2.verify(user.password, password);
		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "incorrect password",
					},
				],
			};
		}

		req.session.userId = user.id;

		return { user };
	}

	@Query(() => [User])
	users(): Promise<User[]> {
		return User.find({ order: { id: "ASC" } });
	}

	@Mutation(() => Boolean)
	async deleteUser(@Arg("id") id: number): Promise<boolean> {
		await User.delete(id);
		return true;
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { req, res }: MyContext) {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME);
				if (err) {
					console.log(err);
					resolve(false);
					return;
				}
				resolve(true);
			})
		);

		// req.session.destroy((err) => {
		// 	res.clearCookie(COOKIE_NAME);
		// 	if (err) {
		// 		console.log(err);
		// 		return false;
		// 	}
		// 	return true;
		// });
	}
}
