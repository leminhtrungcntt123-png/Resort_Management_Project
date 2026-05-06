from fastapi import FastAPI
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

app=FastAPI(
    title="RAG chatbot ",
    description="chatbot ho tro tim kiem phoong",
    version="1.0.0"
)

logger =logging.getLogger(__name__)

@app.get("/")
def test():
    return {
        "static": "online",
        "message":"welcome to my chatbot"
        }

logger.info("Run server fastAPI")