const express = require('express');
const db = require('./db.js');
const route = require('./route.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

app.use(express.static("public")); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:8080', 
    credentials: true}))

// Routing
app.use("/api", route);

app.listen(3000, () => {
    console.log('Listening on port 3000');
    db.connect();
    console.log('Connected to MongoDB');
})