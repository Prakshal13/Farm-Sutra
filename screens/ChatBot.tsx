import 'react-native-get-random-values';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, 
  ActivityIndicator, Alert, StatusBar as RNStatusBar,
  Modal, Image, Animated
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
  en: { 
    header: "🤖 Farm Sutra AI", placeholder: "Ask Farm Sutra...", 
    offline: "You are offline. Please reconnect to ask questions.", thinking: "Farm Sutra is thinking...", 
    welcome: "Ram Ram! I am Farm Sutra AI.",  listening: "Listening...",
    scanTipTitle: "📸 Photo Tips for Best Diagnosis",
    scanTip1: "• Get close to the affected leaf or area",
    scanTip2: "• Make sure there is good lighting",
    scanTip3: "• Hold the phone steady — avoid blur",
    scanTip4: "• Include both healthy & damaged parts in frame",
    btnCamera: "📷 Open Camera",
    btnGallery: "🖼️ Choose from Gallery",
    btnCancel: "Cancel",
    scanningTitle: "🔬 Analyzing Your Crop...",
    scanningSubtitle: "AI is examining for diseases, pests & deficiencies.\nMay take 5–10 seconds on slow networks.",
    youSentPhoto: "📷 Sent a crop photo for diagnosis",
  },
  hi: { 
    header: "🤖 फार्म सूत्र AI", placeholder: "फार्म सूत्र से पूछें...", 
    offline: "आप ऑफ़लाइन हैं। कनेक्ट होने के बाद सवाल पूछें।", thinking: "फार्म सूत्र सोच रहा है...", 
    welcome: "राम राम! मैं फार्म सूत्र AI हूँ।", listening: "सुन रहा हूँ...",
    scanTipTitle: "📸 बेहतर निदान के लिए फोटो टिप्स",
    scanTip1: "• प्रभावित पत्ती या हिस्से के पास जाएं",
    scanTip2: "• अच्छी रोशनी में फोटो लें",
    scanTip3: "• फोन स्थिर रखें — धुंधला न हो",
    scanTip4: "• स्वस्थ और बीमार दोनों हिस्से दिखाएं",
    btnCamera: "📷 कैमरा खोलें",
    btnGallery: "🖼️ गैलरी से चुनें",
    btnCancel: "रद्द करें",
    scanningTitle: "🔬 फसल की जाँच हो रही है...",
    scanningSubtitle: "AI बीमारी, कीट और पोषण की कमी देख रही है।\nधीमे नेटवर्क पर 5–10 सेकंड लग सकते हैं।",
    youSentPhoto: "📷 फसल की फोटो भेजी",
  },
  ta: { 
    header: "🤖 பார்ம் சூத்திரா AI", placeholder: "கேள்வி கேட்க...", 
    offline: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள். இணைந்த பிறகு கேள்வி கேளுங்கள்.", thinking: "பார்ம் சூத்திரா யோசிக்கிறது...", 
    welcome: "வணக்கம்! நான் பார்ம் சூத்திரா AI.", listening: "கேட்கிறேன்...",
    scanTipTitle: "📸 சிறந்த நோய் கண்டறிதலுக்கான டிப்ஸ்",
    scanTip1: "• பாதிக்கப்பட்ட இலைக்கு அருகில் செல்லுங்கள்",
    scanTip2: "• நல்ல வெளிச்சத்தில் எடுக்கவும்",
    scanTip3: "• தெளிவான புகைப்படம் எடுக்கவும்",
    scanTip4: "• ஆரோக்கியமான மற்றும் பாதிக்கப்பட்ட பகுதிகளை காட்டுங்கள்",
    btnCamera: "📷 கேமரா திற",
    btnGallery: "🖼️ கேலரியிலிருந்து தேர்ந்தெடு",
    btnCancel: "ரத்து செய்",
    scanningTitle: "🔬 பயிர் பரிசோதிக்கப்படுகிறது...",
    scanningSubtitle: "AI நோய், பூச்சி மற்றும் ஊட்டச்சத்து குறைபாடுகளை சரிபார்க்கிறது.",
    youSentPhoto: "📷 பயிர் புகைப்படம் அனுப்பப்பட்டது",
  },
  pa: { 
    header: "🤖 ਫਾਰਮ ਸੂਤਰ AI", placeholder: "ਫਾਰਮ ਸੂਤਰ ਤੋਂ ਪੁੱਛੋ...", 
    offline: "ਤੁਸੀਂ ਔਫਲਾਈਨ ਹੋ। ਕਨੈਕਟ ਹੋਣ ਤੋਂ ਬਾਅਦ ਸਵਾਲ ਪੁੱਛੋ।", thinking: "ਫਾਰਮ ਸੂਤਰ ਸੋਚ ਰਿਹਾ ਹੈ...", 
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਫਾਰਮ ਸੂਤਰ AI ਹਾਂ।", listening: "ਸੁਣ ਰਿਹਾ ਹਾਂ...",
    scanTipTitle: "📸 ਵਧੀਆ ਤਸਵੀਰ ਲਈ ਸੁਝਾਅ",
    scanTip1: "• ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਦੇ ਨੇੜੇ ਜਾਓ",
    scanTip2: "• ਚੰਗੀ ਰੋਸ਼ਨੀ ਵਿੱਚ ਫੋਟੋ ਲਓ",
    scanTip3: "• ਫ਼ੋਨ ਸਥਿਰ ਰੱਖੋ",
    scanTip4: "• ਤੰਦਰੁਸਤ ਅਤੇ ਬਿਮਾਰ ਦੋਵੇਂ ਹਿੱਸੇ ਦਿਖਾਓ",
    btnCamera: "📷 ਕੈਮਰਾ ਖੋਲ੍ਹੋ",
    btnGallery: "🖼️ ਗੈਲਰੀ ਤੋਂ ਚੁਣੋ",
    btnCancel: "ਰੱਦ ਕਰੋ",
    scanningTitle: "🔬 ਫਸਲ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...",
    scanningSubtitle: "AI ਬਿਮਾਰੀ, ਕੀੜੇ ਅਤੇ ਪੋਸ਼ਣ ਦੀ ਕਮੀ ਦੇਖ ਰਹੀ ਹੈ।\nਹੌਲੀ ਨੈੱਟਵਰਕ 'ਤੇ 5–10 ਸਕਿੰਟ ਲੱਗ ਸਕਦੇ ਹਨ।",
    youSentPhoto: "📷 ਫਸਲ ਦੀ ਫੋਟੋ ਭੇਜੀ",
  },
  hr: { 
    header: "🤖 फार्म सूत्र AI", placeholder: "फार्म सूत्र तै पूछो...", 
    offline: "नेटवर्क कोन्या। जुड़ण के बाद सवाल पूछो।", thinking: "फार्म सूत्र सोच रहा सै...", 
    welcome: "राम राम! मैं फार्म सूत्र AI सूँ।", listening: "सुणु सूँ...",
    scanTipTitle: "📸 बढ़िया फोटो खातिर टिप्स",
    scanTip1: "• बीमार पत्ती या हिस्से के करीब जाओ",
    scanTip2: "• अच्छी रोशनी में फोटो लो",
    scanTip3: "• फोन हिलाओ मत — साफ आवै",
    scanTip4: "• ठीक और बीमार दोनों हिस्से दिखाओ",
    btnCamera: "📷 कैमरा खोलो",
    btnGallery: "🖼️ गैलरी तै चुनो",
    btnCancel: "रद्द करो",
    scanningTitle: "🔬 फसल की जाँच हो रही सै...",
    scanningSubtitle: "AI बीमारी, कीड़े अर खाद की कमी देख रही सै।\nधीमे नेटवर्क पै 5–10 सेकंड लाग सकें।",
    youSentPhoto: "📷 फसल की फोटो भेजी",
  }
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

