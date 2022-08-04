import { DataSource } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import path from "path";

export let myPath = "";

if (require.main) {
	myPath = path.join(path.dirname(require.main?.filename), '/migrations/*');
}

export const myDataSource = new DataSource({
	type: "postgres",
	database: "lireddit2",
	username: "postgres",
	password: "postgres",
	logging: true,
	synchronize: true,
	migrations: [myPath],
	entities: [Post, User],
});
