const MORNING_GREETINGS = [
  "Let's plan your day out, [Name].",
  "Coffee first, plans second.",
  "What's the move today?",
  "Your city is waking up. Ready to explore?",
];

const NOON_GREETINGS = [
  "Afternoon slump? Let's fix that.",
  "Lunch break? Plan tonight's escape.",
  "What's the scene tonight, [Name]?",
  "Halfway through the day. Let's find some fun.",
];

const EVENING_GREETINGS = [
  "The night is young. Where to?",
  "Time to clock out and step out.",
  "Your friends are making plans...",
  "Evening, [Name]! The city is buzzing.",
];

const LATE_NIGHT_GREETINGS = [
  "Late night cravings? We got you.",
  "Still awake? See what's open near you.",
  "Night owl? Us too.",
  "Let's line up tomorrow's adventure.",
];

const WEEKEND_GREETINGS = [
  "Weekend mode: Activated ⚡",
  "Let's make this weekend count.",
];

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const isWeekendOverride = (dayOfWeek: number, hour: number): boolean => {
  // Friday after 17:00
  if (dayOfWeek === 5 && hour >= 17) return true;
  // Saturday (6) or Sunday (0)
  if (dayOfWeek === 6 || dayOfWeek === 0) return true;
  return false;
};

const getTimeBlock = (hour: number): 'morning' | 'noon' | 'evening' | 'latenight' => {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'noon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'latenight';
};

const resolveName = (greeting: string, firstName?: string | null): string => {
  if (!greeting.includes('[Name]')) return greeting;
  const name = firstName?.trim();
  if (name) return greeting.replace(/\[Name\]/g, name);
  // Fallback: remove "[Name]." or replace with "friend"
  return greeting
    .replace(/,?\s*\[Name\]\./g, '.')
    .replace(/\[Name\]!/g, '!')
    .replace(/\[Name\]/g, 'friend');
};

export const getDynamicGreeting = (
  hour?: number,
  dayOfWeek?: number,
  firstName?: string | null,
): string => {
  const h = hour ?? new Date().getHours();
  const dow = dayOfWeek ?? new Date().getDay();

  // 50% chance of weekend override if applicable
  if (isWeekendOverride(dow, h) && Math.random() < 0.5) {
    return resolveName(pickRandom(WEEKEND_GREETINGS), firstName);
  }

  const block = getTimeBlock(h);
  switch (block) {
    case 'morning':
      return resolveName(pickRandom(MORNING_GREETINGS), firstName);
    case 'noon':
      return resolveName(pickRandom(NOON_GREETINGS), firstName);
    case 'evening':
      return resolveName(pickRandom(EVENING_GREETINGS), firstName);
    case 'latenight':
      return resolveName(pickRandom(LATE_NIGHT_GREETINGS), firstName);
  }
};
