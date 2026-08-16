# نصب کاملاً آفلاین روی VPS

این بسته برای سروری ساخته شده که دانلود Docker، npm یا GitHub روی آن قطع یا ناپایدار است. تمام runtime و وابستگی‌ها از ویندوز شما منتقل می‌شوند و VPS هیچ فایلی از اینترنت دریافت نمی‌کند.

در PowerShell ویندوز اجرا کنید:

```powershell
cd "C:\path\to\sabzino"
powershell -ExecutionPolicy Bypass -File ".\deploy-offline\upload-offline.ps1" -Server "YOUR_SERVER_IP"
```

فایل در قطعه‌های کوچک ارسال می‌شود. اگر ارتباط قطع شد، دستور را دوباره اجرا کنید.

پس از نصب:

- سایت: `http://YOUR_SERVER_IP`
- پنل مدیریت: `http://YOUR_SERVER_IP/admin`

مشاهده وضعیت سرویس:

```powershell
ssh root@YOUR_SERVER_IP "systemctl status sabzino --no-pager"
```

مشاهده گزارش‌ها:

```powershell
ssh root@YOUR_SERVER_IP "journalctl -u sabzino -n 100 --no-pager"
```
