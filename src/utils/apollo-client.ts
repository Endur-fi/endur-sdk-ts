import { ApolloClient, DefaultOptions, InMemoryCache } from "@apollo/client";
import { Network } from "../types";

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

export default function getApolloClient(network: Network) {
    return new ApolloClient({
        uri: network === 'mainnet'
            ? "https://graphql.mainnet.endur.fi"
            : "https://graphql.sepolia.endur.fi",
        cache: new InMemoryCache(),
        defaultOptions,
    });
}
