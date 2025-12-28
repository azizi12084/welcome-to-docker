const { sql, config } = require("./db");

async function inspectDatabase() {
  try {
    console.log("🔌 جاري الاتصال بقاعدة البيانات...");
    await sql.connect(config);
    console.log("✅ تم الاتصال بنجاح!\n");

    // 1. جلب قائمة الجداول
    console.log("📋 جلب قائمة الجداول...");
    const tablesResult = await sql.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    const tables = tablesResult.recordset.map(row => row.TABLE_NAME);
    console.log(`تم العثور على ${tables.length} جدول:\n`);
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table}`);
    });
    console.log("\n" + "=".repeat(60) + "\n");

    // 2. فحص بنية كل جدول
    for (const tableName of tables) {
      console.log(`\n📊 جدول: ${tableName}`);
      console.log("-".repeat(60));
      
      // جلب أعمدة الجدول
      const columnsResult = await sql.query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log("الأعمدة:");
      columnsResult.recordset.forEach(col => {
        const length = col.CHARACTER_MAXIMUM_LENGTH 
          ? `(${col.CHARACTER_MAXIMUM_LENGTH})` 
          : '';
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = col.COLUMN_DEFAULT ? ` DEFAULT ${col.COLUMN_DEFAULT}` : '';
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${nullable}${defaultValue}`);
      });

      // جلب عدد الصفوف
      const countResult = await sql.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const rowCount = countResult.recordset[0].count;
      console.log(`\nعدد الصفوف: ${rowCount}`);

      // عرض عينة من البيانات (أول 5 صفوف)
      if (rowCount > 0) {
        const sampleResult = await sql.query(`SELECT TOP 5 * FROM ${tableName}`);
        console.log("\nعينة من البيانات:");
        sampleResult.recordset.forEach((row, index) => {
          console.log(`  صف ${index + 1}:`, JSON.stringify(row, null, 2));
        });
      }

      // جلب المفاتيح الأساسية
      const pkResult = await sql.query(`
        SELECT 
          COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = '${tableName}' 
          AND CONSTRAINT_NAME LIKE 'PK_%'
        ORDER BY ORDINAL_POSITION
      `);
      
      if (pkResult.recordset.length > 0) {
        const pkColumns = pkResult.recordset.map(r => r.COLUMN_NAME).join(', ');
        console.log(`\nالمفتاح الأساسي: ${pkColumns}`);
      }

      // جلب المفاتيح الخارجية
      const fkResult = await sql.query(`
        SELECT 
          kcu.COLUMN_NAME,
          kcu.CONSTRAINT_NAME,
          ccu.TABLE_NAME AS REFERENCED_TABLE_NAME,
          ccu.COLUMN_NAME AS REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
          ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ccu
          ON rc.UNIQUE_CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
        WHERE kcu.TABLE_NAME = '${tableName}'
      `);
      
      if (fkResult.recordset.length > 0) {
        console.log("\nالمفاتيح الخارجية:");
        fkResult.recordset.forEach(fk => {
          console.log(`  - ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
      }

      // جلب الفهارس
      const indexesResult = await sql.query(`
        SELECT 
          i.name AS IndexName,
          i.is_unique,
          i.is_primary_key,
          STRING_AGG(c.name, ', ') AS Columns
        FROM sys.indexes i
        INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE OBJECT_NAME(i.object_id) = '${tableName}'
          AND i.name IS NOT NULL
        GROUP BY i.name, i.is_unique, i.is_primary_key
        ORDER BY i.is_primary_key DESC, i.name
      `);
      
      if (indexesResult.recordset.length > 0) {
        console.log("\nالفهارس:");
        indexesResult.recordset.forEach(idx => {
          const type = idx.is_primary_key ? 'PRIMARY KEY' : idx.is_unique ? 'UNIQUE' : 'INDEX';
          console.log(`  - ${idx.IndexName} (${type}): ${idx.Columns}`);
        });
      }

      console.log("\n" + "=".repeat(60));
    }

    // 3. اقتراحات التحسين
    console.log("\n\n💡 اقتراحات التحسين:\n");
    suggestImprovements(tables);

    await sql.close();
    console.log("\n✅ تم إغلاق الاتصال بنجاح!");

  } catch (err) {
    console.error("❌ خطأ:", err);
    process.exit(1);
  }
}

function suggestImprovements(tables) {
  const suggestions = [];

  // التحقق من وجود جدول Users
  if (tables.includes('Users')) {
    suggestions.push({
      table: 'Users',
      suggestions: [
        'تأكد من وجود فهرس على Username و Email لتحسين أداء البحث',
        'تأكد من وجود فهرس على Email إذا كان يستخدم في البحث',
        'فكر في إضافة حقل CreatedAt لتسجيل تاريخ إنشاء الحساب',
        'فكر في إضافة حقل LastLogin لتسجيل آخر مرة تم فيها تسجيل الدخول',
        'تأكد من أن PasswordHash له طول كافٍ (255 حرف)',
        'فكر في إضافة حقل IsActive لتعطيل الحسابات بدلاً من حذفها'
      ]
    });
  }

  // التحقق من وجود جدول Contacts
  if (tables.includes('Contacts')) {
    suggestions.push({
      table: 'Contacts',
      suggestions: [
        'تأكد من وجود فهرس مركب على (UserId, ContactUserId) لتحسين أداء البحث',
        'فكر في إضافة حقل CreatedAt لتسجيل تاريخ إرسال الطلب',
        'فكر في إضافة حقل UpdatedAt لتسجيل تاريخ آخر تحديث',
        'تأكد من وجود فهرس على Status للبحث السريع عن الطلبات المعلقة',
        'فكر في إضافة حقل RequestMessage للسماح بإضافة رسالة مع طلب الصداقة'
      ]
    });
  }

  // التحقق من وجود جدول Messages
  if (tables.includes('Messages')) {
    suggestions.push({
      table: 'Messages',
      suggestions: [
        'تأكد من وجود فهرس على RoomId لتحسين أداء جلب الرسائل',
        'تأكد من وجود فهرس على CreatedAt للترتيب الزمني',
        'فكر في إضافة حقل IsRead لتتبع الرسائل المقروءة',
        'فكر في إضافة حقل IsDeleted للسماح بحذف الرسائل (soft delete)',
        'فكر في إضافة دعم للمرفقات (Attachments)',
        'فكر في إضافة دعم للرسائل المحررة (EditHistory)'
      ]
    });
  }

  // التحقق من وجود جدول Rooms
  if (tables.includes('Rooms')) {
    suggestions.push({
      table: 'Rooms',
      suggestions: [
        'تأكد من وجود فهرس على IsPrivate للبحث السريع',
        'فكر في إضافة حقل CreatedAt لتسجيل تاريخ إنشاء الغرفة',
        'فكر في إضافة حقل LastMessageAt لتسجيل آخر رسالة في الغرفة',
        'فكر في إضافة حقل Description للسماح بإضافة وصف للغرف العامة'
      ]
    });
  }

  // اقتراحات عامة
  suggestions.push({
    table: 'عام',
    suggestions: [
      'تأكد من وجود نسخ احتياطية منتظمة لقاعدة البيانات',
      'فكر في إضافة جدول AuditLog لتسجيل جميع العمليات المهمة',
      'فكر في إضافة جدول Sessions لإدارة جلسات المستخدمين',
      'تأكد من وجود Foreign Key Constraints لضمان سلامة البيانات',
      'فكر في إضافة جدول Notifications للإشعارات'
    ]
  });

  suggestions.forEach(item => {
    console.log(`\n📌 ${item.table}:`);
    item.suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
  });
}

// تشغيل الفحص
inspectDatabase();

