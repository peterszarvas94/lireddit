import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

const NavBar = ({}) => {
	const [{ data, fetching }] = useMeQuery();
	let body = null;

	if (fetching) {
		//data is loading
	} else if (!data?.me) {
		//user nor logged in
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
        <Button variant={"link"}>logout</Button>
			</Flex>
		);
	}

	return (
		<Flex bg="tomato" p={4}>
			<Box ml={"auto"}>{body}</Box>
		</Flex>
	);
};

export default NavBar;
