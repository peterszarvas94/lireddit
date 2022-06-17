import { Field, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
// import { v4 } from 'uuid';

@ObjectType("Post")
@Entity()
export class Post extends BaseEntity{
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;
	// id: string = v4();

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;

	@Field()
	@Column()
	title!: string;
}