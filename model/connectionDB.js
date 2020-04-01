  var mongoose=require('mongoose');
  

  mongoose.connect('mongodb://localhost:27017/MyEvents', {useNewUrlParser: true});

  var db = mongoose.connection;
  var Schema = mongoose.Schema;

  var connectionSchema= new Schema({
      connectionID: {type:String, required:true},
      userId: {type:String, required:true},
      connectionName: {type:String, required:true},
      connectionTopic: {type:String, required:true},
      details: {type:String, required:true},
      date: {type:String, required:true},
      time:{type:String, required:true},
      image:{type:String, required:true},
      venue:{type:String, required:true}
  });

  var connectionDB=mongoose.model('connections', connectionSchema);



module.exports.getConnections=  function() {
      return  new Promise(resolve =>{
            resolve(connectionDB.find({}).then(function(allconnections){
              //console.log(allconnections);
              return allconnections;

            })
          );
        });
  };

module.exports.getConnection=  function (connID){
     return  new Promise(resolve =>{
          resolve(connectionDB.find({"connectionID":connID}).then(function(connection){
            return connection;
          })
        );
      });
  };

    module.exports.updateConnection= async function(connection,connID,uID){
      console.log("I am here in updateconn");
      var defaultimageurl = "../assets/images/default.jpg";
      var connectionID= connID;
      var  userId=uID;
      var updatedConnection = {"connectionID":connectionID,"userId":userId,"connectionName":connection.name,"connectionTopic":connection.topic,"details":connection.detail,
            "date":connection.date,
            "time":connection.time,
            "image":defaultimageurl,  /////////check once
            "venue":connection.location};
      return new Promise(resolve =>{
            resolve(connectionDB.updateOne({"connectionID":connectionID},updatedConnection).then(function(data){
              console.log(data);
              return data;
            })
          );
        });
    }

    module.exports.deleteConnection= async function(connectionID,userID){
      return new Promise(resolve =>{
            resolve(connectionDB.deleteOne({connectionID:connectionID, userId:userID}).then(function(data){
              return data;
            })
          );
        });
    }
module.exports.getConnectionTopic=  function(){
    return  new Promise(resolve =>{
          resolve(connectionDB.distinct("connectionTopic").then(function(topics){
            return topics;
          })
        );
      });
  }

    module.exports.connectionDB=connectionDB;
