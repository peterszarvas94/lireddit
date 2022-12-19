import "dotenv-safe/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { Post } from "../entities/Post";
import { User } from "../entities/User";
import path from "path";
import { Updoot } from "../entities/Updoot";
import { __prod__ } from "../constants";

export let myPath = "";

if (require.main) {
	myPath = path.join(path.dirname(require.main?.filename), "/migrations/*");
}

const dataScorceOption : DataSourceOptions = __prod__
	? {
			type: "postgres",
			url: process.env.DATABASE_URL,
			logging: true,
			synchronize: !__prod__,
			migrations: [myPath],
			entities: [Post, User, Updoot],
	  }
	: {
			type: "postgres",
			// host: "localhost",
			// port: 5432,
			// username: "postgres",
			// password: "postgres",
			// database: "lireddit2",
			url: process.env.DATABASE_URL,
			entities: ["dist/entities/*.js"],
			migrations: ["dist/migrations/*.js"],
	  };

export const myDataSource = new DataSource({ ...dataScorceOption });
