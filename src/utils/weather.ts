export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'evening' | 'night';

export interface WeatherData {
  condition: string;
  conditionCode: number;
  tempC: number;
  isDay: boolean;
  fetchedAt: number;
  city: string;
}

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  lahore: { lat: 31.5204, lon: 74.3587 },
  karachi: { lat: 24.8607, lon: 67.0011 },
  islamabad: { lat: 33.6844, lon: 73.0479 },
};

const CACHE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export const getTimeOfDay = (hour?: number): TimeOfDay => {
  const h = hour ?? new Date().getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 16) return 'noon';
  if (h >= 16 && h < 19) return 'sunset';
  if (h >= 19 && h < 22) return 'evening';
  return 'night';
};

export const GRADIENT_MAP: Record<TimeOfDay, readonly string[]> = {
  morning: ['#87CEEB', '#3A6073', '#0A0C12'],
  noon:     ['#FFDF00', '#F0A500', '#0A0C12'],
  sunset:   ['#FF7E5F', '#C0392B', '#0A0C12'],
  evening:  ['#2B5876', '#1A1A3E', '#0A0C12'],
  night:    ['#0D0D0D', '#050508', '#0A0C12'],
};

export const getWeatherEmoji = (conditionCode: number, isDay: boolean): string => {
  if (conditionCode >= 200 && conditionCode < 300) return '⛈️';
  if (conditionCode >= 300 && conditionCode < 400) return '🌧️';
  if (conditionCode >= 500 && conditionCode < 600) return '🌧️';
  if (conditionCode >= 600 && conditionCode < 700) return '❄️';
  if (conditionCode >= 700 && conditionCode < 800) return '🌫️';
  if (conditionCode === 800) return isDay ? '☀️' : '🌙';
  if (conditionCode === 801) return isDay ? '⛅' : '☁️';
  if (conditionCode >= 802) return '☁️';
  return isDay ? '☀️' : '🌙';
};

export const getWeatherIconKey = (conditionCode: number, isDay: boolean): string => {
  if (conditionCode >= 200 && conditionCode < 300) return 'thunderstorms';
  if (conditionCode >= 300 && conditionCode < 400) return 'drizzle';
  if (conditionCode >= 500 && conditionCode < 505) return 'showers_rain';
  if (conditionCode >= 505 && conditionCode < 600) return 'heavy_rain';
  if (conditionCode >= 600 && conditionCode < 613) return 'heavy_snow';
  if (conditionCode >= 613 && conditionCode < 700) return 'flurries';
  if (conditionCode >= 700 && conditionCode < 742) return 'windy';
  if (conditionCode >= 741 && conditionCode < 800) return 'haze_fog_dust_smoke';
  if (conditionCode === 800) return isDay ? 'clear_day' : 'clear_night';
  if (conditionCode === 801) return isDay ? 'mostly_clear_day' : 'mostly_clear_night';
  if (conditionCode === 802) return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
  if (conditionCode === 803 || conditionCode === 804) return isDay ? 'mostly_cloudy_day' : 'mostly_cloudy_night';
  return isDay ? 'clear_day' : 'clear_night';
};

const WEATHER_EMOJI_MAP: Record<string, string> = {
  Clear: '☀️',
  Sunny: '☀️',
  'Partly cloudy': '⛅',
  Cloudy: '☁️',
  Overcast: '☁️',
  Mist: '🌫️',
  Fog: '🌫️',
  Haze: '🌫️',
  Rain: '🌧️',
  'Light rain': '🌦️',
  'Heavy rain': '🌧️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Drizzle: '🌦️',
};

export const getWeatherEmojiFromText = (condition: string, isDay: boolean): string => {
  const matched = Object.keys(WEATHER_EMOJI_MAP).find(key =>
    condition.toLowerCase().includes(key.toLowerCase())
  );
  if (matched) return WEATHER_EMOJI_MAP[matched];
  return isDay ? '☀️' : '🌙';
};

const WEATHER_ICON_KEY_MAP: Record<string, string> = {
  Clear: 'clear_day',
  Sunny: 'sunny',
  'Partly cloudy': 'partly_cloudy_day',
  Cloudy: 'cloudy',
  Overcast: 'cloudy',
  Mist: 'haze_fog_dust_smoke',
  Fog: 'haze_fog_dust_smoke',
  Haze: 'haze_fog_dust_smoke',
  Rain: 'showers_rain',
  'Light rain': 'drizzle',
  'Heavy rain': 'heavy_rain',
  Thunderstorm: 'thunderstorms',
  Snow: 'heavy_snow',
  Drizzle: 'drizzle',
};

export const getWeatherIconKeyFromText = (condition: string, isDay: boolean): string => {
  const matched = Object.keys(WEATHER_ICON_KEY_MAP).find(key =>
    condition.toLowerCase().includes(key.toLowerCase())
  );
  if (matched) {
    const base = WEATHER_ICON_KEY_MAP[matched];
    if (base === 'clear_day') return isDay ? 'clear_day' : 'clear_night';
    if (base === 'partly_cloudy_day') return isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
    return base;
  }
  return isDay ? 'clear_day' : 'clear_night';
};

export const fetchWeather = async (city: string): Promise<WeatherData | null> => {
  const coords = CITY_COORDS[city.toLowerCase()];
  if (!coords) return null;

  const apiKey = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
  if (!apiKey) {
    console.warn('[Weather] EXPO_PUBLIC_WEATHER_API_KEY not set in .env');
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${apiKey}`;
    console.log('[Weather] Fetching:', url);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('[Weather] API error:', response.status);
      return null;
    }

    const data = await response.json();
    const isDay = data.weather?.[0]?.icon?.endsWith('d') ?? true;
    const result: WeatherData = {
      condition: data.weather?.[0]?.description ?? 'Clear',
      conditionCode: data.weather?.[0]?.id ?? 800,
      tempC: Math.round(data.main?.temp ?? 25),
      isDay,
      fetchedAt: Date.now(),
      city: city.toLowerCase(),
    };
    console.log('[Weather] Result:', result.condition, 'code=' + result.conditionCode, 'isDay=' + result.isDay);
    return result;
  } catch (e) {
    console.warn('[Weather] Fetch failed:', e);
    return null;
  }
};

export const isWeatherCacheValid = (weather: WeatherData | null): boolean => {
  if (!weather) return false;
  return Date.now() - weather.fetchedAt < CACHE_DURATION_MS;
};
