import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import fetch from 'cross-fetch'

export const client = new ApolloClient({
  link : new HttpLink({
    uri: 'https://mdcxhd5gszgw7ewmqy2zk44k4e.appsync-api.us-east-2.amazonaws.com/graphql',
    headers: {
        "x-api-key": "da2-wyx7pg4tarf4dhojrlyf44tz2e",
  },
  fetch
  }),
  cache: new InMemoryCache()
});