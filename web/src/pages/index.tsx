import { DeleteIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
	Link,
	Stack,
	Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import Layout from "../components/Layout";
import UpDootSection from "../components/UpdootSection";
import {
	useDeletePostMutation,
	useMeQuery,
	usePostsQuery,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string,
	});
	const [{ data, fetching }] = usePostsQuery({
		variables,
	});
	const [, deletePost] = useDeletePostMutation();
	const [meData] = useMeQuery();

	// console.log("variables: ", variables);

	if (!fetching && !data) {
		return <div>query failed at index.ts</div>;
	}

	return (
		<Layout>
			{!data && fetching ? (
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
										{meData.data?.me?.id === p.creator.id ? (
											<IconButton
												ml="auto"
												colorScheme="red"
												aria-label="delete post"
												icon={<DeleteIcon />}
												onClick={() => {
													deletePost({ id: p.id });
												}}
											/>
										) : null}
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
							setVariables({
								limit: variables.limit,
								cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
							});
						}}
						isLoading={fetching}
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
