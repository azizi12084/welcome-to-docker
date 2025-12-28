const sql = require("mssql");

const config = {
  user: "chatuser",
  password: "azizi12084",
  server: "127.0.0.1",
  port: 1433,
  database: "ChatDB",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

module.exports = { sql, config };
