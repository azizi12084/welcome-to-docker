
const sql = require("mssql");

// تحديد بيئة التشغيل
const isAzure = !!process.env.APPSETTING_DB_HOST;

// إعدادات قاعدة البيانات
const config = {
  server: isAzure ? process.env.APPSETTING_DB_HOST : process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  options: {
    encrypt: isAzure, // Azure => true, Local => false
    trustServerCertificate: !isAzure // Local => true
  }
};

module.exports = {
  sql,
  config
};
if (!config.server || !config.user || !config.password || !config.database) {
  throw new Error("Database configuration is incomplete");
}
