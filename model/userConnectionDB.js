
var connectionDB = require('../model/connectionDB');
//var connection=require('./connectionDB.js')
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/MyEvents', {useNewUrlParser: true});
var db = mongoose.connection;
var Schema = mongoose.Schema;
var userConnectionsSchema = new Schema({
      userId : String,
      connectionID:String,
      rsvp:String
});

var connectionDB=mongoose.model('connections',connectionDB.connectionSchema)
var userConnectionsDB = mongoose.model('userconnections',userConnectionsSchema);

module.exports.getUserProfile =  function(userID){
  return new Promise(resolve =>{
        resolve(userConnectionsDB.find({userId: userID}).then(function(connections){
          return connections;
        })
      );
    });
}

module.exports.updateRSVP= async function(connectionID, userID, rsvp){
  var userConnection = {"userId":userID,"connectionID":connectionID,"rsvp":rsvp};
  return new Promise(resolve =>{
        resolve(userConnectionsDB.updateOne({connectionID:connectionID, userId:userID},userConnection).then(function(data){
          return data;
        })
      );
    });
}

module.exports.addRSVP= async function(connectionID, userID, rsvp,connection){
  var userConnection = {"userId":userID,"connectionID":connectionID,"rsvp":rsvp};
  return new Promise(resolve =>{
        resolve(userConnectionsDB.collection.insertOne(userConnection).then(function(data){
          return data;
        })
      );
    });
}

module.exports.getUserConnection= async function (connID){
     return  new Promise(resolve =>{
          resolve(userConnectionsDB.find({"connectionID":connID}).then(function(connection){
            return connection;
          })
        );
      });
  };


module.exports.removeRSVP= async function(connectionID, userID){
  return new Promise(resolve =>{
        resolve(userConnectionsDB.deleteOne({connectionID:connectionID, userId:userID}).then(function(data){
          return data;
        })
      );
    });
}

module.exports.removeRSVPbyconnId= async function(connectionID){
  return new Promise(resolve =>{
        resolve(userConnectionsDB.deleteMany({connectionID:connectionID}).then(function(data){
          return data;
        })
      );
    });
}


module.exports.addConnection =async function(connection,userID){
  var defaultimageurl = "../assets/images/default.jpg"
  var newConnection = {"connectionID":connection.ID,"userId":userID,"connectionName":connection.name,"connectionTopic":connection.topic,"details":connection.detail,
        "date":connection.date,
        "time":connection.time,
        "image":defaultimageurl,  /////////check once
        "venue":connection.location};
  return new Promise(resolve =>{
        resolve(connectionDB.collection.insertOne(newConnection).then(function(data){
          return data;
        })
      );
    });
}