// 🌍 Fully translated crop scan prompts — every label in the farmer's own language
const cropScanPrompt: any = {
  en: (instruction: string) => `You are an expert agricultural scientist and plant pathologist with 20+ years of experience diagnosing crop diseases, pest infestations, and plant health issues across Indian farming conditions.

Carefully examine this plant/crop image. Even if the plant appears partially healthy, look for ANY signs of disease, pest damage, nutrient deficiency, water stress, or physical damage.

IMPORTANT: If you see BOTH healthy and damaged parts, describe BOTH. Never ignore damaged parts.

Structure your response EXACTLY like this:

🌿 PLANT IDENTIFIED: [Name the plant/crop]
🔍 HEALTH STATUS: [Healthy / Partially Damaged / Severely Damaged / Critical]
🦠 PROBLEMS DETECTED: [Every problem, small or large. If 100% healthy, say so with reasons.]
💊 TREATMENT PLAN: [Step-by-step. Name actual pesticides/fertilizers available in India with dosage.]
⏰ URGENCY: [Immediate action needed / Monitor 3-5 days / No action needed]
🌾 PREVENTION TIP: [One practical tip for future]
🎯 CONFIDENCE: [High — clear image / Medium — some uncertainty, re-scan in better light / Low — blurry/dark, retake photo closer]

Be honest. Farmers depend on this to save their crops. ${instruction}`,

  hi: (instruction: string) => `आप एक विशेषज्ञ कृषि वैज्ञानिक और पादप रोग विशेषज्ञ हैं जिन्हें भारतीय खेती में फसल रोगों, कीट संक्रमण और पौधों की समस्याओं का 20+ वर्षों का अनुभव है।

इस पौधे/फसल की तस्वीर को ध्यान से देखें। भले ही पौधा आंशिक रूप से स्वस्थ लगे, निम्नलिखित संकेत जरूर देखें: रोग (फंगल/बैक्टीरियल/वायरल), कीट नुकसान, पोषण की कमी, पानी का तनाव, या शारीरिक क्षति।

महत्वपूर्ण: अगर एक ही तस्वीर में स्वस्थ और क्षतिग्रस्त दोनों हिस्से दिखें, तो दोनों का वर्णन करें। क्षतिग्रस्त हिस्सों को नज़रअंदाज़ न करें।

अपना जवाब बिल्कुल इस तरह लिखें:

🌿 पौधे की पहचान: [पौधे/फसल का नाम]
🔍 स्वास्थ्य स्थिति: [स्वस्थ / आंशिक रूप से क्षतिग्रस्त / गंभीर रूप से क्षतिग्रस्त / संकटपूर्ण]
🦠 समस्याएं पाई गईं: [हर छोटी-बड़ी समस्या। अगर सच में 100% स्वस्थ है तो कारण सहित बताएं।]
💊 उपचार योजना: [चरण-दर-चरण इलाज। भारत में उपलब्ध कीटनाशकों/खादों के नाम और मात्रा।]
⏰ तात्कालिकता: [तुरंत कार्रवाई जरूरी / 3-5 दिन निगरानी करें / कोई कार्रवाई जरूरी नहीं]
🌾 बचाव का तरीका: [भविष्य में इससे बचने का एक व्यावहारिक सुझाव]
🎯 विश्वसनीयता: [उच्च — साफ तस्वीर, पक्का निदान / मध्यम — कुछ अनिश्चितता, बेहतर रोशनी में दोबारा स्कैन करें / कम — धुंधली/अंधेरे की फोटो, पौधे के करीब से दोबारा लें]

ईमानदार और विस्तृत रहें। किसान इस पर अपनी फसल बचाने के लिए निर्भर हैं। ${instruction}`,

  ta: (instruction: string) => `நீங்கள் ஒரு நிபுணத்துவ வேளாண் விஞ்ஞானி மற்றும் தாவர நோய் நிபுணர். இந்திய விவசாயத்தில் பயிர் நோய்கள், பூச்சி தாக்குதல்கள் மற்றும் தாவர சிக்கல்களை கண்டறிவதில் 20+ ஆண்டுகள் அனுபவம் உள்ளது.

இந்த தாவரம்/பயிர் படத்தை கவனமாக பரிசோதியுங்கள். தாவரம் பகுதியளவு ஆரோக்கியமாக தோன்றினாலும், நோய், பூச்சி சேதம், ஊட்டச்சத்து குறைபாடு, நீர் அழுத்தம் அல்லது சேதத்தை கவனமாக சரிபாருங்கள்.

முக்கியம்: ஆரோக்கியமான மற்றும் சேதமடைந்த இரு பாகங்களும் தெரிந்தால், இரண்டையும் விவரிக்கவும். சேதமடைந்த பாகங்களை புறக்கணிக்காதீர்கள்.

உங்கள் பதிலை இப்படியே அமையுங்கள்:

🌿 தாவரம் கண்டறியப்பட்டது: [தாவரம்/பயிரின் பெயர்]
🔍 ஆரோக்கிய நிலை: [ஆரோக்கியமானது / பகுதியளவு சேதம் / கடுமையான சேதம் / ஆபத்தான நிலை]
🦠 கண்டறியப்பட்ட சிக்கல்கள்: [சிறியதோ பெரியதோ ஒவ்வொரு சிக்கலும். முழுமையாக ஆரோக்கியமாக இருந்தால் காரணங்களுடன் கூறவும்.]
💊 சிகிச்சை திட்டம்: [படிப்படியான சிகிச்சை. இந்தியாவில் கிடைக்கும் பூச்சிக்கொல்லிகள்/உரங்கள் பெயர் மற்றும் அளவு.]
⏰ அவசரநிலை: [உடனடி நடவடிக்கை தேவை / 3-5 நாட்கள் கண்காணிக்கவும் / நடவடிக்கை தேவையில்லை]
🌾 தடுப்பு வழிமுறை: [இனி தடுக்க ஒரு நடைமுறை ஆலோசனை]
🎯 நம்பகத்தன்மை: [அதிகம் — தெளிவான படம் / நடுத்தரம் — சிறந்த வெளிச்சத்தில் மீண்டும் ஸ்கேன் செய்யுங்கள் / குறைவு — மோசமான வெளிச்சம், அருகில் மீண்டும் புகைப்படம் எடுக்கவும்]

நேர்மையாகவும் முழுமையாகவும் இருங்கள். விவசாயிகள் பயிரை காக்க இதை நம்புகிறார்கள். ${instruction}`,

  pa: (instruction: string) => `ਤੁਸੀਂ ਇੱਕ ਮਾਹਿਰ ਖੇਤੀਬਾੜੀ ਵਿਗਿਆਨੀ ਅਤੇ ਪੌਦਾ ਰੋਗ ਮਾਹਿਰ ਹੋ। ਭਾਰਤੀ ਖੇਤੀਬਾੜੀ ਵਿੱਚ ਫਸਲ ਰੋਗਾਂ, ਕੀੜੇ ਮਾਰ ਅਤੇ ਪੌਦਿਆਂ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਦੀ ਜਾਂਚ ਕਰਨ ਦਾ 20+ ਸਾਲਾਂ ਦਾ ਤਜਰਬਾ ਹੈ।

ਇਸ ਪੌਦੇ/ਫਸਲ ਦੀ ਤਸਵੀਰ ਧਿਆਨ ਨਾਲ ਦੇਖੋ। ਭਾਵੇਂ ਪੌਦਾ ਥੋੜਾ ਤੰਦਰੁਸਤ ਲੱਗੇ, ਬਿਮਾਰੀ, ਕੀੜੇ ਦਾ ਨੁਕਸਾਨ, ਪੋਸ਼ਣ ਦੀ ਕਮੀ, ਪਾਣੀ ਦਾ ਤਣਾਅ ਜਾਂ ਸਰੀਰਕ ਨੁਕਸਾਨ ਜ਼ਰੂਰ ਦੇਖੋ।

ਮਹੱਤਵਪੂਰਨ: ਜੇ ਤੰਦਰੁਸਤ ਅਤੇ ਖਰਾਬ ਦੋਵੇਂ ਹਿੱਸੇ ਦਿਖਣ, ਦੋਵਾਂ ਦਾ ਵਰਣਨ ਕਰੋ। ਖਰਾਬ ਹਿੱਸਿਆਂ ਨੂੰ ਨਜ਼ਰਅੰਦਾਜ਼ ਨਾ ਕਰੋ।

ਆਪਣਾ ਜਵਾਬ ਬਿਲਕੁਲ ਇਸ ਤਰ੍ਹਾਂ ਲਿਖੋ:

🌿 ਪੌਦੇ ਦੀ ਪਛਾਣ: [ਪੌਦੇ/ਫਸਲ ਦਾ ਨਾਮ]
🔍 ਸਿਹਤ ਸਥਿਤੀ: [ਤੰਦਰੁਸਤ / ਅੰਸ਼ਕ ਨੁਕਸਾਨ / ਗੰਭੀਰ ਨੁਕਸਾਨ / ਖ਼ਤਰਨਾਕ]
🦠 ਸਮੱਸਿਆਵਾਂ ਲੱਭੀਆਂ: [ਹਰ ਛੋਟੀ-ਵੱਡੀ ਸਮੱਸਿਆ। ਨੁਕਸਾਨੇ ਹਿੱਸਿਆਂ ਦਾ ਖਾਸ ਵਰਣਨ ਕਰੋ।]
💊 ਇਲਾਜ ਯੋਜਨਾ: [ਕਦਮ-ਦਰ-ਕਦਮ ਇਲਾਜ। ਭਾਰਤ ਵਿੱਚ ਮਿਲਣ ਵਾਲੇ ਕੀਟਨਾਸ਼ਕਾਂ/ਖਾਦਾਂ ਦੇ ਨਾਮ ਅਤੇ ਮਾਤਰਾ।]
⏰ ਜ਼ਰੂਰਤ: [ਤੁਰੰਤ ਕਾਰਵਾਈ ਜ਼ਰੂਰੀ / 3-5 ਦਿਨ ਨਿਗਰਾਨੀ ਕਰੋ / ਕੋਈ ਕਾਰਵਾਈ ਜ਼ਰੂਰੀ ਨਹੀਂ]
🌾 ਬਚਾਅ ਦਾ ਤਰੀਕਾ: [ਭਵਿੱਖ ਵਿੱਚ ਬਚਣ ਦਾ ਇੱਕ ਵਿਹਾਰਕ ਸੁਝਾਅ]
🎯 ਭਰੋਸੇਯੋਗਤਾ: [ਉੱਚ — ਸਾਫ਼ ਤਸਵੀਰ / ਮੱਧਮ — ਬਿਹਤਰ ਰੋਸ਼ਨੀ ਵਿੱਚ ਮੁੜ ਸਕੈਨ ਕਰੋ / ਘੱਟ — ਧੁੰਦਲੀ ਤਸਵੀਰ, ਨੇੜੇ ਜਾ ਕੇ ਦੁਬਾਰਾ ਲਓ]

ਇਮਾਨਦਾਰ ਅਤੇ ਵਿਸਤ੍ਰਿਤ ਰਹੋ। ਕਿਸਾਨ ਆਪਣੀ ਫਸਲ ਬਚਾਉਣ ਲਈ ਇਸ ਨਿਦਾਨ 'ਤੇ ਨਿਰਭਰ ਕਰਦੇ ਹਨ। ${instruction}`,

  hr: (instruction: string) => `थाणे एक माहिर खेती-बाड़ी वैज्ञानिक अर पौधे की बीमारी के जाणकार हो। भारत के खेतां में फसल की बीमारियां, कीड़े-मकोड़े अर पौधे की तकलीफां पकड़ण का 20 साल तै ज्यादा का तजरबा सै।

इस पौधे/फसल की फोटो नें ध्यान तै देखो। भले ई पौधा थोड़ा ठीक लागै, बीमारी, कीड़े का नुकसान, खाद की कमी, पाणी की तकलीफ या टूटे-फूटे हिस्से जरूर देखो।

जरूरी बात: ठीक अर खराब दोनों हिस्से दिखें तो दोनों का बखान करो। खराब हिस्सां नें नजरअंदाज मत करो।

आपणा जवाब बिल्कुल इस तरियां लिखो:

🌿 पौधे की पहचान: [पौधे/फसल का नाम]
🔍 सेहत की हालत: [ठीक-ठाक / थोड़ा खराब / बहुत खराब / खतरे में]
🦠 मिली समस्यावां: [जो भी तकलीफ दिखै, छोटी या बड़ी। खराब हिस्सां का खास बखान करो।]
💊 इलाज का तरीका: [कदम-दर-कदम इलाज। भारत में मिलण आले कीटनाशक/खाद का नाम अर मात्रा।]
⏰ कितनी जल्दी: [फौरन काम करो / 3-5 दिन देखते रहो / कुछ करण की जरूरत कोन्या]
🌾 बचाव का नुस्खा: [आगे तै बचण खातिर एक काम का सुझाव]
🎯 कितना पक्का: [पक्का — साफ फोटो / थोड़ा शक — रोशनी में दोबारा स्कैन करो / कम पक्का — धुंधली फोटो, करीब जा कै दोबारा लो]

सच्चा अर पूरा जवाब देओ। किसान आपणी फसल बचाण खातिर इस जाँच पै भरोसा करें सैं। ${instruction}`,
};

