import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import fetch from 'cross-fetch'

export const client = new ApolloClient({
  link : new HttpLink({
    uri: 'https://kvhxvrf74bdwpdlfvgn53o4tka.appsync-api.us-east-2.amazonaws.com/graphql',
    headers: {
        "x-api-key": "da2-5ux6mybrnzfafab2vmnrzhxfpe",
  },
  fetch
  }),
  cache: new InMemoryCache()
});