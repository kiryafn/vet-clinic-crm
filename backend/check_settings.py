import sys
import os
sys.path.append(os.getcwd())
try:
    from app.core.config import settings
    print(f"SECRET_KEY: {settings.SECRET_KEY}")
    print(f"ALGORITHM: {settings.ALGORITHM}")
    print(f"ACCESS_TOKEN_EXPIRE_MINUTES: {settings.ACCESS_TOKEN_EXPIRE_MINUTES}")
    print(f"Type of EXPIRE: {type(settings.ACCESS_TOKEN_EXPIRE_MINUTES)}")
except Exception as e:
    print(e)
