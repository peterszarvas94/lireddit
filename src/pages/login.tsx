import React from "react";
import { Form, Formik } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormHelperText,
	Link,
} from "@chakra-ui/react";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

const Login = ({}) => {
	const router = useRouter();
	const [{}, login] = useLoginMutation();
	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ usernameOrEmail: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await login(values);
					if (response.data?.login.errors) {
						setErrors(toErrorMap(response.data.login.errors));
					} else if (response.data?.login.user) {
						router.push("/");
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
export default withUrqlClient(createUrqlClient)(Login);
