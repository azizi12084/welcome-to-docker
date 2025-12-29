-- ============================================
-- تحسينات قاعدة البيانات AziziChat
-- ============================================

-- ============================================
-- 1. تحسينات جدول Users
-- ============================================

-- إضافة حقل CreatedAt
IF OBJECT_ID('Users','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE Users ADD CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME();
    PRINT 'تم إضافة حقل CreatedAt إلى جدول Users';
END
GO

-- إضافة حقل LastLogin
IF OBJECT_ID('Users','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'LastLogin')
BEGIN
    ALTER TABLE Users ADD LastLogin DATETIME2 NULL;
    PRINT 'تم إضافة حقل LastLogin إلى جدول Users';
END
GO

-- إضافة حقل IsActive
IF OBJECT_ID('Users','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'IsActive')
BEGIN
    ALTER TABLE Users ADD IsActive BIT NOT NULL DEFAULT 1;
    PRINT 'تم إضافة حقل IsActive إلى جدول Users';
END
GO

-- إضافة فهرس على Email (إذا لم يكن موجوداً)
IF OBJECT_ID('Users','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('Users'))
BEGIN
    CREATE INDEX IX_Users_Email ON Users(Email) WHERE Email IS NOT NULL;
    PRINT 'تم إضافة فهرس IX_Users_Email';
END
GO

-- ============================================
-- 2. تحسينات جدول Contacts
-- ============================================

-- ملاحظة: إذا لم يكن الحقل CreatedAt موجوداً، فسنقوم بإنشائه أولاً

-- إضافة حقل CreatedAt (آمن)
IF OBJECT_ID('Contacts','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contacts') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE Contacts ADD CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME();
    PRINT 'تم إضافة حقل CreatedAt إلى جدول Contacts';
END
GO

-- إضافة حقل UpdatedAt
IF OBJECT_ID('Contacts','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contacts') AND name = 'UpdatedAt')
BEGIN
    ALTER TABLE Contacts ADD UpdatedAt DATETIME2 NULL;
    PRINT 'تم إضافة حقل UpdatedAt إلى جدول Contacts';
END
GO

-- إضافة فهرس على Status
IF OBJECT_ID('Contacts','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Contacts_Status' AND object_id = OBJECT_ID('Contacts'))
BEGIN
    CREATE INDEX IX_Contacts_Status ON Contacts(Status);
    PRINT 'تم إضافة فهرس IX_Contacts_Status';
END
GO

-- إضافة فهرس مركب على (UserId, Status) للبحث السريع عن طلبات الصداقة
IF OBJECT_ID('Contacts','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Contacts_UserId_Status' AND object_id = OBJECT_ID('Contacts'))
BEGIN
    CREATE INDEX IX_Contacts_UserId_Status ON Contacts(UserId, Status);
    PRINT 'تم إضافة فهرس IX_Contacts_UserId_Status';
END
GO

-- إضافة فهرس على ContactUserId للبحث السريع عن الطلبات الواردة
IF OBJECT_ID('Contacts','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Contacts_ContactUserId' AND object_id = OBJECT_ID('Contacts'))
BEGIN
    CREATE INDEX IX_Contacts_ContactUserId ON Contacts(ContactUserId);
    PRINT 'تم إضافة فهرس IX_Contacts_ContactUserId';
END
GO

-- ============================================
-- 3. تحسينات جدول Messages
-- ============================================

-- إضافة فهرس على RoomId
IF OBJECT_ID('Messages','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_RoomId' AND object_id = OBJECT_ID('Messages'))
BEGIN
    CREATE INDEX IX_Messages_RoomId ON Messages(RoomId);
    PRINT 'تم إضافة فهرس IX_Messages_RoomId';
END
GO

-- إضافة فهرس مركب على (RoomId, CreatedAt) للترتيب الزمني
IF OBJECT_ID('Messages','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_RoomId_CreatedAt' AND object_id = OBJECT_ID('Messages'))
BEGIN
    CREATE INDEX IX_Messages_RoomId_CreatedAt ON Messages(RoomId, CreatedAt);
    PRINT 'تم إضافة فهرس IX_Messages_RoomId_CreatedAt';
END
GO

-- إضافة حقل IsRead
IF OBJECT_ID('Messages','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Messages') AND name = 'IsRead')
BEGIN
    ALTER TABLE Messages ADD IsRead BIT NOT NULL DEFAULT 0;
    PRINT 'تم إضافة حقل IsRead إلى جدول Messages';
END
GO

-- إضافة حقل IsDeleted (soft delete)
IF OBJECT_ID('Messages','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Messages') AND name = 'IsDeleted')
BEGIN
    ALTER TABLE Messages ADD IsDeleted BIT NOT NULL DEFAULT 0;
    PRINT 'تم إضافة حقل IsDeleted إلى جدول Messages';
END
GO

-- إضافة فهرس على IsDeleted للبحث السريع
IF OBJECT_ID('Messages','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Messages_IsDeleted' AND object_id = OBJECT_ID('Messages'))
BEGIN
    CREATE INDEX IX_Messages_IsDeleted ON Messages(IsDeleted) WHERE IsDeleted = 0;
    PRINT 'تم إضافة فهرس IX_Messages_IsDeleted';
END
GO

-- ============================================
-- 4. تحسينات جدول Rooms
-- ============================================

-- إضافة حقل CreatedAt
IF OBJECT_ID('Rooms','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Rooms') AND name = 'CreatedAt')
BEGIN
    ALTER TABLE Rooms ADD CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME();
    PRINT 'تم إضافة حقل CreatedAt إلى جدول Rooms';
