import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface Props {
	// post: PostsQuery["posts"]["posts"][0];
	post: PostSnippetFragment;
}

const UpDootSection = ({ post }: Props) => {
	const [loadingState, setLoadingState] = useState<
		"updoot-loading" | "downdoot-loading" | "not-loading"
	>();
	const [, vote] = useVoteMutation();

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
						postId: post.id,
						value: 1,
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
						postId: post.id,
						value: -1,
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
