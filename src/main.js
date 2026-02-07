import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@fortawesome/fontawesome-free/css/all.css'

import App from './App.vue'
import router from './router'
import './styles/index.css'

const app = createApp(App)


for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
    locale: zhCn,
})

app.mount('#app')


import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
themeStore.updateTheme()


import { printWelcomeLog } from './utils/welcomeLog'
printWelcomeLog()
