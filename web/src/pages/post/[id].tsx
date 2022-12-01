import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import Layout from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = () => {
	const [{ data, error, fetching }] = useGetPostFromUrl();

	if (fetching) {
		return <Layout>loading...</Layout>;
	}

	if (error) {
		console.log(error);
	}

	if (!data?.post) {
		return (
			<Layout>
				<Box>Could not find post.</Box>
			</Layout>
		);
	}

	return (
		<>
			<Layout>
				<Heading mb={4}>{data.post.title}</Heading>
				<Box mb={4}>{data.post.text}</Box>
				<Box ml={"auto"}>
					<EditDeletePostButtons
						id={data.post.id}
						creatorId={data.post.creator.id}
					/>
				</Box>
			</Layout>
		</>
	);
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);