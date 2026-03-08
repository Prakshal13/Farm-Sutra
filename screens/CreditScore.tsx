import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar as RNStatusBar, ActivityIndicator,
  Modal, Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LanguageContext } from '../LanguageContext';

// 🔥 TAB REFRESH KE LIYE IMPORT 🔥
import { useFocusEffect } from '@react-navigation/native';

const SCORE_TIERS = [
  {
    minScore: 800, maxScore: 900, grade: 'A+',
    status:  { en: 'Outstanding', hi: 'असाधारण',    ta: 'சிறந்தது',      pa: 'ਬੇਮਿਸਾਲ',   hr: 'कसूता' },
    loanAmt: { en: '₹1,00,000',   hi: '₹1,00,000',   ta: '₹1,00,000',     pa: '₹1,00,000', hr: '₹1,00,000' },
    interest: { en: '4% p.a. (Govt. Subvention)', hi: '4% वार्षिक (सरकारी छूट)', ta: '4% ஆண்டுக்கு (அரசு மானியம்)', pa: '4% ਸਾਲਾਨਾ (ਸਰਕਾਰੀ ਛੋਟ)', hr: '4% सालाना (सरकारी छूट)' },
    color: '#1B5E20', ring: '#4CAF50', bg: '#E8F5E9',
  },
  {
    minScore: 700, maxScore: 799, grade: 'A',
    status:  { en: 'Excellent',   hi: 'उत्कृष्ट',    ta: 'சிறப்பானது',    pa: 'ਸ਼ਾਨਦਾਰ',   hr: 'बहुत बढ़िया' },
    loanAmt: { en: '₹75,000',     hi: '₹75,000',     ta: '₹75,000',       pa: '₹75,000',   hr: '₹75,000' },
    interest: { en: '4% p.a. (Govt. Subvention)', hi: '4% वार्षिक (सरकारी छूट)', ta: '4% ஆண்டுக்கு (அரசு மானியம்)', pa: '4% ਸਾਲਾਨਾ (ਸਰਕਾਰੀ ਛੋਟ)', hr: '4% सालाना (सरकारी छूट)' },
    color: '#2E7D32', ring: '#66BB6A', bg: '#F1F8E9',
  },
  {
    minScore: 600, maxScore: 699, grade: 'B+',
    status:  { en: 'Good',        hi: 'अच्छा',       ta: 'நல்லது',        pa: 'ਚੰਗਾ',      hr: 'ठीक-ठाक' },
    loanAmt: { en: '₹50,000',     hi: '₹50,000',     ta: '₹50,000',       pa: '₹50,000',   hr: '₹50,000' },
    interest: { en: '7% p.a. (KCC Base Rate)', hi: '7% वार्षिक (KCC बेस रेट)', ta: '7% ஆண்டுக்கு (KCC அடிப்படை விகிதம்)', pa: '7% ਸਾਲਾਨਾ (KCC ਬੇਸ ਰੇਟ)', hr: '7% सालाना (KCC बेस रेट)' },
    color: '#1565C0', ring: '#42A5F5', bg: '#E3F2FD',
  },
  {
    minScore: 500, maxScore: 599, grade: 'B',
    status:  { en: 'Average',     hi: 'औसत',        ta: 'சராசரி',        pa: 'ਔਸਤ',        hr: 'ठीक' },
    loanAmt: { en: '₹35,000',     hi: '₹35,000',     ta: '₹35,000',       pa: '₹35,000',   hr: '₹35,000' },
    interest: { en: '7% p.a. (KCC Base Rate)', hi: '7% वार्षिक (KCC बेस रेट)', ta: '7% ஆண்டுக்கு (KCC அடிப்படை விகிதம்)', pa: '7% ਸਾਲਾਨਾ (KCC ਬੇਸ ਰੇਟ)', hr: '7% सालाना (KCC बेस रेट)' },
    color: '#E65100', ring: '#FFA726', bg: '#FFF3E0',
  },
  {
    minScore: 400, maxScore: 499, grade: 'C',
    status:  { en: 'Fair',        hi: 'ठीक-ठाक',     ta: 'சரியானது',      pa: 'ਠੀਕ-ਠਾਕ',   hr: 'नरम' },
    loanAmt: { en: '₹20,000',     hi: '₹20,000',     ta: '₹20,000',       pa: '₹20,000',   hr: '₹20,000' },
    interest: { en: '9% p.a. (Bank Rate)', hi: '9% वार्षिक (बैंक दर)', ta: '9% ஆண்டுக்கு (வங்கி விகிதம்)', pa: '9% ਸਾਲਾਨਾ (ਬੈਂਕ ਰੇਟ)', hr: '9% सालाना (बैंक रेट)' },
    color: '#BF360C', ring: '#FF7043', bg: '#FBE9E7',
  },
  {
    minScore: 0, maxScore: 399, grade: 'D',
    status:  { en: 'Building...', hi: 'बन रहा है...', ta: 'உருவாகிறது...', pa: 'ਬਣ ਰਿਹਾ ਹੈ', hr: 'बण रह्या सै' },
    loanAmt: null,
    interest: null,
    color: '#757575', ring: '#BDBDBD', bg: '#F5F5F5',
  },
];

