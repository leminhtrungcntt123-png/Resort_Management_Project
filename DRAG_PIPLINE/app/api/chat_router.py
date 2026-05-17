from fastapi import APIRouter, HTTPException
from app.schemas.chat_schema import ChatRequest, ChatResponse
# Import thêm hàm unload_model_service từ service
from app.services.rag_service import get_rag_response, unload_model_service 
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_resort(request: ChatRequest):
    try:
        # Khi gọi hàm này, bên trong service sẽ tự kiểm tra: 
        # Nếu model chưa load thì nó mới load (Lazy Loading)
        answer, related_rooms = get_rag_response(request.message)
        
        return ChatResponse(
            answer=answer,
            related_rooms=related_rooms
        )
    except Exception as e:
        logger.error(f"Lỗi khi chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# THÊM ROUTE NÀY: Để giải phóng RAM khi đóng chatbot
@router.post("/unload")
async def unload_chatbot():
    try:
        unload_model_service()
        return {"status": "success", "message": "Model đã được giải phóng khỏi RAM"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))