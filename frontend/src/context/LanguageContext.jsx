import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    brand: "BeginUPSC",
    tagline: "Free UPSC Preparation Platform",
    startLearning: "Start Learning",
    checkEligibility: "Check Eligibility",
    heroTitle: "Start Your UPSC Journey for Free",
    heroSubtitle: "Everything you need to become a Civil Servant – Roadmaps, Resources, Strategy, PYQs, Guidance, Motivation and Practice.",
    pledgeTitle: "BeginUPSC Pledge",
    pledgeText: "Take a moment to remember your faith, values, family, and purpose. Trust in yourself, stay honest, remain disciplined, and prepare consistently. Success comes through dedication and perseverance.",
    pledge1: "I will study consistently",
    pledge2: "I will stay disciplined",
    pledge3: "I will avoid shortcuts",
    pledge4: "I will believe in myself",
    pledgeAccept: "I Accept My UPSC Journey",
    home: "Home",
    dashboard: "Dashboard",
    guide: "Beginner Guide",
    eligibility: "Eligibility Checker",
    roadmaps: "Study Roadmaps",
    subjects: "Subjects",
    pyqs: "PYQs",
    mockTests: "Mock Tests",
    currentAffairs: "Current Affairs",
    resources: "Free Resources",
    motivation: "Motivation Center",
    community: "Community Forum",
    aiAssistant: "AI Assistant",
    admin: "Admin Control",
    logout: "Logout",
    login: "Login",
    register: "Register"
  },
  hi: {
    brand: "BeginUPSC",
    tagline: "मुफ़्त यूपीएससी तैयारी प्लेटफॉर्म",
    startLearning: "तैयारी शुरू करें",
    checkEligibility: "पात्रता जांचें",
    heroTitle: "अपनी यूपीएससी यात्रा मुफ़्त में शुरू करें",
    heroSubtitle: "सिविल सेवक बनने के लिए आवश्यक सब कुछ – रोडमैप, संसाधन, रणनीति, पिछले वर्ष के प्रश्न (PYQs), मार्गदर्शन, प्रेरणा और अभ्यास।",
    pledgeTitle: "BeginUPSC प्रतिज्ञा",
    pledgeText: "अपनी आस्था, मूल्यों, परिवार और उद्देश्य को याद करने के लिए एक क्षण लें। खुद पर विश्वास रखें, ईमानदार रहें, अनुशासित रहें और निरंतर तैयारी करें। सफलता समर्पण और दृढ़ता से मिलती है।",
    pledge1: "मैं निरंतर अध्ययन करूँगा/करूँगी",
    pledge2: "मैं अनुशासित रहूँगा/रहूँगी",
    pledge3: "मैं शॉर्टकट से बचूँगा/बचूँगी",
    pledge4: "मैं खुद पर विश्वास रखूँगा/रखूँगी",
    pledgeAccept: "मैं अपनी यूपीएससी यात्रा स्वीकार करता/करती हूँ",
    home: "मुख्य पृष्ठ",
    dashboard: "डैशबोर्ड",
    guide: "शुरुआती मार्गदर्शिका",
    eligibility: "पात्रता जाँच",
    roadmaps: "अध्ययन रोडमैप",
    subjects: "विषय",
    pyqs: "पिछले वर्ष के पेपर",
    mockTests: "मॉक टेस्ट",
    currentAffairs: "सामयिकी (Current Affairs)",
    resources: "मुफ़्त संसाधन",
    motivation: "प्रेरणा केंद्र",
    community: "चर्चा मंच",
    aiAssistant: "एआई सहायक",
    admin: "एडमिन पैनल",
    logout: "लॉगआउट",
    login: "लॉगिन",
    register: "पंजीकरण"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
