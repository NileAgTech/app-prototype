var MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');

const url = 'mongodb://localhost:27017/';
let instance = null;

var usersCol;
var db;

try {

    MongoClient
        .connect(url, { 
            useUnifiedTopology: true 
        })
        .then(client => {
            console.log('Connected to Database')
			db = client.db('app-prototype')
			usersCol = db.collection('users')
    });

} catch (error){
    console.log("DB Connect Error:", error);
}

class DbService {
    static getDbServiceInstance(){
        return instance ? instance : new DbService();
    }

    async registerUser(email, passwordHash){
        try {

            //check if user exists
            var check = await usersCol.findOne({"email": email})

            //create new user
            if (check === null){
      
                var user = {
                    "email" : email,
                    "password": passwordHash
                }

                await usersCol.insertOne(user)
                return null;

            //if user already exists
            } else {
                return "User already exists"
            }

        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async signIn(email, enteredPassword){
        try {

            //pull user from database
            var user = await usersCol.findOne({"email": email})

            if (user){

                var password = user.password
                console.log(user)
                console.log(user.password)
                const passwordMatches = await bcrypt.compare(enteredPassword, password);
                if (passwordMatches){
                    return null
                } else{
                    return "Incorrect password"
                }

            } else{
                return "Username not found"
            }

        } catch (error) {
            console.log(error);
            return error;
        }
    }

    /*
    async addMap()
    */



}

module.exports = DbService;
