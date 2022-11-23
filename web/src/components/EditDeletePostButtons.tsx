import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { ButtonGroup, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface Props {
	id: number;
	creatorId: number;
}

const EditDeletePostButtons = ({ id, creatorId }: Props) => {
	const [{ data: meData }] = useMeQuery();
	const [, deletePost] = useDeletePostMutation();

	if (meData?.me?.id !== creatorId) {
		return null;
	}

	return (
		<ButtonGroup>
			<NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
				<IconButton
					as={Link}
					ml="auto"
					aria-label="delete post"
					icon={<EditIcon />}
				/>
			</NextLink>

			<IconButton
				ml="auto"
				aria-label="delete post"
				icon={<DeleteIcon />}
				onClick={() => {
					deletePost({ id });
				}}
			/>
		</ButtonGroup>
	);
};
export default EditDeletePostButtons;