export const ACTIVITIES = {
  CHATBOT_QUERY:  { key: 'CHATBOT_QUERY',  points: 5,  dailyCap: 25,  icon: 'chatbubble',  label: { en: 'Asked Farm Sutra AI', hi: 'फार्म सूत्र AI से पूछा', ta: 'Farm Sutra AI-யிடம் கேட்டார்', pa: 'Farm Sutra AI ਤੋਂ ਪੁੱਛਿਆ', hr: 'फार्म सूत्र AI तै पूछ्या' } },
  CROP_SCAN:      { key: 'CROP_SCAN',      points: 25, dailyCap: 50,  icon: 'leaf',        label: { en: 'AI Crop Disease Scan', hi: 'AI फसल रोग स्कैन', ta: 'AI பயிர் நோய் ஸ்கேன்', pa: 'AI ਫਸਲ ਰੋਗ ਸਕੈਨ', hr: 'AI फसल बीमारी स्कैन' } },
  WEATHER_DATA:   { key: 'WEATHER_DATA',   points: 15, dailyCap: 15,  icon: 'partly-sunny',label: { en: 'Logged Crop & Soil Data', hi: 'फसल और मिट्टी का डेटा सेव किया', ta: 'பயிர் & மண் தரவு பதிவு', pa: 'ਫਸਲ ਅਤੇ ਮਿੱਟੀ ਦਾ ਡਾਟਾ ਸੇਵ ਕੀਤਾ', hr: 'फसल अर माटी का डेटा गेरया' } },
  WEATHER_CHECK:  { key: 'WEATHER_CHECK',  points: 5,  dailyCap: 10,  icon: 'cloud',       label: { en: 'Checked Weather Forecast', hi: 'मौसम पूर्वानुमान देखा', ta: 'வானிலை முன்னறிவிப்பை பார்த்தார்', pa: 'ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ ਦੇਖੀ', hr: 'मौसम का हाल देख्या' } },
  MANDI_LISTING:  { key: 'MANDI_LISTING',  points: 40, dailyCap: 80,  icon: 'storefront',  label: { en: 'Listed Produce in Mandi', hi: 'मंडी में उपज सूचीबद्ध की', ta: 'மண்டியில் விளைபொருள் பட்டியல்', pa: 'ਮੰਡੀ ਵਿੱਚ ਫਸਲ ਲਿਸਟ ਕੀਤੀ', hr: 'मंडी में फसल बेचन खातिर लगाई' } },
  MANDI_CONTACT:  { key: 'MANDI_CONTACT',  points: 25, dailyCap: 50,  icon: 'cart',        label: { en: 'Contacted Buyer via WhatsApp', hi: 'WhatsApp के जरिए खरीदार से संपर्क किया', ta: 'WhatsApp மூலம் வாங்குபவரை தொடர்பு கொண்டார்', pa: 'WhatsApp ਰਾਹੀਂ ਖਰੀਦਦਾਰ ਨਾਲ ਸੰਪਰਕ ਕੀਤਾ', hr: 'WhatsApp पै खरीदार तै बात करी' } },
  MANDI_SOLD:     { key: 'MANDI_SOLD',     points: 35, dailyCap: 70,  icon: 'checkmark-circle', label: { en: 'Marked Produce as Sold', hi: 'फसल बिकी - मार्क किया', ta: 'விளைபொருள் விற்பனையானது', pa: 'ਫਸਲ ਵਿਕ ਗਈ - ਮਾਰਕ ਕੀਤਾ', hr: 'फसल बिकगी - मार्क करया' } },
};

// 🔥 FIX 1: TS Error Fixed, Lang Param Added, Delay for Popup Added 🔥
export const addActivityPoints = async (
  activity: typeof ACTIVITIES[keyof typeof ACTIVITIES],
  lang: string = 'en' 
) => {
  try {
    const today = new Date().toDateString();
    const existing = await AsyncStorage.getItem('farm_activity_log');
    const log: ActivityEntry[] = existing ? JSON.parse(existing) : [];
    
    const todayPoints = log.filter(e => e.activityKey === activity.key && e.date === today).reduce((sum, e) => sum + e.points, 0);
    
    if (todayPoints >= activity.dailyCap) {
      console.log(`Limit reached for ${activity.key}`);
      return;
    }
    
    const awarded = Math.min(activity.points, activity.dailyCap - todayPoints);
    
    const entry: ActivityEntry = { 
      id: Date.now().toString(), 
      activityKey: activity.key, 
      points: awarded, 
      icon: activity.icon, 
      date: today, 
      displayDate: 'Today' 
    };
    
    await AsyncStorage.setItem('farm_activity_log', JSON.stringify([entry, ...log].slice(0, 50)));

    const actionName = activity.label[lang as keyof typeof activity.label] || activity.label['en'];
    let title = "🎉 Points Earned!";
    let msg = `You earned +${awarded} points for: '${actionName}'!`;

    if (lang === 'hi') { title = "🎉 बधाई हो!"; msg = `आपको '${actionName}' के लिए +${awarded} पॉइंट्स मिले हैं!`; }
    else if (lang === 'pa') { title = "🎉 ਵਧਾਈਆਂ!"; msg = `ਤੁਹਾਨੂੰ '${actionName}' ਲਈ +${awarded} ਪੁਆਇੰਟ ਮਿਲੇ ਹਨ!`; }
    else if (lang === 'hr') { title = "🎉 कसूता काम!"; msg = `तन्ने '${actionName}' खातिर +${awarded} पॉइंट मिलगे!`; }
    else if (lang === 'ta') { title = "🎉 வாழ்த்துக்கள்!"; msg = `நீங்கள் '${actionName}' க்கு +${awarded} புள்ளிகள் பெற்றுள்ளீர்கள்!`; }

    setTimeout(() => {
      Alert.alert(title, msg);
    }, 500);

  } catch (e) { 
    console.log('Activity log error:', e); 
  }
};

interface ActivityEntry { id: string; activityKey: string; points: number; icon: string; date: string; displayDate: string; }

// 🔥 FIX 2: Multiplier (* 2) Hata Diya, Ab Exactly 1:1 Points Judenge 🔥
const calcScore = (pts: number) => Math.min(300 + pts, 900); 

const getTier   = (score: number) => SCORE_TIERS.find(t => score >= t.minScore && score <= t.maxScore) || SCORE_TIERS[5];
const ptsToNext = (score: number) => { const next = [...SCORE_TIERS].reverse().find(t => t.minScore > score); return next ? Math.ceil((next.minScore - score)) : null; };
const npaRisk = (grade: string) => ({ 'A+': 'Very Low (3-4%)', A: 'Low (5-6%)', 'B+': 'Medium (7-8%)', B: 'Medium (9-10%)', C: 'High (11-13%)', D: 'Very High (15%+)' }[grade] || 'Unknown');

