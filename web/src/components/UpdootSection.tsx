import { ApolloCache } from "@apollo/client";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import { gql } from "@urql/core";
import { useState } from "react";
import {
	PostSnippetFragment,
	useVoteMutation,
	VoteMutation
} from "../generated/graphql";

interface Props {
	// post: PostsQuery["posts"]["posts"][0];
	post: PostSnippetFragment;
}

const updateAfterVote = (
	value: number,
	postId: number,
	cache: ApolloCache<VoteMutation>
) => {
	const data = cache.readFragment<{
		id: number;
		points: number;
		voteStatus: number | null;
	}>({
		id: "Post:" + postId,
		fragment: gql`
			fragment _ on Post {
				id
				points
				voteStatus
			}
		`,
	});

	if (data) {
		const { voteStatus, points } = data;

		if (voteStatus === null) {
			cache.writeFragment({
				id: "Post:" + postId,
				fragment: gql`
					fragment __ on Post {
						points
						voteStatus
					}
				`,
				data: { points: points + value, voteStatus: value },
			});
			return;
		}

		if (voteStatus === value) {
			cache.writeFragment({
				id: "Post:" + postId,
				fragment: gql`
					fragment __ on Post {
						points
						voteStatus
					}
				`,
				data: { points: points - value, voteStatus: null },
			});
			return;
		}

		if (value !== null && voteStatus === -value) {
			cache.writeFragment({
				id: "Post:" + postId,
				fragment: gql`
					fragment __ on Post {
						points
						voteStatus
					}
				`,
				data: { points: points + 2 * value, voteStatus: value },
			});
			return;
		}
	}
};

const UpDootSection = ({ post }: Props) => {
	const [loadingState, setLoadingState] = useState<
		"updoot-loading" | "downdoot-loading" | "not-loading"
	>();
	const [vote] = useVoteMutation();

	return (
		<Flex
			direction={"column"}
			justifyContent={"center"}
			alignItems={"center"}
			mr={4}
		>
			<IconButton
				onClick={async () => {
					setLoadingState("updoot-loading");
					await vote({
						variables: {
							postId: post.id,
							value: 1,
						},
						update: (cache) => updateAfterVote(1, post.id, cache),
					});
					setLoadingState("not-loading");
				}}
				colorScheme={post.voteStatus === 1 ? "green" : undefined}
				isLoading={loadingState === "updoot-loading"}
				aria-label="updoot"
				icon={<ChevronUpIcon fontSize={"1.5rem"} />}
			/>
			{post.points}
			<IconButton
				onClick={async () => {
					setLoadingState("downdoot-loading");
					await vote({
						variables: {
							postId: post.id,
							value: -1,
						},
						update: (cache) => updateAfterVote(-1, post.id, cache),
					});
					setLoadingState("not-loading");
				}}
				colorScheme={post.voteStatus === -1 ? "red" : undefined}
				isLoading={loadingState === "downdoot-loading"}
				aria-label="downdoot"
				icon={<ChevronDownIcon fontSize={"1.5rem"} />}
			/>
		</Flex>
	);
};
export default UpDootSection;
