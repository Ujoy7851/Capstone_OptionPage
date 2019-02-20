import Vue from 'vue'
import 'vuetify/dist/vuetify.min.css'
import Vuetify, {
  // VApp, // required
  // VToolbar,
}from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify, {
  iconfont: 'md',
  components: {
    // VApp,
    // VToolbar,
  },
  theme: {
    primary: colors.purple,
    secondary: colors.amber,
    accent: colors.shades.white,
    error: colors.red.accent3
  }
})