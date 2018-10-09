// Mongoose require and connect 
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/ecom', { useNewUrlParser: true });

// Deprecation warning: https://github.com/Automattic/mongoose/issues/6922
mongoose.set('userCreateIndex', true);

// Include models from this folder
module.exports.User = require('./user');