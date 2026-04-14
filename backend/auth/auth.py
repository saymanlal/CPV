from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"])

def hash_password(password):
    return pwd.hash(password)

def verify(password, hashed):
    return pwd.verify(password, hashed)