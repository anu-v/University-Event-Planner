
var UserConnection = function(connection, rsvp ){
var userconnectionModel = {Connection: connection, rsvp: rsvp  };
return userconnectionModel; //return userconnectionModel object
};


module.exports.UserConnection = UserConnection;


module.exports=UserConnection;
