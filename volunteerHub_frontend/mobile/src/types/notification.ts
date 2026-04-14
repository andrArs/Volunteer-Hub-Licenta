export type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  eventId?: string | null;
};
