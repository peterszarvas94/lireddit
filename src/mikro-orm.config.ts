import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
	migrations: {
		path: path.join(__dirname, "./migrations"),
		glob: "!(*.d).{js,ts}",
	},
	type: "postgresql",
	entities: [Post, User],
	dbName: "lireddit",
	user: "postgres",
	password: "postgres",
	debug: !__prod__,
	allowGlobalContext: true
} as Parameters<typeof MikroORM.init>[0];
