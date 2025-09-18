# إعداد المشروع - REHAL

## خطوات الإعداد

### 1. إنشاء ملف .env
أنشئ ملف `.env` في المجلد الرئيسي وأضف:

```
PORT=3000
DATABASE_URL=postgresql://postgres:Ahmed%401989@db.yrwwwcfxwfvwontqbayt.supabase.co:5432/postgres
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد قاعدة البيانات
```bash
npm run init:db
```

### 4. تشغيل الخادم
```bash
npm start
```

## استكشاف الأخطاء

إذا ظهرت رسالة "فشل إنشاء الحساب":

1. **تحقق من ملف .env**: تأكد من وجود ملف `.env` مع `DATABASE_URL` الصحيح
2. **تحقق من قاعدة البيانات**: تأكد من تشغيل `npm run init:db`
3. **تحقق من الخادم**: افتح Developer Tools في المتصفح وانتقل إلى Console لرؤية رسائل الخطأ
4. **تحقق من الخادم**: في Terminal، ستظهر رسائل مفصلة عن الأخطاء

## اختبار الاتصال
افتح: http://localhost:3000/api/health

يجب أن ترى: `{"ok":true,"db":1}`
