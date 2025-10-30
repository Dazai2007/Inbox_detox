from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from jose import jwt, JWTError
from app.core.config import settings


def custom_key_func(request: Request) -> str | None:
    """
    Hız sınırlaması için özel anahtar fonksiyonu.
    
    1. OPTIONS (preflight) isteklerini hız sınırlamasından MUAF TUTAR.
    2. Anahtar olarak kimliği doğrulanmış kullanıcıyı (JWT) kullanmayı dener.
    3. Token yoksa veya geçersizse IP adresine geri döner.
    """
    
    # 1. OPTIONS (preflight) isteklerini es geç
    # Bu, 'preflight 400' CORS hatasını kalıcı olarak çözer.
    if request.method == "OPTIONS":
        return None

    # 2. JWT'den kullanıcıyı almayı dene (eski user_rate_limit_key fonksiyonu)
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        try:
            token = auth.split(" ", 1)[1].strip()
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            sub = payload.get("sub")
            if sub:
                return f"user:{sub.lower()}"
        except JWTError:
            # Token geçersizse, IP'ye geri dön (aşağıdaki kod)
            pass
    
    # 3. IP adresine geri dön
    return get_remote_address(request)


# Global limiter (Hız Sınırlayıcı)
# Artık OPTIONS isteklerini görmezden gelen 'custom_key_func' kullanıyor.
limiter = Limiter(
    key_func=custom_key_func,
    default_limits=[f"{settings.rate_limit_per_minute}/minute"],
    headers_enabled=True,
)
