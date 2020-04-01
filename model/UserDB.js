var mongoose=require('mongoose');
var crypto = require('crypto');
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/MyEvents', {useNewUrlParser: true});

var Schema = mongoose.Schema;

var userSchema= new Schema({
    userId: String,
    firstName: String,
    lastName: String,
    emailAddress: String,
    salt:String,
    hash:String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
});

var userDB=mongoose.model('users', userSchema);
module.exports.userDB=userDB;


module.exports.getUsers=async function(){
  return new Promise(resolve =>{
        resolve(userDB.find({}).then(function(users){
          return users;
        })
      );
    });
}



module.exports.getUser=function(userName){
  return new Promise(resolve =>{
        resolve(userDB.find({firstName:userName}).then(function(user){
          return user;
        })
      );
    });
}

module.exports.getUserbyId=function(userID){
  return new Promise(resolve =>{
        resolve(userDB.find({userId:userID}).then(function(user){
          return user;
        })
      );
    });
}

module.exports.addUser =async function(user){
  var salt = this.generateSalt(user.password);
  var hash = this.getHash(user.password,salt);
  console.log("salt",salt);
  console.log("hash",hash);
  var newUser = {"userId":user.userId,"firstName":user.firstName,"lastName":user.lastName,"emailAddress":user.emailAddress,
        "salt":salt,
        "hash":hash,
        "address1": user.address1,
        "address2": user.address2,
        "city":user.city,
        "state":user.state,
        "zipCode":user.zipCode,
        "country":user.country };
  return new Promise(resolve =>{
        resolve(userDB.collection.insertOne(newUser).then(function(data){
          return data;
        })
      );
    });
}
//generating hash for given salt and password
module.exports.getHash = function(password,salt) {
    var hash = crypto.pbkdf2Sync(password,salt, 1000, 64, 'sha512').toString('hex');
    return hash;
};

module.exports.generateSalt = function(password) {
 // Creating a unique salt for a particular user
    var salt = crypto.randomBytes(16).toString('hex');
    return salt;
};


































// //rsvp values for default printing
// var rsvp = {
//     Yes: "Yes",
//     No: "No",
//     Maybe: "Maybe",
// };
//
//

// module.exports.getUsers = function () {   //return all users
//     let users = [];
//     for (let i = 0; i < userdata.length; i++) {
//         let user =  User.userDetails(
//             userdata[i].userId,
//             userdata[i].firstName,
//             userdata[i].lastName,
//             userdata[i].emailAddress,
//             userdata[i].address1,
//             userdata[i].address2,
//             userdata[i].city,
//             userdata[i].state,
//             userdata[i].zipCode,
//             userdata[i].country);
//
//             users.push(user);
//
//     }
//     return users;
// };
//
// var UserConnection1 =  UserConnection.userConnection(
//     connectionDB.getConnection('A3').connectionName,
//     rsvp.Yes,
//     connectionDB.getConnection('A3').connectionTopic,
//     connectionDB.getConnection('A3').connectionID,
//     1
// );
// var UserConnection2 = UserConnection.userConnection(
//   connectionDB.getConnection('B2').connectionName,
//   rsvp.No,
//   connectionDB.getConnection('B2').connectionTopic,
//   connectionDB.getConnection('B2').connectionID,
//   1
// );
//
// var connections = [UserConnection1, UserConnection2]; //hardcoding some connection details for userprofile
// //var defaultConnections = [];
//
// //Default user and default UserProfile
// var DefaultUser = User.userDetails("0",
//  "Joker",
//  "Joker",
//  "joker@gmail.com",
//  "128",
//  "F",
//  "New york",
//  "NY",
//  "23456",
//  "US");
// module.exports.DefaultProfile = new UserProfile(DefaultUser.userId, connections);// Default user profile
// module.exports.connections = connections;
//
//
//
// module.exports.getSize = function () {
//     return userdata.length;
// }
