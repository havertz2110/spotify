const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./model/user');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
let app = express();
const crypto = require('crypto');
app.use(express.static(__dirname + '/public'));

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://22520039:JaVHhoJmN7iHt9Sr@scopify.9dlayjt.mongodb.net/users');

var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
	console.log("connection succeeded");
})

const axios = require('axios');
const qs = require('qs');
const clientId = 'c97357a5eaff4fb984809b2c766159b1';
const clientSecret = '859efe96b2834a77b759d3a755d7347d';
const auth = 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64');
let token = '';
const getToken = async () => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: qs.stringify({grant_type: 'client_credentials'}),
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    token = response.data.access_token;
    console.log('Token:', token); // Log để kiểm tra token
  } catch (error) {
    console.error('Error in getToken:', error.response ? error.response.data : error.message);}
};

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

//showing shazam
app.get("/shazam", function (req, res) {
  res.render("shazam");
});

app.get("/subscription", function (req, res) {
  res.render("subscription");
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.render("search");
  }
  await getToken();
  const data = await search(query);
  // res.render("search", { data });
  res.json(data); // Trả về dữ liệu dạng JSON
});

//handling user sign up
app.post('/register', function(req,res){
var name = req.body.name;
var pass = req.body.password;
// Tạo salt
const salt = crypto.randomBytes(16).toString('hex');

// Băm mật khẩu với salt
const hashedPassword = crypto.createHmac('sha256', salt).update(pass).digest('hex');
var data = {
  "name": name,
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
      return res.json({success: true});
        } else {
      
          return res.json({ error: "Password doesn't match" });
        }
      } 
      else {
        return res.json({ error: "User doesn't exist" });
      }
    } catch (error) {
      return res.json({ error });
    }
});

app.get("/main", function (req, res) {
  res.render("main");
});


// Route to handle recording and identifying song
app.post('/identify-song', (req, res) => {
  const scriptPath = path.join(__dirname, 'shazam', 'listen.py');

  exec(`python ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ error: `Error identifying song: ${stderr}` });
      }
      res.json({ song: stdout.trim() });
  });
});

const search = async (query) => {
  try {
    const response = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album`,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    console.log('Search Response:', response.data); // Log để kiểm tra dữ liệu trả về
    return response.data;
  } catch (error) {
    console.error('Error in search:', error.response ? error.response.data : error.message);
  }
}



 
let port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});