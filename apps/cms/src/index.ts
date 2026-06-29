const SEED_PAGES = [
  {
    title: "Welcome to WikiWonder",
    slug: "welcome",
    summary: "CMS-managed welcome page from Strapi GraphQL.",
    content: `# Welcome from Strapi

This page is authored in **Strapi CMS** and served to Next.js via GraphQL.

## CMS Features

- Draft & publish workflow
- Rich text / markdown content
- Categories and relations
- GraphQL API at \`/graphql\`

Try [[Getting Started]] for setup instructions.`,
    contentFormat: "markdown",
    sourceType: "strapi",
  },
  {
    title: "Getting Started",
    slug: "getting-started",
    summary: "Run Strapi CMS alongside the Next.js wiki frontend.",
    content: `# Getting Started with Strapi

1. \`cd apps/cms && cp .env.example .env\`
2. \`npm install && npm run develop\`
3. Open http://localhost:1337/admin and create an admin user
4. Set \`STRAPI_GRAPHQL_URL\` and \`STRAPI_API_TOKEN\` in the web app env`,
    contentFormat: "markdown",
    sourceType: "strapi",
  },
] as const;

async function enablePublicPermissions(strapi) {
  const publicRole = await strapi.db.query("plugin::users-permissions.role").findOne({
    where: { type: "public" },
  });

  if (!publicRole) return;

  const actions = [
    "api::wiki-page.wiki-page.find",
    "api::wiki-page.wiki-page.findOne",
    "api::wiki-category.wiki-category.find",
    "api::wiki-category.wiki-category.findOne",
  ];

  for (const action of actions) {
    const existing = await strapi.db.query("plugin::users-permissions.permission").findOne({
      where: { action, role: publicRole.id },
    });

    if (!existing) {
      await strapi.db.query("plugin::users-permissions.permission").create({
        data: { action, role: publicRole.id, enabled: true },
      });
    } else if (!existing.enabled) {
      await strapi.db.query("plugin::users-permissions.permission").update({
        where: { id: existing.id },
        data: { enabled: true },
      });
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }) {
    await enablePublicPermissions(strapi);

    const existing = await strapi.documents("api::wiki-page.wiki-page").findMany({ limit: 1 });
    if (existing.length > 0) return;

    for (const page of SEED_PAGES) {
      const doc = await strapi.documents("api::wiki-page.wiki-page").create({
        data: page,
        status: "published",
      });
      strapi.log.info(`Seeded wiki page: ${doc.title}`);
    }
  },
};
