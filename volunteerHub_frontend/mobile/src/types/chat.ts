export interface MessageDto {
  id: string;
  role: "user" | "model";
  content: string;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  createdAt: string;
  summary: string | null;
  messages: MessageDto[];
}

export interface AiChatResponse {
  reply: string;
  conversationId: string;
}