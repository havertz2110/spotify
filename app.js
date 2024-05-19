const express = require("express"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = 
        require("passport-local-mongoose")
const User = require("./model/user");
let app = express();
const crypto = require('crypto');
app.use(express.static(__dirname + '/public'));
const http = require('http');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const client_id = 'e65ad95dae4045be8a9ae3ae90c9c8d4';
const client_secret = 'bca74f5b89984c2eaf0de643a2644cab';
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://22520039:JaVHhoJmN7iHt9Sr@scopify.9dlayjt.mongodb.net/users');

var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
	console.log("connection succeeded");
})


app.set("view engine", "ejs");
app.use(require("express-session")({
    secret: "meow meoww",
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.use(passport.initialize());
app.use(passport.session());
 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//=====================
// ROUTES
//=====================


async function getToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
    },
  });

  const data = await response.json();
  return data.access_token;
}




// Showing home page
app.get("/", function (req, res) {
    res.render("home");
});

// Showing payment page
app.get("/payment", function (req, res) {
  res.render("payment");
});

app.get("/playlist", function (req, res) {
  res.render("playlist");
});
// Showing signup form
app.get("/register", function (req, res) {
  res.render("register");
});

//Showing login form
app.get("/login", function (req, res) {
  res.render("login");
});


//handling user sign up
app.post('/register', function(req,res){
var name = req.body.name;
var email =req.body.email;
var phone =req.body.phone;
var pass = req.body.password;
// Tạo salt
const salt = crypto.randomBytes(16).toString('hex');

// Băm mật khẩu với salt
const hashedPassword = crypto.createHmac('sha256', salt).update(pass).digest('hex');
var data = {
  "name": name,
  "email":email,
  "phone":phone,
  // "password": pass,
  "password": hashedPassword,
  "salt": salt
}
db.collection('details').insertOne(data,function(err, collection){
  if (err) throw err;
  console.log("Record inserted Successfully");
    
});
return  res.render("register_success");
})



//Handling user login
app.post("/login", async function(req, res){
  try {
      // check if the user exists
      const detailsCollection = db.collection('details');
      const user = await detailsCollection.findOne({ name:req.body.name});
     
      if (user) {
     // Lấy salt từ người dùng trong cơ sở dữ liệu
     const salt = user.salt;

     // Băm mật khẩu nhập vào với salt
     const hashedPassword = crypto.createHmac('sha256', salt).update(req.body.password).digest('hex');
      const result = hashedPassword === user.password;
     if (result) {
       res.redirect('/main');
        } else {
      
          res.status(400).json({ error: "password doesn't match" });
        }
      } 
      else {
        res.status(400).json({ error: "User doesn't exist" });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
});

app.get("/main", function (req, res) {
  res.render("main");
});







 
let port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});