const sql = require("mssql");

const server = process.env.APPSETTING_DB_HOST || process.env.DB_HOST;

// إذا كان السيرفر من Azure، فعل التشفير
const isAzureSql = server && server.includes("database.windows.net");

const config = {
  server,
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,   // كما اخترت
  database: process.env.DB_NAME,
  options: {
    encrypt: isAzureSql,
    trustServerCertificate: !isAzureSql
  }
};

if (!config.server || !config.user || !config.password || !config.database) {
  throw new Error("Database configuration is incomplete");
}

module.exports = { sql, config };
