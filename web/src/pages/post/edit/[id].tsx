import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {
	usePostQuery,
	useUpdatePostMutation,
} from "../../../generated/graphql";
import { useGetIntId } from "../../../utils/useGetIntId";
import { withApollo } from "../../../utils/withApollo";

const EditPost = ({}) => {
	const router = useRouter();
	const intId = useGetIntId();
	const { data, loading } = usePostQuery({
		skip: intId === -1,
		variables: {
			id: intId,
		},
	});
	const [updatePost] = useUpdatePostMutation();

	if (loading) {
		return <Layout>loading...</Layout>;
	}

	if (!data?.post) {
		return (
			<Layout>
				<Box>Could not find post.</Box>
			</Layout>
		);
	}

	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: data.post.title, text: data.post.text }}
				onSubmit={async (values) => {
					await updatePost({ variables: { id: intId, ...values } });
					router.back();
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="title" placeholder="title" label="Title" />
						<Box mt={4}>
							<InputField
								name="text"
								placeholder="text..."
								label="Body"
								textarea
							/>
						</Box>
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							update post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};
export default withApollo({ ssr: false })(EditPost);
