require('dotenv').config();   //require the variable from the .env
const express = require('express');
const jwt = require('jsonwebtoken');    // allowing us to the functionality from the jsonwebtoken, 
// const mongoose = require('mongoose');

const db = require('../models');
const router = express.Router();

// POST /auth/login route - returns a JWT
router.post('/login', (req, res) => {
  console.log(req.body);
  // Find out if the user exists (for login, they should)
  db.User.findOne({email: req.body.email})
  .then((user) => {
    if(!user || !user.password){
      return res.status(403).send('User not found');
    }

    // The user exists. Now, we want to validate their password
    if(!user.authenticated(req.body.password)){
      // User is invalid
      return res.status(401).send('Invalid Credentials.');
    }

    // The user is valid!!! :)
    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {     // sign a new token to the user
      expiresIn: 60 * 60 * 24       // 60 seconds times 60 and times 24 seconds is 24 hours 
    });

    // Send that token and the user info
    res.send({ user: user, token: token });    // I can delete the user here
  })
  .catch((err) => {
    console.log('error was', err);
    return res.status(503).send('Database Error. Sad day. :(');
  });
});





// POST /auth/signup route - create a user in the DB and then log them in
router.post('/signup', function(req, res) {
  console.log('BODY', req.body);
  // console.log('REST', req)
  //TODO: First check if the user already exists
  db.User.findOne({ email: req.body.email })
  .then((user) => {
    // Database call was a success
    if(user){
      // If the user exists already, don't let them create a duplicate account. Instead they should log in.
      return res.status(400).send('User exists already!');
    }

    // Great! This is a new user. Let's make them an account!
    db.User.create(req.body)
    .then((createdUser) => {
      // Make a token and send it as JSON, so the user can remain logged in
      const token = jwt.sign(createdUser.toJSON(), process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24 // 24 hours, in seconds
      });

      res.send({ user: createdUser, token: token })       // I can delete the current user here 
    })
    .catch((err) => {
      console.log('err', err);
      res.status(500).send('Could not create user in DB');
    });
  })
  .catch((err) => {
    console.log('err', err);
    res.status(500).send('Database Error! :(');
  });
});





// This is checked on a browser refresh
// this is what is returned when client(react) queries for new user data 
router.post('/me/from/token', function(req, res) {
  console.log('this is hitting this route!');
  db.User.findById(req.user.id)
  .then(function(user){
    res.send({ user: user });
  })
  .catch(function(err){
    console.log(err);
    res.send({ user: null, error: 'server error' });
  });
});

module.exports = router;


