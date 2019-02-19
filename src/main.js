import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import FirebaseAuthPlugin from './FirebaseAuthPlugin'

Vue.use(FirebaseAuthPlugin)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
