import { createApp } from 'vue'
import './assets/css/main.css'
import '@varlet/ui/es/style'
import './assets/css/variables.scss'
import App from './App.vue'
import Router from './router'
import { createPinia } from 'pinia'
import 'virtual-icons'
import '@varlet/touch-emulator'




createApp(App).use(createPinia()).use(Router).mount('#app')

