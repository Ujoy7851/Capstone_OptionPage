import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import FirebaseAuthPlugin from './FirebaseAuthPlugin'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'

Vue.use(FirebaseAuthPlugin)
Vue.config.productionTip = false

sync(store, router)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

export { app, router, store} 