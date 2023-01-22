const express = require('express');
const app = express();
const mongoose = require("mongoose");
const ejs = require('ejs');
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");

const User = require("./models/user");
const Vote = require('./models/votes');
const { json } = require('body-parser');
mongoose.set("strictQuery", true);

require("dotenv").config()
const DB_USERNAME=process.env.DB_USERNAME
const DB_PASSWORD=process.env.DB_PASSWORD

//Connecting database
try {
    console.log("Attempting to establish connection.");
    mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@online-voting-system-cl.hyhqlkr.mongodb.net/data?retryWrites=true&w=majority`);
    console.log("Connected to DB!!!");
} catch(err) {
    console.log("Could not connect to DB.");
}

app.use(require("express-session")({
    secret: "Any normal Word",       //decode or encode session
    resave: false,
    saveUninitialized: false
}));

passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded(
    { extended: true }
))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(passport.initialize());
app.use(passport.session());

/*
=======================
    R O U T E S
=======================
*/

app.get("/userprofile", isLoggedIn, (req, res) => {
    res.render("userprofile");
})

//Auth Routes
app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async(req, res)=>{
    let username=req.body.username;
    let password=req.body.password
    let party=req.body.party;
    party=party.trim()

    let temp=party;
    party="";
    const len=temp.length;
    for(let i=0; i<len; i++) {
        if(temp.charAt(i) !== ' ')
           party+=temp.charAt(i);
    }

    party=party.toUpperCase();
    username=username.trim();

    console.log(JSON.stringify({username: username, party: party}))

    const doc= await User.findOne({username: username, password: password}).exec();
    if(doc != null) {
        console.log("Logged in as ", await doc.name);
        if(await doc.voted == false) {
            const record= await Vote.findOne({name: party}).exec();
            const x=await record.voteCount;
            console.log("Prev vote count: ", x);
            await Vote.updateOne({name: party}, {$set: { voteCount : x + 1 }});
            await User.updateOne({username: username, password: password}, {$set: { voted: true }}).exec();
            console.log("Successfully voted !!");
        } else {
            console.log("You have already voted!");
        }
    } 
    else {
        console.log("No user found with these details.")
        console.log(JSON.stringify({username: username}));
    }
    res.redirect("/");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async(req, res) => {
    await User.create({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        age: req.body.age,
        voted: false
    });

    console.log("User created !!");
    console.log(JSON.stringify({name: req.body.name, age: req.body.age}));

    res.redirect("/login");
})

app.get('/', (req, res) => {
    res.render('index', { page: 'index' })
})

app.get('/vote', (req, res) => {
    res.render('vote', { page: 'vote' })
})

app.get('/contact', (req, res) => {
    res.render('contact', { page: 'contact' })
})

app.get('/admin_login', (req, res) => {
    res.render('admin_login', { page: 'admin_login' })
})

app.post("/admin_login", (req, res) => {

    User.register(new User({ username: req.body.username, password: req.body.password }), function (err, user) {
        if (err) {
            console.log(err);
            res.render("error");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/login");
        })
    })
})

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("vote");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

//Listen On Server
const PORT=process.env.PORT || 3000
app.listen(PORT, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server running at port ${PORT}`);
    }
});