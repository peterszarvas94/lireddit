import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__ } from "./constants";
import { MyContext } from "./types";
// import cors from 'cors';

const main = async () => {
	const orm = await MikroORM.init(mikroConfig);
	orm.getMigrator().up();

	const app = express();

	const RedisStore = connectRedis(session);

	const redisClient = createClient({ legacyMode: true });
	redisClient.connect().catch(console.error);

	app.use(
		session({
			name: "qid",
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				// httpOnly: true,
				httpOnly: false,
				// sameSite: "lax", // csrf
				sameSite: "none",
				// secure: __prod__, //cookie only works in https
				secure: true,
			},
			secret: "qwizhieuafbkjdnvoisdksowesd",
			resave: false,
			saveUninitialized: true,
		})
	);

	app.set('trust proxy', 1);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({ em: orm.em.fork(), req, res }),
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({
		app,
		cors: {
			origin: ["https://studio.apollographql.com"],
			credentials: true,
		},
	});

	app.listen(4000, () => {
		console.log("server started on localhost:4000");
	});
};

main().catch((err) => {
	console.error(err);
});
