# LifeOS — راهنمای راه‌اندازی روی GitHub Pages

## ساختار فایل‌ها

```
lifeos/
├── index.html           ← برنامه اصلی
├── manifest.json        ← تنظیمات PWA
├── sw.js                ← Service Worker (نوتیفیکیشن + آفلاین)
└── icons/
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    ├── icon-512.png
    ├── icon-maskable-512.png
    └── apple-touch-icon.png
```

---

## مراحل راه‌اندازی روی GitHub Pages

### ۱. ساخت ریپازیتوری
- به github.com برو
- روی **New repository** کلیک کن
- نام بده (مثلاً `lifeos`) — **Public** انتخاب کن
- **Create repository** بزن

### ۲. آپلود فایل‌ها
گزینه A — از مرورگر (راحت‌تر):
- توی ریپازیتوری روی **Add file → Upload files** کلیک کن
- همه فایل‌ها و پوشه `icons` رو drag & drop کن
- **Commit changes** بزن

گزینه B — از ترمینال:
```bash
git clone https://github.com/USERNAME/lifeos
cd lifeos
# فایل‌ها رو کپی کن اینجا
git add .
git commit -m "init"
git push
```

### ۳. فعال‌سازی GitHub Pages
- توی ریپازیتوری، **Settings** رو باز کن
- از منوی چپ **Pages** رو انتخاب کن
- زیر **Branch**: شاخه `main` و پوشه `/ (root)` رو انتخاب کن
- **Save** بزن

### ۴. آدرس برنامه
بعد از حدود ۱-۲ دقیقه برنامه روی این آدرس آماده می‌شه:

```
https://USERNAME.github.io/lifeos/
```

---

## چرا GitHub Pages؟

| مرورگر | فایل HTML | GitHub Pages (HTTPS) |
|--------|-----------|---------------------|
| Firefox Desktop | ✅ نوتیفیکیشن | ✅ نوتیفیکیشن |
| Chrome Desktop | ❌ | ✅ نوتیفیکیشن |
| Edge Desktop | ❌ | ✅ نوتیفیکیشن |
| Chrome Android | ❌ | ✅ نوتیفیکیشن + نصب |
| Safari iOS | ❌ | ✅ Add to Home Screen |

Chrome و Edge به HTTPS نیاز دارن برای Notification API.

---

## نصب به عنوان اپ (PWA Install)

**دسکتاپ Chrome/Edge:**
- بعد از باز کردن آدرس، در نوار آدرس یه آیکون نصب ظاهر می‌شه
- یا دکمه **📲 نصب LifeOS** در گوشه پایین sidebar رو بزن

**اندروید (Chrome):**
- بعد از باز کردن آدرس، یه banner **Add to Home Screen** ظاهر می‌شه
- یا از منوی سه نقطه → **Add to Home Screen**

**iOS (Safari):**
- آدرس رو باز کن
- دکمه Share (مربع با فلش) رو بزن
- **Add to Home Screen** رو انتخاب کن

---

## آپدیت برنامه

هر بار که `index.html` رو تغییر میدی:
1. فایل جدید رو توی ریپازیتوری آپلود/push کن
2. در `sw.js` شماره نسخه Cache رو تغییر بده:
   ```js
   const CACHE_VERSION = 'lifeos-v2';  // ← عدد رو بالا ببر
   ```
3. کاربران بعد از refresh بعدی نسخه جدید رو می‌گیرن
