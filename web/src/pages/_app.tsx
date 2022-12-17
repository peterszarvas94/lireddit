import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";

function MyApp({ Component, pageProps }: any) {
	const client = new ApolloClient({
		uri: process.env.NEXT_PUBLIC_API_URL as string,
		credentials: "include",
		cache: new InMemoryCache(),
	});

	return (
		<ApolloProvider client={client}>
			<ChakraProvider resetCSS theme={theme}>
				<Component {...pageProps} />
			</ChakraProvider>
		</ApolloProvider>
	);
}

export default MyApp;
