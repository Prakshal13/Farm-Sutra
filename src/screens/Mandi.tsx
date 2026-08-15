import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, StatusBar as RNStatusBar, Modal, TextInput,
  Linking, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { LanguageContext } from '../context/LanguageContext';
import { addActivityPoints, ACTIVITIES } from './CreditScore';

// ─────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'mandi_sell_orders';
const EXPIRY_DAYS = 15;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// ─────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────
interface SellOrder {
  id: string;
  nameKey: string;
  crop: string;
  qty: string;
  price: string;
  rating: string;
  verified: boolean;
  phone: string;
  createdAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED';
  buyerContacted: boolean;
}

interface BuyOrder {
  id: string;
  nameKey: string;
  cropKey: string;
  qty: string;
  price: string;
  rating: string;
  verified: boolean;
  phone: string;
}

// ─────────────────────────────────────────────────────────
//  STATIC BUY ORDERS
// ─────────────────────────────────────────────────────────
const INITIAL_BUY_ORDERS: BuyOrder[] = [
  { id: '1', nameKey: 'ramesh', cropKey: 'wheat', qty: '500 Quintal', price: '₹2,275/q', rating: '4.8', verified: true, phone: '9999999999' },
  { id: '2', nameKey: 'kisaan', cropKey: 'potato', qty: '200 Tonne', price: '₹1,200/q', rating: '4.5', verified: true, phone: '8888888888' },
];

