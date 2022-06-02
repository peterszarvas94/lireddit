import { EntityManager } from "@mikro-orm/core";
import { Request, Response } from "express";
import "express-session";
import { Session } from "express-session";
import Redis from "ioredis";
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export type MyContext = {
  em: EntityManager;
  req: Request & {session?: Session};
  res: Response;
  redis: Redis;
}

