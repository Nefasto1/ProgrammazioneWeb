const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db')
const url = require('url');

const router = express.Router();

var verify = async (req, res, next) => {
    const token = req.cookies.access_token;

    if (token){
        jwt.verify(token, "token", async (err, decoded) => {
            if (err){
                res.status(401).send(err);
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
    const username = req.body.username;
    const password = req.body.password;
    const nome = req.body.nome;
    const cognome = req.body.cognome;
    const bio = req.body.bio;

    const mongo = db.getDb();
    let userexist = await mongo.collection('users').findOne({'username': username});
    
    if (userexist){
        res.status(403).send("Username già in uso");
    } else {
        const last = await mongo.collection("users").findOne({}, {sort: {"id": -1}});
        let lastId = last?.id === undefined ? 0 : last.id;
        ++lastId;

        const user = {
            id: lastId,
            username: username,
            password: password,
            nome: nome,
            cognome: cognome,
            bio: bio
        }

        await mongo.collection('users').insertOne(user);
        res.status(201).send("Account creato con successo")
    }
});

// Signin
router.post("/auth/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    const mongo = db.getDb();
    let user = await mongo.collection('users').findOne({'username': username});
    if(!(user) || password != user.password){
        
        res.status(403).send("Username e/o password errati");
    } else {
        jwt.sign(user, "token", (err, token) => {
            if (err) {
                
                res.status(401).send(err);
            } else {
                
                res.cookie("access_token", token, { 
                    httpOnly: true
                }).status(201).json("Login effettuato con successo");
            }
        });
    }
});

// Signout
router.get("/auth/signout", async (req, res) => {    
    if(req.cookies.access_token){
        res.clearCookie('access_token');
        res.status(200).send("Logout effettuato con successo");
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
    const user = await mongo.collection('users').findOne({"id": parseInt(req.params.id)});
    token = req.cookies.access_token;

    if(user) {
        if (token){
            jwt.verify(token, "token", async (err, decoded) => {
                if (err){
                    res.status(401).send(err);
                } else {
                    if (user.id === decoded.id)
                        user.self = true;

                    const followers = await mongo.collection('followers').find({"followed": parseInt(req.params.id)}).toArray();
                    user.nfollowers = followers.length
                    
                    const followed = await mongo.collection('followers').findOne({"followed": parseInt(req.params.id), "follower": decoded.id});
                    user.followed = followed ? true : false;
                    
                    res.status(201).json(user)
                }
            });
        } else {
            const followers = await mongo.collection('followers').find({"followed": parseInt(req.params.id)}).toArray();
            user.nfollowers = followers.length
                        
            user.followed = false;
                    
            res.status(201).json(user)
        }
    } else {
        res.status(404).send("ERROR 404: Utente non trovato");
    }
});

// Search
router.get('/social/search', async (req, res) => {    
    const queryObject = url.parse(req.url, true).query;
    if(!queryObject.q){
        res.status(404).send(queryObject.q);
    } else {
        const mongo = db.getDb();
        const q = queryObject.q;
        
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
    verify(req, res, async (req, res, decoded) => {
        mongo = db.getDb();
        const followers = await mongo.collection('followers').find({"followed": parseInt(decoded.id)}).toArray();
        decoded.followers = followers
        decoded.nfollowers = followers.length
        
        res.status(200).json(decoded);
    });
});

// Feed
var feed = async (req, res, decoded) => {
    const mongo = db.getDb();
    
    const follow = await mongo.collection('followers').find({'follower': decoded.id}).toArray();
    followed = []
    follow.forEach(user => {
        followed.push(user.followed)      
    });
    
    const messages = await mongo.collection('messages').find({'userID': {$in: followed}}, {sort: {"date": -1}}).toArray();
    
    for(const message of messages) {
        const user = await mongo.collection('users').findOne({'id': message.userID});
        message.username = user.username;
        message.nome = user.nome;
        message.cognome = user.cognome;
        message.follower = true
        const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
        message.nlike = nlike.length;
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
var messages = async (req, res, decoded) => {
    const mongo = db.getDb();

    const last = await mongo.collection('messages').findOne({}, {sort: {"msgID": -1}});
    let lastID = last?.msgID===undefined? 0: last.msgID;
    ++lastID;

    msg = {
        userID: decoded.id,
        msgID: lastID,
        date: new Date(),
        msg: req.body.msg
    };

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

    if (token){
        jwt.verify(token, "token", async (err, decoded) => {
            if (err){
                res.status(401).send(err);
            } else {
                const messages = await mongo.collection("messages").find({'userID': parseInt(req.params.userID)}, {sort: {"date": -1}}).toArray();

                for(const message of messages) {
                    const user = await mongo.collection('users').findOne({'id': message.userID});
                    message.username = user.username;
                    message.nome = user.nome;
                    message.cognome = user.cognome;
                    const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
                    message.nlike = nlike.length;
                    const like = await mongo.collection('like').findOne({'msgID': message.msgID, 'userID': decoded.id});
                    message.like = like ? true : false;
                }
                
                res.status(201).json(messages);
            }
        });
    } else {
        const messages = await mongo.collection("messages").find({'userID': parseInt(req.params.userID)}, {sort: {"date": -1}}).toArray();
        
        for (message of messages) {
            const user = await mongo.collection('users').findOne({'id': message.userID});
            message.username = user.username;
            message.nome = user.nome;
            message.cognome = user.cognome;
            const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
            message.nlike = nlike.length;
            message.like = false;
        };
        res.status(201).json(messages);
    }
    
});

// Get message by userID and msgID
router.get("/social/messages/:userID/:msgID", async (req, res) => {
    const token = req.cookies.access_token;
    const mongo = db.getDb()

    if (token){
        jwt.verify(token, "token", async (err, decoded) => {
            if (err){
                res.status(401).send(err);
            } else {
                const message = await mongo.collection("messages").findOne({'userID': parseInt(req.params.userID), 'msgID': parseInt(req.params.msgID)});
                
                if(message){
                    const user = await mongo.collection('users').findOne({'id': message.userID});
                    message.username = user.username;
                    message.nome = user.nome;
                    message.cognome = user.cognome;
                    
                    const followed = await mongo.collection('followers').findOne({"followed": parseInt(req.params.userID), "follower": decoded.id});
                    message.followed = followed ? true : false;

                    const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
                    message.nlike = nlike.length;
                    const like = await mongo.collection('like').findOne({'msgID': message.msgID, 'userID': decoded.id});
                    message.like = like ? true : false;
                    
                    res.status(201).json(message);
                } else {
                    res.status(404).send('ERROR 404: Message not found')
                }
            }
        });
    } else {
        const message = await mongo.collection("messages").findOne({'userID': parseInt(req.params.userID), 'msgID': parseInt(req.params.msgID)});

        if(message){
            const user = await mongo.collection('users').findOne({'id': message.userID});
            message.username = user.username;
            message.nome = user.nome;
            message.cognome = user.cognome;
            const nlike = await mongo.collection('like').find({'msgID': message.msgID}).toArray();
            message.nlike = nlike.length;
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
    const exist = await mongo.collection("users").findOne({'id': parseInt(req.params.id)})
    
    if (exist){
        const followers = await mongo.collection('followers').find({"followed": parseInt(req.params.id)}).toArray();    
        res.status(201).json(followers);
    } else {
        res.status(404).send("ERROR 404: Utente non trovato");
    }
});

// Insert follower
var followers = async (req, res, decoded) => {
    const mongo = db.getDb();

    follow = {
        followed: parseInt(req.params.id),
        follower: decoded.id,
    };

    const exist = await mongo.collection('users').findOne({"id": parseInt(req.params.id)});
    const followed = await mongo.collection('followers').findOne(follow);
    
    
    if (follow.followed == follow.follower || followed || !exist || follow.follower == follow.followed) {    
        res.status(403).send("Operazione non consentita");
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
    
    follow = {
        followed: parseInt(req.params.id),
        follower: decoded.id,
    };

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
var likes = async (req, res, decoded) => {
    const mongo = db.getDb();
    
    like = {
        msgID: parseInt(req.params.msgID),
        userID: decoded.id
    };
    
    const exist = await mongo.collection('messages').find({"msgID": parseInt(req.params.msgID)});
    const liked = await mongo.collection('like').findOne(like);
    
    if (liked || !exist){
        res.status(403).send("Operazione non consentita");
    } else {
        await mongo.collection("like").insertOne(like);
        res.status(200).send("Like inserito con successo");
    }
}

// Delete like by msgID
router.post("/social/like/:msgID", async (req, res) => {
    verify(req, res, likes);
});

var deleteLike = async (req, res, decoded) => {
    const mongo = db.getDb();
    
    like = {
        msgID: parseInt(req.params.msgID),
        userID: decoded.id
    };

    await mongo.collection("like").deleteOne(like);
    
    res.status(200).send("Like eliminato con successo");
}

router.delete("/social/like/:msgID", async (req, res) => {
    verify(req, res, deleteLike);
});

// Get like by msgID
router.get("/social/like/:msgID", async (req, res) => {
    const mongo = db.getDb();
    const likes = await mongo.collection('like').find({"msgID": parseInt(req.params.msgID)}).toArray();
    
    res.status(201).json(likes);
});

module.exports = router;