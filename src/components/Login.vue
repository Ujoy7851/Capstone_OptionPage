<template>
<v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <p>Please Sign In</p>
        <v-btn color="primary" v-on:click="loginG">sign In</v-btn>
      </v-card>
      
    </v-flex>
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
    }
}
</script>

<style scoped>

</style>
