from bot_api import app, chat_endpoint, ChatRequest, BotResponse
import uvicorn

if __name__ == "__main__":
    uvicorn.run("bot_api:app", host="0.0.0.0", port=8000, reload=True)


