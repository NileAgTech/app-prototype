var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
const co = require('co');
const bcrypt = require('bcrypt');

var url = 'mongodb://localhost:27017/';
var datab = 'app-prototype'
const saltRounds = 10;

/* GET login page. */
router.get('/', async (req, res) => {
  res.render('login', { title: 'Express' });
});

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

  //check db to see if user already exists
  co(function*(){

    let client = yield MongoClient.connect(url)
    const db = client.db(datab)
    let usersCol = db.collection('users')

    check = yield usersCol.findOne({"email": email})

    if (check === null){
      
      var item = {
        "email" : email,
        "password": passwordHash
      }

      yield usersCol.insertOne(item)

      res.render('login')

    } else {
      
      //TODO: create error messgae

      res.render('signup')
    }

  })

})

router.post('/login', async (req, res) => {


  email = req.body.email

  co(function*(){

    let client = yield MongoClient.connect(url)
    const db = client.db(datab)
    let usersCol = db.collection('users')

    check = yield usersCol.findOne({"email": email})
    var password = check.password
    const passwordMatches = yield bcrypt.compare(req.body.password, password);

    console.log(passwordMatches)

    if (passwordMatches){

      res.redirect('index')

    }

  })

})


module.exports = router;
