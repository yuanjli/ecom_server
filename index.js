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
const db = require('./models');
// const { Brand } = require('./models/brand');


// Set up middleware
// app.use(favicon(path.join(__dirname, 'public', favicon.ico)));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json({limit: '25mb'}));
app.use(bodyParser.urlencoded({extended: false}));




// Handling routes for the styles: 
// ===========================================
app.post('/service/product/style', (req, res)=>{
	console.log('this is the type of the new model:', typeof(db.Style));
	var style = new db.Style(req.body);

	style.save((err, doc)=>{
		if(err) return res.json({success:false, err});
		res.status(200).json({
			success: true,
			style: doc
		})
	})
})

app.get('/service/product/styles', (req, res)=>{
	db.Style.find({}, (err, styles)=>{
		if(err) return res.status(400).send(err);
		res.status(200).send(styles)
	})
})

// handling routes for the brand: 
// ===========================================
app.post('/service/product/brand', (req, res)=>{
	console.log('this is the type of the new model:', typeof(db.Brand));
	var brand = new db.Brand(req.body);

	brand.save((err, doc)=>{
		if(err) return res.json({success:false, err});
		res.status(200).json({
			success: true,
			brand: doc
		})
	})
})

app.get('/service/product/brands', (req, res)=>{
	db.Brand.find({}, (err, brands)=>{
		if(err) return res.status(400).send(err);
		res.status(200).send(brands)
	})
})

// handling routes for the products: 
// ===========================================
app.post('/service/product/item', (req, res)=>{
	const product = new db.Product(req.body);

	product.save((err,doc)=>{
		if(err) return res.json({success:false, err});
		res.status(200).json({
			success: true,
			item: doc
		})
	})
})

app.get('/service/product/items', (req, res)=>{
	db.Product.find({}, (err, products)=>{
		if(err) return res.status(400).send(err);
		res.status(200).send(products)
	})
})





// Controllers/auth routes for handling user:
// ===========================================
app.use('/auth', expressJWT({
	secret: process.env.JWT_SECRET,
	getToken: function fromRequest(req){
		if(req.body.headers.Authorization.split(' ')[0] === 'Bearer'){
			return req.body.headers.Authorization.split(' ')[1];
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

app.listen(process.env.PORT || 3002, ()=>{
	console.log('Server is running at 3002')
});
