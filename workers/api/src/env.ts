export interface Env {
  chillingz_db: D1Database;
  PUSHER_APP_ID?: string;
  PUSHER_KEY?: string;
  PUSHER_SECRET?: string;
  PUSHER_CLUSTER?: string;
  AI?: any;
  SEND_EMAIL: SendEmail;
}