END
GO

-- إضافة حقل LastMessageAt
IF OBJECT_ID('Rooms','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Rooms') AND name = 'LastMessageAt')
BEGIN
    ALTER TABLE Rooms ADD LastMessageAt DATETIME2 NULL;
    PRINT 'تم إضافة حقل LastMessageAt إلى جدول Rooms';
END
GO

-- إضافة فهرس على IsPrivate
IF OBJECT_ID('Rooms','U') IS NOT NULL AND NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Rooms_IsPrivate' AND object_id = OBJECT_ID('Rooms'))
BEGIN
    CREATE INDEX IX_Rooms_IsPrivate ON Rooms(IsPrivate);
    PRINT 'تم إضافة فهرس IX_Rooms_IsPrivate';
END
GO

-- ============================================
-- 5. إنشاء Trigger لتحديث UpdatedAt في Contacts
-- ============================================

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Contacts_UpdateUpdatedAt')
    DROP TRIGGER TR_Contacts_UpdateUpdatedAt;
GO

CREATE TRIGGER TR_Contacts_UpdateUpdatedAt
ON Contacts
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Contacts
    SET UpdatedAt = SYSDATETIME()
    FROM Contacts c
    INNER JOIN inserted i ON c.Id = i.Id;
END;
GO

PRINT 'تم إنشاء Trigger TR_Contacts_UpdateUpdatedAt';
GO

-- ============================================
-- 6. إنشاء Trigger لتحديث LastMessageAt في Rooms
-- ============================================

IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'TR_Messages_UpdateRoomLastMessage')
    DROP TRIGGER TR_Messages_UpdateRoomLastMessage;
GO

CREATE TRIGGER TR_Messages_UpdateRoomLastMessage
ON Messages
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Rooms
    SET LastMessageAt = SYSDATETIME()
    FROM Rooms r
    INNER JOIN inserted i ON r.Id = i.RoomId;
END;
GO

PRINT 'تم إنشاء Trigger TR_Messages_UpdateRoomLastMessage';
GO

-- ============================================
-- 7. إنشاء Trigger لتحديث LastLogin في Users
-- ============================================

-- ملاحظة: يجب استدعاء هذا من الكود عند تسجيل الدخول
-- يمكن إضافة API endpoint لتحديث LastLogin

-- ============================================
-- 8. إنشاء View لجهات الاتصال المقبولة
-- ============================================

IF OBJECT_ID('Contacts','U') IS NOT NULL AND OBJECT_ID('Users','U') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Contacts') AND name = 'CreatedAt')
   AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Contacts') AND name = 'UpdatedAt')
BEGIN
    IF OBJECT_ID('vw_AcceptedContacts','V') IS NOT NULL
        DROP VIEW vw_AcceptedContacts;

    DECLARE @sql NVARCHAR(MAX) = N'
    CREATE VIEW vw_AcceptedContacts AS
    SELECT 
        c.Id,
        c.UserId,
        u1.Username AS UserUsername,
        c.ContactUserId,
        u2.Username AS ContactUsername,
        c.Status,
        c.CreatedAt,
        c.UpdatedAt
    FROM Contacts c
    INNER JOIN Users u1 ON c.UserId = u1.Id
    INNER JOIN Users u2 ON c.ContactUserId = u2.Id
    WHERE c.Status = ''accepted'';
    ';

    EXEC sp_executesql @sql;
    PRINT 'تم إنشاء View vw_AcceptedContacts';
END
ELSE
BEGIN
    PRINT 'تخطي إنشاء vw_AcceptedContacts: الجداول أو الأعمدة المطلوبة غير موجودة بعد';
END
GO

-- ============================================
-- 9. إنشاء View للرسائل غير المقروءة
-- ============================================

IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_UnreadMessages')
    DROP VIEW vw_UnreadMessages;
GO

CREATE VIEW vw_UnreadMessages
AS
SELECT 
    m.Id,
    m.RoomId,
    m.SenderId AS SenderId,
    u.Username,
    m.Content,
    m.CreatedAt,
    m.IsRead,
    r.Name AS RoomName
FROM Messages m
INNER JOIN Users u ON m.SenderId = u.Id
INNER JOIN Rooms r ON m.RoomId = r.Id
WHERE m.IsRead = 0 AND m.IsDeleted = 0;
GO

PRINT 'تم إنشاء View vw_UnreadMessages';
GO

-- ============================================
-- 10. ملخص التحسينات
-- ============================================

PRINT '';
PRINT '========================================';
PRINT 'تم تطبيق جميع التحسينات بنجاح!';
PRINT '========================================';
PRINT '';
PRINT 'التحسينات المطبقة:';
PRINT '1. إضافة حقول CreatedAt, LastLogin, IsActive إلى Users';
PRINT '2. إضافة فهرس على Email في Users';
PRINT '3. إضافة حقل UpdatedAt إلى Contacts';
PRINT '4. إضافة فهارس على Status و UserId في Contacts';
PRINT '5. إضافة فهارس على RoomId و CreatedAt في Messages';
PRINT '6. إضافة حقول IsRead و IsDeleted إلى Messages';
PRINT '7. إضافة حقول CreatedAt و LastMessageAt إلى Rooms';
PRINT '8. إضافة فهرس على IsPrivate في Rooms';
PRINT '9. إنشاء Triggers لتحديث UpdatedAt و LastMessageAt تلقائياً';
PRINT '10. إنشاء Views لسهولة الاستعلام';
PRINT '';

