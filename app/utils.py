from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
import bcrypt

load_dotenv()

# Parche para compatibilidad entre passlib 1.7.4 y bcrypt 4.0.0+
# passlib intenta acceder a bcrypt.__about__.__version__ que fue eliminado en versiones recientes
if not hasattr(bcrypt, "__about__"):
    class About:
        __version__ = bcrypt.__version__
    bcrypt.__about__ = About()

# Nuevo parche para evitar el error de longitud de contraseña con bcrypt 4.0+
# passlib realiza una prueba interna con una contraseña larga que hace fallar a las versiones nuevas de bcrypt
_original_hashpw = bcrypt.hashpw

def _hashpw_patch(password, salt):
    try:
        return _original_hashpw(password, salt)
    except ValueError:
        # Si la contraseña es muy larga (lo cual ocurre en el test interno de passlib),
        # la truncamos a 72 bytes para evitar el error.
        return _original_hashpw(password[:72], salt)

bcrypt.hashpw = _hashpw_patch

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkeynailsbyanais123!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 5 # 5 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
