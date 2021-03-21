var MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');

const url = 'mongodb://localhost:27017/';
let instance = null;

try {

    MongoClient
        .connect(url, { 
            useUnifiedTopology: true 
        })
        .then(client => {
            console.log('Connected to Database')
            const db = client.db('app-prototype')
            const usersCol = db.collection('users')
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

            check = await usersCol.findOne({"email": email})
            if (check === null){
      
                var user = {
                    "email" : email,
                    "password": passwordHash
                }

                await usersCol.insertOne(user)
                return user;
            }

        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async signIn(email, passwordHash){
        try {

            user = await usersCol.findOne({"email": email})
            var password = user.password
            const passwordMatches = await bcrypt.compare(passwordHash, password);
            if (passwordMatches){
                return user;
            }

        } catch (error) {
            console.log(error);
            return error;
        }
    }
}

module.exports = DbService;