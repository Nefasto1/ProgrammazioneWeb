<template>
    <div class="list-inline-item">
        <input type="text" class="form-control" v-model="search" placeholder="Search">
        <div class="container">
            <div class="row p-11" id="userFound" v-for="user in users" v-bind:key="user.username">
                <a :href="'http://localhost:8080/#/users/' + user.id" @click="reset">
                    <small class="text-muted">@{{ user.username }}</small> - {{ user.nome }} {{ user.cognome }}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import request from '@/utils/requests.js';

export default {
    name: "SearchItem",
    data() {return {search:""}},
    computed: {
        users() {
            if (this.search != "" && !this.search.match(/[|\\/~^:,;?!&%$@*+"']/)){
                request.getRequest(`http://localhost:3000/api/social/search?q=${this.search}`, {},
                    (res) => this.res = res.data.slice(0, 5),
                    null
                );
                return this.res
            }
            return 0
        }
    },
    methods: {
        reset() {
            this.search = "";
        }
    }
}
</script>

<style scoped>
    input {
        background: linear-gradient(21deg, #240046, #5A189A);
        color: #DDFFF7;
    }

    input:focus {
        background: linear-gradient(21deg, #E4B7E5, #E980FC);
        color: #292b2c;
    }
    
    input + div.container {
        z-index: 1000;
        position: absolute;
        max-width: 195px;
        display: none;
    }

    input:focus + div.container, div.container:active {
        display: block;
    }

    div .row{
        background: linear-gradient(21deg, #240046, #5A189A);
        color: #DDFFF7;
        border: 1px solid #DDFFF7;
        border-radius: 5px;
    }
    
    div .row:hover{
        background: linear-gradient(21deg, #E4B7E5, #E980FC);
        color: #292b2c;
        border: 1px solid #292b2c;
    }

    nav a:hover{
        font-weight: bold;
        color: #292b2c;
        text-decoration: none;
    }
</style>