// ─────────────────────────────────────────────────────────
//  TRANSLATIONS
// ─────────────────────────────────────────────────────────
const T: any = {
  en: {
    title: '🛒 Farm Sutra Mandi',
    buyTab: 'Buyer Demand', sellTab: "Farmer's Crop",
    buyAction: 'Contact Buyer', sellAction: 'Contact Farmer',
    crop: 'Crop', qty: 'Qty', price: 'Price',
    addBtn: '+ Add Crop', cancel: 'Cancel', submit: 'Submit',
    enterCrop: 'Crop Name (e.g. Wheat)',
    enterQty: 'Quantity (e.g. 50 Qtl)',
    enterPrice: 'Price (e.g. ₹2200/q)',
    enterPhone: 'Your Mobile Number',
    markSold: '✅ Mark as Sold',
    soldBadge: 'Sold ✅',
    expiredBadge: 'Expired ⏰',
    daysLeft: 'days left',
    lastDay: 'Last day!',
    alreadyListedToday: 'You already listed {crop} today.\nNew listing added, but points will be awarded again tomorrow.',
    incompleteDetails: 'Please fill all details and mobile number.',
    waMsg: 'Hello {name}, I saw your {crop} on Farm Sutra. I am interested.',
    advice: 'AI Advice: Based on live weather, soil moisture evaporation is normal. (Saves 30% Water)',
    traders: { ramesh: 'Ramesh Traders', kisaan: 'Kisaan Agro Ltd', suresh: 'Suresh Kumar', farmUser: 'Farm Sutra User' },
    crops: { wheat: 'Wheat', potato: 'Potato' },
  },
  hi: {
    title: '🛒 फार्म सूत्र मंडी',
    buyTab: 'व्यापारी की मांग', sellTab: 'किसान की फसल',
    buyAction: 'व्यापारी से बात करें', sellAction: 'किसान से संपर्क करें',
    crop: 'फसल', qty: 'मात्रा', price: 'भाव',
    addBtn: '+ अपनी फसल बेचें', cancel: 'रद्द करें', submit: 'जोड़ें',
    enterCrop: 'फसल का नाम (जैसे: गेहूं)',
    enterQty: 'मात्रा (जैसे: 50 क्विंटल)',
    enterPrice: 'भाव (जैसे: ₹2200/q)',
    enterPhone: 'आपका 10-अंकों का मोबाइल नंबर',
    markSold: '✅ बिक गई - मार्क करें',
    soldBadge: 'बिक गई ✅',
    expiredBadge: 'समय समाप्त ⏰',
    daysLeft: 'दिन बचे',
    lastDay: 'आखिरी दिन!',
    alreadyListedToday: 'आपने आज पहले से {crop} लिस्ट की है।\nनई लिस्टिंग जुड़ गई, पर पॉइंट्स कल मिलेंगे।',
    incompleteDetails: 'कृपया सभी जानकारी और मोबाइल नंबर भरें।',
    waMsg: 'राम राम {name} जी, मैंने फार्म सूत्र पर आपकी {crop} देखी। मुझे दिलचस्पी है।',
    advice: 'AI सलाह: मौसम के अनुसार, आज फसल में आवश्यकता अनुसार ही पानी दें।',
    traders: { ramesh: 'रमेश ट्रेडर्स', kisaan: 'किसान एग्रो लिमिटेड', suresh: 'सुरेश कुमार', farmUser: 'फार्म सूत्र किसान' },
    crops: { wheat: 'गेहूं', potato: 'आलू' },
  },
  ta: {
    title: '🛒 பார்ம் சூத்திரா மண்டி',
    buyTab: 'வாங்குபவர் தேவை', sellTab: 'விவசாயியின் விளைபொருள்',
    buyAction: 'தொடர்புகொள்', sellAction: 'தொடர்புகொள்',
    crop: 'பயிர்', qty: 'அளவு', price: 'விலை',
    addBtn: '+ பயிரை சேர்க்க', cancel: 'ரத்து செய்', submit: 'சமர்ப்பி',
    enterCrop: 'பயிர் பெயர் (உ-ம்: கோதுமை)',
    enterQty: 'அளவு (உ-ம்: 50 Qtl)',
    enterPrice: 'விலை (உ-ம்: ₹2000)',
    enterPhone: 'மொபைல் எண்',
    markSold: '✅ விற்பனையானது',
    soldBadge: 'விற்பனை ✅',
    expiredBadge: 'காலாவதியானது ⏰',
    daysLeft: 'நாட்கள் மீதம்',
    lastDay: 'கடைசி நாள்!',
    alreadyListedToday: 'இன்று ஏற்கனவே {crop} பட்டியலிட்டீர்கள்.\nபுதிய பட்டியல் சேர்க்கப்பட்டது, ஆனால் புள்ளிகள் நாளை கிடைக்கும்.',
    incompleteDetails: 'அனைத்து விவரங்களையும் நிரப்பவும்.',
    waMsg: 'வணக்கம் {name}, பார்ம் சூத்திராவில் உங்கள் {crop} பார்த்தேன். நான் ஆர்வமாக உள்ளேன்.',
    advice: 'AI ஆலோசனை: நேரடி வானிலை அடிப்படையில், நீர் ஆவியாதல் இயல்பானது. (30% நீர் சேமிப்பு)',
    traders: { ramesh: 'ரமேஷ் வர்த்தகர்கள்', kisaan: 'கிசான் அக்ரோ லிமிடெட்', suresh: 'சுரேஷ் குமார்', farmUser: 'பார்ம் சூத்திரா விவசாயி' },
    crops: { wheat: 'கோதுமை', potato: 'உருளைக்கிழங்கு' },
  },
  pa: {
    title: '🛒 ਫਾਰਮ ਸੂਤਰ ਮੰਡੀ',
    buyTab: 'ਵਪਾਰੀ ਦੀ ਮੰਗ', sellTab: 'ਕਿਸਾਨ ਦੀ ਫਸਲ',
    buyAction: 'ਵਪਾਰੀ ਨਾਲ ਗੱਲ ਕਰੋ', sellAction: 'ਕਿਸਾਨ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
    crop: 'ਫਸਲ', qty: 'ਮਾਤਰਾ', price: 'ਭਾਅ',
    addBtn: '+ ਆਪਣੀ ਫਸਲ ਵੇਚੋ', cancel: 'ਰੱਦ ਕਰੋ', submit: 'ਜੋੜੋ',
    enterCrop: 'ਫਸਲ ਦਾ ਨਾਮ (ਜਿਵੇਂ: ਕਣਕ)',
    enterQty: 'ਮਾਤਰਾ (ਜਿਵੇਂ: 50 ਕੁਇੰਟਲ)',
    enterPrice: 'ਭਾਅ (ਜਿਵੇਂ: ₹2200/q)',
    enterPhone: 'ਆਪਣਾ ਮੋਬਾਈਲ ਨੰਬਰ ਭਰੋ',
    markSold: '✅ ਵਿਕ ਗਈ - ਮਾਰਕ ਕਰੋ',
    soldBadge: 'ਵਿਕ ਗਈ ✅',
    expiredBadge: 'ਮਿਆਦ ਖਤਮ ⏰',
    daysLeft: 'ਦਿਨ ਬਾਕੀ',
    lastDay: 'ਆਖਰੀ ਦਿਨ!',
    alreadyListedToday: 'ਤੁਸੀਂ ਅੱਜ ਪਹਿਲਾਂ ਹੀ {crop} ਲਿਸਟ ਕੀਤੀ ਹੈ।\nਨਵੀਂ ਲਿਸਟਿੰਗ ਜੋੜੀ ਗਈ, ਪਰ ਪੁਆਇੰਟ ਕੱਲ੍ਹ ਮਿਲਣਗੇ।',
    incompleteDetails: 'ਕਿਰਪਾ ਸਾਰੀ ਜਾਣਕਾਰੀ ਅਤੇ ਮੋਬਾਈਲ ਨੰਬਰ ਭਰੋ।',
    waMsg: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {name} ਜੀ, ਮੈਂ ਫਾਰਮ ਸੂਤਰ 'ਤੇ ਤੁਹਾਡੀ {crop} ਦੇਖੀ। ਦਿਲਚਸਪੀ ਰੱਖਦਾ ਹਾਂ।",
    advice: 'AI ਸਲਾਹ: ਲਾਈਵ ਮੌਸਮ ਦੇ ਅਨੁਸਾਰ, ਫਸਲ ਨੂੰ ਲੋੜ ਅਨੁਸਾਰ ਪਾਣੀ ਦਿਓ।',
    traders: { ramesh: 'ਰਮੇਸ਼ ਟਰੇਡਰਜ਼', kisaan: 'ਕਿਸਾਨ ਐਗਰੋ ਲਿਮਟਿਡ', suresh: 'ਸੁਰੇਸ਼ ਕੁਮਾਰ', farmUser: 'ਫਾਰਮ ਸੂਤਰ ਕਿਸਾਨ' },
    crops: { wheat: 'ਕਣਕ', potato: 'ਆਲੂ' },
  },
  hr: {
    title: '🛒 फार्म सूत्र मंडी',
    buyTab: 'व्यापारी की मांग', sellTab: 'किसान की फसल',
    buyAction: 'व्यापारी तै बात करो', sellAction: 'किसान तै बात करो',
    crop: 'फसल', qty: 'मात्रा', price: 'भाव',
    addBtn: '+ फसल बेचो', cancel: 'काट दो', submit: 'जोड़ दो',
    enterCrop: 'फसल का नाम (ज्यूकर: गेहूं)',
    enterQty: 'मात्रा (ज्यूकर: 50 क्विंटल)',
    enterPrice: 'भाव (ज्यूकर: ₹2200/q)',
    enterPhone: 'थारा मोबाइल नंबर',
    markSold: '✅ बिकगी - मार्क करो',
    soldBadge: 'बिकगी ✅',
    expiredBadge: 'टेम गया ⏰',
    daysLeft: 'दिन बचे',
    lastDay: 'आखिरी दिन!',
    alreadyListedToday: 'थैने आज पहल्यां ही {crop} लिस्ट करी सै।\nनई लिस्टिंग जुड़गी, पर पॉइंट काल मिलेंगे।',
    incompleteDetails: 'कृपया सारी जानकारी अर मोबाइल नंबर भरो।',
    waMsg: 'राम राम {name} भाई, मैंने फार्म सूत्र पै थारी {crop} देखी। मन्नै दिलचस्पी सै।',
    advice: 'AI सलाह: मौसम के हिसाब तै आज खेत में ठीक-ठाक पाणी ला दियो।',
    traders: { ramesh: 'रमेश ट्रेडर्स', kisaan: 'किसान एग्रो लिमिटेड', suresh: 'सुरेश कुमार', farmUser: 'फार्म सूत्र किसान' },
    crops: { wheat: 'गेहूं', potato: 'आलू' },
  },
};

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const daysUntilExpiry = (expiresAt: number): number =>
  Math.ceil((expiresAt - Date.now()) / MS_PER_DAY);

