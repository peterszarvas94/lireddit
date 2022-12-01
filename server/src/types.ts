import DataLoader from "dataloader";
import { Request, Response } from "express";
import "express-session";
import { Session } from "express-session";
import Redis from "ioredis";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";
declare module "express-session" {
	interface SessionData {
		userId: number;
	}
}

export type MyContext = {
	req: Request & { session?: Session };
	res: Response;
	redis: Redis;
	userLoader: DataLoader<number, User, number>;
	updootLoader: DataLoader<
		{ postId: number; userId: number },
		Updoot | null,
		{ postId: number; userId: number }
	>;
	// userLoader: ReturnType<typeof createUserLoader>;
	// updootLoader: ReturnType<typeof createUpdootLoader>;
};
