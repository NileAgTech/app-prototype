var express = require('express');
var router = express.Router();
var dbService = require('../dbService');
const bcrypt = require('bcryptjs');
const ee = require('@google/earthengine');
const { v4: uuidv4 } = require('uuid');
const User = require('../User');
const eeService = require('../eeService')

let getUserBySession = token => users.find(user => user.cookie === token);

const requireAuth = (req, res, next) => {
  const sessionToken = req.cookies.sessionToken;
  console.log(sessionToken)
  //find session
  const db = dbService.getDbServiceInstance();
  var user = db.findSession(sessionToken)
  
  if (!user) {
      res.status(401).redirect('/login');
      return;
  }
  next();
};


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
router.get('/index',	requireAuth, async (req,res) => {  res.render('index');	});
router.get('/login',	async (req,res) => {  res.render('login');	});
router.get('/signup',	async (req,res) => {  res.render('signup');	});
router.get('/forgot',	async (req,res) => {  res.render('forgot');	});
router.get('/menu',		async (req,res) => {  res.render('menu');	});
router.get('/welcome',	async (req,res) => {  res.render('welcome');});
router.get('/map',		async (req,res) => {  res.render('map');	});
router.get('/weather',	requireAuth, async (req,res) => {  res.render('weather');	});
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

    const sessionToken = uuidv4();
    db.registerSession(email, sessionToken)

    res.cookie('sessionToken', sessionToken);

    res.redirect('index')

  } else{

    res.status(401).render('login', {message: message})

  }

})

//create map

router.post('/createmap', async (req, res) => {
  
  let group = Object.keys(req.body);
  group = JSON.parse(group)

  email = group[0]
  lat = group[1]
  lon = group[2]
  bbox = group[3]
  points = group[4]

  const db = dbService.getDbServiceInstance();
  const message = await db.addMap(email,lat,lon,bbox, points);


})

//get earth engine
// Define endpoint at /mapid.
router.get('/getVideoURL', async (req, res) => {

  const sessionToken = req.cookies.sessionToken;
  console.log(sessionToken)
  const user = getUserBySession(sessionToken)
  const db = dbService.getDbServiceInstance();
  const userObj = await db.getUser(email);

  var latitude = userObj.latitude
  var longitude = userObj.longitude
  var userbbox = userObj.bbox
  var points = userObj.points

  var aoi = ee.Geometry.Polygon(
    [[points[0],points[1],points[2],points[3]]], null,
    false);

  var tempCol = ee.ImageCollection('NOAA/GFS0P25')
    .filterDate('2018-01-01', '2019-01-01')
    .limit(24)
    .select('temperature_2m_above_ground');

  // Define arguments for animation function parameters.
  var videoArgs = {
    dimensions: 768,
    region: aoi,
    framesPerSecond: 7,
    crs: 'EPSG:3857',
    min: -40.0,
    max: 35.0,
    palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red']
};

  console.log(tempCol.getVideoThumbURL(videoArgs));
  res.send(tempCol.getVideoThumbURL(videoArgs))

});

router.get('/satImgURL', async (req, res) => {

  const sessionToken = req.cookies.sessionToken;
  console.log(sessionToken)
  const user = getUserBySession(sessionToken)


  const db = dbService.getDbServiceInstance();
  const userObj = await db.getUser(email);

  var latitude = userObj.latitude
  var longitude = userObj.longitude
  var userbbox = userObj.bbox

  var image = ee.ImageCollection('LANDSAT/LC08/C01/T1_RT')
    .filterBounds(ee.Geometry.BBox(userbbox[0],userbbox[1],userbbox[2],userbbox[3]))
    .filterDate('2021-01-01', '2021-04-27')
    .sort('system:time_start', false)
    .first();

  var date = ee.Date(image.get('system:time_start')).getInfo().value

  var url = image
    .clip(ee.Geometry.BBox(userbbox[0],userbbox[1],userbbox[2],userbbox[3]))
    .visualize({bands:['B4', 'B3', 'B2'], gamma: 1.5})
    .resample('bicubic')
    .getThumbURL({dimensions:'2000x2000', format: 'jpg'});

  console.log(url)
  console.log(date)
  res.send({url,date})

});

module.exports = router;