interface Message {
  id: number;
  text?: string;
  imageUri?: string;
  sender: string;
  type?: 'text' | 'image' | 'scan_result';
}

export default function ChatBot() {
  const { lang } = useContext(LanguageContext);
  const t = chatDict[lang] || chatDict['en'];
  const instruction = aiPromptInstruction[lang] || aiPromptInstruction['en'];

  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: t.welcome, sender: 'bot', type: 'text' }]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Scan UI states
  const [showTipModal, setShowTipModal] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;

  // Animated bouncing dots for scan overlay
  useEffect(() => {
    if (isScanLoading) {
      const animateDot = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        ).start();
      animateDot(dotAnim1, 0);
      animateDot(dotAnim2, 200);
      animateDot(dotAnim3, 400);
    } else {
      dotAnim1.setValue(0);
      dotAnim2.setValue(0);
      dotAnim3.setValue(0);
    }
  }, [isScanLoading]);

  // Load chat history from AsyncStorage
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedChat = await AsyncStorage.getItem('chat_history');
        if (savedChat !== null) {
          setMessages(JSON.parse(savedChat));
        } else {
          setMessages([{ id: 1, text: t.welcome, sender: 'bot', type: 'text' }]);
        }
      } catch (e) { console.log("Load Error", e); }
    };
    loadChatHistory();
  }, [lang]);

  // Save chat history to AsyncStorage on every update
  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        // Strip imageUri before saving — keeps AsyncStorage lean for 2G devices
        const toSave = messages.map(m => ({ ...m, imageUri: undefined }));
        await AsyncStorage.setItem('chat_history', JSON.stringify(toSave));
      } catch (e) { console.log("Save Error", e); }
    };
    saveChatHistory();
  }, [messages]);

  // Simple NetInfo listener — just track online/offline state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  const startListening = () => {
    if (isListening) return;
    setIsListening(true);
    setInputText(t.listening);
    setTimeout(() => {
      setIsListening(false);
      setInputText(mockVoiceDict[lang] || mockVoiceDict['en']);
    }, 2000);
  };

  // Tapping camera opens tip modal first
  const pickImage = () => {
    setShowTipModal(true);
  };

  // Called when user taps Camera or Gallery inside tip modal
  const handleImageSource = async (source: 'camera' | 'gallery') => {
    setShowTipModal(false);

    if (isOffline) {
      setMessages(prev => [...prev, { id: Date.now(), text: t.offline, sender: 'bot', type: 'text' }]);
      return;
    }

    try {
      let result;

      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { Alert.alert("Permission Required", "Camera access needed!"); return; }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true, aspect: [4, 3],
          quality: 0.5,
          base64: true,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { Alert.alert("Permission Required", "Gallery access needed!"); return; }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true, aspect: [4, 3],
          quality: 0.5,
          base64: true,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
      }

      if (!result.canceled && result.assets) {
        const asset = result.assets[0];
        if (!asset.base64) return;
        processScan(asset.base64, asset.uri);
      }
    } catch (error) { console.log(error); }
  };

  // Show photo thumbnail and fullscreen overlay during scan
  const processScan = async (img: string, localUri?: string) => {
    if (localUri) {
      setMessages(prev => [...prev, {
        id: Date.now(), imageUri: localUri,
        text: t.youSentPhoto, sender: 'user', type: 'image',
      }]);
    }

    setIsScanLoading(true);

    try {
      // 🌍 Fully translated prompt — every word in the farmer's chosen language
      const promptText = (cropScanPrompt[lang] || cropScanPrompt['en'])(instruction);

      const op = post({ apiName: 'farmsutraApi', path: '/chat', options: { body: { prompt: promptText, image: img } } });
      const { body } = await op.response;
      const res = await body.json() as { reply: string };
      setMessages(prev => [...prev, { id: Date.now(), text: res.reply, sender: 'bot', type: 'scan_result' }]);

      // 🔥 SCORE UPDATE + POPUP 🔥
      await addActivityPoints(ACTIVITIES.CROP_SCAN, lang);

    } catch (e) {
      console.log(e);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "⚠️ Could not connect to AI. Please check your network and try again.",
        sender: 'bot', type: 'text',
      }]);
    } finally {
      setIsScanLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || inputText === t.listening) return;
    const userQuery = inputText;
    setMessages(prev => [...prev, { id: Date.now(), text: userQuery, sender: 'user', type: 'text' }]);
    setInputText('');

    if (isOffline) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: t.offline, sender: 'bot', type: 'text' }]);
      return;
    }

    setIsLoading(true);
    try {
      const hiddenPrompt = `${userQuery}. ${instruction}`;
      const op = post({ apiName: 'farmsutraApi', path: '/chat', options: { body: { prompt: hiddenPrompt } } });
      const { body } = await op.response;
      const res = await body.json() as { reply: string };
      setMessages(prev => [...prev, { id: Date.now() + 1, text: res.reply, sender: 'bot', type: 'text' }]);

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
              {msg.type === 'image' && msg.imageUri ? (
                <View>
                  <Image source={{ uri: msg.imageUri }} style={styles.thumbnailImg} resizeMode="cover" />
                  <Text style={styles.imgCaption}>{msg.text}</Text>
                </View>
              ) : msg.sender === 'user' ? (
                <Text style={styles.userText}>{msg.text}</Text>
              ) : (
                <Markdown style={markdownStyles}>{msg.text || ''}</Markdown>
              )}
            </View>
          ))}
          {isLoading && (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color="#2E7D32" />
              <Text style={styles.loaderText}>{t.thinking}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.camBtn} onPress={pickImage}>
            <Ionicons name="camera" size={26} color="#2E7D32" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.micBtn} onPress={startListening}>
            <Ionicons name={isListening ? "mic" : "mic-outline"} size={26} color={isListening ? "#FF5252" : "#2E7D32"} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, isListening && styles.listeningInput]}
            placeholderTextColor="#888" placeholder={t.placeholder}
            value={inputText} onChangeText={setInputText}
            onSubmitEditing={sendMessage} editable={!isListening}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={isLoading || isListening}>
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* TIP MODAL — photo tips + Camera vs Gallery choice */}
      <Modal visible={showTipModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.tipSheet}>
            <View style={styles.tipHandle} />
            <Text style={styles.tipTitle}>{t.scanTipTitle}</Text>
            <View style={styles.tipBox}>
              <Text style={styles.tipItem}>{t.scanTip1}</Text>
              <Text style={styles.tipItem}>{t.scanTip2}</Text>
              <Text style={styles.tipItem}>{t.scanTip3}</Text>
              <Text style={styles.tipItem}>{t.scanTip4}</Text>
            </View>
            <TouchableOpacity style={styles.camOptionBtn} onPress={() => handleImageSource('camera')}>
              <Text style={styles.camOptionTxt}>{t.btnCamera}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryOptionBtn} onPress={() => handleImageSource('gallery')}>
              <Text style={styles.galleryOptionTxt}>{t.btnGallery}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowTipModal(false)}>
              <Text style={styles.cancelTxt}>{t.btnCancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* FULLSCREEN SCANNING OVERLAY — shows during Bedrock processing */}
      <Modal visible={isScanLoading} transparent animationType="fade">
        <View style={styles.scanOverlay}>
          <View style={styles.scanCard}>
            <Ionicons name="leaf" size={50} color="#4CAF50" style={{ marginBottom: 20 }} />
            <Text style={styles.scanTitle}>{t.scanningTitle}</Text>
            <View style={styles.dotsRow}>
              {[dotAnim1, dotAnim2, dotAnim3].map((anim, i) => (
                <Animated.View key={i} style={[styles.dot, {
                  opacity: anim,
                  transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }]
                }]} />
              ))}
            </View>
            <Text style={styles.scanSubtitle}>{t.scanningSubtitle}</Text>
          </View>
        </View>
      </Modal>

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
  thumbnailImg: { width: 200, height: 150, borderRadius: 10, marginBottom: 5 },
  imgCaption: { color: '#FFF', fontSize: 12, fontStyle: 'italic' },
  loader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  loaderText: { marginLeft: 10, color: '#666', fontStyle: 'italic' },
  inputArea: { flexDirection: 'row', padding: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  camBtn: { marginRight: 8 },
  micBtn: { marginRight: 10 },
  input: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 25, paddingHorizontal: 15, height: 45, color: '#333' },
  listeningInput: { color: '#FF5252', fontStyle: 'italic', fontWeight: 'bold' },
  sendBtn: { backgroundColor: '#2E7D32', width: 45, height: 45, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  // Tip modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  tipSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: 40 },
  tipHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  tipTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3F20', marginBottom: 14, textAlign: 'center' },
  tipBox: { backgroundColor: '#F1F8E9', borderRadius: 12, padding: 14, marginBottom: 20 },
  tipItem: { fontSize: 14, color: '#2E7D32', marginBottom: 7, fontWeight: '500' },
  camOptionBtn: { backgroundColor: '#1E3F20', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  camOptionTxt: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  galleryOptionBtn: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderWidth: 2, borderColor: '#1E3F20' },
  galleryOptionTxt: { color: '#1E3F20', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelTxt: { color: '#999', fontSize: 15 },
  // Scan overlay
  scanOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  scanCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, alignItems: 'center', width: '100%' },
  scanTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E3F20', textAlign: 'center', marginBottom: 16 },
  dotsRow: { flexDirection: 'row', marginBottom: 18 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#4CAF50', marginHorizontal: 5 },
  scanSubtitle: { fontSize: 13, color: '#666', textAlign: 'center', lineHeight: 20 },
});

const markdownStyles = { body: { color: '#333' } };