import DataLoader from "dataloader";
import { In } from "typeorm";
import { Updoot } from "../entities/Updoot";

export const createUpdootLoader = () =>
	new DataLoader<{ postId: number; userId: number }, Updoot | null>(
		async (keys) => {
			const updoots = await Updoot.findBy({
				userId: In(keys.map((key) => key.userId)),
				postId: In(keys.map((key) => key.postId)),
			});
			const updootIdToUpdoot: Record<string, Updoot> = {};
			updoots.forEach((updoot) => {
				updootIdToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
			});

			return keys.map((key) => updootIdToUpdoot[`${key.userId}|${key.postId}`]);
		}
	);
