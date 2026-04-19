import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "devices": "Devices",
      "alerts": "Alerts",
      "settings": "Settings",
      "welcome": "Welcome back",
      "total_devices": "Total Devices",
      "healthy": "Healthy",
      "warning": "Warning",
      "critical": "Critical"
    }
  },
  ta: {
    translation: {
      "dashboard": "கட்டுப்பாட்டு அறை",
      "devices": "சாதனங்கள்",
      "alerts": "எச்சரிக்கைகள்",
      "settings": "அமைப்புகள்",
      "welcome": "மீண்டும் வருக",
      "total_devices": "மொத்த சாதனங்கள்",
      "healthy": "ஆரோக்கியமான",
      "warning": "எச்சரிக்கை",
      "critical": "ஆபத்தான"
    }
  },
  hi: {
    translation: {
      "dashboard": "डैशबोर्ड",
      "devices": "उपकरण",
      "alerts": "अलर्ट",
      "settings": "सेटिंग्स",
      "welcome": "वापसी पर स्वागत है",
      "total_devices": "कुल उपकरण",
      "healthy": "स्वस्थ",
      "warning": "चेतावनी",
      "critical": "गंभीर"
    }
  },
  fr: {
    translation: {
      "dashboard": "Tableau de bord",
      "devices": "Appareils",
      "alerts": "Alertes",
      "settings": "Paramètres",
      "welcome": "Bon retour",
      "total_devices": "Appareils totaux",
      "healthy": "En bonne santé",
      "warning": "Avertissement",
      "critical": "Critique"
    }
  },
  de: {
    translation: {
      "dashboard": "Armaturenbrett",
      "devices": "Geräte",
      "alerts": "Warnungen",
      "settings": "Einstellungen",
      "welcome": "Willkommen zurück",
      "total_devices": "Gesamte Geräte",
      "healthy": "Gesund",
      "warning": "Warnung",
      "critical": "Kritisch"
    }
  },
  ar: {
    translation: {
      "dashboard": "لوحة القيادة",
      "devices": "الأجهزة",
      "alerts": "تنبيهات",
      "settings": "إعدادات",
      "welcome": "مرحباً بعودتك",
      "total_devices": "إجمالي الأجهزة",
      "healthy": "صحي",
      "warning": "تحذير",
      "critical": "حرج"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
