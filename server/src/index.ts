import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
import { createUpdootLoader } from "./utils/createUpdootLoader";
import { createUserLoader } from "./utils/createUserLoader";
import { myDataSource } from "./utils/myDataSource";
// import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const main = async () => {
	// await myDataSource.initialize();

	// ! triggering migration:
	const conn = await myDataSource.initialize()
	await conn.runMigrations()

	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis(process.env.REDIS_URL);

	let playground: Boolean = false;

	app.set("proxy", 1);
	app.use(
		cors({
			origin: playground
				? ["https://studio.apollographql.com"]
				: [process.env.CORS_ORIGIN],
			credentials: true,
		})
	);

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: !playground,
				sameSite: playground ? "none" : "lax",
				secure: playground ? true : __prod__,
				domain: __prod__ ? ".playingdeer.hu" : undefined,
			},
			secret: process.env.SESSION_SECRET,
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

	app.listen(parseInt(process.env.PORT), () => {
		console.log("server started on localhost:4000");
	});
};

main().catch((err) => {
	console.error("Err: ", err);
});
