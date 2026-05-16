export type Notification = {
  id: string;
  userId: string;
  type: string;
  /** Arbitrary JSON payload; structure depends on the notification type */
  payload: Record<string, unknown>;
  sentAt: Date | null;
  readAt: Date | null;
};
