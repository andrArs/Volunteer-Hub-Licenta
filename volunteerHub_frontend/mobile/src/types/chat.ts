export interface MessageDto {
  id: string;
  role: "user" | "model";
  content: string;
  createdAt: string;
}

export interface ConversationDto {
  id: string;
  createdAt: string;
  title: string | null;
  summary: string | null;
  messages: MessageDto[];
}

export interface AiChatResponse {
  reply: string;
  conversationId: string;
}