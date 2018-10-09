require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const cors = require('cors');
const expressJWT = require('express-jwt');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');

// App instance
const app = express();

const mongoose = require('mongoose');

// Set up middleware
// app.use(favicon(path.join(__dirname, 'public', favicon.ico)));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json({limit: '25mb'}));
app.use(bodyParser.urlencoded({extended: false}));


// Controllers
app.use('/auth', expressJWT({
	secret: process.env.JWT_SECRET,
	gotToken: function fromRequest(req){
		if(req.body.headers.Authorization.split('')[0] === 'Bearer'){
			return req.body.headers.Autherization.split('')[1];
		}
		return null;
	}
}).unless({
	path:[
		{ url: '/auth/login', methods: ['POST'] },
		{ url: '/auth/signup', methods: ['POST'] }
	]	 // those two path are not protected. all the other routes are protected.
}), require('./controllers/auth'));

// wild card route
app.get('*', function(req, res, next) {
	res.send({ message: 'Unkown Route' });
});

app.listen(process.env.PORT || 3002);
