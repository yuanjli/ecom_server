require('dotenv').config();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 99
  },
  lastname: {
    type:String,
    required:true,
    minlength: 1,
    maxlength: 99
  },
  email: { // TODO: Need to add email validation
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 99
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 99
  },
  cart: {
    type:Array,
    default: []
  },
  history: {
    type:Array,
    default: []
  },
  role: {
    type:Number,
    default:0
  },
  token: {
    type:String
  }
});

// Before save password, hash the password
userSchema.pre('save',function(next){
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(10,function(err,salt){
            if(err) return next(err);
    
            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password = hash;
                next();
            });
        })
    } else{
        next()
    }
})

userSchema.methods.comparePassword = function(candidatePassword,cb){
    bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch)
    })
}


userSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),process.env.JWT_SECRET)

    user.token = token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

userSchema.statics.findByToken = function(token,cb){
    var user = this;

    jwt.verify(token,process.env.JWT_SECRET,function(err,decode){
        user.findOne({"_id":decode,"token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })
}

// module.exports = mongoose.model('User', userSchema);

const User = mongoose.model('User',userSchema);
module.exports = { User }
