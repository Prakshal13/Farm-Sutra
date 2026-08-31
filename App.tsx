import './src/global.css';
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { LanguageProvider, LanguageContext } from './src/context/LanguageContext';
import Welcome from './src/screens/Welcome';
import Mandi from './src/screens/Mandi';
import ChatBot from './src/screens/ChatBot';
import CreditScore from './src/screens/CreditScore';
import AgriWeather from './src/screens/AgriWeather';
import DashboardLayout from './src/layouts/DashboardLayout';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const withLayout = (Component: React.FC, routeName: string) => (props: any) => (
  <DashboardLayout activeRoute={routeName}>
    <Component {...props} />
  </DashboardLayout>
);

function MainTabs() {
  const { lang } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.OS === 'web' ? { display: 'none' } : { paddingBottom: 5, height: 60 },
      }}
    >
      <Tab.Screen name="Mandi">
        {props => withLayout(Mandi, 'Mandi')(props)}
      </Tab.Screen>
      <Tab.Screen name="Farm Sutra AI">
        {props => withLayout(ChatBot, 'Farm Sutra AI')(props)}
      </Tab.Screen>
      <Tab.Screen name="Credit">
        {props => withLayout(CreditScore, 'Credit')(props)}
      </Tab.Screen>
      <Tab.Screen name="Mausam">
        {props => withLayout(AgriWeather, 'Mausam')(props)}
      </Tab.Screen>
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
