/*
const sql = require('mssql');

const sqlConfig = {
    user: "azzuz",                           // من JSON
    password: "كلمة_المرور_الخاصة_بك",       // إذا نسيتها أعد تعيينها
    database: "ChatDB",                       // اسم قاعدة البيانات
    server: "azizichat-sqlsrv.database.windows.net",
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        await sql.connect(sqlConfig);
        console.log("✅ DB connected successfully");
    } catch (err) {
        console.error("❌ DB connect error:", err);
    }
}

connectDB();
*/
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
