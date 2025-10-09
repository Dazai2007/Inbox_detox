from typing import Set

blacklisted_jti: Set[str] = set()

def blacklist_jti(jti: str):
    blacklisted_jti.add(jti)

def is_blacklisted(jti: str) -> bool:
    return jti in blacklisted_jti