<template>
    <div class="container text-white">
        <div class="container">
            <div class="container mt-5 p-3">
                <div class="row justify-content-between">
                    <div class="col-auto fs-4">
                        <a :href="'http://localhost:8080/#/users/' + message.userID">{{ message.username }}</a>
                    </div>
                    <div class="col-auto">
                        {{ message.date }} {{ message.time }}
                    </div>
                </div>

                <div class="row justify-content-between" id="name">
                    <div class="col-auto">
                        <a :href="'http://localhost:8080/#/users/' + message.userID"><small class="text-muted">{{ message.nome }} {{ message.cognome }}</small></a>
                    </div>
                    <div class="col-auto" v-if="!user.self">    
                        <a v-if="!message.followed" @click="follow()"><div class="container" id="follow">follow</div></a>
                        <a v-if="message.followed" @click="unfollow()"><div class="container" id="unfollow">unfollow</div></a>
                    </div>
                </div>

                <div class="row justify-content-start" id="message">
                    <div class="col-auto">
                        <p>{{ message.msg }}</p>
                    </div>
                </div>
                
                <a v-if="!message.like" @click.stop="like(message.msgID)"><div class="container" id="like">like {{ message.nlike }}</div></a>
                <a v-if="message.like" @click.stop="unlike(message.msgID)"><div class="container" id="unlike">unlike {{ message.nlike }}</div></a>
            </div>
        </div>
    </div>
</template>


<script>
import request from '@/utils/requests';

export default {
    name: 'MessageItem',    
    data() {return {user:"", message:""}},
    watch: {
        '$route.params': {
            handler() {
                this.refresh();
            }
        }
    },
    mounted() {
        this.refresh()
    },
    methods: {
        refresh() {
            request.getRequest(`http://localhost:3000/api/social/messages/${this.$route.params.userID}/${this.$route.params.msgID}`, {},
                (res) => {
                    res.data.time = new Date(res.data.date).toLocaleTimeString("it-IT");
                    res.data.date = new Date(res.data.date).toLocaleDateString("it-IT");
                    
                    this.message = res.data;
                },
                () => this.$router.push({name: 'feed'})
            );   
            request.getRequest(`http://localhost:3000/api/social/users/${this.$route.params.userID}`, {},
                (res) => {
                    this.user = res.data;
                },
                () => this.$router.push({name: 'feed'})
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
        follow() {
            request.postRequest(`http://localhost:3000/api/social/followers/${this.$route.params.userID}`, {},
                () => this.refresh(),
                () => this.$router.push({name: 'signinup'})
            );
        },
        unfollow() {
            request.deleteRequest(`http://localhost:3000/api/social/followers/${this.$route.params.userID}`, {},
                () => this.refresh(),
                () => this.$router.push({name: 'signinup'})
            );
        }
    }
}
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

#message {
  padding-top: 7em;
  padding-bottom: 7em;
}
</style>