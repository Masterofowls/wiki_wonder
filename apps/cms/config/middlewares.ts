export default ({ env }) => {
  const origins = env("CORS_ORIGIN", "http://localhost:9000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [
    "strapi::logger",
    "strapi::errors",
    "strapi::security",
    {
      name: "strapi::cors",
      config: {
        origin: origins,
        headers: ["Content-Type", "Authorization", "Origin", "Accept"],
      },
    },
    "strapi::poweredBy",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
  ];
};
