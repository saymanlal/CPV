from fastapi import FastAPI
import httpx

app = FastAPI()

AUTH = "http://localhost:8001"

@app.get("/auth")
async def auth_proxy():
    async with httpx.AsyncClient() as client:
        r = await client.get(AUTH)
    return r.json()