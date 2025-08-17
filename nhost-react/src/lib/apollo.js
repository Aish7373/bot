import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// Replace with your actual Hasura GraphQL HTTP endpoint
const HASURA_HTTP_URL = "https://yluumwvskyknvtklidxg.hasura.ap-south-1.nhost.run/v1/graphql";

// Replace with your actual Hasura WebSocket endpoint (notice wss:// and same base URL)
const HASURA_WS_URL = "wss://yluumwvskyknvtklidxg.hasura.ap-south-1.nhost.run/v1/graphql";

// Your Hasura admin secret or appropriate auth token
const HASURA_ADMIN_SECRET = "&+2gW3G1$h72lcBJhNRW5D=1dc'^*nYF";

const httpLink = new HttpLink({
  uri: HASURA_HTTP_URL,
  headers: {
    "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
  },
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: HASURA_WS_URL,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
      },
    },
  })
);

// Using split to route subscription requests to websocket and others to http
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === "OperationDefinition" && definition.operation === "subscription";
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
