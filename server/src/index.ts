import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session, { CookieOptions } from "express-session";
import connectRedis from "connect-redis";
import { COOKIE_NAME, FRONTEND_SERVER, __prod__ } from "./constants";
import { MyContext } from "./types";
import cors from "cors";
import { myDataSource } from "./utils/myDataSource";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";
// import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const main = async () => {
	await myDataSource.initialize();

	// ! triggering migration:
	// const conn = await myDataSource.initialize()
	// await conn.runMigrations();

	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis();

	app.use(
		cors({
			origin: ["https://studio.apollographql.com", `${FRONTEND_SERVER}`],
			credentials: true,
		})
	);

	let frontend: Boolean = true;

	// frontend = false;

	const cookieSettings: CookieOptions = frontend
		? {
				// ! for font-end to work
				httpOnly: true,
				sameSite: "lax", // csrf
				secure: __prod__, // cookie only works in https
		  }
		: {
				// ! for apollo playgound to work
				httpOnly: false,
				sameSite: "none",
				secure: true,
		  };

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				...cookieSettings,
			},
			secret: "qwizhieuafbkjdnvoisdksowesd",
			resave: false,
			saveUninitialized: false,
		})
	);

	app.set("trust proxy", 1);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({
			req,
			res,
			redis,
			userLoader: createUserLoader(),
			updootLoader: createUpdootLoader(),
		}),
		// plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
	});

	await apolloServer.start();

	apolloServer.applyMiddleware({ app, cors: false });

	// apolloServer.applyMiddleware({
	// 	app,
	// 	cors: {
	// 		origin: ["https://studio.apollographql.com", "http://localhost:3000"],
	// 		credentials: true,
	// 	},
	// });

	app.listen(4000, () => {
		console.log("server started on localhost:4000");
	});
};

main().catch((err) => {
	console.error("Err: ", err);
});
