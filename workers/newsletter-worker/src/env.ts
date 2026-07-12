import { EmailMessage } from 'cloudflare:email';

export interface Env {
  chillingz_db: D1Database;
  NEWSLETTER_EMAIL: SendEmail;
}

export { EmailMessage };
