import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

interface Props {}

const Post = ({}: Props) => {
	const router = useRouter();
	const intId =
		typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
	const [{ data, error, fetching }] = usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId,
		},
	});

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
				{data.post.text}
			</Layout>
		</>
	);
};
export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