const T: any = {
  en: { title:"💳 Kisaan Credit", scoreTitle:"Your Trust Score", loanText:"Pre-approved Loan", applyBtn:"Apply for Loan", history:"Activity History", noLoan:"Keep farming to unlock loans!", noLoanSub:"Score above 400 to get your first loan.", scan1:"Connecting to Sentinel-2 Satellite...", scan2:"Analyzing Farm NDVI Data...", verified:"Satellite Verified ✅", noHistory:"No activity yet. Start scanning!", nextTier:"more points to next loan tier", applyTitle:"Apply for Loan", applySubtitle:"Choose how you want to proceed", pdfBtn:"📄 Download Credit Report", waBtn:"💬 Contact Bank via WhatsApp", bankTitle:"🏦 Bank Partner Report", bankClose:"Close", unlockTitle:"How to earn points:", totalPts:"Total Points", basedOn:"Farm Sutra verified activity", grade:"Risk Grade", npaRiskLbl:"NPA Risk", recommended:"Recommended Loan", digitalVerified:"Digitally Verified", activityScore:"Activity Score", interestRate:"Interest Rate", verActions:"Verified Actions", farmIdStr:"Farm ID", recorded:"recorded", today:"Today", yesterday:"Yesterday", daysAgo:"days ago", notEligible:"Not Eligible", fetchingData:"Fetching Data Flywheel...", farmerText:"Farmer", digiVerPill:"Digitally\nVerified", ptsText:"pts", poweredBy:"Powered by AWS Bedrock · Farm Sutra Data Flywheel", bankNoteTxt:"Score derived from verified in-app farming behaviour — Mandi transactions, crop health scans, and weather-based planning. Daily caps prevent gaming." },
  hi: { title:"💳 किसान क्रेडिट", scoreTitle:"आपका भरोसा स्कोर", loanText:"प्री-अप्रूव्ड लोन", applyBtn:"लोन के लिए आवेदन करें", history:"आपका डेटा इतिहास", noLoan:"लोन के लिए स्कोर बढ़ाएं!", noLoanSub:"पहला लोन पाने के लिए 400 से ऊपर स्कोर लाएं।", scan1:"सेंटीनेल-2 सैटेलाइट से जुड़ रहे हैं...", scan2:"खेत का NDVI डेटा चेक हो रहा है...", verified:"सैटेलाइट द्वारा प्रमाणित ✅", noHistory:"कोई गतिविधि नहीं। स्कैन करें या बेचें!", nextTier:"पॉइंट्स अगले लोन टियर के लिए", applyTitle:"लोन के लिए आवेदन", applySubtitle:"आगे बढ़ने का तरीका चुनें", pdfBtn:"📄 क्रेडिट रिपोर्ट डाउनलोड करें", waBtn:"💬 WhatsApp से बैंक से संपर्क करें", bankTitle:"🏦 बैंक पार्टनर रिपोर्ट", bankClose:"बंद करें", unlockTitle:"पॉइंट्स कैसे कमाएं:", totalPts:"कुल पॉइंट", basedOn:"फार्म सूत्र द्वारा सत्यापित", grade:"जोखिम ग्रेड", npaRiskLbl:"NPA जोखिम", recommended:"अनुशंसित लोन", digitalVerified:"डिजिटल रूप से सत्यापित", activityScore:"गतिविधि स्कोर", interestRate:"ब्याज दर", verActions:"सत्यापित कार्य", farmIdStr:"फार्म आईडी", recorded:"दर्ज किए गए", today:"आज", yesterday:"कल", daysAgo:"दिन पहले", notEligible:"अभी पात्र नहीं", fetchingData:"डेटा ला रहे हैं...", farmerText:"किसान", digiVerPill:"डिजिटल\nसत्यापित", ptsText:"पॉइंट्स", poweredBy:"AWS Bedrock द्वारा संचालित · फार्म सूत्र डेटा", bankNoteTxt:"स्कोर इन-ऐप गतिविधियों (मंडी, स्कैन, मौसम) से बना है। कोई फेक डेटा नहीं।" },
  ta: { title:"💳 விவசாயி கடன்", scoreTitle:"உங்கள் நம்பிக்கை மதிப்பெண்", loanText:"முன் அனுமதிக்கப்பட்ட கடன்", applyBtn:"கடனுக்கு விண்ணப்பிக்கவும்", history:"செயல்பாட்டு வரலாறு", noLoan:"கடனை திறக்க மேலும் சம்பாதிக்கவும்!", noLoanSub:"400க்கு மேல் மதிப்பெண் பெற செயல்களை முடிக்கவும்.", scan1:"Sentinel-2 இணைகிறது...", scan2:"பகுப்பாய்வு...", verified:"சரிபார்க்கப்பட்டது ✅", noHistory:"செயல்பாடு இல்லை!", nextTier:"அடுத்த நிலைக்கு புள்ளிகள்", applyTitle:"கடன் விண்ணப்பம்", applySubtitle:"தொடர விரும்பும் முறையை தேர்ந்தெடுக்கவும்", pdfBtn:"📄 அறிக்கை பதிவிறக்கவும்", waBtn:"💬 WhatsApp மூலம் தொடர்பு கொள்ளவும்", bankTitle:"🏦 வங்கி அறிக்கை", bankClose:"மூடு", unlockTitle:"புள்ளிகள் சம்பாதிப்பது:", totalPts:"மொத்த புள்ளிகள்", basedOn:"Farm Sutra செயல்பாடு", grade:"ஆபத்து தரம்", npaRiskLbl:"NPA ஆபத்து", recommended:"பரிந்துரைக்கப்பட்ட கடன்", digitalVerified:"டிஜிட்டல் சரிபார்க்கப்பட்டது", activityScore:"செயல்பாட்டு மதிப்பெண்", interestRate:"வட்டி விகிதம்", verActions:"சரிபார்க்கப்பட்டவை", farmIdStr:"பண்ணை ஐடி", recorded:"பதிவு செய்யப்பட்டது", today:"இன்று", yesterday:"நேற்று", daysAgo:"நாட்களுக்கு முன்", notEligible:"தகுதியற்றது", fetchingData:"தரவைப் பெறுகிறது...", farmerText:"விவசாயி", digiVerPill:"டிஜிட்டல்\nசரிபார்க்கப்பட்டது", ptsText:"புள்ளிகள்", poweredBy:"AWS Bedrock மற்றும் Farm Sutra", bankNoteTxt:"இந்த மதிப்பெண் பயன்பாட்டில் உள்ள விவசாய நடத்தையிலிருந்து பெறப்பட்டது." },
  pa: { title:"💳 ਕਿਸਾਨ ਕ੍ਰੈਡਿਟ", scoreTitle:"ਤੁਹਾਡਾ ਟਰੱਸਟ ਸਕੋਰ", loanText:"ਪ੍ਰੀ-ਅਪਰੂਵਡ ਲੋਨ", applyBtn:"ਲੋਨ ਲਈ ਅਪਲਾਈ ਕਰੋ", history:"ਤੁਹਾਡਾ ਡਾਟਾ ਇਤਿਹਾਸ", noLoan:"ਸਕੋਰ ਵਧਾਓ ਲੋਨ ਪਾਉਣ ਲਈ!", noLoanSub:"ਪਹਿਲਾ ਲੋਨ ਪਾਉਣ ਲਈ 400 ਤੋਂ ਉੱਪਰ ਸਕੋਰ ਲਿਆਓ।", scan1:"ਸੈਂਟੀਨੇਲ-2 ਸੈਟੇਲਾਈਟ ਨਾਲ ਜੁੜ ਰਿਹਾ ਹੈ...", scan2:"ਖੇਤ ਦਾ NDVI ਡਾਟਾ ਚੈੱਕ ਹੋ ਰਿਹਾ ਹੈ...", verified:"ਸੈਟੇਲਾਈਟ ਪ੍ਰਮਾਣਿਤ ✅", noHistory:"ਅਜੇ ਕੋਈ ਗਤੀਵਿਧੀ ਨਹੀਂ!", nextTier:"ਪੁਆਇੰਟ ਅਗਲੇ ਟੀਅਰ ਲਈ", applyTitle:"ਲੋਨ ਅਪਲਾਈ", applySubtitle:"ਅੱਗੇ ਵਧਣ ਦਾ ਤਰੀਕਾ ਚੁਣੋ", pdfBtn:"📄 ਕ੍ਰੈਡਿਟ ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ", waBtn:"💬 WhatsApp ਰਾਹੀਂ ਸੰਪਰਕ ਕਰੋ", bankTitle:"🏦 ਬੈਂਕ ਪਾਰਟਨਰ ਰਿਪੋਰਟ", bankClose:"ਬੰਦ ਕਰੋ", unlockTitle:"ਪੁਆਇੰਟ ਕਿਵੇਂ ਕਮਾਓ:", totalPts:"ਕੁੱਲ ਪੁਆਇੰਟ", basedOn:"Farm Sutra ਪ੍ਰਮਾਣਿਤ ਗਤੀਵਿਧੀ", grade:"ਜੋਖਮ ਗ੍ਰੇਡ", npaRiskLbl:"NPA ਜੋਖਮ", recommended:"ਸਿਫ਼ਾਰਿਸ਼ ਲੋਨ", digitalVerified:"ਡਿਜੀਟਲ ਪ੍ਰਮਾਣਿਤ", activityScore:"ਗਤੀਵਿਧੀ ਸਕੋਰ", interestRate:"ਵਿਆਜ ਦਰ", verActions:"ਪ੍ਰਮਾਣਿਤ ਕਾਰਵਾਈਆਂ", farmIdStr:"ਫਾਰਮ ID", recorded:"ਰਿਕਾਰਡ ਕੀਤੇ", today:"ਅੱਜ", yesterday:"ਕੱਲ੍ਹ", daysAgo:"ਦਿਨ ਪਹਿਲਾਂ", notEligible:"ਅਜੇ ਯੋਗ ਨਹੀਂ", fetchingData:"ਡਾਟਾ ਲਿਆ ਰਿਹਾ ਹੈ...", farmerText:"ਕਿਸਾਨ", digiVerPill:"ਡਿਜੀਟਲ\nਪ੍ਰਮਾਣਿਤ", ptsText:"ਪੁਆਇੰਟ", poweredBy:"AWS Bedrock ਦੁਆਰਾ ਸੰਚਾਲਿਤ", bankNoteTxt:"ਇਹ ਸਕੋਰ ਐਪ ਵਿੱਚ ਤੁਹਾਡੀਆਂ ਗਤੀਵਿਧੀਆਂ (ਮੰਡੀ, ਸਕੈਨ, ਮੌਸਮ) 'ਤੇ ਅਧਾਰਤ ਹੈ।" },
  hr: { title:"💳 किसान क्रेडिट", scoreTitle:"थारा भरोसा स्कोर", loanText:"प्री-अप्रूव्ड लोन", applyBtn:"लोन खातिर अप्लाई करो", history:"थारा काम का हिसाब", noLoan:"लोन खातिर स्कोर बढ़ा!", noLoanSub:"पहला लोन पाण खातिर 400 तै ऊपर स्कोर लाओ।", scan1:"सेंटीनेल-2 सैटेलाइट तै जुड़ रह्या सै...", scan2:"खेत का NDVI डेटा देख्या जा रह्या सै...", verified:"सैटेलाइट तै पास ✅", noHistory:"अभी तक कोई काम नहीं। शुरू कर!", nextTier:"पॉइंट अगले टियर खातिर", applyTitle:"लोन खातिर अप्लाई", applySubtitle:"आगे बढ़ण का तरीका छांट", pdfBtn:"📄 क्रेडिट रिपोर्ट डाउनलोड कर", waBtn:"💬 WhatsApp तै बैंक तै बात कर", bankTitle:"🏦 बैंक पार्टनर रिपोर्ट", bankClose:"बंद कर", unlockTitle:"पॉइंट कड़े मिलें:", totalPts:"कुल पॉइंट", basedOn:"Farm Sutra गतिविधि", grade:"जोखिम ग्रेड", npaRiskLbl:"NPA जोखिम", recommended:"सुझाया लोन", digitalVerified:"डिजिटल तरीके तै पास", activityScore:"गतिविधि स्कोर", interestRate:"ब्याज दर", verActions:"पक्के काम", farmIdStr:"खेत की ID", recorded:"दर्ज होगे", today:"आज", yesterday:"काल", daysAgo:"दिन पेहल्यां", notEligible:"इब्बै हकदार कोन्या", fetchingData:"डेटा ल्या रया सै...", farmerText:"किसान", digiVerPill:"डिजिटल\nपास", ptsText:"पॉइंट", poweredBy:"AWS Bedrock अर फार्म सूत्र", bankNoteTxt:"यो स्कोर थारी ऐप की असली मेहनत (मंडी, स्कैन, मौसम) तै बण्या सै। कोई फेक काम कोन्या।" },
};

