import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Stack,
	Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import Layout from "../components/Layout";
import UpDootSection from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string,
	});
	const [{ data, fetching }] = usePostsQuery({
		variables,
	});

	// console.log("variables: ", variables);

	if (!fetching && !data) {
		return <div>query failed at index.ts</div>;
	}

	return (
		<Layout>
			<Flex align={"center"}>
				<Heading>LiReddit</Heading>
				<NextLink href={"/create-post"}>
					<Link ml={"auto"}>
						<Button my={4}>CREATE POST</Button>
					</Link>
				</NextLink>
			</Flex>
			<br />
			{!data && fetching ? (
				<div>loading...</div>
			) : (
				<Stack mb={5} spacing={5}>
					{data!.posts.posts.map((p) => (
						<Flex key={p.id} p={5} shadow="md" borderWidth={"1px"}>
							<UpDootSection post={p} />
							<Box>
								<Heading fontSize={"xl"}>{p.title}</Heading>
								<Text>posted by {p.creator.username}</Text>
								<Text mt={4}>
									{p.textSnippet.trim()}
									{p.textSnippet < p.text ? "..." : ""}
								</Text>
							</Box>
						</Flex>
					))}
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
