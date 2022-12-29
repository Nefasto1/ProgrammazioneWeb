const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db')
const url = require('url');

const router = express.Router();

// Controlla se l'utente che effettua la richiesta è autenticato
// Nel caso lo sia esegue la callback
// Altrimenti restituisce un errore
var verify = async (req, res, next) => {
    const token = req.cookies.access_token;

    // Controllo se è presente il token
    if (token){
        jwt.verify(token, "token", async (err, decoded) => {
            // Se il token non coincide restituisce un errore
            if (err){
                res.status(401).send(err);
            // Se il token coincide esegue la callback
            } else {
                next(req, res, decoded);
            }
        })
    } else {
        res.status(403).send("Non sei autenticato");
    }
}

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Authorizzation Routing
// Signup
router.post("/auth/signup", async (req, res) => {
    // Prelevo dal body tutte le informazioni
    const username = req.body.username;
    const password = req.body.password;
    const nome = req.body.nome;
    const cognome = req.body.cognome;
    const bio = req.body.bio;

    // Cerco un utente con lo stesso username
    const mongo = db.getDb();
    let userexist = await mongo.collection('users').findOne({'username': username});
    
    // Se l'utente esiste restituisco un errore
    if (userexist){
        res.status(403).send("Username già in uso");
    // Se l'utente non esiste lo aggiungo
    } else {
        // Inserisco come identificativo il successivo a quello presente
        const last = await mongo.collection("users").findOne({}, {sort: {"id": -1}});
        let lastId = last?.id === undefined ? 0 : last.id;
        ++lastId;

        // Creo il nuovo oggetto utente
        const user = {
            id: lastId,
            username: username,
            password: password,
            nome: nome,
            cognome: cognome,
            bio: bio
        }

        // Aggiungo l'utente al database
        await mongo.collection('users').insertOne(user);
        res.status(201).send("Account creato con successo")
    }
});

// Signin
router.post("/auth/signin", async (req, res) => {
    // Prelevo le informazioni dal body
    const username = req.body.username;
    const password = req.body.password;
    
    // Cerco un utente con lo stesso username
    const mongo = db.getDb();
    let user = await mongo.collection('users').findOne({'username': username});

    // Se l'utente non esiste o la password non coincide restituisco un errore
    if(!(user) || password != user.password){
        res.status(403).send("Username e/o password errati");
    // Altrimenti prelevo il token
    } else {
        jwt.sign(user, "token", (err, token) => {
            if (err) {
                res.status(401).send(err);
            } else {           
                // Creo un cookie contenente il cookie  
                res.cookie("access_token", token, { 
                    httpOnly: true
                }).status(201).json("Login effettuato con successo");
            }
        });
    }
});

// Signout
router.get("/auth/signout", async (req, res) => {   
    // Se è presente il cookie lo elimino 
    if(req.cookies.access_token){
        res.clearCookie('access_token');
        res.status(200).send("Logout effettuato con successo");
    // Altrimenti restituisco un errore
    } else {
        res.status(403).send("Non sei autenticato");
    }
});


// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Social Routing
// User by id
router.get('/social/users/:id', async (req, res) => {
    const mongo = db.getDb();
    
    // Prelevo l'utente con l'id ricercato
    const user = await mongo.collection('users').findOne({"id": parseInt(req.params.id)});
   
    // Se l'utente esiste
    if(user) {
        token = req.cookies.access_token;
        // Se l'utente è autenticato (gestione della mancanza del token diverso rispetto a verify)
        if (token){
            jwt.verify(token, "token", async (err, decoded) => {
                if (err){
                    res.status(401).send(err);
                // Se l'utente è autenticato
                } else {
                    // Controllo se l'utente richiesto corrisponde al richiedente
                    if (user.id === decoded.id)
                        user.self = true;

                    // Controllo la lista dei follower
                    const followers = await mongo.collection('followers').find({"followed": parseInt(req.params.id)}).toArray();
                    user.nfollowers = followers.length
                    
                    // Controllo se l'utente richiedente segue l'utente ricercato
                    const followed = await mongo.collection('followers').findOne({"followed": parseInt(req.params.id), "follower": decoded.id});
                    user.followed = followed ? true : false;
                    
                    res.status(201).json(user)
                }
            });
        // Se l'utente non è autenticato
        } else {  
            // Controllo la lista dei follower
            const followers = await mongo.collection('followers').find({"followed": parseInt(req.params.id)}).toArray();
            user.nfollowers = followers.length

            // Controllo se l'utente richiedente segue l'utente ricercato            
            user.followed = false;
                    
            res.status(201).json(user)
        }
    } else {
        res.status(404).send("ERROR 404: Utente non trovato");
    }
});

