export default ({ env }) => ({
  graphql: {
    enabled: true,
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      depthLimit: 10,
      amountLimit: 100,
      apolloServer: {},
      v4CompatibilityMode: env.bool("STRAPI_GRAPHQL_V4_COMPATIBILITY_MODE", false),
    },
  },
});
