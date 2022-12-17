import { useApolloClient } from "@apollo/client";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
// import { useRouter } from "next/router";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

const NavBar = ({}) => {
	const [logout, { loading: logoutFetching}] = useLogoutMutation();
	const { data, loading } = useMeQuery({
		// fetch user from server (with cookie), or from cache
		// from cache:
		skip: isServer(),
	});
	const apolloClient = useApolloClient();
	// const router = useRouter();
	let body = null;

	if (loading) {
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
			<Flex align="center">
				<NextLink href={"/create-post"}>
					<Button mr={4} as={Link} textDecor="underline">
						create post
					</Button>
				</NextLink>
				<Flex mr={2}>{data.me.username}</Flex>
				<Button
					onClick={async () => {
						await logout();
						// router.reload();
						await apolloClient.resetStore();
					}}
					isLoading={logoutFetching}
					variant="link"
				>
					logout
				</Button>
			</Flex>
		);
	}

	return (
		<Flex zIndex={2} position={"sticky"} top={0} bg="tan" p={4}>
			<Flex flex={1} margin="auto" maxWidth={800} align="center">
				<NextLink href="/">
					<Link>
						<Heading>Lireddit</Heading>
					</Link>
				</NextLink>
				<Box ml={"auto"}>{body}</Box>
			</Flex>
		</Flex>
	);
};

export default NavBar;
