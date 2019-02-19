<template>
<v-layout row>
  <v-card>
      <v-card-text>
    <p>Please Sign In</p>
    <v-btn color="primary" v-on:click="loginG">sign In</v-btn>
      </v-card-text>
  </v-card>
</v-layout>
    
</template>

<script>
import {mapGetters} from 'vuex'
export default {
    name: 'Login',
    computed: {
        ...mapGetters(['user']),
        nextRoute () {
            return this.$route.query.redirect || '/'
        }
    },
    watch: {
        user (auth) {
            if(!!auth){
                this.$router.replace(this.nextRoute)
            }
        }
    },
    methods: {
        async loginG () {
            const auth = await this.$auth.loginG()
        }
    },
    mounted (){
        chrome.runtime.sendMessage({
            data:"logout"
        });
    }
}
</script>

<style scoped>

</style>
