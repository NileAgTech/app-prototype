var MongoClient = require("mongodb").MongoClient;
const bcrypt = require("bcryptjs");

const url = process.env.MONGO_CONNECTION_STRING
let instance = null;

var usersCol;
var sessionsCol;
var db;

try {
  MongoClient.connect(url, {
    useUnifiedTopology: true,
  }).then((client) => {
    console.log("Connected to Database");
    db = client.db("app-prototype");
    usersCol = db.collection("users");
    sessionsCol = db.collection("sessions");
  });
} catch (error) {
  console.log("DB Connect Error:", error);
}

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  async registerUser(email, passwordHash) {
    try {
      //check if user exists
      var check = await usersCol.findOne({ email: email });

      //create new user
      if (check === null) {
        var user = {
          email: email,
          password: passwordHash,
        };

        await usersCol.insertOne(user);
        return null;

        //if user already exists
      } else {
        return "User already exists";
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async registerSession(email, sessionToken) {
    try {
      //check if session exists
      var check = await sessionsCol.findOne({ email: email });

      //create new session if first session
      if (check === null) {
        var session = {
          email: email,
          token: sessionToken,
        };

        await sessionsCol.insertOne(session);

        //otherwise, update session
      } else {
        var newItem = {
          token: sessionToken,
        };

        await sessionsCol.updateOne({ email: email }, { $set: newItem });
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async findSession(sessionToken) {
    try {
      //check if session exists
      var session = await sessionsCol.findOne({ token: sessionToken });

      //create new session if first session
      if (session === null) {
        return null;
      } else {
        return session;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async signIn(email, enteredPassword) {
    try {
      //pull user from database
      var user = await usersCol.findOne({ email: email });

      if (user) {
        var password = user.password;
        console.log(user);
        console.log(user.password);
        const passwordMatches = await bcrypt.compare(enteredPassword, password);
        if (passwordMatches) {
          return null;
        } else {
          return "Incorrect password";
        }
      } else {
        return "Username not found";
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async addMap(email, lat, long, bbox, points) {
    try {
      var newItem = {
        latitude: lat,
        longitude: long,
        bbox: bbox,
        points: points,
      };

      await usersCol.updateOne({ email: email }, { $set: newItem });
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getUser(email) {
    try {
      var user = await usersCol.findOne({ email: email });
      return user;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

module.exports = DbService;
