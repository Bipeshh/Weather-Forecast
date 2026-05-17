import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { 
  SafeAreaView, 
  Text, 
  Input, 
  Card, 
  CardContent,
  ScrollView,
  Pressable
} from "@/components/ui";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Droplets, 
  Search, 
  MapPin,
  CloudLightning,
  CloudSnow,
  Thermometer,
  AlertCircle
} from "lucide-react-native";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

type WeatherData = {
  city: string;
  location: string;
  temp: number;
  condition: string;
  description: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  forecast: {
    day: string;
    temp: number;
    condition: string;
  }[];
};

const WeatherIcon = ({ condition, size = 24, className = "text-foreground" }: { condition: string, size?: number, className?: string }) => {
  switch (condition) {
    case 'Sun': return <Sun size={size} className={className} />;
    case 'Cloud': return <Cloud size={size} className={className} />;
    case 'CloudRain': return <CloudRain size={size} className={className} />;
    case 'CloudLightning': return <CloudLightning size={size} className={className} />;
    case 'CloudSnow': return <CloudSnow size={size} className={className} />;
    case 'Partly Cloudy': return <Cloud size={size} className={className} />;
    default: return <Sun size={size} className={className} />;
  }
};

export default function WeatherScreen() {
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  
  const getWeatherData = useAction(api.weather.getWeatherData);

  const toCelsius = (f: number) => Math.round((f - 32) * 5 / 9);
  const displayTemp = (f: number) => unit === 'F' ? f : toCelsius(f);

  const fetchWeather = async (city: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching weather for:", city);
      const data = await getWeatherData({ city });
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("San Francisco");
  }, []);

  const handleSearch = () => {
    if (search.trim()) {
      fetchWeather(search.trim());
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-12">
        {/* Search Bar */}
        <View className="flex-row items-center gap-2 mb-8">
          <View className="flex-1 relative">
            <Input
              placeholder="Search city..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              className="pl-10"
            />
            <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          </View>
          <Pressable 
            className="bg-secondary p-3 rounded-xl active:opacity-70"
            onPress={handleSearch}
          >
            <Search size={20} className="text-secondary-foreground" />
          </Pressable>
        </View>

        {/* Unit Toggle */}
        <View className="flex-row justify-end mb-4">
          <Pressable 
            onPress={() => setUnit(unit === 'F' ? 'C' : 'F')}
            className="bg-secondary px-4 py-2 rounded-full flex-row items-center gap-2"
          >
            <Thermometer size={16} className="text-secondary-foreground" />
            <Text className="font-medium text-secondary-foreground">
              Switch to °{unit === 'F' ? 'C' : 'F'}
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="rgb(59, 130, 246)" />
            <Text className="mt-4 text-muted-foreground">Fetching weather...</Text>
          </View>
        ) : error ? (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 items-center">
              <AlertCircle size={40} className="text-destructive mb-4" />
              <Text variant="h4" className="text-destructive mb-2">Error</Text>
              <Text className="text-center text-muted-foreground mb-6">{error}</Text>
              <Pressable 
                className="bg-primary px-6 py-2 rounded-lg"
                onPress={() => fetchWeather("San Francisco")}
              >
                <Text className="text-primary-foreground font-medium">Try San Francisco</Text>
              </Pressable>
            </CardContent>
          </Card>
        ) : weather ? (
          <>
            {/* Current Weather Card */}
            <Card className="mb-8 bg-primary/10 border-0">
              <CardContent className="pt-6 items-center">
                <Text variant="h2" className="mb-1 text-center">{weather.city}</Text>
                <Text variant="muted" className="mb-6 text-center">{weather.location}</Text>
                
                <View className="flex-row items-center justify-center mb-6">
                  <WeatherIcon condition={weather.condition} size={80} className="text-primary mr-4" />
                  <Text className="text-7xl font-bold">{displayTemp(weather.temp)}°</Text>
                </View>

                <View className="flex-row gap-4 mb-4">
                  <View className="flex-row items-center gap-1">
                    <Thermometer size={16} className="text-red-500" />
                    <Text>H: {displayTemp(weather.high)}°</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Thermometer size={16} className="text-blue-500" />
                    <Text>L: {displayTemp(weather.low)}°</Text>
                  </View>
                </View>
                
                <Text className="text-center italic text-muted-foreground">
                  "Currently {displayTemp(weather.temp)}°{unit}. {weather.description}"
                </Text>
              </CardContent>
            </Card>

            {/* Details Grid */}
            <View className="flex-row gap-4 mb-8">
              <Card className="flex-1">
                <CardContent className="p-4 items-center">
                  <Wind size={20} className="text-teal-500 mb-2" />
                  <Text variant="small" className="text-muted-foreground mb-1">Wind Speed</Text>
                  <Text className="font-bold">{weather.windSpeed} mph</Text>
                </CardContent>
              </Card>
              <Card className="flex-1">
                <CardContent className="p-4 items-center">
                  <Droplets size={20} className="text-blue-500 mb-2" />
                  <Text variant="small" className="text-muted-foreground mb-1">Condition</Text>
                  <Text className="font-bold">{weather.condition}</Text>
                </CardContent>
              </Card>
            </View>

            {/* 5-Day Forecast */}
            <Text variant="h4" className="mb-4">5-Day Forecast</Text>
            <Card>
              <CardContent className="p-0">
                {weather.forecast.map((item, index) => (
                  <View 
                    key={`${item.day}-${index}`} 
                    className={`flex-row items-center justify-between p-4 ${
                      index !== weather.forecast.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                  >
                    <Text className="w-12 font-medium">{item.day}</Text>
                    <View className="flex-1 items-center">
                      <WeatherIcon condition={item.condition} size={24} className="text-primary" />
                    </View>
                    <Text className="w-12 text-right font-bold">{displayTemp(item.temp)}°</Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
