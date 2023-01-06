<template>
    <div class="container text-white">
        <p v-if="status"> {{ status }} </p>
        <div v-if="!status">
            <div>
                <div class="row justify-content-between">
                    <div class="col-auto">
                        <p class="fs-2 fw-bold">
                            {{ user.nome }} {{ user.cognome }}
                        </p>
                    </div>
                    <div class="col-auto">
                        <a :href="'http://localhost:8080/#/followers/' + user.id" class="text-decoration-none">{{ user.nfollowers }} <small>follower</small></a>
                    </div>
                </div>

                <div class="row justify-content-between user">
                    <div class="col-auto">
                        <small class="text-muted">
                            @{{ user.username }}
                        </small>
                    </div>
                    <div class="col-auto">    
                        <a v-if="!user.followed" @click="follow()"><div class="container follow">follow</div></a>
                        <a v-if="user.followed" @click="unfollow()"><div class="container unfollow">unfollow</div></a>
                    </div>
                </div>

                <div class="row justify-content-start">
                    <div class="col-auto">
                        <p>          
                            {{ user.bio }}
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="container messages">
                <a @click.stop="redirect(message.msgID, message.userID)" v-for="message in messages" :key="message.msg">
                    <div class="container p-3">
                        <div class="row justify-content-between">
                            <div class="col-auto fs-4">
                                {{ message.username }}
                            </div>
                            <div class="col-auto">
                                {{ message.date }} {{ message.time }}
                            </div>
                        </div>

                        <div class="row justify-content-start name">
                            <div class="col-auto">
                                <small class="text-muted">{{ message.nome }} {{ message.cognome }}</small>
                            </div>
                        </div>

                        <div class="row justify-content-start pt-2 ps-4 message">
                            <div class="col-auto">
                                <p>{{ message.msg }}</p>
                            </div>
                        </div>
                        
                        <a v-if="!message.like" @click.stop="like(message.msgID)"><div class="container like">like {{ message.nlike }}</div></a>
                        <a v-if="message.like" @click.stop="unlike(message.msgID)"><div class="container unlike">unlike {{ message.nlike }}</div></a>
                    </div>
                </a>
            </div>
        </div>
    </div>
</template>


<script>
import request from '@/utils/requests';

export default {
    name: 'UsersItem',
    data() {
        return {status:"", user:"", messages:""};
    },
    mounted() {
        this.refresh();
    },
    watch: {
        '$route.params.id': {
            handler() {
                this.refresh();
            }
        }
    },
    methods: {
        refresh() {
            request.getRequest(`http://localhost:3000/api/social/users/${this.$route.params.id}`, {},
                (res) => {
                    this.user = res.data
                    if (this.user.self){
                        this.$router.push({name: 'whoami'});
                    }
                },
                () => this.$router.push({name: 'feed'})
            );
            request.getRequest(`http://localhost:3000/api/social/messages/${this.$route.params.id}`, {},
                (res) => {
                    res.data.forEach(message => {
                        message.time = new Date(message.date).toLocaleTimeString("it-IT");
                        message.date = new Date(message.date).toLocaleDateString("it-IT");
                    });

                    this.messages = res.data;
                },
                () => this.$router.push({name: 'feed'})
            );
        },
        follow() {
            request.postRequest(`http://localhost:3000/api/social/followers/${this.$route.params.id}`, {},
                () => this.refresh(),
                () => this.$router.push({name: 'signinup'})
            );
        },
        unfollow() {
            request.deleteRequest(`http://localhost:3000/api/social/followers/${this.$route.params.id}`, {},
                () => this.refresh(),
                () => this.$router.push({name: 'signinup'})
            );
        },
        like(msgID) {
            request.postRequest(`http://localhost:3000/api/social/like/${msgID}`, {},
                () => this.refresh(),
                () => this.$router.push({name: 'signinup'})
            );
        },
        unlike(msgID) {
            request.deleteRequest(`http://localhost:3000/api/social/like/${msgID}`, {},
                () => this.refresh(),
                () => this.$router.push({name: 'signinup'})
            );
        },
        redirect(msgID, userID) {
            window.location.href = `http://localhost:8080/#/message/${userID}/${msgID}`
        }
    }
};
</script>

<style scoped>
a {
  color: #DDFFF7;
  text-decoration: none;
}

a:hover {
  color: #E980FC;
  cursor: pointer;
}
</style>