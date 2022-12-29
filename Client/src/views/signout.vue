<template>
    <div>
        <h1> Sign Out </h1>
        <p> {{ status }} </p>
        <input type="button" @click.prevent="signout" value="Logout"/>
    </div>
</template>


<script>
import request from '@/utils/requests';

export default {
    name: 'SignoutItem',
    methods: {
        signout: function(){
            request.getRequest('http://localhost:3000/api/auth/signout', {}, 
                () => this.$router.push({name: "feed"}),
                () => this.$router.push({name: "feed"})
            );
        }
    }
};
</script>