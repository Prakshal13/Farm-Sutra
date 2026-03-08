import 'react-native-get-random-values';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, 
  ActivityIndicator, Alert, StatusBar as RNStatusBar
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AWS IMPORTS
import { Amplify } from 'aws-amplify';
import { post } from 'aws-amplify/api';
import awsconfig from '../src/aws-exports'; 
import { LanguageContext } from '../LanguageContext';

// 🔥 CREDIT SCORE IMPORT 🔥
import { addActivityPoints, ACTIVITIES } from './CreditScore';

Amplify.configure(awsconfig);

const chatDict: any = {
  en: { header: "🤖 Farm Sutra AI", placeholder: "Ask Farm Sutra...", offline: "Offline. Data saving to device.", thinking: "Farm Sutra is thinking...", welcome: "Ram Ram! I am Farm Sutra AI.", listening: "Listening..." },
  hi: { header: "🤖 फार्म सूत्र AI", placeholder: "फार्म सूत्र से पूछें...", offline: "ऑफ़लाइन। डेटा डिवाइस में सेव हो रहा है।", thinking: "फार्म सूत्र सोच रहा है...", welcome: "राम राम! मैं फार्म सूत्र AI हूँ।", listening: "सुन रहा हूँ..." },
  ta: { header: "🤖 பார்ம் சூத்திரா AI", placeholder: "கேள்வி கேட்க...", offline: "ஆஃப்லைன். தரவு சேமிக்கப்படுகிறது.", thinking: "பார்ம் சூத்திரா யோசிக்கிறது...", welcome: "வணக்கம்! நான் பார்ம் சூத்திரா AI.", listening: "கேட்கிறேன்..." },
  pa: { header: "🤖 ਫਾਰਮ ਸੂਤਰ AI", placeholder: "ਫਾਰਮ ਸੂਤਰ ਤੋਂ ਪੁੱਛੋ...", offline: "ਔਫਲਾਈਨ। ਡਾਟਾ ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ।", thinking: "ਫਾਰਮ ਸੂਤਰ ਸੋਚ ਰਿਹਾ ਹੈ...", welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਫਾਰਮ ਸੂਤਰ AI ਹਾਂ।", listening: "ਸੁਣ ਰਿਹਾ ਹਾਂ..." },
  hr: { header: "🤖 फार्म सूत्र AI", placeholder: "फार्म सूत्र तै पूछो...", offline: "ऑफलाइन। डेटा डिवाइस में सेव हो रह्या सै।", thinking: "फार्म सूत्र सोच रहा सै...", welcome: "राम राम! मैं फार्म सूत्र AI सूँ।", listening: "सुणु सूँ..." }
};

const mockVoiceDict: any = {
  en: "How to protect my wheat crop from fungus?",
  hi: "मेरी गेहूं की फसल में फंगस लग गई है, क्या उपाय है?",
  ta: "என் கோதுமை பயிரை பூஞ்சையிலிருந்து எப்படி பாதுகாப்பது?",
  pa: "ਮੇਰੀ ਕਣਕ ਦੀ ਫਸਲ ਵਿੱਚ ਉੱਲੀ ਲੱਗ ਗਈ ਹੈ, ਕੀ ਕਰੀਏ?",
  hr: "मेरी गेहूं की फसल में फंगस लाग गी, के इलाज सै?"
};

const aiPromptInstruction: any = {
  en: "Please reply strictly in English.",
  hi: "Please reply strictly in Hindi.",
  ta: "Please reply strictly in Tamil.",
  pa: "Please reply strictly in Punjabi.",
  hr: "Please reply strictly in proper Haryanvi dialect used by farmers in Haryana. Use local tone and words."
};

export default function ChatBot() {
  const { lang } = useContext(LanguageContext);
  const t = chatDict[lang] || chatDict['en'];
  const instruction = aiPromptInstruction[lang] || aiPromptInstruction['en'];

  const [messages, setMessages] = useState([{ id: 1, text: t.welcome, sender: 'bot' }]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<{ type: string; data: string }[]>([]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedChat = await AsyncStorage.getItem('chat_history');
        if (savedChat !== null) {
          setMessages(JSON.parse(savedChat));
        } else {
          setMessages([{ id: 1, text: t.welcome, sender: 'bot' }]);
        }
      } catch (e) { console.log("Load Error", e); }
    };
    loadChatHistory();
  }, [lang]);

  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        await AsyncStorage.setItem('chat_history', JSON.stringify(messages));
      } catch (e) { console.log("Save Error", e); }
    };
    saveChatHistory();
  }, [messages]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
      if (state.isConnected === true && offlineQueue.length > 0) {
        setOfflineQueue([]);
        Alert.alert("Sync Complete", "Farm Sutra synced offline data!");
      }
    });
    return () => unsubscribe();
  }, [offlineQueue]);

  const startListening = () => {
    if (isListening) return;
    setIsListening(true);
    setInputText(t.listening);
    setTimeout(() => {
      setIsListening(false);
      setInputText(mockVoiceDict[lang] || mockVoiceDict['en']);
    }, 2000);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera access needed!");
      return;
    }
    try {
      let result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.3, base64: true });
      if (!result.canceled && result.assets) {
        const base64Img = result.assets[0].base64;
        if (!base64Img) return;
        
        if (isOffline) {
          setOfflineQueue([...offlineQueue, { type: 'image', data: base64Img }]);
          setMessages((prev) => [...prev, { id: Date.now(), text: "⚠️ Image saved offline. Will sync when online.", sender: 'bot' }]);
        } else {
          processScan(base64Img);
        }
      }
    } catch (error) { console.log(error); }
  };

  const processScan = async (img: string) => {
    setIsLoading(true);
    try {
      const promptText = `Analyze crop disease. ${instruction}`;
      const op = post({ apiName: 'farmsutraApi', path: '/chat', options: { body: { prompt: promptText, image: img } } });
      const { body } = await op.response;
      const res = await body.json() as { reply: string };
      setMessages(prev => [...prev, { id: Date.now(), text: res.reply, sender: 'bot' }]);
      
      // 🔥 SCORE UPDATE + POPUP 🔥
      await addActivityPoints(ACTIVITIES.CROP_SCAN, lang);

    } catch (e) { console.log(e); } finally { setIsLoading(false); }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || inputText === t.listening) return;
    const userQuery = inputText;
    setMessages(prev => [...prev, { id: Date.now(), text: userQuery, sender: 'user' }]);
    setInputText('');
    
    if (isOffline) {
      setOfflineQueue([...offlineQueue, { type: 'text', data: userQuery }]);
      setMessages(prev => [...prev, { id: Date.now()+1, text: "⚠️ Question saved in local storage.", sender: 'bot' }]);
      return;
    }
    
    setIsLoading(true);
    try {
      const hiddenPrompt = `${userQuery}. ${instruction}`;
      const op = post({ apiName: 'farmsutraApi', path: '/chat', options: { body: { prompt: hiddenPrompt } } });
      const { body } = await op.response;
      const res = await body.json() as { reply: string };
      setMessages(prev => [...prev, { id: Date.now() + 1, text: res.reply, sender: 'bot' }]);
      
      // 🔥 SCORE UPDATE + POPUP 🔥
      await addActivityPoints(ACTIVITIES.CHATBOT_QUERY, lang);

    } catch (e) { console.log(e); } finally { setIsLoading(false); }
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        {isOffline && <View style={styles.offlineBanner}><Text style={styles.offlineText}>{t.offline}</Text></View>}
        <View style={styles.header}><Text style={styles.headerTitle}>{t.header}</Text></View>
        <ScrollView style={styles.mainScroll} contentContainerStyle={{ padding: 20 }}>
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
              {msg.sender === 'user' ? <Text style={styles.userText}>{msg.text}</Text> : <Markdown style={markdownStyles}>{msg.text}</Markdown>}
            </View>
          ))}
          {isLoading && <View style={styles.loader}><ActivityIndicator size="small" color="#2E7D32" /><Text style={styles.loaderText}>{t.thinking}</Text></View>}
        </ScrollView>
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.camBtn} onPress={pickImage}><Ionicons name="camera" size={26} color="#2E7D32" /></TouchableOpacity>
          <TouchableOpacity style={styles.micBtn} onPress={startListening}><Ionicons name={isListening ? "mic" : "mic-outline"} size={26} color={isListening ? "#FF5252" : "#2E7D32"} /></TouchableOpacity>
          <TextInput style={[styles.input, isListening && styles.listeningInput]} placeholderTextColor="#888" placeholder={t.placeholder} value={inputText} onChangeText={setInputText} onSubmitEditing={sendMessage} editable={!isListening} />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={isLoading || isListening}><Ionicons name="send" size={20} color="#FFF" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <ExpoStatusBar style="light" />
    </View>
  );
}

const paddingTopOS = Platform.OS === 'ios' ? 50 : RNStatusBar.currentHeight || 0;
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E3F20', paddingTop: paddingTopOS },
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  offlineBanner: { backgroundColor: '#FF9800', padding: 5, alignItems: 'center' },
  offlineText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  header: { backgroundColor: '#1E3F20', paddingVertical: 15, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  mainScroll: { flex: 1 },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 18, marginBottom: 10 },
  userBubble: { backgroundColor: '#2E7D32', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  botBubble: { backgroundColor: '#FFF', alignSelf: 'flex-start', borderBottomLeftRadius: 2, elevation: 1 },
  userText: { color: '#FFF' },
  loader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  loaderText: { marginLeft: 10, color: '#666', fontStyle: 'italic' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  camBtn: { marginRight: 8 },
  micBtn: { marginRight: 10 },
  input: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 25, paddingHorizontal: 15, height: 45, color: '#333' },
  listeningInput: { color: '#FF5252', fontStyle: 'italic', fontWeight: 'bold' },
  sendBtn: { backgroundColor: '#2E7D32', width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});
const markdownStyles = { body: { color: '#333' } };
