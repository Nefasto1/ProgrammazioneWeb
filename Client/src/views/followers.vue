<template>
    <div class="container text-white">
        <p v-if="status"> {{ status }} </p>
        <p v-if="!status && followers.length === 0">Nessun follower</p>
        <div v-if="!status && followers.length !== 0">
            <div v-for="user in followers" v-bind:key="user.id" id="follower">
                <div class="row justify-content-between">
                    <div class="col-auto">
                        <p class="fs-2 fw-bold">
                            {{ user.nome }} {{ user.cognome }} <span v-if="user.self">(tu)</span>
                        </p>
                    </div>
                    <div class="col-auto">
                        <a :href="'http://localhost:8080/#/followers/' + user.id" class="text-decoration-none">{{ user.nfollowers }} <small>follower</small></a>
                    </div>
                </div>
            
                <div class="row justify-content-between" id="user">
                    <div class="col-auto">
                        <small class="text-muted">
                            @{{ user.username }}
                        </small>
                    </div>
                    <div class="col-auto" v-if="!user.self">    
                        <a v-if="!user.followed" @click="follow(user.id)"><div class="container" id="follow">follow</div></a>
                        <a v-if="user.followed" @click="unfollow(user.id)"><div class="container" id="unfollow">unfollow</div></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import request from '@/utils/requests';

export default {
    name: "followersItem",
    data() {return {status:false, followers:[]}},
    watch: {
        '$route.params.id': {
            handler() {
                this.refresh();
            }
        }
    },
    mounted() {
        this.refresh();
    },
    methods: {
        refresh() {
            this.status=false;
            this.followers=[];
            request.getRequest(`http://localhost:3000/api/social/followers/${this.$route.params.id}`, {},
                (res) => {
                    res.data.forEach(user => {
                        request.getRequest(`http://localhost:3000/api/social/users/${user.follower}`, {},
                            (res) => this.followers.push(res.data),
                            (err) => this.status = err.response.data
                        );
                    });               
                },
                (err) => this.status = err.response.data
            );
        },
        follow(id) {
            request.postRequest(`http://localhost:3000/api/social/followers/${id}`, {},
                () => this.refresh(),
                () => this.$router.push({name: 'signinup'})
            );
        },
        unfollow(id) {
            request.deleteRequest(`http://localhost:3000/api/social/followers/${id}`, {},
                () => this.refresh(),
                () => this.$router.push({name: 'signinup'})
            );
        },
    }
}
</script>

<style scoped>
#follower {
    padding-bottom: 10px;
    padding-top: 10px;
    border-top: 2px solid #DDFFF7;
}
</style>