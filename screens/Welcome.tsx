import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  KeyboardAvoidingView, Platform, StatusBar, Image, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../LanguageContext'; 

const textDict: any = {
  en: { langTitle: "Select Language", loginTitle: "Enter Mobile Number", phoneDesc: "We'll send a 4-digit OTP to verify", getOtp: "Send OTP", guestText: "Continue as Guest", otpTitle: "Verify OTP", otpDesc: "Enter code sent to ", verifyBtn: "Verify & Login" },
  hi: { langTitle: "भाषा चुनें", loginTitle: "मोबाइल नंबर दर्ज करें", phoneDesc: "हम सत्यापन के लिए 4-अंकों का OTP भेजेंगे", getOtp: "OTP भेजें", guestText: "बिना अकाउंट के चलाएं", otpTitle: "OTP सत्यापित करें", otpDesc: "इस नंबर पर भेजा गया कोड दर्ज करें ", verifyBtn: "सत्यापित करें" },
  // ... (Baaki languages same rakhna)
  ta: { langTitle: "மொழியைத் தேர்ந்தெடுக்கவும்", loginTitle: "மொபைல் எண்", phoneDesc: "OTP அனுப்பப்படும்", getOtp: "OTP பெறுக", guestText: "விருந்தினராக தொடரவும்", otpTitle: "OTP ஐ சரிபார்க்கவும்", otpDesc: "குறியீட்டை உள்ளிடவும் ", verifyBtn: "உள்நுழையவும்" },
  pa: { langTitle: "ਭਾਸ਼ਾ ਚੁਣੋ", loginTitle: "ਮੋਬਾਈਲ ਨੰਬਰ ਭਰੋ", phoneDesc: "ਅਸੀਂ OTP ਭੇਜਾਂਗੇ", getOtp: "OTP ਪ੍ਰਾਪਤ ਕਰੋ", guestText: "ਮਹਿਮਾਨ ਵਜੋਂ ਜਾਰੀ ਰੱਖੋ", otpTitle: "OTP ਵੈਰੀਫਾਈ ਕਰੋ", otpDesc: "ਕੋਡ ਦਰਜ ਕਰੋ ", verifyBtn: "ਵੈਰੀਫਾਈ ਕਰੋ" },
  hr: { langTitle: "भाषा छांटो", loginTitle: "मोबाइल नंबर लिखो", phoneDesc: "हम 4-अक्षर का OTP भेजेंगे", getOtp: "OTP मंगवाओ", guestText: "बिना अकाउंट के चलाओ", otpTitle: "OTP पक्का करो", otpDesc: "इस नंबर पै आया कोड लिखो ", verifyBtn: "लॉगिन करो" }
};

