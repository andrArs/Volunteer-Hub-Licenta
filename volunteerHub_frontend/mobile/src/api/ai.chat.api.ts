import { api } from "./client";
import { AiChatResponse, ConversationDto, MessageDto } from "@/src/types/chat";

export const aiService = {
  async sendMessage(message: string, conversationId?: string): Promise<AiChatResponse> {
    const res = await api.post<AiChatResponse>("/api/ai/chat", {
      Message: message,
      ConversationId: conversationId,
    });
    return res.data;
  },    

  async getConversations(): Promise<ConversationDto[]> {
    const res = await api.get<ConversationDto[]>("/api/ai/conversations");
    return res.data;
  },

  async getConversation(id: string): Promise<ConversationDto> {
    const res = await api.get<ConversationDto>(`/api/ai/conversations/${id}`);
    return res.data;
  },

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/api/ai/conversations/${id}`, { method: "DELETE" });
  },

  async updateAttendance(eventId: string, status: "going" | "interested" | "none"): Promise<void> {
    await api.post(`/api/events/${eventId}/attendance`, {
        Status: status
    });
  },
};