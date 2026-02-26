import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
// @ts-expect-error: element-plus locale missing types
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import '@fortawesome/fontawesome-free/css/all.css';

import App from './App.vue';
import router from './router';
import './styles/index.css';
// @ts-expect-error: vue-virtual-scroller missing types
import VueVirtualScroller from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

import { useThemeStore } from './stores/theme';
import { printWelcomeLog } from './utils/welcomeLog';
import i18n from './i18n';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App);

app.use(VueVirtualScroller);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(ElementPlus, {
  locale: zhCn
});

app.mount('#app');

// Initialize theme — theme store 内部已自动调用 updateTheme()
// 此处仅触发 store 实例化
useThemeStore();

// Print welcome log
printWelcomeLog();
