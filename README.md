# 🌾 Farm Sutra 
**Empowering "Bharat" with Cloud AI and Financial Inclusion**

Farm Sutra is India’s first offline-optimized, modular super-app ecosystem designed specifically for the 100M+ smallholder farmers in remote areas. Built for the **AWS AI for Bharat Hackathon**, Farm Sutra bridges the digital divide by unifying agronomy, finance, and commerce into a single, lightweight platform (under 50MB) optimized for 2G networks and low-end Android devices.

---

## 🎥 App Demos
* **Primary Pitch & Demo (Hindi UI for "Bharat" focus):** [Watch on YouTube](https://youtu.be/diwF98dJrFA)
* **English UI Demo:** [Watch on YouTube](https://youtu.be/JZJCW6QZfU8)

---

## 🚀 The Problem

1. **Connectivity Gaps:** Farmers in remote villages operate on unstable 2G/EDGE networks, making traditional cloud-heavy apps completely unusable in the field.
2. **Financial Exclusion:** A lack of formal agronomic data prevents farmers from building verifiable credit profiles, pushing them towards high-interest, predatory informal loans.
3. **Digital Literacy:** Complex, English-first interfaces act as a massive barrier for low-literacy users in rural India.

---

## 💡 Our Solution & Core Innovations

Farm Sutra solves these systemic challenges through three fundamental innovations:

* **Hybrid-Cloud AI Diagnosis:** Instead of relying on heavy on-device models, we use a robust **'Store-and-Forward'** sync mechanism. Farmers can log crop issues offline, and the app auto-syncs to **Amazon Bedrock (Claude 3 Sonnet)** when a network is found, delivering high-accuracy, science-backed treatment plans.
* **The "Data Flywheel" (Kisaan Credit Score):** We convert daily agronomic health into financial trust. Every time a farmer logs crop data or harvest details, it feeds a proprietary scoring engine. This validated data acts as a digital footprint, unlocking access to collateral-free institutional loans and insurance.
* **Voice-First Vernacular Design:** A fully localized, intuitive interface supporting multiple regional languages to ensure cutting-edge technology is accessible to the most remote users.

---

## 🌟 Key Features

* **Multilingual Onboarding:** A seamless, localized language selection grid right from the welcome screen supporting **Hindi, Tamil, Punjabi, Haryanvi, and English**.
* **Farm Sutra Chatbot:** A voice-first natural language assistant powered by Amazon Bedrock, allowing farmers to ask complex agronomy questions in their native language and receive instant, conversational advice.
* **Frictionless Guest Login:** Powered by localized session management, users can experience the app immediately without forcing account creation, ensuring a smooth first-touch experience.
* **Field-Ready UI/UX:** A high-contrast dark green theme (`#122614`) designed specifically for maximum outdoor visibility and harsh sunlight.

---

## 🛠️ Technical Architecture

Our backend is completely Serverless, ensuring zero idle costs, high availability, and infinite scalability.

* **Frontend (Mobile & Edge):** React Native & Expo (Ensuring a premium native feel with a sub-50MB footprint).
* **Serverless API Layer:** * **Amazon API Gateway:** Secure, scalable entry point for all mobile requests.
  * **AWS Lambda:** Event-driven compute that processes data instantly.
* **Intelligence Layer:** **Amazon Bedrock** provides the foundational generative AI models for deep agronomic analysis and the conversational Farm Sutra Chatbot.
* **Data & Storage:** * **Amazon DynamoDB:** A high-speed NoSQL database acting as a fast buffer for offline data synchronization.
  * **Amazon Aurora:** Relational database for structured, ACID-compliant financial and user data storage.

---

## 👥 Team
**Team Name:** Farm Sutra  
**Team Leader:** Prakshal Jain  
**Track:** AI for Communities, Access & Public Impact
