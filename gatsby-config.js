module.exports = {
  siteMetadata: {
    title: `Gatsby Default Starter`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
  },
    plugins: [
    `gatsby-plugin-react-helmet`,
    // Add typescript stack into webpack
    `gatsby-plugin-typescript`,
    {
      resolve: "gatsby-source-graphql",
      options: {
          // This type will contain the remote schema Query type
          typeName: "AWSAppSync",
          // This is the field under which it's accessible
          fieldName: "appsync",
          // URL to query from
          url:"https://mdcxhd5gszgw7ewmqy2zk44k4e.appsync-api.us-east-2.amazonaws.com/graphql",
          headers:{
              "x-api-key": "da2-wyx7pg4tarf4dhojrlyf44tz2e"
          },
      },
  },
  ],
}
