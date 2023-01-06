<template>
  <nav class="text-white">
    | 
    <span v-if="authenticated"><router-link to="/">Feed</router-link> | </span>
    <span v-if="authenticated"><router-link to="/whoami">Whoami</router-link> | </span>
    <span v-if="authenticated"><input class="btn" type="button" @click.prevent="signout" value="Logout"/> | </span>
    <span v-if="!authenticated"><router-link to="/signinup">SignIn</router-link> | </span>
    <search />
    <span v-if="authenticated"><router-link to="/post"><input class="btn rounded-circle" type="button" value="+"/></router-link> </span>
  </nav>
  <router-view/>
</template>

<script>
import search from './components/search.vue'
import request from '@/utils/requests'

export default {
  data() {return {authenticated:false}},
  components: {
    search
  },
  watch: {
      '$route.fullPath': {
          handler() {
              this.authenticator()
          }
      }
  },
  methods: {
      authenticator: function(){
        request.getRequest("http://localhost:3000/api/social/whoami", {},
            () => this.authenticated = true,
            () => this.authenticated = false
        );
      },
      signout: function(){
          request.getRequest('http://localhost:3000/api/auth/signout', {}, 
              () => this.$router.push({name: "signinup"}),
              () => this.$router.push({name: "signinup"})
          );
      }
  }
}
</script>


<style>
:root {
  /* background: linear-gradient(0deg, #3C096C, #7B2CBF); */
  background-color: #480A82;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #292b2c;
  /* background: linear-gradient(0deg, #240046b8, #5A189Ab8); */
  background-color: #480A82;
}

input.btn{
    border: 1px solid #DDFFF7;
    color: #DDFFF7;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #DDFFF7;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #DDFFF7;
}

input.btn{
  background: linear-gradient(21deg, #240046, #5A189A);
}

input.btn:hover, input.btn:focus{
  background: linear-gradient(21deg, #E4B7E5, #E980FC);
  border: 1px solid #292b2c;
  color: #292b2c;
}

nav a:hover{
  font-weight: bold;
  color: #E980FC;
  text-decoration: none;
}

nav a.router-link-exact-active:hover {
  color: #E980FC;
}

nav.text-white {  
  background: linear-gradient(0deg, #3C096C, #11001C);
}

small.text-muted {
  color: #c6a8de !important;
}

div .row:hover > a > small.text-muted {
  color: #254209 !important;
}

div.container.text-white {  
  background-color: #3C096C;
  box-shadow: 15px 15px 15px #240046;
}

a > div.container {
  border-top: 2px solid #DDFFF7;
  margin-bottom: 5px;
  color: #DDFFF7;
}

a:hover > div.container {
  background: linear-gradient(21deg, #240046, #5A189A);
}

a:first-child > div.container {
  border-top: 0px;
  margin-bottom: 5px;
  color: #DDFFF7;
}

p {
  color: #DDFFF7
}

h1 {
  color: #DDFFF7;
}

.fs-4 {
  margin-top: -8px;
}

div[class~=user] {
  margin-top: -25px;
}

div[class~=name] {
  margin-top: -7px;
}

div[class~=messages] {
  border-top: 3px solid #DDFFF7;
}

div[class~=like]:hover, div[class~=unlike] {
  background: linear-gradient(21deg, #E4B7E5, #E980FC) !important;
  color: #292b2c !important;
}

div[class~=unlike]:hover {
  background: linear-gradient(21deg, #9d0208, #6a040f) !important;
  color: #fff !important;
}

div[class~=follow] {
  border: 1px solid #00B4D8 !important;
}

div[class~=follow]:hover, div[class~=unfollow] {
  background: linear-gradient(21deg, #00B4D8, #0077B6) !important;
}

div[class~=unfollow]:hover {
  background: linear-gradient(21deg, #023E8A, #03045E) !important;
}

.error {
  color: red;
}

.errorInput {
  border: 3px solid red !important;
  border-radius: .550rem;
}
</style>