export default function CreditScore() {
  const { lang } = useContext(LanguageContext);
  const t = T[lang] || T['en'];

  const [isScanning, setIsScanning]           = useState(true);
  const [scanText, setScanText]               = useState(t.scan1);
  const [log, setLog]                         = useState<ActivityEntry[]>([]);
  const [totalPts, setTotalPts]               = useState(0);
  const [showApply, setShowApply]             = useState(false);
  const [showBank, setShowBank]               = useState(false);
  const [pdfLoading, setPdfLoading]           = useState(false);

  // 🔥 FIX 3: TAB REFRESH HOGA JAB BHI OPEN KAREGA 🔥
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('farm_activity_log').then(existing => {
        if (existing) {
          const parsed: ActivityEntry[] = JSON.parse(existing);
          setLog(parsed); 
          setTotalPts(parsed.reduce((s, e) => s + e.points, 0));
        } else {
          setLog([]); 
          setTotalPts(0);
        }
      }).catch(e => console.log(e));
    }, [])
  );

  useEffect(() => {
    setIsScanning(true); setScanText(t.scan1);
    const t1 = setTimeout(() => setScanText(t.scan2), 1500);
    const t2 = setTimeout(() => setIsScanning(false), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [lang]);

  const score   = calcScore(totalPts);
  const tier    = getTier(score);
  const toNext  = ptsToNext(score);
  const pct     = Math.round(((score - 300) / 600) * 100);
  const farmId  = `FS-${new Date().getFullYear()}-${String(totalPts * 7 + 1000).slice(0,4)}`;

  const generatePDF = async () => {
    setPdfLoading(true);
    try {
      const issued  = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' });
      const rows    = log.slice(0,8).map(e => {
        const actionLabel = ACTIVITIES[e.activityKey as keyof typeof ACTIVITIES]?.label['en'] || e.activityKey;
        return `<tr><td>${actionLabel}</td><td style="color:#888">${e.displayDate}</td><td style="color:#2E7D32;font-weight:bold;text-align:right">+${e.points} pts</td></tr>`;
      }).join('');
      
      const html = `<html><head><style>body{font-family:Arial,sans-serif;padding:30px;color:#333}.hdr{background:#1E3F20;color:#fff;padding:24px;border-radius:10px;margin-bottom:20px}table{width:100%;border-collapse:collapse}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}.badge{font-size:24px;color:${tier.color};font-weight:bold}</style></head><body>
        <div class="hdr"><h2>Farm Sutra — Kisaan Credit Report</h2><p>Farm ID: ${farmId} | Issued: ${issued}</p></div>
        <h3>Credit Score: <span class="badge">${score} (${tier.grade})</span></h3>
        <p>Pre-Approved Loan: <b>${tier.loanAmt ? tier.loanAmt['en'] : 'Not Eligible'}</b></p>
        <p>Interest Rate: ${tier.interest ? tier.interest['en'] : 'N/A'}</p>
        <hr/><h3>Verified Activity Log</h3><table><tr><th>Action</th><th>Date</th><th style="text-align:right">Points</th></tr>${rows}</table>
        <p style="margin-top:30px;font-size:10px;color:#888;text-align:center">Digitally Verified by AWS Bedrock & Sentinel-2</p>
      </body></html>`;

      if (Platform.OS !== 'web') {
        // ✅ Native iOS/Android app: expo-print works perfectly
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Download Farm Sutra Report' });
      } else {
        // Web / PWA — must handle 3 sub-cases:
        // 1. Desktop browser     → open new tab + browser print dialog (Save as PDF)
        // 2. Android Chrome PWA  → anchor download works
        // 3. iOS Safari (browser OR home screen PWA) → window.open blocked, print() not supported
        //    Best option: navigate to blob URL — opens the report in Safari where
        //    the user can tap Share → Save to Files / Print

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);

        const isIOS = /iPad|iPhone|iPod/.test((navigator as any).userAgent);

        if (isIOS) {
          // iOS Safari (both browser and PWA home screen):
          // Navigate current window to blob URL — renders report in Safari.
          // User can then tap the Share button → Save to Files, Print, AirDrop etc.
          window.location.href = blobUrl;
        } else {
          // Desktop / Android: try opening new tab with print dialog
          const win = (window as any).open(blobUrl, '_blank');
          if (win) {
            win.addEventListener('load', () => {
              setTimeout(() => win.print(), 400);
            });
          } else {
            // Popup blocked fallback: force download as .html file
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `FarmSutra_CreditReport_${farmId}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }

        // Cleanup blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      }
    } catch (e: any) {
      console.log('PDF Error:', e);
      Alert.alert('Download Issue', `Could not save PDF: ${e.message}`);
    } finally { 
      setPdfLoading(false); 
    }
  };

  const openWhatsApp = async () => {
    const msg = `Namaste,\n\nI am applying for a Kisan Credit Card loan via Farm Sutra.\n\n*Farm ID:* ${farmId}\n*Score:* ${score} (${tier.grade})\n*Verified Actions:* ${log.length}\n\nScore verified by Farm Sutra App.`;
    const url = `https://wa.me/918007919191?text=${encodeURIComponent(msg)}`;
    try {
      await Linking.openURL(url);
    } catch { 
      Alert.alert('Error', 'Could not open WhatsApp.'); 
    }
  };

  const bankRows = [
    { label: t.grade,           value: tier.grade,                                                color: tier.color },
    { label: t.activityScore,   value: `${score} / 900`,                                          color: '#333' },
    { label: t.npaRiskLbl,      value: npaRisk(tier.grade),                                       color: tier.color },
    { label: t.recommended,     value: tier.loanAmt ? tier.loanAmt[lang as 'en'] : t.notEligible, color: '#333' },
    { label: t.interestRate,    value: tier.interest ? tier.interest[lang as 'en'] : 'N/A',       color: '#333' },
    { label: t.digitalVerified, value: 'AWS Bedrock + GPS + Sentinel-2',                          color: '#2E7D32' },
    { label: t.verActions,      value: `${log.length} ${t.recorded}`,                             color: '#333' },
    { label: t.farmIdStr,       value: farmId,                                                    color: '#666' },
  ];

  return (
    <View style={S.safeArea}>
      <View style={S.header}><Text style={S.headerTitle}>{t.title}</Text></View>

      {isScanning ? (
        <View style={S.scanWrap}>
          <View style={S.radarBox}><Ionicons name="earth-outline" size={60} color="#2E7D32" style={S.radarIcon}/><ActivityIndicator size="large" color="#FF9800" style={{marginTop:20}}/></View>
          <Text style={S.scanText}>{scanText}</Text>
          <Text style={S.scanSub}>{t.fetchingData}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={S.scroll}>
          
          <View style={[S.scoreCard, {borderTopColor:tier.ring, borderTopWidth:4}]}>
            <Text style={S.scoreSubtitle}>{t.scoreTitle}</Text>
            <View style={[S.circle, {borderColor:tier.ring}]}>
              <Text style={[S.scoreNum, {color:tier.color}]}>{score}</Text>
              <Text style={[S.scoreStatus, {color:tier.ring}]}>{tier.status[lang as 'en'] || tier.status['en']}</Text>
            </View>
            <View style={S.progWrap}>
              <View style={S.progTrack}><View style={[S.progFill, {width:`${Math.max(pct,2)}%`, backgroundColor:tier.ring}]}/></View>
              <View style={S.progLabels}><Text style={S.progLbl}>300</Text><Text style={S.progLbl}>600</Text><Text style={S.progLbl}>900</Text></View>
            </View>
            {toNext !== null && <Text style={S.nextTier}>🎯 {toNext} {t.nextTier}</Text>}
            <View style={[S.verBadge, {backgroundColor:tier.color}]}><Ionicons name="shield-checkmark" size={16} color="#FFF"/><Text style={S.verText}>{t.verified}</Text></View>
            <Text style={S.infoTxt}>{t.basedOn}</Text>
            <Text style={S.infoTxt}>{t.totalPts}: {totalPts} {t.ptsText} · {t.farmIdStr}: {farmId}</Text>
          </View>

          {tier.loanAmt ? (
            <View style={[S.loanCard, {borderColor:tier.ring, backgroundColor:tier.bg}]}>
              <View style={S.loanRow}>
                <View>
                  <Text style={[S.loanLbl, {color:tier.color}]}>{t.loanText}</Text>
                  <Text style={S.loanAmt}>{tier.loanAmt[lang as 'en'] || tier.loanAmt['en']}</Text>
                  <Text style={S.loanRate}>{tier.interest?.[lang as 'en']}</Text>
                </View>
                <Ionicons name="cash" size={44} color={tier.ring}/>
              </View>
              <TouchableOpacity style={[S.applyBtn, {backgroundColor:tier.color}]} onPress={() => setShowApply(true)}>
                <Ionicons name="document-text" size={18} color="#FFF" style={{marginRight:8}}/>
                <Text style={S.applyBtnTxt}>{t.applyBtn}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={S.noLoanCard}>
              <Ionicons name="lock-closed" size={36} color="#BDBDBD" style={{marginBottom:10}}/>
              <Text style={S.noLoanTitle}>{t.noLoan}</Text>
              <Text style={S.noLoanSub}>{t.noLoanSub}</Text>
              <View style={S.hints}>
                <Text style={S.hintsTitle}>{t.unlockTitle}</Text>
                <Text style={S.hint}>🛒 {ACTIVITIES.MANDI_LISTING.label[lang as 'en'] || ACTIVITIES.MANDI_LISTING.label['en']} = +{ACTIVITIES.MANDI_LISTING.points} {t.ptsText}</Text>
                <Text style={S.hint}>✅ {ACTIVITIES.MANDI_SOLD.label[lang as 'en'] || ACTIVITIES.MANDI_SOLD.label['en']} = +{ACTIVITIES.MANDI_SOLD.points} {t.ptsText}</Text>
                <Text style={S.hint}>💬 {ACTIVITIES.MANDI_CONTACT.label[lang as 'en'] || ACTIVITIES.MANDI_CONTACT.label['en']} = +{ACTIVITIES.MANDI_CONTACT.points} {t.ptsText}</Text>
                <Text style={S.hint}>🌿 {ACTIVITIES.CROP_SCAN.label[lang as 'en'] || ACTIVITIES.CROP_SCAN.label['en']} = +{ACTIVITIES.CROP_SCAN.points} {t.ptsText}</Text>
                <Text style={S.hint}>🌦️ {ACTIVITIES.WEATHER_DATA.label[lang as 'en'] || ACTIVITIES.WEATHER_DATA.label['en']} = +{ACTIVITIES.WEATHER_DATA.points} {t.ptsText}</Text>
                <Text style={S.hint}>☁️ {ACTIVITIES.WEATHER_CHECK.label[lang as 'en'] || ACTIVITIES.WEATHER_CHECK.label['en']} = +{ACTIVITIES.WEATHER_CHECK.points} {t.ptsText}</Text>
                <Text style={S.hint}>🤖 {ACTIVITIES.CHATBOT_QUERY.label[lang as 'en'] || ACTIVITIES.CHATBOT_QUERY.label['en']} = +{ACTIVITIES.CHATBOT_QUERY.points} {t.ptsText}</Text>
              </View>
            </View>
          )}

          <Text style={S.histTitle}>{t.history}</Text>
          <View style={S.histCard}>
            {log.length === 0 ? <Text style={S.noHistTxt}>{t.noHistory}</Text> : log.slice(0,8).map((e, i) => {
              const actionName = ACTIVITIES[e.activityKey as keyof typeof ACTIVITIES]?.label[lang as 'en'] || e.activityKey;
              const dispDate = e.displayDate === 'Today' ? t.today : e.displayDate === 'Yesterday' ? t.yesterday : e.displayDate.includes('2 days') ? `2 ${t.daysAgo}` : e.displayDate;
              
              return (
                <View key={e.id}>
                  <View style={S.histItem}>
                    <View style={S.iconBox}><Ionicons name={e.icon as any} size={20} color="#2E7D32"/></View>
                    <View style={{flex:1}}>
                      <Text style={S.histAction}>{actionName}</Text>
                      <Text style={S.histDate}>{dispDate}</Text>
                    </View>
                    <Text style={S.pts}>+{e.points} {t.ptsText}</Text>
                  </View>
                  {i < Math.min(log.length,8)-1 && <View style={S.div}/>}
                </View>
              )
            })}
          </View>

          <TouchableOpacity style={S.bankBtn} onPress={() => setShowBank(true)}>
            <Ionicons name="business" size={18} color="#1565C0" style={{marginRight:10}}/>
            <Text style={S.bankBtnTxt}>{t.bankTitle}</Text>
            <Ionicons name="chevron-forward" size={16} color="#1565C0" style={{marginLeft:'auto'}}/>
          </TouchableOpacity>

        </ScrollView>
      )}

      <Modal visible={showApply} transparent animationType="slide">
        <View style={S.overlay}>
          <View style={S.applySheet}>
            <View style={S.handle}/>
            <Text style={S.applyTitle}>{t.applyTitle}</Text>
            <Text style={S.applySub}>{t.applySubtitle}</Text>
            <View style={[S.applyScoreRow, {backgroundColor:tier.bg, borderColor:tier.ring}]}>
              <Text style={[S.applyScoreNum, {color:tier.color}]}>{score}</Text>
              <View style={{flex:1}}>
                <Text style={S.applyScoreLbl}>{tier.status[lang as 'en']||tier.status['en']} · Grade {tier.grade}</Text>
                <Text style={S.applyLoanLbl}>{tier.loanAmt?tier.loanAmt[lang as 'en']:t.notEligible}</Text>
              </View>
            </View>
            <TouchableOpacity style={[S.optBtn, {borderColor:'#1E3F20'}]} onPress={() => { setShowApply(false); generatePDF(); }} disabled={pdfLoading}>
              {pdfLoading ? <ActivityIndicator color="#1E3F20" style={{marginRight:12}}/> : <Ionicons name="document-text" size={26} color="#1E3F20" style={{marginRight:12}}/>}
              <View style={{flex:1}}><Text style={[S.optTitle, {color:'#1E3F20'}]}>{t.pdfBtn}</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={[S.optBtn, {borderColor:'#25D366'}]} onPress={() => { setShowApply(false); openWhatsApp(); }}>
              <Ionicons name="logo-whatsapp" size={26} color="#25D366" style={{marginRight:12}}/>
              <View style={{flex:1}}><Text style={[S.optTitle, {color:'#25D366'}]}>{t.waBtn}</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={S.cancelBtn} onPress={() => setShowApply(false)}><Text style={S.cancelTxt}>{t.bankClose}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showBank} transparent animationType="slide">
        <View style={S.overlay}>
          <ScrollView>
            <View style={S.bankSheet}>
              <View style={S.handle}/>
              <Text style={S.bankTitle}>{t.bankTitle}</Text>
              <Text style={S.bankSubtitle}>{t.poweredBy}</Text>
              <View style={[S.bankGradeBox, {backgroundColor:tier.bg, borderColor:tier.ring}]}>
                <Text style={[S.bankGrade, {color:tier.color}]}>{tier.grade}</Text>
                <View style={{flex:1}}>
                  <Text style={S.bankGradeLbl}>{t.grade}</Text>
                  <Text style={[S.bankGradeStatus, {color:tier.color}]}>{tier.status[lang as 'en']} {t.farmerText}</Text>
                </View>
                <View style={[S.verPill, {backgroundColor:tier.color}]}>
                  <Text style={S.verPillTxt}>{t.digiVerPill}</Text>
                </View>
              </View>
              {bankRows.map((r,i) => (
                <View key={i} style={S.bankRow}><Text style={S.bankKey}>{r.label}</Text><Text style={[S.bankVal, {color:r.color}]}>{r.value}</Text></View>
              ))}
              
              <View style={S.bankNote}>
                <Ionicons name="information-circle" size={16} color="#1565C0" style={{marginRight:6, marginTop:2}}/>
                <Text style={S.bankNoteTxt}>{t.bankNoteTxt}</Text>
              </View>

              <TouchableOpacity style={[S.applyBtn, {backgroundColor:'#1565C0', marginTop:15}]} onPress={() => setShowBank(false)}>
                <Text style={S.applyBtnTxt}>{t.bankClose}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const pad = Platform.OS === 'ios' ? 50 : RNStatusBar.currentHeight || 0;
const S = StyleSheet.create({
  safeArea:{flex:1,backgroundColor:'#F0F4F1',paddingTop:pad},
  header:{backgroundColor:'#1E3F20',paddingVertical:15,alignItems:'center'},
  headerTitle:{color:'#FFF',fontSize:20,fontWeight:'bold'},
  scanWrap:{flex:1,justifyContent:'center',alignItems:'center'},
  radarBox:{width:150,height:150,borderRadius:75,backgroundColor:'#E8F5E9',justifyContent:'center',alignItems:'center',borderWidth:2,borderColor:'#4CAF50',borderStyle:'dashed',marginBottom:20},
  radarIcon:{position:'absolute',opacity:0.5},
  scanText:{fontSize:18,fontWeight:'bold',color:'#1E3F20',textAlign:'center',marginHorizontal:20},
  scanSub:{fontSize:14,color:'#666',marginTop:10,fontStyle:'italic'},
  scroll:{padding:20,paddingBottom:40},
  scoreCard:{backgroundColor:'#FFF',borderRadius:15,padding:25,alignItems:'center',elevation:4,shadowColor:'#000',shadowOpacity:0.1,shadowRadius:10,marginBottom:20},
  scoreSubtitle:{fontSize:16,color:'#666',fontWeight:'bold',marginBottom:15},
  circle:{width:150,height:150,borderRadius:75,borderWidth:8,justifyContent:'center',alignItems:'center',backgroundColor:'#F8FFF9'},
  scoreNum:{fontSize:42,fontWeight:'bold'},
  scoreStatus:{fontSize:14,fontWeight:'bold',marginTop:2},
  progWrap:{width:'100%',marginTop:20,marginBottom:5},
  progTrack:{height:10,backgroundColor:'#E0E0E0',borderRadius:5,overflow:'hidden'},
  progFill:{height:10,borderRadius:5},
  progLabels:{flexDirection:'row',justifyContent:'space-between',marginTop:4},
  progLbl:{fontSize:11,color:'#999'},
  nextTier:{fontSize:13,color:'#666',marginTop:8,fontStyle:'italic'},
  verBadge:{flexDirection:'row',paddingHorizontal:10,paddingVertical:5,borderRadius:15,marginTop:15,alignItems:'center'},
  verText:{color:'#FFF',fontSize:12,fontWeight:'bold',marginLeft:5},
  infoTxt:{marginTop:5,fontSize:11,color:'#888',fontStyle:'italic',textAlign:'center'},
  loanCard:{borderRadius:15,padding:20,marginBottom:25,borderWidth:2},
  loanRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
  loanLbl:{fontSize:12,fontWeight:'bold',textTransform:'uppercase',letterSpacing:0.5},
  loanAmt:{fontSize:32,fontWeight:'bold',color:'#333',marginVertical:4},
  loanRate:{fontSize:12,color:'#666'},
  applyBtn:{paddingVertical:13,borderRadius:10,alignItems:'center',flexDirection:'row',justifyContent:'center'},
  applyBtnTxt:{color:'#FFF',fontSize:16,fontWeight:'bold'},
  noLoanCard:{backgroundColor:'#FAFAFA',borderRadius:15,padding:25,alignItems:'center',marginBottom:25,borderWidth:1,borderColor:'#E0E0E0',borderStyle:'dashed'},
  noLoanTitle:{fontSize:18,fontWeight:'bold',color:'#333',textAlign:'center'},
  noLoanSub:{fontSize:13,color:'#777',textAlign:'center',marginTop:8,marginBottom:15},
  hints:{backgroundColor:'#E8F5E9',padding:15,borderRadius:10,width:'100%'},
  hintsTitle:{fontSize:13,fontWeight:'bold',color:'#2E7D32',marginBottom:8},
  hint:{fontSize:14,color:'#2E7D32',marginBottom:5,fontWeight:'500'},
  histTitle:{fontSize:18,fontWeight:'bold',color:'#1E3F20',marginBottom:10,marginLeft:5},
  histCard:{backgroundColor:'#FFF',borderRadius:15,padding:15,elevation:2,marginBottom:20},
  noHistTxt:{color:'#999',textAlign:'center',paddingVertical:20,fontStyle:'italic'},
  histItem:{flexDirection:'row',alignItems:'center',paddingVertical:10},
  iconBox:{width:40,height:40,borderRadius:20,backgroundColor:'#E8F5E9',justifyContent:'center',alignItems:'center',marginRight:15},
  histAction:{fontSize:15,fontWeight:'bold',color:'#333'},
  histDate:{fontSize:12,color:'#888',marginTop:2},
  pts:{fontSize:16,fontWeight:'bold',color:'#2E7D32'},
  div:{height:1,backgroundColor:'#EEE',marginVertical:5},
  bankBtn:{flexDirection:'row',alignItems:'center',backgroundColor:'#E3F2FD',padding:16,borderRadius:12,borderWidth:1,borderColor:'#90CAF9'},
  bankBtnTxt:{fontSize:15,fontWeight:'bold',color:'#1565C0'},
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  handle:{width:40,height:4,backgroundColor:'#DDD',borderRadius:2,alignSelf:'center',marginBottom:20},
  applySheet:{backgroundColor:'#FFF',borderTopLeftRadius:25,borderTopRightRadius:25,padding:25,paddingBottom:40},
  applyTitle:{fontSize:22,fontWeight:'bold',color:'#1E3F20',marginBottom:5},
  applySub:{fontSize:14,color:'#888',marginBottom:20},
  applyScoreRow:{flexDirection:'row',alignItems:'center',gap:15,padding:15,borderRadius:12,borderWidth:1.5,marginBottom:20},
  applyScoreNum:{fontSize:36,fontWeight:'bold'},
  applyScoreLbl:{fontSize:14,fontWeight:'bold',color:'#333'},
  applyLoanLbl:{fontSize:12,color:'#666',marginTop:3},
  optBtn:{flexDirection:'row',alignItems:'center',padding:18,borderRadius:12,borderWidth:2,marginBottom:12,backgroundColor:'#FAFAFA'},
  optTitle:{fontSize:15,fontWeight:'bold'},
  cancelBtn:{alignItems:'center',paddingVertical:12},
  cancelTxt:{color:'#888',fontSize:16,fontWeight:'500'},
  bankSheet:{backgroundColor:'#FFF',borderTopLeftRadius:25,borderTopRightRadius:25,padding:25,paddingBottom:40},
  bankTitle:{fontSize:22,fontWeight:'bold',color:'#1565C0',marginBottom:4},
  bankSubtitle:{fontSize:12,color:'#888',marginBottom:18,fontStyle:'italic'},
  bankGradeBox:{flexDirection:'row',alignItems:'center',gap:15,padding:15,borderRadius:12,borderWidth:1.5,marginBottom:18},
  bankGrade:{fontSize:40,fontWeight:'bold'},
  bankGradeLbl:{fontSize:10,color:'#888',textTransform:'uppercase',letterSpacing:1},
  bankGradeStatus:{fontSize:15,fontWeight:'bold',marginTop:3},
  verPill:{paddingHorizontal:10,paddingVertical:6,borderRadius:10,alignItems:'center'},
  verPillTxt:{color:'#FFF',fontSize:10,fontWeight:'bold',textAlign:'center'},
  bankRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#F0F0F0'},
  bankKey:{fontSize:13,color:'#666',flex:1},
  bankVal:{fontSize:13,fontWeight:'bold',flex:1,textAlign:'right'},
  bankNote:{flexDirection:'row',backgroundColor:'#E3F2FD',padding:12,borderRadius:10,marginTop:15,alignItems:'flex-start'},
  bankNoteTxt:{fontSize:11,color:'#1565C0',flex:1,lineHeight:17},
});