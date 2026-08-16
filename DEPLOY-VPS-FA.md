# راه‌اندازی سبزینو روی VPS

این بسته، فروشگاه، بک‌اند، پنل مدیریت، حساب مشتریان و دیتابیس محلی پایدار را با Docker اجرا می‌کند. اطلاعات دیتابیس در پوشه `data` باقی می‌ماند و با ری‌استارت یا به‌روزرسانی کانتینر حذف نمی‌شود.

## نصب اولیه

1. فایل بسته را روی سرور در مسیر `/opt` کپی و استخراج کنید.
2. وارد پوشه پروژه شوید.
3. دستور زیر را اجرا کنید:

```bash
sudo bash deploy/deploy.sh
```

در پایان، اسکریپت نام کاربری و رمز اولیه مدیر را از شما می‌پرسد. رمز در فایل یا تاریخچه دستور ذخیره نمی‌شود.

سایت روی پورت‌های ۸۰ و ۴۴۳ اجرا می‌شود و پنل مدیریت فقط در مسیر `/admin` است.

## اتصال دامنه و HTTPS

فایل `.env` را ویرایش کنید:

```env
SITE_ADDRESS=example.com
COOKIE_SECURE=true
```

سپس DNS دامنه را به IP سرور متصل کنید و اجرا کنید:

```bash
sudo docker compose up -d
```

Caddy گواهی HTTPS را به‌صورت خودکار دریافت و تمدید می‌کند.

## به‌روزرسانی

نسخه جدید را جایگزین کنید و سپس:

```bash
sudo docker compose up -d --build
```

مهاجرت‌های دیتابیس هنگام شروع برنامه خودکار اجرا می‌شوند.

## بکاپ

```bash
sudo bash deploy/backup.sh
```

برای بکاپ روزانه، این خط را با `sudo crontab -e` اضافه کنید:

```cron
15 3 * * * cd /opt/sabzino && bash deploy/backup.sh >/var/log/sabzino-backup.log 2>&1
```

## بازیابی

```bash
sudo bash deploy/restore.sh backups/sabzino-YYYYMMDD-HHMMSS.tar.gz
```

## مشاهده وضعیت و گزارش‌ها

```bash
sudo docker compose ps
sudo docker compose logs -f --tail=100 app
```
