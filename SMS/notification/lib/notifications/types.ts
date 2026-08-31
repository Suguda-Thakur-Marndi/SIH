export type NotificationType = "DISTRESS" | "DISASTER" | "WEATHER" | "MARKET" | "LOAN" | string;

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type NotificationChannel = "SMS" | "IN_APP" | "VOICE" | "PUSH";

export type NotificationStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";

export type NotificationEvent = {
  farmerId: string;
  type: NotificationType;
  priority: Priority;
  score?: number;
  reasons: string[];
  language: string;
  channel: NotificationChannel;
  metadata?: Record<string, unknown>;
};
