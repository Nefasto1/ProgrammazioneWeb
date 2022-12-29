<template>
    <div class="container text-white mt-5 p-3"> 
        <div class="row justify-text-start p-5">
            <label for="messageArea" class="form-label fs-4">A cosa stai pensando?</label>
            <span class="fs-3 error">{{ status }}</span>
            <textarea class="form-control fs-4" @keyup.enter="post" :class="{errorInput: status}" type="text" v-model="message" placeholder="Messaggio" rows="7"></textarea>
            <input class="btn" type="button" @click="post" value="Post" />
        </div>
    </div>
</template>

<script>
import request from '@/utils/requests';

export default {
    name: "PostItem",
    data() {return {status: "", message:"", clickable:true}},
    methods: {
        post() {
            if(this.message != "" && this.clickable){
                this.clickable = false;
                request.postRequest('http://localhost:3000/api/social/messages', {msg: this.message},
                    () => this.$router.push({name: "feed"}),
                    (err) => {
                        this.status = err.response.data;
                        this.clickable = true;
                    }
                );
            } else {
                this.status = "Scrivere un messaggio"
            }
        }
    }
}
</script>

<style scoped>
textarea {
    background: linear-gradient(21deg, #190031, #5A189A);
    color: #DDFFF7;
}

textarea:focus, textarea:hover {
    background: linear-gradient(21deg, #E4B7E5, #E980FC);
    color: #292b2c;
}
</style>
