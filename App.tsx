import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// 🌍 Language Context Import Kiya
import { LanguageProvider, LanguageContext } from './LanguageContext';

import Welcome from './screens/Welcome';
import Mandi from './screens/Mandi';
import ChatBot from './screens/ChatBot';
import CreditScore from './screens/CreditScore';
import AgriWeather from './screens/AgriWeather';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 🌍 TAB NAMES DICTIONARY 🌍
const tabDict: any = {
  en: { mandi: "Mandi", ai: "Farm AI", credit: "Credit", weather: "Weather" },
  hi: { mandi: "मंडी", ai: "फार्म AI", credit: "क्रेडिट", weather: "मौसम" },
  ta: { mandi: "மண்டி", ai: "பார்ம் AI", credit: "கிரெடிட்", weather: "வானிலை" },
  pa: { mandi: "ਮੰਡੀ", ai: "ਫਾਰਮ AI", credit: "ਕ੍ਰੈਡਿਟ", weather: "ਮੌਸਮ" },
  hr: { mandi: "मंडी", ai: "फार्म AI", credit: "क्रेडिट", weather: "मौसम" }
};

function MainTabs() {
  // 🌍 Global Language Memory Se Bhasha Uthayi
  const { lang } = useContext(LanguageContext);
  const t = tabDict[lang] || tabDict['en'];

  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName = 'leaf-outline';
          
          if (route.name === 'Mandi') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Farm Sutra AI') iconName = focused ? 'leaf' : 'leaf-outline';
          else if (route.name === 'Credit') iconName = focused ? 'card' : 'card-outline'; 
          else if (route.name === 'Mausam') iconName = focused ? 'partly-sunny' : 'partly-sunny-outline';
          
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, 
        tabBarStyle: { paddingBottom: 5, height: 60 }
      })}
    >
      {/* tabBarLabel ka use karke sirf display naam change kiya hai */}
      <Tab.Screen 
        name="Mandi" 
        component={Mandi} 
        options={{ tabBarLabel: t.mandi }} 
      />
      <Tab.Screen 
        name="Farm Sutra AI" 
        component={ChatBot} 
        options={{ tabBarLabel: t.ai }} 
      />
      <Tab.Screen 
        name="Credit" 
        component={CreditScore} 
        options={{ tabBarLabel: t.credit }} 
      />
      <Tab.Screen 
        name="Mausam" 
        component={AgriWeather} 
        options={{ tabBarLabel: t.weather }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}