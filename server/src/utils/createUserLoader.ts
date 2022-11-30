import DataLoader from "dataloader";
import { In } from "typeorm";
import { User } from "../entities/User";

export const createUserLoader = () =>
	new DataLoader<number, User>(async (userids) => {
		const users = await User.findBy({ id: In(userids as number[]) });
		const userIdToUser: Record<number, User> = {};
		users.forEach((u) => {
			userIdToUser[u.id] = u;
		});

		return userids.map((userId) => userIdToUser[userId]);
	});
