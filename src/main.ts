import { createApp } from 'vue'
import './assets/css/main.css'
import './assets/css/variables.scss'
import App from './App.vue'
import Router from './router'
import { createPinia } from 'pinia'



createApp(App).use(createPinia()).use(Router).mount('#app')

