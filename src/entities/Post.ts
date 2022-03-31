import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from 'uuid';

@Entity()
export class Post {
	@PrimaryKey()
	id: string = v4();

	@Property({ type: "date" })
	createdAt? = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt? = new Date();

	@Property({ type: "text" })
	title!: string;
}
