import { createApp } from 'vue'
import './style.css'
import './tailwind.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'

import '@/assets/themes/lara-light-green/theme.css'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice';

const app = createApp(App)

app.use(PrimeVue, { unstyled: false })
app.use(ToastService);

app.mount('#app')
