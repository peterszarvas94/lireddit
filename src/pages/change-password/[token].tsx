import { WarningIcon } from "@chakra-ui/icons";
import {
	Button,
	FormControl,
	FormErrorMessage,
	Link,
  Text,
} from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import NextLink from "next/link";

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
	const router = useRouter();
	const [, changePassword] = useChangePasswordMutation();
	const [tokenError, settokenError] = useState("");

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ newPassword: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await changePassword({
						newPassword: values.newPassword,
						token,
					});

					if (response.data?.changePassword.errors) {
						const errorMap = toErrorMap(response.data.changePassword.errors);
						settokenError("");
						if ("token" in errorMap) {
							settokenError(errorMap.token);
						}
						setErrors(errorMap);
					} else if (response.data?.changePassword.user) {
						router.push("/");
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name="newPassword"
							placeholder="new password"
							label="New Password"
							type="password"
						/>
						<FormControl isInvalid={!!tokenError}>
							{tokenError ? (
								<>
									<FormErrorMessage>
										<WarningIcon mr={1} />
										{tokenError}
                    <Text>,&nbsp;</Text>
										<NextLink href={"/forgot-password"}>
											<Link>
												click here to request a new password
											</Link>
										</NextLink>
									</FormErrorMessage>
								</>
							) : null}
						</FormControl>
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							change password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

ChangePassword.getInitialProps = ({ query }) => {
	return {
		token: query.token as string,
	};
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
