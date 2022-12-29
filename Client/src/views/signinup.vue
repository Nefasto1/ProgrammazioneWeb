<template>
    <div class="container text-white mt-5 p-3">
    <!-- SIGNIN -->
        <div class="container" v-if="login">
            <h1 class="h1">Sign In</h1>
            <span class="fs-4 error">{{ status }}</span>
            
            <div id="normal">
                <div class="input-group mb-3" :class="{errorInput: erruser}">
                    <span class="input-group-text justify-content-center fs-5" id="basic-addon1">@Username</span>
                    <input type="text" class="form-control fs-5" @keyup.enter="signin" v-model="username" placeholder="@Username">
                </div>  

                <div class="row">
                    <div class="col">
                        <div class="input-group mb-3" :class="{errorInput: errpass}">
                            <span class="input-group-text justify-content-center fs-5" id="basic-addon1">Password</span>
                            <input :type="visible" class="form-control fs-5" @keyup.enter="signin" v-model="password" placeholder="Password">
                            <input type="button" class="btn" @click="visibility" :value=button />
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- MOBILE -->

            <div id="mobile">
                <div class="row">
                    <div class="col">
                        <div :class="{errorInput: erruser}">
                            <span class="input-group-text justify-content-center fs-5" id="alternativelabel">@Username</span>
                            <div class="input-group">
                                <input type="text" class="form-control fs-5" id="alternativeinput" @keyup.enter="signin" v-model="username" placeholder="@Username">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="col">
                        <div :class="{errorInput: errpass}">
                            <span class="input-group-text justify-content-center fs-5" id="alternativelabel">Password</span>
                            <div class="input-group">
                                <input :type=visible class="form-control fs-5" id="alternativeinput" @keyup.enter="signin" v-model="password" placeholder="Password">
                                <input type="button" class="btn" @click="visibility" :value=button />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col mt-3">
                    <input type="button" class="btn fs-5" @click="signin" value="Sign In"/>
                </div>
            </div>

            <div class="row mt-3">
                <span>Non sei registrato? <a class="change" @click="change">Registrati</a></span>
            </div>
        </div>

    <!-- SIGNUP -->
        
        <div class="container" v-if="!login">        
            <h1 class="h1">Sign Up</h1>
            <span class="fs-4 error">{{ status }}</span>
            
            <div class="row">
                <div class="col">
                    <div :class="{errorInput: erruser}">
                        <span class="input-group-text justify-content-center fs-5" id="alternativelabel">@Username</span>
                        <div class="input-group">
                            <input type="text" class="form-control fs-5" id="alternativeinput" @keyup.enter="signin" v-model="username" placeholder="@Username">
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col">
                    <div :class="{errorInput: errpass}">
                        <span class="input-group-text justify-content-center fs-5" id="alternativelabel">Password</span>
                        <div class="input-group" :class="{errorInput: errpass}">
                            <input :type="visible" class="form-control fs-5" @keyup.enter="signin" v-model="password" placeholder="Password (8-16 caratteri)">
                            <input type="button" class="btn" @click="visibility" :value=button />
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div :class="{errorInput: errredo}">
                        <span class="input-group-text justify-content-center fs-5" id="alternativelabel">Ripeti Password</span>
                        <div class="input-group" :class="{errorInput: errredo}">
                            <input :type="visible" class="form-control fs-5" @keyup.enter="signin" v-model="redo" placeholder="Ripeti Password">
                            <input type="button" class="btn" @click="visibility" :value=button />
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col">
                    <div :class="{errorInput: errnome}">
                        <span class="input-group-text justify-content-center fs-5" id="alternativelabel">Nome</span>
                        <div class="input-group">
                            <input type="text" class="form-control fs-5" id="alternativeinput" @keyup.enter="signup" v-model="nome" placeholder="Nome">
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div :class="{errorInput: errcogn}">
                        <span class="input-group-text justify-content-center fs-5" id="alternativelabel">Cognome</span>
                        <div class="input-group">
                            <input type="text" class="form-control fs-5" id="alternativeinput" @keyup.enter="signup" v-model="cognome" placeholder="Cognome">
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col">
                    <div :class="{errorInput: errbio}">
                        <span class="input-group-text justify-content-center fs-5" id="alternativelabel">Inserisci una tua descrizione:</span>
                        <div class="input-group">
                            <textarea class="form-control fs-5" id="alternativeinput" @keyup.enter="signup" v-model="bio" placeholder="Inserisci una tua descrizione" rows="2"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-3">
                <div class="col">
                    <input type="button" class="btn fs-5" @click="signup" value="Sign Up"/>
                </div>
            </div>
            
            <div class="row mt-3">
                <span>Sei registrato? <a class="change" @click="change">Accedi</a></span>
            </div>
        </div>
    </div>
