export type NotificationType =
  | 'DISTRESS'
  | 'DISASTER'
  | 'WEATHER'
  | 'MARKET'
  | 'INSURANCE'
  | 'SCHEME'
  | 'LOAN'
  | 'OFFICER'
  | 'GENERAL'
  | string;

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type NotificationChannel = 'SMS' | 'IN_APP' | 'VOICE' | 'PUSH';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'QUEUED';

export interface NotificationEvent {
  farmerId: string;
  type: NotificationType;
  priority: Priority;
  score?: number;
  reasons?: string[];
  language?: string;
  channel: NotificationChannel;
  title?: string;
  customMessage?: string;
  metadata?: Record<string, unknown>;
  eventId?: string;
}

export interface SendSmsInput {
  userId: string;
  message: string;
  notificationType: NotificationType;
  priority?: Priority;
  score?: number;
  reasons?: string[];
  language?: string;
  eventId?: string;
}

export interface SendSmsResult {
  success: boolean;
  notificationId?: string;
  status: NotificationStatus;
  messageId?: string;
  error?: string;
}

export interface SmsProviderResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rawResponse?: any;
}
