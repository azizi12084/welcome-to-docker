# 1) نستخدم Node رسمي وخفيف
FROM node:20-alpine

# 2) مجلد العمل داخل الحاوية
WORKDIR /app

# 3) نسخ ملفات التعريف فقط (لتسريع build)
COPY package*.json ./

# 4) تثبيت الاعتمادات
RUN npm install

# 5) نسخ باقي المشروع
COPY . .

# 6) فتح المنفذ
EXPOSE 3000

# 7) تشغيل التطبيق
CMD ["npm", "start"]
