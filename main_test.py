from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Inbox Detox API çalışıyor!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)