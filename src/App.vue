<template>
  <v-app>
    <v-toolbar app color="amber">
      <v-toolbar-title class="title">
        <span>PoseKey</span>        
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="font-weight-light subheading">Option Page</span>
      <!-- <v-spacer></v-spacer> -->
      <!-- <v-btn dark color="purple" v-on:click="loginG">Login</v-btn> -->
      <!-- <v-btn dark color="purple" v-on:click="logout">Log out</v-btn> -->
    </v-toolbar>

    <v-content>
      <!-- <HelloWorld/> -->
      <router-view></router-view>
    </v-content>
  </v-app>
</template>
<script>
import HelloWorld from './components/HelloWorld'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data () {
    return {
      
    }
  },
  methods: {
    async loginG () {
      const auth = await this.$auth.loginG()
    }
  },
  computed: {
        // ...mapGetters(['user']),
        // nextRoute () {
        //     return this.$route.query.redirect || '/'
        // }
    },
    watch: {
        user (auth) {
            if(!!auth){
                // this.$router.replace(this.nextRoute)
            }
        }
    },
}
</script>
