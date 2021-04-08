var express = require('express');
var dbService = require('../dbService');
var router = express.Router();
const bcrypt = require('bcryptjs');
var axios = require('axios');

/* Mongo DB options */
var url = 'mongodb://localhost:27017/';
var datab = 'app-prototype'
const saltRounds = 10;

//satillite api 
var spectatorKey = '29d8ad412c96e1d63a431fb1add3ce53fd1a135e150eca4c28a31a1f56c3867c'

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

    //fetch satillite api
    //
    var bboxArrray = [coordinates[2][1], coordinates[0][0],coordinates[0][1],coordinates[2][0]]
    var bbox = bboxArrray.toString()
    console.log(bbox)
    console.log(lat)
    console.log(lon)

    var url = 'https://api.spectator.earth/imagery/?api_key='+spectatorKey+'&bbox='+bbox

    console.log(url)
    
    axios.get(url)
    .then(response => {
      var imgData = response.data
      var MostRecent = imgData['results'][0]['id']
      var ImgUrl = imgData['results'][4]['download_url'] + 'preview.jpg/?api_key=' + spectatorKey

      console.log(ImgUrl)

    });


    // Get satillite image

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

  const db = dbService.getDbServiceInstance();
  const message = await db.addMap(email,lat,lon,coordinates);


})



module.exports = router;
