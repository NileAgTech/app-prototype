var express = require('express');
var dbService = require('../dbService');
var router = express.Router();
const bcrypt = require('bcryptjs');
var axios = require('axios');
const ee = require('@google/earthengine');
var privateKey = require('../nile-tech-3c124847ed1a.json')
require("ee-runner")

/* Mongo DB options */
var url = 'mongodb://localhost:27017/';
var datab = 'app-prototype'
const saltRounds = 10;

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

    const user = await db.getUser(email);

    var lat = user.latitude
    var lon = user.longitude
    var coordinates = user.coordinates
    console.log(coordinates)

    ee.data.authenticateViaPrivateKey(
      privateKey,
      () => {
        ee.initialize(
            null, null,
            () => {
              console.log('Earth Engine client library initialized.');
            },
            (err) => {
              console.log(err);

            });
      },
      (err) => {
        console.log(err);
      });

    
   
    res.render('index',{coordinates: coordinates})

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

  const db = dbService.getDbServiceInstance();
  const message = await db.addMap(email,lat,lon,coordinates);


})

//get earth engine
// Define endpoint at /mapid.
router.get('/mapid', async (req, res) => {

  var image = ee.ImageCollection('COPERNICUS/S2_SR')
                .filterBounds(ee.Geometry.Point(-70.48, 43.3631))
                .filterDate('2019-01-01', '2019-12-31')
                .sort('CLOUDY_PIXEL_PERCENTAGE')
                .first();

  var url = image
    .visualize({bands:['B5', 'B4', 'B3']})
    .getThumbURL({dimensions:'1024x1024', format: 'jpg'});

  console.log(url)

  image.getMap({bands: ['B4', 'B3', 'B2'], min: 0, max: 2000}, function(map) {
    console.log(map);
    res.send(map)
  });

});

router.get('/satImgURL', async (req, res) => {

  var image = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(ee.Geometry.Point(-70.48, 43.3631))
    .filterDate('2021-01-01', '2021-04-20')
    .sort('CLOUDY_PIXEL_PERCENTAGE')
    .first();

  var date = ee.Date(image.get('system:time_start')).getInfo().value

  var url = image
    .visualize({bands:['B4', 'B3', 'B2'], gamma: 1.5})
    .getThumbURL({dimensions:'1024x1024', format: 'jpg'});

  console.log(url)
  console.log(date)
  res.send({url,date})

});

module.exports = router;
