from fastapi import FastAPI
from schemas import UserCreate

app = FastAPI()

@app.get("/")
def root():
    return {"service": "auth running"}

@app.post("/register")
def register(user: UserCreate):
    return {"message": "user registered"}