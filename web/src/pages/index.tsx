import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Stack,
	Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import EditDeletePostButtons from "../components/EditDeletePostButtons";
import Layout from "../components/Layout";
import UpDootSection from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const Index = () => {
	const { data, error, loading, fetchMore, variables } = usePostsQuery({
		variables: {
			limit: 15,
			cursor: null as null | string,
		},
		notifyOnNetworkStatusChange: true,
	});

	// console.log("variables: ", variables);

	if (!loading && !data) {
		return (
			<div>
				<div>query failed at index.ts</div>
				<div>{error?.message}</div>
			</div>
		);
	}

	return (
		<Layout>
			{!data && loading ? (
				<div>loading...</div>
			) : (
				<Stack mb={5} spacing={5}>
					{data!.posts.posts.map((p) =>
						!p ? null : (
							<Flex key={p.id} p={5} shadow="md" borderWidth={"1px"}>
								<UpDootSection post={p} />

								<Box flex={1}>
									<NextLink href="/post/[id]" as={`/post/${p.id}`}>
										<Link>
											<Heading fontSize={"xl"}>{p.title}</Heading>
										</Link>
									</NextLink>
									<Text>posted by {p.creator.username}</Text>

									<Flex align="center">
										<Text flex={1} mt={4}>
											{p.textSnippet.trim()}
											{p.textSnippet < p.text ? "..." : ""}
										</Text>
										<Box ml="auto">
											<EditDeletePostButtons
												id={p.id}
												creatorId={p.creator.id}
											/>
										</Box>
									</Flex>
								</Box>
							</Flex>
						)
					)}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() => {
							fetchMore({
								variables: {
									limit: variables?.limit,
									cursor:
										data.posts.posts[data.posts.posts.length - 1].createdAt,
								},
								// updateQuery: (previousValues, { fetchMoreResult }) => {
								// 	if (!fetchMoreResult) {
								// 		return previousValues;
								// 	}

								// 	return {
								// 		__typename: "Query",
								// 		posts: {
								// 			__typename: "PaginatedPosts",
								// 			hasMore: fetchMoreResult.posts.hasMore,
								// 			posts: [
								// 				...previousValues.posts.posts,
								// 				...fetchMoreResult.posts.posts,
								// 			],
								// 		},
								// 	};
								// },
							});
						}}
						isLoading={loading}
						m={"auto"}
						mb={5}
					>
						LOAD MORE
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withApollo({ ssr: true })(Index);
