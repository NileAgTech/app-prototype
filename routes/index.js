var express = require('express');
var dbService = require('../dbService');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');

var url = 'mongodb://localhost:27017/';
var datab = 'app-prototype'
const saltRounds = 10;

/* GET login page. */
router.get('/', async (req, res) => {
  res.render('login', { title: 'Express' });
});

//get index
router.get('/index',async (req, res) => {
  res.render('index');
});

router.get('/signup', async (req,res) => {
  res.render('signup')
})

router.post('/signup', async (req, res) => {

  //get username and password
  email = req.body.email
  const passwordHash = await bcrypt.hash(req.body.password, saltRounds)
  const db = dbService.getDbServiceInstance();

  const result = await db.registerUser(email,passwordHash);

  if (result){
    res.render('login')
  }
  else {
    res.render('signup')
  }

})

router.post('/login', async (req, res) => {

  email = req.body.email
  const passwordHash = await bcrypt.hash(req.body.password, saltRounds)
  
  const db = dbService.getDbServiceInstance();
  const result = await db.signIn(email,passwordHash);

  if (result){
    res.redirect('index')
  } else{
    res,render('login')
  }

})


module.exports = router;
