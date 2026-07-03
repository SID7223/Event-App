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
  noon:     ['#FF8F00', '#FFA000', '#FFB300', '#FFC107', '#FFD600', '#FFEA00'],
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
  // Thunderstorm group (2xx)
  if (conditionCode >= 200 && conditionCode <= 202) return isDay ? 'isolated_scattered_thunderstorms_day' : 'isolated_scattered_thunderstorms_night';
  if (conditionCode >= 210 && conditionCode <= 221) return 'strong_thunderstorms';
  if (conditionCode >= 230 && conditionCode <= 232) return isDay ? 'isolated_scattered_thunderstorms_day' : 'isolated_scattered_thunderstorms_night';
  if (conditionCode >= 200 && conditionCode < 300) return 'thunderstorms';
  // Drizzle group (3xx)
  if (conditionCode >= 300 && conditionCode < 400) return 'drizzle';
  // Rain group (5xx) — 500=light rain, 501=moderate, 502+=heavy
  if (conditionCode === 500) return 'scattered_showers_day';
  if (conditionCode === 501) return 'showers_rain';
  if (conditionCode >= 502 && conditionCode < 600) return 'heavy_rain';
  // Snow group (6xx)
  if (conditionCode >= 600 && conditionCode <= 613) return 'heavy_snow';
  if (conditionCode >= 614 && conditionCode < 700) return 'flurries';
  // Atmosphere group (7xx)
  if (conditionCode === 701) return 'haze_fog_dust_smoke'; // mist
  if (conditionCode === 711) return 'haze_fog_dust_smoke'; // smoke
  if (conditionCode === 721) return 'haze_fog_dust_smoke'; // haze
  if (conditionCode === 731 || conditionCode === 751 || conditionCode === 761) return 'haze_fog_dust_smoke'; // dust/sand
  if (conditionCode === 741) return 'haze_fog_dust_smoke'; // fog
  if (conditionCode === 762) return 'haze_fog_dust_smoke'; // volcanic ash
  if (conditionCode === 771) return 'windy'; // squalls
  if (conditionCode === 781) return 'tornado'; // tornado
  if (conditionCode >= 700 && conditionCode < 800) return 'haze_fog_dust_smoke';
  // Clear / Clouds group (8xx)
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
  if (!coords) {
    console.warn('[Weather] Unknown city:', city);
    return null;
  }

  // Read API key — try process.env first (works in native & web Expo),
  // then fall back to expo-constants extra config.
  let apiKey: string | undefined = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
  if (!apiKey) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Constants = require('expo-constants').default;
      apiKey = Constants.expoConfig?.extra?.weatherApiKey
        ?? Constants.manifest?.extra?.weatherApiKey
        ?? Constants.manifest2?.extra?.expoClient?.extra?.weatherApiKey;
    } catch (_) {
      // expo-constants not available, ignore
    }
  }

  if (!apiKey) {
    console.warn('[Weather] EXPO_PUBLIC_WEATHER_API_KEY not set in .env');
    return null;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${apiKey}`;
    console.log('[Weather] Fetching for city:', city);
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('[Weather] API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const weatherInfo = data.weather?.[0];
    const iconSuffix = weatherInfo?.icon ?? '';
    let isDay = iconSuffix.endsWith('d');

    // Override: some atmosphere codes (7xx) use night icon even during the day
    if (weatherInfo?.id >= 700 && weatherInfo?.id < 800) {
      const hour = new Date().getHours();
      isDay = hour >= 6 && hour < 19;
    }

    const result: WeatherData = {
      condition: weatherInfo?.description ?? 'clear sky',
      conditionCode: weatherInfo?.id ?? 800,
      tempC: Math.round(data.main?.temp ?? 25),
      isDay,
      fetchedAt: Date.now(),
      city: city.toLowerCase(),
    };
    console.log(
      '[Weather] Result:',
      result.condition,
      'code=' + result.conditionCode,
      'isDay=' + result.isDay,
      'icon=' + getWeatherIconKey(result.conditionCode, result.isDay)
    );
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
