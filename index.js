require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const formidable = require('express-formidable');
const cloudinary = require('cloudinary');

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

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE)


// app.use(favicon(path.join(__dirname, 'public', favicon.ico)));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json({limit: '25mb'}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})



// Models
const { User } = require('./models/user');
const { Brand } = require('./models/brand');
const { Style } = require('./models/style');
const { Product } = require('./models/product');

// Set up  Middlewares
const { auth } = require('./controllers/auth');
const { admin } = require('./controllers/admin');


//=================================
//             PRODUCTS
//=================================

app.post('/api/product/shop',(req,res)=>{

    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100; 
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    for(let key in req.body.filters){
        if(req.body.filters[key].length >0 ){
            if(key === 'price'){
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            }else{
                findArgs[key] = req.body.filters[key]
            }
        }
    }

    findArgs['publish'] = true;

    Product.
    find(findArgs).
    populate('brand').
    populate('style').
    sort([[sortBy,order]]).
    skip(skip).
    limit(limit).
    exec((err,articles)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({
            size: articles.length,
            articles
        })
    })
})


// BY ARRIVAL
// /items?sortBy=createdAt&order=desc&limit=4

// BY SELL
// /items?sortBy=sold&order=desc&limit=100&skip=5
app.get('/api/product/items',(req,res)=>{

    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? parseInt(req.query.limit) : 100;

    Product.
    find().
    populate('brand').
    populate('style').
    sort([[sortBy,order]]).
    limit(limit).
    exec((err,items)=>{
        if(err) return res.status(400).send(err);
        res.send(items)
    })
})


/// /api/product/item?id=HSHSHSKSK,JSJSJSJS,SDSDHHSHDS,JSJJSDJ&type=single
app.get('/api/product/items_by_id',(req,res)=>{
    let type = req.query.type;
    let items = req.query.id;

    if(type === "array"){
        let ids = req.query.id.split(',');
        items = [];
        items = ids.map(item=>{
            return mongoose.Types.ObjectId(item)
        })
    }

    Product.
    find({ '_id':{$in:items}}).
    populate('brand').
    populate('style').
    exec((err,docs)=>{
        return res.status(200).send(docs)
    })
});


app.post('/api/product/item',auth,admin,(req,res)=>{
    const product = new Product(req.body);

    product.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success: true,
            item: doc
        })
    })
})

//=================================
//              STYLES
//=================================

app.post('/api/product/style',auth,admin,(req,res)=>{
    const style = new Style(req.body);

    style.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success: true,
            style: doc
        })
    })
});

app.get('/api/product/styles',(req,res)=>{
    Style.find({},(err,styles)=>{
        if(err) return res.status(400).send(err);
        res.status(200).send(styles)
    })
})


//=================================
//              BRAND
//=================================

app.post('/api/product/brand',auth,admin,(req,res)=>{
    const brand = new Brand(req.body);

    brand.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success:true,
            brand: doc
        })
    })
})

app.get('/api/product/brands',(req,res)=>{
    Brand.find({},(err,brands)=>{
        if(err) return res.status(400).send(err);
        res.status(200).send(brands)
    })
})


//=================================
//              USERS
//=================================

app.get('/api/users/auth',auth,(req,res)=>{
        res.status(200).json({
            isAdmin: req.user.role === 0 ? false : true,
            isAuth: true,
            email: req.user.email,
            name: req.user.name,
            lastname: req.user.lastname,
            role: req.user.role,
            cart: req.user.cart,
            history: req.user.history
        })
})

app.post('/api/users/register',(req,res)=>{
    const user = new User(req.body);

    user.save((err,doc)=>{
        if(err) return res.json({success:false,err});
        res.status(200).json({
            success: true,
            user: doc
        })
    })
});

app.post('/api/users/login',(req,res)=>{
    console.log(req.body.email);
    User.findOne({'email':req.body.email},(err,user)=>{
        if(!user) return res.json({loginSuccess:false,message:'Auth failed, email not found'});

        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch) return res.json({loginSuccess:false,message:'Wrong password'});

            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err);
                res.cookie('w_auth',user.token).status(200).json({
                    loginSuccess: true,
                    user: user
                })
            })
        })
    })
})


app.get('/api/users/logout',auth,(req,res)=>{
    User.findOneAndUpdate(
        { _id:req.user._id },
        { token: '' },
        (err,doc)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success: true,
                user: doc
            })
        }
    )
})

app.post('/api/users/uploadimage',auth,admin,formidable(),(req,res)=>{
    cloudinary.uploader.upload(req.files.file.path,(result)=>{
        console.log(result);
        res.status(200).send({
            public_id: result.public_id,
            url: result.url
        })
    },{
        public_id: `${Date.now()}`,
        resource_type: 'auto'
    })
})

app.get('/api/users/removeimage',auth,admin,(req,res)=>{
    let image_id = req.query.public_id;

    cloudinary.uploader.destroy(image_id,(error,result)=>{
        if(error) return res.json({succes:false,error});
        res.status(200).send('ok');
    })
})

app.post('/api/users/update_profile',auth,(req,res)=>{

    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            "$set": req.body
        },
        { new: true },
        (err,doc)=>{
            if(err) return res.json({success:false,err});
            return res.status(200).send({
                success:true
            })
        }
    );
})



// wild card route
app.get('*', function(req, res, next) {
	res.send({ message: 'Unkown Route' });
});

app.listen(process.env.PORT || 3002, ()=>{
	console.log('Server is running at 3002')
});