const alreadyListedCropToday = async (cropName: string): Promise<boolean> => {
  try {
    const key = `last_listing_${cropName.trim().toLowerCase()}`;
    const lastDate = await AsyncStorage.getItem(key);
    return lastDate === new Date().toDateString();
  } catch { return false; }
};

const recordCropListingToday = async (cropName: string) => {
  try {
    const key = `last_listing_${cropName.trim().toLowerCase()}`;
    await AsyncStorage.setItem(key, new Date().toDateString());
  } catch (e) { console.log(e); }
};

// ─────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function Mandi() {
  const { lang } = useContext(LanguageContext);
  const t = T[lang] || T['en'];

  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const [sellOrders, setSellOrders] = useState<SellOrder[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newCrop, setNewCrop] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [liveLocation, setLiveLocation] = useState('Fetching GPS...');
  const [liveTemp, setLiveTemp] = useState('--°C');
  const [isWeatherLoading, setIsWeatherLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SellOrder[] = JSON.parse(raw);
        const now = Date.now();

        const updated = parsed.map(order =>
          order.status === 'ACTIVE' && now > order.expiresAt
            ? { ...order, status: 'EXPIRED' as const }
            : order
        );

        if (updated.some((o, i) => o.status !== parsed[i].status)) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }

        setSellOrders(updated);
      } else {
        const defaultOrder: SellOrder = {
          id: '3',
          nameKey: 'suresh',
          crop: 'Wheat',
          qty: '50 Quintal',
          price: '₹2,300/q',
          rating: '4.9',
          verified: true,
          phone: '7777777777',
          createdAt: Date.now(),
          expiresAt: Date.now() + (EXPIRY_DAYS * MS_PER_DAY),
          status: 'ACTIVE',
          buyerContacted: false,
        };
        setSellOrders([defaultOrder]);
      }
    } catch (e) { console.log('Load error:', e); }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  useEffect(() => {
    const fetchLiveWeather = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLiveLocation('Location Access Denied');
          setIsWeatherLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const { latitude: lat, longitude: lon } = location.coords;

        const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
        if (geocode.length > 0) {
          const city = geocode[0].city || geocode[0].district || geocode[0].region || '';
          setLiveLocation(`${city}, ${geocode[0].country}`);
        }

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        if (data?.current_weather) setLiveTemp(`${data.current_weather.temperature}°C`);
      } catch {
        setLiveLocation('Location Not Found');
      } finally {
        setIsWeatherLoading(false);
      }
    };
    fetchLiveWeather();
  }, []);

  const saveOrders = async (orders: SellOrder[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) { console.log('Save error:', e); }
  };

  const addNewItem = async () => {
    if (!newCrop.trim() || !newQty.trim() || !newPrice.trim() || !newPhone.trim()) {
      Alert.alert('⚠️', t.incompleteDetails);
      return;
    }

    const now = Date.now();
    const cropName = newCrop.trim();

    const newOrder: SellOrder = {
      id: now.toString(),
      nameKey: 'farmUser',
      crop: cropName,
      qty: newQty.trim(),
      price: newPrice.trim(),
      rating: 'New',
      verified: true,
      phone: newPhone.trim(),
      createdAt: now,
      expiresAt: now + (EXPIRY_DAYS * MS_PER_DAY),
      status: 'ACTIVE',
      buyerContacted: false,
    };

    const updated = [newOrder, ...sellOrders];
    setSellOrders(updated);
    await saveOrders(updated);

    setModalVisible(false);
    setNewCrop(''); setNewQty(''); setNewPrice(''); setNewPhone('');

    const listedToday = await alreadyListedCropToday(cropName);

    if (!listedToday) {
      await recordCropListingToday(cropName);
      await addActivityPoints(ACTIVITIES.MANDI_LISTING, lang);
    } else {
      setTimeout(() => {
        Alert.alert(
          '📋',
          t.alreadyListedToday.replace('{crop}', cropName)
        );
      }, 300);
    }
  };

  const markAsSold = async (orderId: string) => {
    const updated = sellOrders.map(o =>
      o.id === orderId ? { ...o, status: 'SOLD' as const } : o
    );
    setSellOrders(updated);
    await saveOrders(updated);
    await addActivityPoints(ACTIVITIES.MANDI_SOLD, lang);
  };

  const openWhatsApp = async (
    name: string,
    crop: string,
    phone: string,
    orderId?: string
  ) => {
    const message = t.waMsg.replace('{name}', name).replace('{crop}', crop);
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('WhatsApp', 'WhatsApp is not installed on this device.');
        return;
      }
      await Linking.openURL(url);

      if (orderId) {
        const updated = sellOrders.map(o =>
          o.id === orderId ? { ...o, buyerContacted: true } : o
        );
        setSellOrders(updated);
        await saveOrders(updated);
      }

      await addActivityPoints(ACTIVITIES.MANDI_CONTACT, lang);
    } catch {
      Alert.alert('Error', 'Could not open WhatsApp.');
    }
  };

  const renderSellCard = ({ item }: { item: SellOrder }) => {
    const displayName = item.nameKey ? t.traders[item.nameKey] : 'Farmer';
    const days = daysUntilExpiry(item.expiresAt);
    const isSold = item.status === 'SOLD';
    const isExpired = item.status === 'EXPIRED';

    const countdownColor = days <= 1 ? '#DC2626' : days <= 5 ? '#D05A22' : '#737A71';

    return (
      <View style={[
        styles.card,
        isSold && styles.soldCard,
        isExpired && styles.expiredCard,
      ]}>
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{displayName}</Text>
            {item.verified && <Ionicons name="checkmark-circle" size={16} color="#0284C7" style={styles.verifyIcon} />}
          </View>
          <View style={styles.rightHeader}>
            {isSold ? (
              <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>{t.soldBadge}</Text>
              </View>
            ) : isExpired ? (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredBadgeText}>{t.expiredBadge}</Text>
              </View>
            ) : (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#D05A22" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cropText}>🌾 {t.crop}: {item.crop}</Text>
          <Text style={styles.detailText}>📦 {t.qty}: {item.qty}</Text>
          <Text style={styles.priceText}>💰 {t.price}: {item.price}</Text>
        </View>

        {!isSold && !isExpired && (
          <View style={styles.countdownRow}>
            <Ionicons name="time-outline" size={14} color={countdownColor} />
            <Text style={[styles.countdownText, { color: countdownColor }]}>
              {days <= 0
                ? t.lastDay
                : `${days} ${t.daysLeft}`}
            </Text>
            {item.buyerContacted && (
              <View style={styles.contactedPill}>
                <Text style={styles.contactedPillText}>💬</Text>
              </View>
            )}
          </View>
        )}

        {!isSold && !isExpired && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={() => openWhatsApp(displayName, item.crop, item.phone, item.id)}
            >
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" style={{ marginRight: 6 }} />
              <Text style={styles.whatsappBtnText}>{t.sellAction}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.soldBtn}
              onPress={() => markAsSold(item.id)}
            >
              <Text style={styles.soldBtnText}>{t.markSold}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderBuyCard = ({ item }: { item: BuyOrder }) => {
    const displayName = t.traders[item.nameKey] || item.nameKey;
    const displayCrop = t.crops[item.cropKey] || item.cropKey;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{displayName}</Text>
            {item.verified && <Ionicons name="checkmark-circle" size={16} color="#0284C7" style={styles.verifyIcon} />}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#D05A22" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cropText}>🌾 {t.crop}: {displayCrop}</Text>
          <Text style={styles.detailText}>📦 {t.qty}: {item.qty}</Text>
          <Text style={styles.priceText}>💰 {t.price}: {item.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.fullWhatsappBtn}
          onPress={() => openWhatsApp(displayName, displayCrop, item.phone)}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#25D366" style={{ marginRight: 8 }} />
          <Text style={styles.whatsappBtnText}>{t.buyAction}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.title}</Text>
      </View>

      <View style={styles.weatherCard}>
        <View style={styles.weatherRow}>
          <View>
            <Text style={styles.weatherLoc}>
              <Ionicons name="location" size={14} color="#FFF" /> {liveLocation}
            </Text>
            {isWeatherLoading
              ? <ActivityIndicator size="small" color="#FFF" style={{ marginTop: 5, alignSelf: 'flex-start' }} />
              : <Text style={styles.weatherTemp}>{liveTemp} | Live</Text>
            }
          </View>
          <Ionicons name="partly-sunny" size={40} color="#FBBF24" />
        </View>
        <View style={styles.adviceBox}>
          <Text style={styles.adviceText}>{t.advice}</Text>
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'BUY' && styles.activeToggle]}
          onPress={() => setActiveTab('BUY')}
        >
          <Text style={[styles.toggleText, activeTab === 'BUY' && styles.activeToggleText]}>
            {t.buyTab}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'SELL' && styles.activeToggle]}
          onPress={() => setActiveTab('SELL')}
        >
          <Text style={[styles.toggleText, activeTab === 'SELL' && styles.activeToggleText]}>
            {t.sellTab}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'SELL' && (
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>{t.addBtn}</Text>
        </TouchableOpacity>
      )}

      {activeTab === 'BUY' ? (
        <FlatList
          data={INITIAL_BUY_ORDERS}
          keyExtractor={item => item.id}
          renderItem={renderBuyCard}
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={sellOrders}
          keyExtractor={item => item.id}
          renderItem={renderSellCard}
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t.addBtn}</Text>

            <TextInput
              style={styles.input}
              placeholderTextColor="#737A71"
              placeholder={t.enterCrop}
              value={newCrop}
              onChangeText={setNewCrop}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor="#737A71"
              placeholder={t.enterQty}
              value={newQty}
              onChangeText={setNewQty}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor="#737A71"
              placeholder={t.enterPrice}
              value={newPrice}
              onChangeText={setNewPrice}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor="#737A71"
              placeholder={t.enterPhone}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={addNewItem}>
                <Text style={styles.submitBtnText}>{t.submit}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ─────────────────────────────────────────────────────────
//  STYLES: Lighter "Warm Minimalism" (Warm Moss & Almond)
// ─────────────────────────────────────────────────────────
const paddingTopOS = Platform.OS === 'ios' ? 50 : RNStatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  // APP BACKGROUND: Almond Oat (Warm, bright, glare-free)
  safeArea: { flex: 1, backgroundColor: '#F7F7F3', paddingTop: paddingTopOS },

  // HEADER: Charcoal Olive (Softer anchor, highly readable)
  header: { backgroundColor: '#2C332A', paddingVertical: 15, alignItems: 'center' },
  headerTitle: { color: '#F7F7F3', fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },

  // WEATHER CARD: Warm Moss (Organic earthy green)
  weatherCard: { backgroundColor: '#4A7240', margin: 10, borderRadius: 16, padding: 18, elevation: 2 },
  weatherRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  weatherLoc: { color: '#EAF0E9', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  weatherTemp: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 4 },
  adviceBox: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 12, borderRadius: 10, marginTop: 5 },
  adviceText: { color: '#FFFFFF', fontSize: 13, fontStyle: 'italic', fontWeight: '600' },

  // TOGGLES: Clean white pill with Soft Terracotta active state
  toggleContainer: { flexDirection: 'row', padding: 8, backgroundColor: '#FFFFFF', marginHorizontal: 10, borderRadius: 12, elevation: 1, marginBottom: 5 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeToggle: { backgroundColor: '#D05A22', shadowColor: '#D05A22', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  toggleText: { fontSize: 15, fontWeight: '700', color: '#889384' },
  activeToggleText: { color: '#FFFFFF' },

  // CALL TO ACTION: Soft Terracotta
  addBtn: { backgroundColor: '#D05A22', marginHorizontal: 15, marginTop: 10, marginBottom: 5, padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  // CARDS: Pure white surfaces
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 15, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 5 },
  soldCard: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
  expiredCard: { backgroundColor: '#F3F4F6', opacity: 0.7 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0EE', paddingBottom: 12, marginBottom: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  nameText: { fontSize: 17, fontWeight: '800', color: '#2C332A' },

  // VERIFICATION: Friendly Trust Blue
  verifyIcon: { marginLeft: 6, color: '#0284C7' },
  rightHeader: { alignItems: 'flex-end' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: '800', color: '#D05A22' },

  soldBadge: { backgroundColor: '#F0F5F1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#4A7240' },
  soldBadgeText: { color: '#4A7240', fontSize: 12, fontWeight: '800' },
  expiredBadge: { backgroundColor: '#F0F0EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  expiredBadgeText: { color: '#889384', fontSize: 12, fontWeight: '800' },

  cardBody: { marginBottom: 15 },
  cropText: { fontSize: 17, fontWeight: '800', color: '#2C332A', marginBottom: 6 },
  detailText: { fontSize: 15, color: '#5C6658', marginBottom: 6, fontWeight: '500' },
  priceText: { fontSize: 16, fontWeight: '800', color: '#4A7240' }, // Moss Green for money

  countdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  countdownText: { fontSize: 13, fontWeight: '700', marginLeft: 6 },
  contactedPill: { marginLeft: 10, backgroundColor: '#F0F9FF', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  contactedPillText: { fontSize: 12 },

  // SECONDARY ACTIONS: Subtle, clean
  actionRow: { flexDirection: 'row', gap: 10 },
  whatsappBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#EBECE9' },
  soldBtn: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#EBECE9' },
  soldBtnText: { color: '#5C6658', fontWeight: '800', fontSize: 14 },
  whatsappBtnText: { color: '#2C332A', fontWeight: '800', fontSize: 14 },

  fullWhatsappBtn: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#EBECE9' },

  // MODALS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(44, 51, 42, 0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#2C332A', marginBottom: 20 },
  input: { backgroundColor: '#F7F7F3', padding: 15, borderRadius: 12, marginBottom: 12, fontSize: 16, color: '#2C332A', fontWeight: '500', borderWidth: 1, borderColor: '#EBECE9' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15 },
  cancelBtn: { padding: 12, marginRight: 15, justifyContent: 'center' },
  cancelBtnText: { color: '#889384', fontSize: 16, fontWeight: '800' },
  submitBtn: { backgroundColor: '#D05A22', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, elevation: 2 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});