export default function Welcome({ navigation }: any) {
  const [step, setStep] = useState<'LANGUAGE' | 'LOGIN' | 'OTP'>('LANGUAGE'); 
  const { lang, setLang } = useContext(LanguageContext); 
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const t = textDict[lang] || textDict.en;

  const selectLanguage = (selectedLang: string) => {
    setLang(selectedLang); 
    setStep('LOGIN'); 
  };

  const handleSendOTP = () => {
    if(phone.length !== 10) return;
    setLoading(true);
    // Yahan backend API call aayegi (AWS/Firebase)
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if(otp.length !== 4) return;
    setLoading(true);
    // Yahan OTP verification aayega
    setTimeout(async () => {
      setLoading(false);
      await AsyncStorage.setItem('user_token', 'dummy_token');
      navigation.replace('MainTabs');
    }, 1500);
  };

  const handleGuestLogin = async () => {
    const fixedKeys = ['chat_history', 'farm_activity_log', 'mandi_sell_orders'];
    await AsyncStorage.multiRemove(fixedKeys);
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A160D" />
      
      {/* Background Decorative Elements for Premium Vibe */}
      <View style={styles.glowCircleTop} />
      <View style={styles.glowCircleBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <View style={styles.logoContainer}>
          <View style={styles.imageWrapper}>
             <Image source={require('../assets/logo.jpg')} style={styles.logoImage} />
          </View>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>Farm Sutra</Text>
            <Text style={styles.logoText}>🌾</Text> 
          </View>
          <Text style={styles.tagline}>Empowering Bharat's Farmers</Text>
        </View>

        {step === 'LANGUAGE' && (
          <View style={[styles.bottomSection, styles.glassCard]}>
            <Text style={styles.title}>{t.langTitle}</Text>
            <View style={styles.gridContainer}>
              <TouchableOpacity style={styles.gridBtn} onPress={() => selectLanguage('en')}><Text style={styles.gridBtnText}>English</Text></TouchableOpacity>
              <TouchableOpacity style={styles.gridBtn} onPress={() => selectLanguage('hi')}><Text style={styles.gridBtnText}>हिन्दी</Text></TouchableOpacity>
              <TouchableOpacity style={styles.gridBtn} onPress={() => selectLanguage('pa')}><Text style={styles.gridBtnText}>ਪੰਜਾਬੀ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.gridBtn} onPress={() => selectLanguage('hr')}><Text style={styles.gridBtnText}>हरियाणवी</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'LOGIN' && (
          <View style={[styles.bottomSection, styles.glassCard]}>
            <Text style={styles.title}>{t.loginTitle}</Text>
            <Text style={styles.subtitle}>{t.phoneDesc}</Text>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput style={styles.input} placeholder="00000 00000" placeholderTextColor="#555" keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} />
            </View>

            <TouchableOpacity style={[styles.primaryBtn, phone.length !== 10 && styles.disabledBtn]} onPress={handleSendOTP} disabled={phone.length !== 10 || loading}>
              {loading ? <ActivityIndicator color="#122614" /> : <Text style={styles.primaryBtnText}>{t.getOtp}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleGuestLogin}>
              <Text style={styles.secondaryBtnText}>{t.guestText}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'OTP' && (
          <View style={[styles.bottomSection, styles.glassCard]}>
            <Text style={styles.title}>{t.otpTitle}</Text>
            <Text style={styles.subtitle}>{t.otpDesc} <Text style={{fontWeight: 'bold', color: '#00E676'}}>+91 {phone}</Text></Text>
            
            <TextInput style={styles.otpInput} placeholder="• • • •" placeholderTextColor="#555" keyboardType="number-pad" maxLength={4} value={otp} onChangeText={setOtp} autoFocus />

            <TouchableOpacity style={[styles.primaryBtn, otp.length !== 4 && styles.disabledBtn]} onPress={handleVerifyOTP} disabled={otp.length !== 4 || loading}>
              {loading ? <ActivityIndicator color="#122614" /> : <Text style={styles.primaryBtnText}>{t.verifyBtn}</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setStep('LOGIN')}>
              <Text style={{ color: '#00E676', textAlign: 'center', fontSize: 14 }}>← Edit Number</Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A160D', paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0 }, 
  container: { flex: 1, justifyContent: 'space-between', padding: 20, zIndex: 10 },
  
  // Ambient Glow Effects
  glowCircleTop: { position: 'absolute', width: 250, height: 250, backgroundColor: '#00E676', borderRadius: 125, top: -50, left: -50, opacity: 0.15, transform: [{ scale: 2 }] },
  glowCircleBottom: { position: 'absolute', width: 200, height: 200, backgroundColor: '#2E7D32', borderRadius: 100, bottom: -50, right: -50, opacity: 0.2, transform: [{ scale: 2 }] },

  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  imageWrapper: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', borderWidth: 2, borderColor: '#00E676', marginBottom: 15, elevation: 10 },
  logoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandName: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: 1.5 },
  logoText: { fontSize: 32, marginLeft: 8 }, 
  tagline: { color: '#888', fontSize: 14, marginTop: 5, fontStyle: 'italic', letterSpacing: 0.5 },

  // Pseudo-Glassmorphism Card
  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 24, padding: 25, width: '100%' },
  bottomSection: { paddingBottom: 20, alignItems: 'center' },
  
  title: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#A0A0A0', marginBottom: 25, textAlign: 'center' },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  gridBtn: { width: '48%', backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingVertical: 18, borderRadius: 16, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)' },
  gridBtnText: { fontSize: 16, color: '#FFF', fontWeight: '600', letterSpacing: 0.5 },
  
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20, paddingHorizontal: 15 },
  prefix: { color: '#00E676', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  input: { flex: 1, paddingVertical: 18, fontSize: 18, color: '#FFF', fontWeight: '500', letterSpacing: 2 },
  
  otpInput: { width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.5)', marginBottom: 20, fontSize: 32, color: '#00E676', fontWeight: 'bold', letterSpacing: 15, textAlign: 'center' },

  primaryBtn: { width: '100%', backgroundColor: '#00E676', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#00E676', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  disabledBtn: { backgroundColor: '#2A3C30', shadowOpacity: 0, elevation: 0 },
  primaryBtnText: { color: '#0A160D', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
  
  secondaryBtn: { width: '100%', backgroundColor: 'transparent', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 15 },
  secondaryBtnText: { color: '#A0A0A0', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' }
});