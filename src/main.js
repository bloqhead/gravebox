import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './styles/theme.css'
import './styles/pixel-borders.css'
import './styles/animations.css'

createApp(App).use(createPinia()).mount('#app')
