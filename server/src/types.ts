import DataLoader from "dataloader";
import { Request, Response } from "express";
import "express-session";
import { Session } from "express-session";
import Redis from "ioredis";
import { User } from "./entities/User";
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export type MyContext = {
  req: Request & {session?: Session};
  res: Response;
  redis: Redis;
  userLoader: DataLoader<number, User, number>;
  // userLoader: ReturnType<typeof createUserLoader>;
}

