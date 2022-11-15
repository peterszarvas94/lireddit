import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import {
	Exchange,
	dedupExchange,
	fetchExchange,
	stringifyVariables,
} from "urql";
import {
	LoginMutation,
	LogoutMutation,
	MeDocument,
	MeQuery,
	RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { pipe, tap } from "wonka";
import Router from "next/router";

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

		// console.log("entityKey: ", entityKey, ", fieldName: ", fieldName);
		//entityKey: Query
		//fieldName: posts

		const allFields = cache.inspectFields(entityKey);
		// console.log("allFields: ", allFields);
		// allFields [
		//   {
		//     fieldKey: 'posts({"limit":10})',
		//     fieldName: 'posts',
		//     arguments: { limit: 10 }
		//   }
		// ]

		//filter queries from cache, only which we want:
		const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
		const size = fieldInfos.length;
		if (size === 0) {
			return undefined;
		}

		// console.log("fieldArgs: ", fieldArgs);

		const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
		// console.log("fieldKey we created: ", fieldKey);
		// 'posts({"limit":10})'

		//check if the data is in the cache
		const isItInTheCache = cache.resolve(
			cache.resolve(entityKey, fieldKey) as string,
			"posts"
		);
		// console.log("isItInTheCache: ", isItInTheCache);

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

			// console.log("data: ", data);
			// console.log("hasMore: ", hasMore);

			results.push(...data);
		});

		const obj = {
			__typename: "PaginatedPosts",
			hasMore,
			posts: results,
		};
		// console.log("thing returned: ", obj);

		return obj;

		/*
		const visited = new Set();
		let result: NullArray<string> = [];
		let prevOffset: number | null = null;

		for (let i = 0; i < size; i++) {
			const { fieldKey, arguments: args } = fieldInfos[i];
			if (args === null || !compareArgs(fieldArgs, args)) {
				continue;
			}

			const links = cache.resolve(entityKey, fieldKey) as string[];
			const currentOffset = args[cursorArgument];

			if (
				links === null ||
				links.length === 0 ||
				typeof currentOffset !== "number"
			) {
				continue;
			}

			const tempResult: NullArray<string> = [];

			for (let j = 0; j < links.length; j++) {
				const link = links[j];
				if (visited.has(link)) continue;
				tempResult.push(link);
				visited.add(link);
			}

			if (
				(!prevOffset || currentOffset > prevOffset) ===
				(mergeMode === "after")
			) {
				result = [...result, ...tempResult];
			} else {
				result = [...tempResult, ...result];
			}

			prevOffset = currentOffset;
		}

		const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
		if (hasCurrentPage) {
			return result;
		} else if (!(info as any).store.schema) {
			return undefined;
		} else {
			info.partial = true;
			return result;
		}
*/
	};
};

export const createUrqlClient = (ssrExchange: any) => ({
	url: "http://localhost:4000/graphql",
	fetchOptions: {
		credentials: "include" as const,
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
					//@ts-expect-error
					logout: (_result, args, cache, info) => {
						betterUpdateQuery<LogoutMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							_result,
							() => ({ me: null })
						);
					},

					//@ts-expect-error
					login: (_result, args, cache, info) => {
						betterUpdateQuery<LoginMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							_result,
							(result, query) => {
								if (result.login.errors) {
									return query;
								} else {
									return {
										me: result.login.user,
									};
								}
							}
						);
					},

					//@ts-expect-error
					register: (_result, args, cache, info) => {
						betterUpdateQuery<RegisterMutation, MeQuery>(
							cache,
							{ query: MeDocument },
							_result,
							(result, query) => {
								if (result.register.errors) {
									return query;
								} else {
									return {
										me: result.register.user,
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
});