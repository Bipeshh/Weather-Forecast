import { v } from "convex/values";
import { action, query } from "./_generated/server";

export const getWeatherData = action({
  args: {
    city: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get coordinates for the city
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(args.city)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json() as any;

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const { latitude, longitude, name, admin1, country } = geoData.results[0];

    // 2. Get weather data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json() as any;

    const current = weatherData.current_weather;
    const daily = weatherData.daily;

    // Map weather codes to condition names
    const getCondition = (code: number) => {
      if (code === 0) return "Sun";
      if (code <= 3) return "Cloud";
      if (code <= 48) return "Cloud";
      if (code <= 55) return "CloudRain";
      if (code <= 65) return "CloudRain";
      if (code <= 75) return "CloudSnow";
      if (code <= 82) return "CloudRain";
      if (code <= 99) return "CloudLightning";
      return "Sun";
    };

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    const forecast = daily.time.map((time: string, i: number) => {
      const date = new Date(time);
      return {
        day: days[date.getDay()],
        temp: Math.round(daily.temperature_2m_max[i]),
        condition: getCondition(daily.weathercode[i]),
      };
    }).slice(1, 6); // Next 5 days

    return {
      city: name,
      location: `${admin1 ? admin1 + ', ' : ''}${country}`,
      temp: Math.round(current.temperature),
      condition: getCondition(current.weathercode),
      description: `High of ${Math.round(daily.temperature_2m_max[0])}°, low of ${Math.round(daily.temperature_2m_min[0])}°`,
      high: Math.round(daily.temperature_2m_max[0]),
      low: Math.round(daily.temperature_2m_min[0]),
      humidity: 0, // Open-Meteo current_weather doesn't include humidity by default in this call
      windSpeed: Math.round(current.windspeed),
      forecast: forecast,
    };
  },
});
