import path from "node:path";

export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite");

  if (client === "postgres") {
    const connectionString = env("DATABASE_URL");
    const useSsl =
      env.bool("DATABASE_SSL", false) ||
      connectionString.includes("sslmode=require") ||
      connectionString.includes("neon.tech");

    return {
      connection: {
        client: "postgres",
        connection: {
          connectionString,
          ssl: useSsl ? { rejectUnauthorized: false } : false,
        },
        pool: { min: 0, max: 10 },
      },
    };
  }

  return {
    connection: {
      client: "sqlite",
      connection: {
        filename: path.join(__dirname, "..", env("DATABASE_FILENAME", ".tmp/data.db")),
      },
      useNullAsDefault: true,
    },
  };
};
