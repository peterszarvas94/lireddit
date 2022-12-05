import { Cache, cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
	Exchange,
	dedupExchange,
	fetchExchange,
	stringifyVariables,
} from "urql";
import {
	DeletePostMutationVariables,
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
	VoteMutationVariables,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import Router from "next/router";
import { gql } from "@urql/core";
import { isServer } from "./isServer";

const errorExchange: Exchange =
	({ forward }) =>
	(ops$) => {
		return pipe(
			forward(ops$),
			tap(({ error }) => {
				if (error) {
					if (error?.message.includes("not authenticated")) {
						Router.replace("/login");
					}
				}
			})
		);
	};

const cursorPagination = (/*, mergeMode = "after",*/): Resolver => {
	return (_parent, fieldArgs, cache, info) => {
		const { parentKey: entityKey, fieldName } = info;

		const allFields = cache.inspectFields(entityKey);

		//filter queries from cache, only which we want:
		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

		//check if the data is in the cache
		const isItInTheCache = cache.resolve(
			cache.resolve(entityKey, fieldKey) as string,
			"posts"
		);

		//fetch partial data from server, if not in the cache:
		info.partial = !isItInTheCache;

		const results: string[] = [];
		let hasMore: boolean = true;

		fieldInfos.forEach((fi) => {
			const key = cache.resolve(entityKey, fi.fieldKey) as string;
			const data = cache.resolve(key, "posts") as string[];
			const _hasMore = cache.resolve(key, "hasMore");

			if (!_hasMore) {
				hasMore = _hasMore as boolean;
			}

			results.push(...data);
		});

		const obj = {
			__typename: "PaginatedPosts",
			hasMore,
			posts: results,
		};

		return obj;
	};
};

const invalidateAllPosts = (cache: Cache) => {
	cache
		.inspectFields("Query")
		.filter((field) => field.fieldName === "posts")
		.forEach((field) => {
			cache.invalidate("Query", "posts", field.arguments || {});
		});
};

const updateDootCache = (
	newPoints: number,
	newStatus: number | null,
	cache: Cache,
	postId: VoteMutationVariables["postId"]
) => {
	cache.writeFragment(
		gql`
			fragment __ on Post {
				points
				voteStatus
			}
		`,
		{
			id: postId,
			points: newPoints,
			voteStatus: newStatus,
		} as any
	);
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
	let cookie = "";
	if (isServer()) {
		cookie = ctx?.req?.headers?.cookie;
	}

	return {
		url: process.env.NEXT_PUBLIC_API_URL as string,
		fetchOptions: {
			credentials: "include" as const,
			headers: cookie
				? {
						cookie,
				  }
				: undefined,
		},
		exchanges: [
			dedupExchange,
			cacheExchange({
				keys: {
					PaginatedPosts: () => null,
				},
				resolvers: {
					Query: {
						posts: cursorPagination(),
					},
				},
				updates: {
					Mutation: {
						deletePost: (_result, args, cache, _info) => {
							cache.invalidate({
								__typename: "Post",
								id: (args as DeletePostMutationVariables).id,
							});
						},
						vote: (_result, args, cache, _info) => {
							const { postId, value } = args as VoteMutationVariables;
							const data = cache.readFragment(
								gql`
									fragment __ on Post {
										id
										points
										voteStatus
									}
								`,
								{ id: postId } as any
							);

							if (data) {
								const { voteStatus, points } = data;

								if (voteStatus === null) {
									return updateDootCache(points + value, value, cache, postId);
								}
								if (voteStatus === value) {
									return updateDootCache(points - value, null, cache, postId);
								}
								if (value !== null && voteStatus === -value) {
									return updateDootCache(
										points + 2 * value,
										value,
										cache,
										postId
									);
								}
							}
						},

						createPost: (_result, _args, cache, _info) => {
							invalidateAllPosts(cache);
						},

						logout: (result, _args, cache, _info) => {
							betterUpdateQuery<LogoutMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								result,
								() => ({ me: null })
							);

							invalidateAllPosts(cache);
						},

						login: (result, _args, cache, _info) => {
							betterUpdateQuery<LoginMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								result,
								(queryResult, query) => {
									if (queryResult.login.errors) {
										return query;
									} else {
										return {
											me: queryResult.login.user,
										};
									}
								}
							);

							invalidateAllPosts(cache);
						},

						register: (result, _args, cache, _info) => {
							betterUpdateQuery<RegisterMutation, MeQuery>(
								cache,
								{ query: MeDocument },
								result,
								(queryResult, query) => {
									if (queryResult.register.errors) {
										return query;
									} else {
										return {
											me: queryResult.register.user,
										};
									}
								}
							);
						},
					},
				},
			}),
			errorExchange,
			ssrExchange,
			fetchExchange,
		],
	};
};
