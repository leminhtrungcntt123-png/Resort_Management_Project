from fastapi import APIRouter, HTTPException
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.rag_service import get_rag_response
import logging

# Khởi tạo logger để theo dõi lỗi
logger = logging.getLogger(__name__)

# Khởi tạo router
router = APIRouter()

@router.post("/chat", response_model=ChatResponse, summary="Chat với Trợ lý ảo Resort")
async def chat_with_resort(request: ChatRequest):
    try:
        # 1. Gọi hàm xử lý RAG từ service đã viết
        # answer: Câu trả lời từ AI
        # related_rooms: Danh sách các phòng tìm được trong Qdrant
        answer, related_rooms = get_rag_response(request.message)
        
        # 2. Trả về đúng định dạng Schema đã định nghĩa
        return ChatResponse(
            answer=answer,
            related_rooms=related_rooms
        )
        
    except Exception as e:
        logger.error(f"Lỗi khi chat: {str(e)}")
        # Sửa detail thành str(e) để Swagger hiện lỗi thật
        raise HTTPException(status_code=500, detail=f": {str(e)}")