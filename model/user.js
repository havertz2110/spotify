const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    phone:{
        type: String
    },
})
 
User.plugin(passportLocalMongoose);
 
module.exports = mongoose.model('user', User)