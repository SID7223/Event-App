interface NewsletterEvent {
  imageUrl: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  city: string;
}

interface NewsletterData {
  events: NewsletterEvent[];
  city: string;
  subscriberEmail: string;
  unsubscribeToken: string;
  subject: string;
}

const subjects = [
  'Look what you\'re missing out this week',
  'Your weekly dose of events just dropped',
  'Don\'t be the last to know about these events',
  'This week\'s hottest events are here',
  'Your city is buzzing — and you\'re not there yet',
  'The weekend is coming. We got you.',
  'Events you can\'t afford to miss',
  'Something big is happening near you',
];

export function pickSubject(): string {
  return subjects[Math.floor(Math.random() * subjects.length)];
}

function formatPrice(price: number): string {
  if (price === 0) return 'FREE';
  return `PKR ${price.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export function buildHtml(data: NewsletterData): string {
  const eventCards = data.events.map((ev) => `
    <tr>
      <td style="padding: 0 0 24px 0;">
        <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 560px; margin: 0 auto; background: #161B24; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
          <tr>
            <td style="padding: 0; position: relative;">
              <img src="${ev.imageUrl}" alt="${ev.title}" style="width: 100%; height: 200px; object-fit: cover; display: block; border: 0;" />
              <table cellpadding="0" cellspacing="0" style="position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg, #E43414, #FF6B35); border-radius: 8px; padding: 6px 12px;">
                <tr>
                  <td style="color: #FFFFFF; font-family: 'Inter', Arial, sans-serif; font-size: 12px; font-weight: 600;">${ev.category}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 20px 20px 20px;">
              <h3 style="margin: 0 0 12px 0; color: #FFFFFF; font-family: 'Inter', Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 24px;">${ev.title}</h3>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 6px 0; color: rgba(255,255,255,0.6); font-family: 'Inter', Arial, sans-serif; font-size: 13px;">
                    <span style="color: #99E1D9;">\u{1F4C5}</span> ${formatDate(ev.date)} at ${ev.time}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 6px 0; color: rgba(255,255,255,0.6); font-family: 'Inter', Arial, sans-serif; font-size: 13px;">
                    <span style="color: #E43414;">\u{1F4CD}</span> ${ev.location}
                  </td>
                </tr>
              </table>
              <div style="margin-top: 14px; display: inline-block; background: rgba(228, 52, 20, 0.15); color: #E43414; font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 700; padding: 6px 16px; border-radius: 999px;">${formatPrice(ev.price)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const cityDisplay = data.city.charAt(0).toUpperCase() + data.city.slice(1);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
</head>
<body style="margin: 0; padding: 0; background: #0A0C12; font-family: 'Inter', 'Segoe UI', Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" style="width: 100%; background: #0A0C12;">
    <tr>
      <td style="padding: 40px 16px;">
        <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">

          <!-- Header -->
          <tr>
            <td style="text-align: center; padding: 0 0 32px 0;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                <span style="color: #99E1D9;">chilling</span><span style="color: #E43414;">z</span>
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.5); font-size: 14px;">Discover events in <strong style="color: #99E1D9;">${cityDisplay}</strong></p>
            </td>
          </tr>

          <!-- Subject Line -->
          <tr>
            <td style="text-align: center; padding: 0 0 32px 0;">
              <h2 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; line-height: 30px;">${data.subject}</h2>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.45); font-size: 14px;">Handpicked events happening near you this week</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 0 28px 0;">
              <table cellpadding="0" cellspacing="0" style="width: 60px; margin: 0 auto;">
                <tr>
                  <td style="height: 3px; background: linear-gradient(to right, #99E1D9, #E43414); border-radius: 2px;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Event Cards -->
          ${eventCards}

          <!-- CTA -->
          <tr>
            <td style="text-align: center; padding: 8px 0 32px 0;">
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #99E1D9, #E43414); border-radius: 999px; padding: 14px 40px;">
                    <a href="https://chillingz.com/explore?city=${data.city}" style="color: #FFFFFF; font-family: 'Inter', Arial, sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; display: block;">Explore More Events</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid rgba(255,255,255,0.06); padding: 24px 0 0 0;">
              <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">
                You received this email because you subscribed to Chillingz newsletters.
              </p>
              <p style="margin: 0; text-align: center;">
                <a href="https://chillingz.com/unsubscribe?email=${encodeURIComponent(data.subscriberEmail)}&token=${data.unsubscribeToken}" style="color: rgba(255,255,255,0.25); font-size: 12px; text-decoration: underline;">Unsubscribe</a>
                <span style="color: rgba(255,255,255,0.15); font-size: 12px; padding: 0 8px;">|</span>
                <a href="https://chillingz.com" style="color: #99E1D9; font-size: 12px; text-decoration: none;">chillingz.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
