import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
// AsyncStorage import karna zaroori hai data clear karne ke liye
import AsyncStorage from '@react-native-async-storage/async-storage';
// Context import kiya
import { LanguageContext } from '../LanguageContext'; 

const textDict: any = {
  en: { langTitle: "Select language", loginTitle: "Login to Farm Sutra", phoneText: "Enter Mobile Number", getOtp: "Get OTP", guestText: "Continue as Guest" },
  hi: { langTitle: "भाषा चुनें", loginTitle: "फार्म सूत्र में लॉगिन करें", phoneText: "अपना मोबाइल नंबर डालें", getOtp: "ओटीपी प्राप्त करें", guestText: "बिना अकाउंट के चलाएं" },
  ta: { langTitle: "மொழியைத் தேர்ந்தெடுக்கவும்", loginTitle: "உள்நுழையவும்", phoneText: "மொபைல் எண்", getOtp: "OTP பெறுக", guestText: "விருந்தினராக தொடரவும்" },
  pa: { langTitle: "ਭਾਸ਼ਾ ਚੁਣੋ", loginTitle: "ਫਾਰਮ ਸੂਤਰ ਵਿੱਚ ਲਾਗਇਨ ਕਰੋ", phoneText: "ਮੋਬਾਈਲ ਨੰਬਰ ਭਰੋ", getOtp: "OTP ਪ੍ਰਾਪਤ ਕਰੋ", guestText: "ਮਹਿਮਾਨ ਵਜੋਂ ਜਾਰੀ ਰੱਖੋ" },
  hr: { langTitle: "भाषा छांटो", loginTitle: "फार्म सूत्र में लॉगिन करो", phoneText: "मोबाइल नंबर लिखो", getOtp: "OTP मंगवाओ", guestText: "बिना अकाउंट के चलाओ" }
};

export default function Welcome({ navigation }: any) {
  const [step, setStep] = useState('LANGUAGE'); 
  
  // Ab bhasha Global Memory (Context) se aa rahi hai!
  const { lang, setLang } = useContext(LanguageContext); 

  const selectLanguage = (selectedLang: string) => {
    setLang(selectedLang); // Global memory me bhasha save ho gayi
    setStep('LOGIN'); 
  };

  // 🔥 GUEST LOGIN — FULL FRESH START 🔥
  const handleGuestLogin = async () => {
    try {
      // 1. Get ALL keys currently in AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();

      // 2. Fixed keys to always delete
      const fixedKeys = [
        'chat_history',        // ChatBot conversation history
        'farm_activity_log',   // Credit score activity log
        'mandi_sell_orders',   // Mandi listings (expiry, sold status etc.)
      ];

      // 3. Dynamic keys — daily crop listing cap (last_listing_{cropName})
      const cropCapKeys = allKeys.filter(k => k.startsWith('last_listing_'));

      // 4. Delete everything in one shot
      const keysToDelete = [...fixedKeys, ...cropCapKeys];
      await AsyncStorage.multiRemove(keysToDelete);

      console.log(`Guest Login: Cleared ${keysToDelete.length} keys →`, keysToDelete);

      // 5. Navigate fresh
      navigation.replace('MainTabs');
    } catch (e) {
      console.log("Error clearing data:", e);
      navigation.replace('MainTabs'); // App should never get stuck
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#122614" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌾</Text>
          <Text style={styles.brandName}>Farm Sutra</Text>
        </View>

        {step === 'LANGUAGE' && (
          <View style={styles.bottomSection}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>कA</Text>
            </View>
            <Text style={styles.title}>{textDict.en.langTitle}</Text>
            
            <View style={styles.gridContainer}>
              <TouchableOpacity style={styles.gridBtn} onPress={() => selectLanguage('en')}><Text style={styles.gridBtnText}>English</Text></TouchableOpacity>
              <TouchableOpacity style={styles.gridBtn} onPress={() => selectLanguage('hi')}><Text style={styles.gridBtnText}>हिन्दी</Text></TouchableOpacity>
              <TouchableOpacity style={styles.gridBtn} onPress={() => selectLanguage('pa')}><Text style={styles.gridBtnText}>ਪੰਜਾਬੀ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.gridBtn} onPress={() => selectLanguage('hr')}><Text style={styles.gridBtnText}>हरियाणवी</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.gridBtn, styles.fullWidthBtn]} onPress={() => selectLanguage('ta')}><Text style={styles.gridBtnText}>தமிழ் (Tamil)</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'LOGIN' && (
          <View style={styles.bottomSection}>
            <Text style={styles.title}>{textDict[lang].loginTitle}</Text>
            
            <TextInput style={styles.input} placeholder={textDict[lang].phoneText} placeholderTextColor="#888" keyboardType="phone-pad" maxLength={10} />
            <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>{textDict[lang].getOtp}</Text></TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line}></View><Text style={styles.orText}>OR</Text><View style={styles.line}></View>
            </View>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleGuestLogin}>
              <Text style={styles.secondaryBtnText}>{textDict[lang].guestText}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 25 }} onPress={() => setStep('LANGUAGE')}>
              <Text style={{ color: '#A5D6A7', textAlign: 'center', fontSize: 16 }}>← Change Language</Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </View>
  );
}

const paddingTopOS = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#122614', paddingTop: paddingTopOS }, 
  container: { flex: 1, justifyContent: 'space-between', padding: 20 },
  logoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 80 },
  brandName: { fontSize: 36, fontWeight: 'bold', color: '#FFF', marginTop: 10, letterSpacing: 1 },
  bottomSection: { paddingBottom: 40, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1E3F20', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  iconText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '600', color: '#FFF', marginBottom: 25 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  gridBtn: { width: '48%', backgroundColor: '#1E3F20', paddingVertical: 18, borderRadius: 12, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#2E7D32' },
  fullWidthBtn: { width: '100%' },
  gridBtnText: { fontSize: 18, color: '#FFF', fontWeight: '500' },
  input: { width: '100%', backgroundColor: '#1E3F20', padding: 18, borderRadius: 12, fontSize: 18, color: '#FFF', marginBottom: 20, borderWidth: 1, borderColor: '#2E7D32' },
  primaryBtn: { width: '100%', backgroundColor: '#4CAF50', padding: 18, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25, width: '100%' },
  line: { flex: 1, height: 1, backgroundColor: '#333' },
  orText: { marginHorizontal: 15, color: '#888', fontWeight: 'bold', fontSize: 16 },
  secondaryBtn: { width: '100%', backgroundColor: 'transparent', padding: 18, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#4CAF50' },
  secondaryBtnText: { color: '#4CAF50', fontSize: 18, fontWeight: 'bold' }
});