// Search
router.get('/social/search', async (req, res) => {    
    // Prendo i parametry in input
    const queryObject = url.parse(req.url, true).query;
    
    // Se non è presente il parametro q restituisco un errore
    if(!queryObject.q){
        res.status(404).send(queryObject.q);
    // Se è presente
    } else {
        const mongo = db.getDb();
        const q = queryObject.q;
        
        // Cerco gli utenti i quali username, nome o cognome coincidano con il valore cercato 
        const users = await mongo.collection('users').find({
            $expr: {
                $regexMatch: {
                    input: {
                        $concat: ["$username", " ", "$nome", " ", "$cognome"]
                    },
                    regex: q,
                    options: 'i'
                }
            }
        }).toArray();
        
        res.status(201).send(users);
    }
});

// Whoami
router.get('/social/whoami', async (req, res) => {
    // Controllo se l'utente è autenticato
    verify(req, res, async (req, res, decoded) => {
        mongo = db.getDb();

        // Se lo è prendo anche la lista dei follower dell'utente
        const followers = await mongo.collection('followers').find({"followed": parseInt(decoded.id)}).toArray();
        decoded.followers = followers
        decoded.nfollowers = followers.length
        
        res.status(200).json(decoded);
    });
});

// Feed
// Callback di verify
var feed = async (req, res, decoded) => {
    const mongo = db.getDb();
    
    // Cerco la lista degli utenti seguiti dall'utente
    const follow = await mongo.collection('followers').find({'follower': decoded.id}).toArray();
    
    // Aggiungo gli id ad un array
    followed = []
    follow.forEach(user => {
        followed.push(user.followed)      
    });
    
    // Cerco i messaggi scritti dagli utenti seguiti ordinati in modo decrescente per la data
    const messages = await mongo.collection('messages').find({'userID': {$in: followed}}, {sort: {"date": -1}}).toArray();
    
    // Per ogni messaggio trovato
    for(const message of messages) {
        // Prelevo le informazioni di chi la ha scritta
        const user = await mongo.collection('users').findOne({'id': message.userID});
        message.username = user.username;
        message.nome = user.nome;
        message.cognome = user.cognome;
        message.follower = true

        // Prelevo il numero di like
        const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
        message.nlike = nlike.length;

        // Prelevo se l'utente richiedente ha inserito like
        const like = await mongo.collection('like').findOne({'msgID': message.msgID, 'userID': decoded.id});
        message.like = like ? true : false;
    }

    res.status(201).send(messages);
}

router.get('/social/feed', (req, res) => {
    verify(req, res, feed);
});

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Social-Message Routing
// Insert messages
// Callback per verify
var messages = async (req, res, decoded) => {
    const mongo = db.getDb();

    // Inserisco come id l'ultimo inserito più uno
    const last = await mongo.collection('messages').findOne({}, {sort: {"msgID": -1}});
    let lastID = last?.msgID===undefined? 0: last.msgID;
    ++lastID;

    // Creo il messaggio
    msg = {
        userID: decoded.id,
        msgID: lastID,
        date: new Date(),
        msg: req.body.msg
    };

    // Lo inserisco
    await mongo.collection("messages").insertOne(msg);
    
    res.status(200).send("Messaggio inserito con successo");
}

