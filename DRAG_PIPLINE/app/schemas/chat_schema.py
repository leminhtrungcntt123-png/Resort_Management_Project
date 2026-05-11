from pydantic import BaseModel,Field
from typing import List, Optional
from .search_schema import RoomSearchResult

# Nhận câu hỏi từ người dùng (Input)
class ChatRequest(BaseModel):
    message: str = Field(..., example="Tìm cho tôi phòng 2 người dưới 1 triệu")

# Trả về câu trả lời của AI (Output)
class ChatResponse(BaseModel):
    answer: str  # Câu trả lời từ LLM (Groq/OpenAI)
    related_rooms: List[RoomSearchResult]  # Danh sách các phòng tìm thấy trong Qdrant