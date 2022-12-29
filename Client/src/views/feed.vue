<template>
    <div class="container text-white">
        <div class="container">
            <h1 class="h1" v-if="messages.length == 0">Tutto troppo tranquillo</h1>
            <a @click.stop="redirect(message.msgID, message.userID)" v-for="message in messages" :key="message.msg">
                <div class="container p-3">
                    <div class="row justify-content-between">
                        <div class="col-auto fs-4">
                            <a :href="'http://localhost:8080/#/users/' + message.userID">{{ message.username }}</a>
                        </div>
                        <div class="col-auto">
                            {{ message.date }} {{ message.time }}
                        </div>
                    </div>

                    <div class="row justify-content-start" id="name">
                        <div class="col-auto">
                            <a :href="'http://localhost:8080/#/users/' + message.userID"><small class="text-muted">{{ message.nome }} {{ message.cognome }}</small></a>
                        </div>
                    </div>

                    <div class="row justify-content-start pt-2 ps-4" id="message">
                        <div class="col-auto">
                            <p>{{ message.msg }}</p>
                        </div>
                    </div>

                    <a v-if="!message.like" @click.stop="like(message.msgID)"><div class="container" id="like">like {{ message.nlike }}</div></a>
                    <a v-if="message.like" @click.stop="unlike(message.msgID)"><div class="container" id="unlike">unlike {{ message.nlike }}</div></a>
                </div>
            </a>
        </div>
    </div>
</template>


<script>
import request from '@/utils/requests';

export default {
    name: 'FeedItem',    
    data() {
        return {status: "", messages: []};
    },
    mounted() {
        this.refresh();
    },
    methods: {
        refresh() {
            request.getRequest('http://localhost:3000/api/social/feed', {}, 
                (res) => {
                    res.data.forEach(message => {
                        message.time = new Date(message.date).toLocaleTimeString("it-IT");
                        message.date = new Date(message.date).toLocaleDateString("it-IT");
                    });

                    this.messages = res.data;
                },
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