router.post("/social/messages", async (req, res) => {
    verify(req, res, messages);
});

// Get message by userID
router.get("/social/messages/:userID", async (req, res) => {
    const token = req.cookies.access_token;
    const mongo = db.getDb()

    // Se l'utente è autenticato
    if (token){
        jwt.verify(token, "token", async (err, decoded) => {
            if (err){
                res.status(401).send(err);
            } else {
                // Prelevo i messaggi scritti dall'utente richiesto
                const messages = await mongo.collection("messages").find({'userID': parseInt(req.params.userID)}, {sort: {"date": -1}}).toArray();

                // Per ogni messaggio
                for(const message of messages) {
                    // Prelevo le informazioni su chi le ha scritte
                    const user = await mongo.collection('users').findOne({'id': message.userID});
                    message.username = user.username;
                    message.nome = user.nome;
                    message.cognome = user.cognome;

                    // Prelevo il numero di like
                    const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
                    message.nlike = nlike.length;

                    // Controllo se l'utente ha messo like al messaggio
                    const like = await mongo.collection('like').findOne({'msgID': message.msgID, 'userID': decoded.id});
                    message.like = like ? true : false;
                }
                
                res.status(201).json(messages);
            }
        });
    // Se l'utente non è autenticato
    } else {
        // Prelevo tutti i messaggi inviati dall'utente richiesto
        const messages = await mongo.collection("messages").find({'userID': parseInt(req.params.userID)}, {sort: {"date": -1}}).toArray();
        
        // Per ogni messasggio
        for (message of messages) {
            // Prelevo le informazioni dell'utente che ha scritto i messaggi
            const user = await mongo.collection('users').findOne({'id': message.userID});
            message.username = user.username;
            message.nome = user.nome;
            message.cognome = user.cognome;
            
            // Prelevo il numero di like 
            const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
            message.nlike = nlike.length;

            // Imposto a false il like dall'utente richiedente
            message.like = false;
        };
        res.status(201).json(messages);
    }
    
});

// Get message by userID and msgID
router.get("/social/messages/:userID/:msgID", async (req, res) => {
    const token = req.cookies.access_token;
    const mongo = db.getDb()

    // Se l'utente è autenticato
    if (token){
        jwt.verify(token, "token", async (err, decoded) => {
            if (err){
                res.status(401).send(err);
            } else {
                // Prelevo il messaggio richiesto
                const message = await mongo.collection("messages").findOne({'userID': parseInt(req.params.userID), 'msgID': parseInt(req.params.msgID)});
                
                // Se esiste
                if(message){
                    // Prelevo le informazioni dell'utente che lo ha scritto
                    const user = await mongo.collection('users').findOne({'id': message.userID});
                    message.username = user.username;
                    message.nome = user.nome;
                    message.cognome = user.cognome;
                    
                    // Controllo se l'utente segue chi ha scritto il messaggio
                    const followed = await mongo.collection('followers').findOne({"followed": parseInt(req.params.userID), "follower": decoded.id});
                    message.followed = followed ? true : false;

                    // Prelevo il numero di like del messaggio
                    const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
                    message.nlike = nlike.length;

                    // Controllo se l'utente ha messo like al messaggio
                    const like = await mongo.collection('like').findOne({'msgID': message.msgID, 'userID': decoded.id});
                    message.like = like ? true : false;
                    
                    res.status(201).json(message);
                } else {
                    res.status(404).send('ERROR 404: Message not found')
                }
            }
        });
    // Se non è autenticato
    } else {
        // Prelevo il messaggio richiesto
        const message = await mongo.collection("messages").findOne({'userID': parseInt(req.params.userID), 'msgID': parseInt(req.params.msgID)});

        // Se esiste
        if(message){
            // Prelevo le informazioni dell'utente che lo ha scritto
            const user = await mongo.collection('users').findOne({'id': message.userID});
            message.username = user.username;
            message.nome = user.nome;
            message.cognome = user.cognome;
            
            // Prelevo il numero di like del messaggio
            const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
            message.nlike = nlike.length;

            // Imposto a false il like dall'utente richiedente
            message.like = false;

            res.status(201).json(message);
        } else {
            res.status(404).send('ERROR 404: Message not found')
        }
    }
});


// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Social-Followers Routing
// Get followers by Id
router.get("/social/followers/:id", async (req, res) => {
    const mongo = db.getDb();

    // Controllo se esiste l'utente richiesto
    const exist = await mongo.collection("users").findOne({'id': parseInt(req.params.id)})
    
    // Se l'utente esiste
    if (exist){
        // Controllo la lista dei follower
        const followers = await mongo.collection('followers').find({"followed": parseInt(req.params.id)}).toArray();    
        res.status(201).json(followers);
    } else {
        res.status(404).send("ERROR 404: Utente non trovato");
    }
});

// Insert follower
// Callback per verify
var followers = async (req, res, decoded) => {
    const mongo = db.getDb();

    // Creo l'oggetto follow
    follow = {
        followed: parseInt(req.params.id),
        follower: decoded.id,
    };

    // Controllo se l'utente esiste
    const exist = await mongo.collection('users').findOne({"id": parseInt(req.params.id)});
    // Controllo se l'utente segue già l'utente richiesto
    const followed = await mongo.collection('followers').findOne(follow);
    
    // Se il richiedente corrisponde al richiesto, se lo segue già, o se l'utente non esiste restituisco un errore
    if (follow.followed == follow.follower || followed || !exist) {    
        res.status(403).send("Operazione non consentita");
    // Altrimenti lo inserisco
    } else {
        await mongo.collection("followers").insertOne(follow);
        res.status(200).send("Follow aggiunto con successo");
    }
}

router.post("/social/followers/:id", async (req, res) => {
    verify(req, res, followers);
});

// Delete followers by Id
var deleteFollowers = async (req, res, decoded) => {
    const mongo = db.getDb();
    
    // Creo l'oggetto follow
    follow = {
        followed: parseInt(req.params.id),
        follower: decoded.id,
    };

    // Elimino l'elemento richiesto (se presente)
    await mongo.collection("followers").deleteOne(follow);
    
    res.status(200).send("Follow eliminato con successo");
}

router.delete("/social/followers/:id", async (req, res) => {
    verify(req, res, deleteFollowers);
});

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Social-Like Routing
// Insert like by msgID
// Callback per verify
var likes = async (req, res, decoded) => {
    const mongo = db.getDb();
    
    // Creo l'oggetto like
    like = {
        msgID: parseInt(req.params.msgID),
        userID: decoded.id
    };
    
    // Controllo se il messaggio esiste
    const exist = await mongo.collection('messages').find({"msgID": parseInt(req.params.msgID)});
    // Controllo se il messaggio ha già ricevuto il like
    const liked = await mongo.collection('like').findOne(like);
    
    // Se il messaggio non esiste o è stato già messo like restituisco un errore
    if (liked || !exist){
        res.status(403).send("Operazione non consentita");
    // Altrimenti lo inserisco
    } else {
        await mongo.collection("like").insertOne(like);
        res.status(200).send("Like inserito con successo");
    }
}

// Insert like by msgID
router.post("/social/like/:msgID", async (req, res) => {
    verify(req, res, likes);
});

// Delete like by msgID
// Callback per verify
var deleteLike = async (req, res, decoded) => {
    const mongo = db.getDb();
    
    // Creo l'oggetto like
    like = {
        msgID: parseInt(req.params.msgID),
        userID: decoded.id
    };

    // Elimino l'elemento richiesto (se presente)
    await mongo.collection("like").deleteOne(like);
    
    res.status(200).send("Like eliminato con successo");
}

router.delete("/social/like/:msgID", async (req, res) => {
    verify(req, res, deleteLike);
});

module.exports = router;