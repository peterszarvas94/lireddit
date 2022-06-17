import { DataSource } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";

export const myDataSource = new DataSource({
	type: "postgres",
	database: "lireddit2",
	username: "postgres",
	password: "postgres",
	logging: true,
	synchronize: true,
	entities: [Post, User],
});
