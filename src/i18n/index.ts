import { createI18n } from 'vue-i18n';
import zhCN from '../locales/zh-CN.json';
import en from '../locales/en.json';

const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: localStorage.getItem('locale') || 'zh-CN', // Default locale
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    en
  }
});

export default i18n;
