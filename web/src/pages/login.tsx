import {
	Box,
	Button,
	Flex,
	FormControl,
	FormHelperText,
	Link
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

const Login = ({}) => {
	const router = useRouter();
	const [login] = useLoginMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ usernameOrEmail: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await login({variables: values});
					if (response.data?.login.errors) {
						setErrors(toErrorMap(response.data.login.errors));
					} else if (response.data?.login.user) {
						if (typeof router.query.next === "string") {
							router.push(router.query.next);
						} else {
							router.push("/");
						}
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="usernameOrEmail"
							placeholder="username or email"
							label="Username or Email"
						/>
						<Box mt={4}>
							<InputField
								name="password"
								placeholder="password"
								label="Password"
								type="password"
							/>
							<FormControl>
								<Flex>
									<FormHelperText ml={"auto"}>
										<NextLink href={"/forgot-password"}>
											<Link>forgot password?</Link>
										</NextLink>
									</FormHelperText>
								</Flex>
							</FormControl>
						</Box>
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							login
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};
export default Login;
