var express = require('express');
var dbService = require('../dbService');
var router = express.Router();
const bcrypt = require('bcryptjs');
var axios = require('axios');

/* Mongo DB options */
var url = 'mongodb://localhost:27017/';
var datab = 'app-prototype'
const saltRounds = 10;

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// welcome page
router.get('/welcome', async (req,res) => {
  res.render('welcome')
})


/* GET login page. */
router.get('/', async (req, res) => {
  res.render('welcome');
});

//get index
router.get('/index',	async (req,res) => {  res.render('index');	});
router.get('/login',	async (req,res) => {  res.render('login');	});
router.get('/signup',	async (req,res) => {  res.render('signup');	});
router.get('/forgot',	async (req,res) => {  res.render('forgot');	});
router.get('/menu',		async (req,res) => {  res.render('menu');	});
router.get('/welcome',	async (req,res) => {  res.render('welcome');});
router.get('/map',		async (req,res) => {  res.render('map');	});
router.get('/weather',	async (req,res) => {  res.render('weather');	});
router.get('/location',	async (req,res) => {  res.render('location');	});


// signup
router.post('/signup', async (req, res) => {

  //get username and password
  const email = req.body.email

  //check if email exists
  if (email === null){
    res.render('signup', {message: "Please Enter a valid email"});
  }

  if (req.body.password === null){
    res.render('signup', {message: "Please Enter a valid email"});
  }



  const passwordHash = await bcrypt.hash(req.body.password, saltRounds)
  const db = dbService.getDbServiceInstance();

  const message = await db.registerUser(email,passwordHash);

  if (message === null){
    res.render('location', {email: email});
  }
  else {
    res.render('signup', {message: message});
  }

})


// login
router.post('/login', async (req, res) => {
  email = req.body.email
  
  const db = dbService.getDbServiceInstance();
  const message = await db.signIn(email,req.body.password);

  if (message === null){

    res.redirect('index')

  } else{

    res.render('login', {message: message})

  }

})

//create map

router.post('/createmap', async (req, res) => {
  
  let group = Object.keys(req.body);
  group = JSON.parse(group)

  email = group[0]
  lat = group[1]
  lon = group[2]
  coordinates = group[3]
  console.log(coordinates)

  //create new polygon
  var api_key = '92746ad71c2ebfbb81d42d2ed6d152ff';
  var id = makeid(7)
  console.log(id)

  json = {

    "name": id,
    "geo_json" : {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                  coordinates[0],coordinates[1],coordinates[2],coordinates[3],coordinates[0]
                ]
            ]
        }
    }
}

  const resp = await axios.post(`http://api.agromonitoring.com/agro/1.0/polygons?appid=${api_key}`, json, {
      headers: {'Content-Type': 'application/json'}
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    })

  console.log(resp)
  polyID = group

  const db = dbService.getDbServiceInstance();
  const message = await db.addMap(email,lat,lon,coordinates);


})



module.exports = router;
