# Alembic migration: Enum değerlerini düzeltme
"FREE" → "free"

"PREMIUM" → "premium"
"TRIAL" → "trial"
"BASIC" → "basic"
"PRO" → "pro"
"BUSINESS" → "business"

---

PostgreSQL için migration komutları:

```sql
-- Kullanıcı tablosunda subscription_tier ve subscription_status alanlarını düzelt
UPDATE users SET subscription_tier = 'free' WHERE subscription_tier = 'FREE';
UPDATE users SET subscription_tier = 'premium' WHERE subscription_tier = 'PREMIUM';
UPDATE users SET subscription_tier = 'trial' WHERE subscription_tier = 'TRIAL';
UPDATE users SET subscription_tier = 'basic' WHERE subscription_tier = 'BASIC';

UPDATE users SET subscription_status = 'free' WHERE subscription_status = 'FREE';
UPDATE users SET subscription_status = 'pro' WHERE subscription_status = 'PRO';
UPDATE users SET subscription_status = 'business' WHERE subscription_status = 'BUSINESS';

-- Enum tipini değiştirmek için (manuel müdahale gerekebilir)
-- Enum tipini yeniden oluşturmak veya yeni değer eklemek için aşağıdaki gibi komutlar kullanılır:
-- ALTER TYPE subscriptiontier ADD VALUE IF NOT EXISTS 'free';
-- ALTER TYPE subscriptionstatus ADD VALUE IF NOT EXISTS 'free';

-- Enum tipinden büyük harfli değerleri kaldırmak için migration ve veri güncellemesi gerekebilir.
```

# Notlar
- Enum tipini değiştirmek için bazen yeni bir enum oluşturup tabloyu güncellemek gerekebilir.
- Migration işlemi öncesi mutlaka yedek alınız.
- Alembic ile migration dosyası oluşturmak için: `alembic revision --autogenerate -m "Enum fix: FREE -> free"`
- SQL komutlarını doğrudan veritabanında çalıştırabilirsiniz.
