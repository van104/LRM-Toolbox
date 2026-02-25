export interface FeedbackData {
  type: string;
  content: string;
  contact?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface FeedbackItem {
  id: string;
  type: string;
  content: string;
  contact?: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  timestamp: string;
  userAgent?: string;
}
