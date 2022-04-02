import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
// import { v4 } from 'uuid';

// @ObjectType('Post')
// @Entity()
// export class Post {
// 	@Field()
// 	@PrimaryKey()
// 	id: string = v4();

// 	@Field(() => String)
// 	@Property({ type: "date" })
// 	createdAt? = new Date();

// 	@Field(() => String)
// 	@Property({ type: "date", onUpdate: () => new Date() })
// 	updatedAt? = new Date();

// 	@Field( )
// 	@Property({ type: "text" })
// 	title!: string;
// }

@Entity()
@ObjectType()
export class Post {
	@Field( )
	@PrimaryKey()
	id!: string;

	@Field(() => String)
	@Property({ type: "date" })
	createdAt? = new Date();

	@Field(() => String)
	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt? = new Date();

	@Field()
	@Property({ type: "text" })
	title!: string;
}