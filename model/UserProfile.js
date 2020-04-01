var UserConnection = require('../model/UserConnection');
//var connection = require('./connection');
var userConnectionDB = require('../model/userConnectionDB');
var connectionDB= require('../model/connectionDB');


class UserProfile {
   constructor(user) {
    this.User=user;
    this.userConnectionList=[];
  }

 getConnections() {
 return this.userConnectionList;
}
 emptyProfile(){
  this.userConnectionList = [];
  this.User = null;
}


checkIfExists(connectionId){
  var exist = 0;
  for(var i=0; i< this.userConnectionList.length; i++ ){
    if(this.userConnectionList[i].Connection.connectionID === connectionId){
      exist = 1;
    }
  }
  return exist ;
}

 getConnection(connectionId){
  var connection;
  if(this.userConnectionList[i].connection.connectionID === connectionId){
    connection = this.userConnectionList[i].connection;
  }
  return connection;
}
}



module.exports = UserProfile;
