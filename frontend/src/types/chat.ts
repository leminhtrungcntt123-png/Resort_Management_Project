
// Định nghĩa cấu trúc nút bấm nhận từ Backend
export interface SuggestedAction {
  label: string;
  action: string;
  payload: string;
}

// Định nghĩa cấu trúc của một tin nhắn trong Ô Chat
export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  related_rooms?: any[];
  suggested_actions?: SuggestedAction[];
  timestamp: Date;
}