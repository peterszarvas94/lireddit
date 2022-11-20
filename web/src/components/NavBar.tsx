import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

const NavBar = ({}) => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({
		// fetch user from server (with cookie), or from cache
		// from cache:
		pause: isServer(),
	});
	let body = null;

	if (fetching) {
		//data is loading
	} else if (!data?.me) {
		//user not logged in
		body = (
			<>
				<NextLink href="/login">
					<Link mr={4}>login</Link>
				</NextLink>
				<NextLink href="/register">
					<Link mr={4}>register</Link>
				</NextLink>
			</>
		);
	} else {
		//user is logged in
		body = (
			<Flex>
				<Box mr={2}>{data.me.username}</Box>
				<Button
					onClick={() => {
						logout();
					}}
					isLoading={logoutFetching}
					variant={"link"}
				>
					logout
				</Button>
			</Flex>
		);
	}

	return (
		<Flex zIndex={2} position={"sticky"} top={0} bg="tan" p={4}>
			<Box ml={"auto"}>{body}</Box>
		</Flex>
	);
};

export default NavBar;
