import json
import os
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
# Load biến môi trường từ file .env (DATABASE_URL, v.v.)
load_dotenv()

DATA_DIR = "/app/data"
DB_URL = os.getenv("DATABASE_URL")
engine = create_engine(DB_URL)

logging.basicConfig(level=logging.INFO)
_logger = logging.getLogger(__name__)

def extract_room_types_to_jsonl(output_file: str):
    _logger.info("Bắt đầu trích xuất dữ liệu từ MySQL sang định dạng JSONL...")
    
    # Tạo thư mục chứa dữ liệu nếu chưa có
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    try:
        with engine.connect() as connection:
            # Truy vấn lấy dữ liệu từ bảng của bạn
            query = text("""
                SELECT id, type_name, description, price_per_night, capacity 
                FROM room_types
            """)
            result = connection.execute(query)
            
            with open(output_file, "w", encoding="utf-8") as f:
                for row in result.mappings():
                    # 1. Xử lý dữ liệu an toàn
                    room_id = row["id"]
                    name = row["type_name"]
                    desc = row["description"] if row["description"] else "Không có mô tả cụ thể."
                    price = float(row["price_per_night"])
                    cap = row["capacity"]

                    # 2. Tạo cấu trúc Document (Giống hệt trong video/ảnh bạn gửi)
                    # 'content' là phần sẽ được dùng để tìm kiếm (Vector Search)
                    # 'metadata' dùng để lọc dữ liệu (Filtering)
                    doc = {
                        "doc_id": f"room_{room_id}",
                        "content": f"Loại phòng: {name}. Chi tiết: {desc}. Sức chứa: {cap} người. Giá: {price} VNĐ.",
                        "metadata": {
                            "room_type": name,
                            "price": price,
                            "capacity": cap,
                            "source": "mysql_room_types"
                        }
                    }
                    
                    # 3. Ghi vào file JSONL (mỗi dòng một JSON object)
                    f.write(json.dumps(doc, ensure_ascii=False) + "\n")
                    
        _logger.info(f"Đã trích xuất xong! File lưu tại: {output_file}")
        
    except Exception as e:
        _logger.error(f"Lỗi khi trích xuất: {e}")

if __name__ == "__main__":
    # Đường dẫn file output trong container
    path = os.path.join(DATA_DIR, "room_data.jsonl")
    extract_room_types_to_jsonl(path)