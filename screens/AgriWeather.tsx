import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Platform, StatusBar as RNStatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location'; 
import { LanguageContext } from '../LanguageContext';

// 🔥 CREDIT SCORE IMPORT 🔥
import { addActivityPoints, ACTIVITIES } from './CreditScore';

const weatherUIDict: any = {
  en: { 
    title: "🌦️ Smart Agri-Weather", cropLabel: "Crop Name (e.g. Wheat)", soilLabel: "Soil Type (e.g. Sandy, Clay)", btn: "Get Smart Forecast", alertTitle: "⚠️ Extreme Weather Alert", pestTitle: "🦠 Pest & Disease Alert", forecastTitle: "7-Day Forecast", fetching: "Fetching Live GPS Weather...",
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    conditions: { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain', lightRain: 'Light Rain' }
  },
  hi: { 
    title: "🌦️ स्मार्ट कृषि-मौसम", cropLabel: "फसल का नाम (जैसे: गेहूं)", soilLabel: "मिट्टी का प्रकार (जैसे: बलुई)", btn: "स्मार्ट मौसम देखें", alertTitle: "⚠️ मौसम चेतावनी", pestTitle: "🦠 बीमारी का खतरा", forecastTitle: "7-दिन का मौसम", fetching: "लाइव मौसम ला रहे हैं...",
    days: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    conditions: { clear: 'साफ', cloudy: 'बादल', rain: 'बारिश', lightRain: 'हल्की बारिश' }
  },
  ta: { 
    title: "🌦️ ஸ்மார்ட் வானிலை", cropLabel: "பயிர் பெயர்", soilLabel: "மண் வகை", btn: "முன்னறிவிப்பைப் பெறுங்கள்", alertTitle: "⚠️ வானிலை எச்சரிக்கை", pestTitle: "🦠 பூச்சி எச்சரிக்கை", forecastTitle: "7 நாள் வானிலை", fetching: "வானிலை பெறப்படுகிறது...",
    days: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
    conditions: { clear: 'தெளிவு', cloudy: 'மேகம்', rain: 'மழை', lightRain: 'லேசான மழை' }
  },
  pa: { 
    title: "🌦️ ਸਮਾਰਟ ਖੇਤੀ-ਮੌਸਮ", cropLabel: "ਫਸਲ ਦਾ ਨਾਮ", soilLabel: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ", btn: "ਸਮਾਰਟ ਮੌਸਮ ਦੇਖੋ", alertTitle: "⚠️ ਮੌਸਮ ਚੇਤਾਵਨੀ", pestTitle: "🦠 ਬਿਮਾਰੀ ਦਾ ਖਤਰਾ", forecastTitle: "7-ਦਿਨ ਦਾ ਮੌਸਮ", fetching: "ਲਾਈਵ ਮੌਸਮ ਲਿਆ ਰਿਹਾ ਹੈ...",
    days: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗਲ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕਰ', 'ਸ਼ਨਿੱਚਰ'],
    conditions: { clear: 'ਸਾਫ਼', cloudy: 'ਬੱਦਲ', rain: 'ਮੀਂਹ', lightRain: 'ਹਲਕਾ ਮੀਂਹ' }
  },
  hr: { 
    title: "🌦️ स्मार्ट खेती-मौसम", cropLabel: "फसल का नाम", soilLabel: "माटी का प्रकार", btn: "स्मार्ट मौसम देखो", alertTitle: "⚠️ मौसम अलर्ट", pestTitle: "🦠 बीमारी का खतरा", forecastTitle: "7-दिन का मौसम", fetching: "GPS मौसम ल्या रया सै...",
    days: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    conditions: { clear: 'साफ', cloudy: 'बादल', rain: 'बारिश', lightRain: 'हल्की बारिश' }
  }
};

interface CropData { cropName: string; soilType: string; }
interface WeatherDay { dayKey: number; temp: number; humidity: number; conditionKey: string; rainChance: number; }

export default function AgriWeather() {
  const { lang } = useContext(LanguageContext);
  const t = weatherUIDict[lang] || weatherUIDict['en'];

  const [cropData, setCropData] = useState<CropData>({ cropName: '', soilType: '' });
  const [weatherData, setWeatherData] = useState<WeatherDay[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [extremeAlert, setExtremeAlert] = useState<string | null>(null);
  const [pestAlert, setPestAlert] = useState<string | null>(null);

  const fetchSmartWeather = async () => {
    if (!cropData.cropName || !cropData.soilType) {
      Alert.alert("Missing Details", "Kripya fasal aur mitti ki jankari bharein!");
      return;
    }

    setLoading(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Live weather ke liye Location zaroori hai.");
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_probability_max,weathercode,relative_humidity_2m_max&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.daily) {
        const realForecast: WeatherDay[] = data.daily.time.slice(0, 7).map((dateStr: string, index: number) => {
          const wmoCode = data.daily.weathercode[index];
          const rainChance = data.daily.precipitation_probability_max[index] || 0;
          const temp = Math.round(data.daily.temperature_2m_max[index]);
          
          let condKey = 'clear';
          if (wmoCode >= 1 && wmoCode <= 3) condKey = 'cloudy';
          if (wmoCode >= 51 && wmoCode <= 55) condKey = 'lightRain';
          if (wmoCode >= 61) condKey = 'rain';

          const humidity = data.daily.relative_humidity_2m_max 
            ? Math.round(data.daily.relative_humidity_2m_max[index]) 
            : (rainChance > 50 ? 80 + Math.floor(Math.random() * 15) : 40 + Math.floor(Math.random() * 20));

          const dayOfWeek = new Date(dateStr).getDay();

          return { dayKey: dayOfWeek, temp: temp, humidity: humidity, conditionKey: condKey, rainChance: rainChance };
        });

        setWeatherData(realForecast);

        if (realForecast[1].rainChance > 70) {
          setExtremeAlert(lang === 'en' ? `Heavy rain expected tomorrow (${realForecast[1].rainChance}%). Do not spray pesticides.` : `कल भारी बारिश (${realForecast[1].rainChance}%) है। खेत में कीटनाशक स्प्रे न करें।`);
        } else if (cropData.soilType.toLowerCase().includes('sand') && realForecast[0].rainChance < 15) {
          setExtremeAlert(lang === 'en' ? "Sandy soil dries quickly and no rain today. Immediate irrigation recommended." : "बलुई मिट्टी जल्दी सूखती है और आज बारिश नहीं है। आज सिंचाई जरूर करें।");
        } else {
          setExtremeAlert(null);
        }

        if (realForecast[0].humidity > 80 && realForecast[1].humidity > 80) {
          setPestAlert(lang === 'en' ? "High humidity detected for 2 days. High risk of fungal infection." : "हवा में नमी बहुत ज्यादा है। फंगल इन्फेक्शन का खतरा है।");
        } else {
          setPestAlert(null);
        }

        // 🔥 SCORE UPDATE + POPUP 🔥
        await addActivityPoints(ACTIVITIES.WEATHER_DATA, lang);
      }
    } catch (error) {
      console.log("Weather API Error:", error);
      Alert.alert("Network Issue", "Using offline data for demonstration.");
      const dummyForecast: WeatherDay[] = [
        { dayKey: 0, temp: 32, humidity: 85, conditionKey: 'cloudy', rainChance: 10 },
        { dayKey: 1, temp: 30, humidity: 90, conditionKey: 'rain', rainChance: 80 },
        { dayKey: 2, temp: 34, humidity: 65, conditionKey: 'clear', rainChance: 0 }
      ];
      setWeatherData(dummyForecast as WeatherDay[]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        
        {extremeAlert && (
          <View style={styles.alertBox}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
              <Ionicons name="warning" size={20} color="#DC2626" style={{marginRight: 8}}/>
              <Text style={styles.alertTitle}>{t.alertTitle}</Text>
            </View>
            <Text style={styles.alertText}>{extremeAlert}</Text>
          </View>
        )}

        {pestAlert && (
          <View style={styles.pestBox}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 5}}>
              <Ionicons name="bug" size={20} color="#D97706" style={{marginRight: 8}}/>
              <Text style={styles.pestTitle}>{t.pestTitle}</Text>
            </View>
            <Text style={styles.pestText}>{pestAlert}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>{t.cropLabel}</Text>
          <TextInput 
            style={styles.input}
            placeholderTextColor="#888"
            placeholder={lang === 'en' ? "e.g. Wheat" : "जैसे: गेहूं"}
            value={cropData.cropName}
            onChangeText={(text) => setCropData({...cropData, cropName: text})}
          />

          <Text style={styles.label}>{t.soilLabel}</Text>
          <TextInput 
            style={styles.input}
            placeholderTextColor="#888"
            placeholder={lang === 'en' ? "e.g. Sandy" : "जैसे: बलुई"}
            value={cropData.soilType}
            onChangeText={(text) => setCropData({...cropData, soilType: text})}
          />

          <TouchableOpacity style={styles.button} onPress={fetchSmartWeather} disabled={loading}>
            {loading ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ActivityIndicator color="#fff" style={{marginRight: 10}} />
                <Text style={styles.buttonText}>{t.fetching}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{t.btn}</Text>
            )}
          </TouchableOpacity>
        </View>

        {weatherData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.forecastTitle}</Text>
            {weatherData.map((item, index) => (
              <View key={index} style={styles.weatherRow}>
                <Text style={styles.dayText}>{t.days[item.dayKey]}</Text>
                <View style={styles.weatherDetails}>
                  <Text style={styles.weatherText}><Ionicons name="thermometer-outline" size={14}/> {item.temp}°C</Text>
                  <Text style={styles.weatherText}><Ionicons name="water-outline" size={14} color="#3B82F6"/> {item.humidity}%</Text>
                  <Text style={[styles.weatherText, { width: 70 }]} numberOfLines={1}>
                    {t.conditions[item.conditionKey]}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const paddingTopOS = Platform.OS === 'ios' ? 50 : RNStatusBar.currentHeight || 0;
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F4F1', paddingTop: paddingTopOS },
  header: { backgroundColor: '#1E3F20', paddingVertical: 15, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  container: { flex: 1, padding: 15 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3F20', marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, color: '#333' },
  button: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, marginTop: 20, alignItems: 'center', elevation: 2, flexDirection: 'row', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  alertBox: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#F87171', padding: 15, marginBottom: 15, borderRadius: 8 },
  alertTitle: { fontWeight: 'bold', color: '#B91C1C', fontSize: 16 },
  alertText: { color: '#991B1B', fontSize: 14, marginTop: 4 },
  pestBox: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FBBF24', padding: 15, marginBottom: 15, borderRadius: 8 },
  pestTitle: { fontWeight: 'bold', color: '#B45309', fontSize: 16 },
  pestText: { color: '#92400E', fontSize: 14, marginTop: 4 },
  weatherRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  dayText: { fontWeight: 'bold', fontSize: 16, color: '#333', flex: 1 },
  weatherDetails: { flexDirection: 'row', flex: 2, justifyContent: 'space-between' },
  weatherText: { fontSize: 14, color: '#555', fontWeight: '500' }
});