</template>


<script>
import request from '@/utils/requests';

export default {
    name: 'SigninupItem',    
    data() {
        return {username: "", password: "", redo:"", nome:"", cognome:"", bio:"", status: "", login:true, switch:true, visible:"password", button:"show",
                erruser:false, errpass:false, errredo:false, errnome:false, errcogn:false, errbio:false};
    }, 
    methods: {
        signin: function(){
            this.reset();
            if (!(this.username == "" || this.password == "")){
                if(!this.username.match(/[|\\/~^:,;?!&%$@*+]/)){
                    request.postRequest('http://localhost:3000/api/auth/signin', {username: this.username.trim(), password: this.password.trim()}, 
                        () => this.$router.push({name: "feed"}),
                        (err) => this.status = err.response.data
                    );
                } else {
                    this.status = "Caratteri speciali non consentiti";
                    this.erruser = true;
                }
            } else {
                this.status = "Riempire tutti i campi";
                if(this.username == ""){
                    this.erruser = true;
                }
                if(this.password == ""){
                    this.errpass = true;
                }
            }
        },
        signup: function(){
            this.reset();
            if (!(this.username == "" || this.password == "" || this.nome == "" || this.cognome == "" || this.bio == "")){
                if(!(this.username.match(/[|\\/~^:,;?!&%$@*+]/) || this.nome.match(/[|\\/~^:,;?!&%$@*+]/) || this.cognome.match(/[|\\/~^:,;?!&%$@*+]/))){
                    if (!(this.password.length < 8 || this.password.length > 16)) {
                        if(this.password === this.redo) {
                            request.postRequest('http://localhost:3000/api/auth/signup', {username:this.username.trim(), password:this.password.trim(), 
                                                                                        nome:this.nome.trim(), cognome:this.cognome.trim(), bio:this.bio.trim()}, 
                                (res) => {
                                    this.status = res.data
                                    this.change();
                                },
                                (err) => this.status = err.response.data
                            );
                        } else {
                            this.status = "Le password non coincidono";
                            this.errpass = true;
                            this.errredo = true
                        }
                    } else {
                        this.status = "Numero di caratteri non conforme";
                        this.errpass = true;
                    }
                } else {
                    this.status = "Caratteri speciali non consentiti";
                    if(this.username.match(/[|\\/~^:,;?!&%$@*+]/)){
                        this.erruser = true;
                    }
                    if(this.nome.match(/[|\\/~^:,;?!&%$@*+]/)){
                        this.erruser = true;
                    }
                    if(this.cognome.match(/[|\\/~^:,;?!&%$@*+]/)){
                        this.erruser = true;
                    }
                }
            } else {
                this.status = "Riempire tutti i campi";
                if(this.username == ""){
                    this.erruser = true;
                }
                if(this.password == ""){
                    this.errpass = true;
                }
                if(this.redo == ""){
                    this.errredo = true;
                }
                if(this.nome == ""){
                    this.errnome = true;
                }
                if(this.cognome == ""){
                    this.errcogn = true;
                }
                if(this.bio == ""){
                    this.errbio = true;
                }
            } 
        },
        change: function(){
            this.reset();
            this.login = !this.login;
        },
        visibility: function(){
            this.switch = !this.switch;
            this.button = this.switch ? 'show' : 'hide';
            this.visible = this.switch ? 'password' : 'text';
        },
        reset: function(){
            this.status = "";
            this.erruser = false;
            this.errpass = false;
            this.errredo = false;
            this.errnome = false;
            this.errcogn = false;
            this.errbio = false;
        }
    }
};
</script>

<style scoped>
.change {
  color: #DDFFF7;
  text-decoration: none;
}

.change:hover {
  color: #E980FC;
  cursor: pointer;
}

.input-group-text {
    min-width: 7em;
    background: linear-gradient(21deg, #5A189A, #190031);
    color: #DDFFF7;
}

#alternativelabel {
    border-radius: .375rem .375rem 0px 0px;
}

#alternativeinput {
    border-radius:  0px 0px .375rem .375rem;
}

#alternativeinput, input {
    background: linear-gradient(21deg, #190031, #5A189A);
    color: #DDFFF7;
}

#alternativeinput:focus, input:focus, #alternativeinput:hover, input:hover {
    background: linear-gradient(21deg, #E4B7E5, #E980FC);
    color: #292b2c;
}

@media (max-width: 500px) {
    #mobile {
        display: block;
    }
    #normal {
        display: none;
    }
}
@media (min-width: 500px) {
    #mobile {
        display: none;
    }
    #normal {
        display: block;
    }
}
</style>