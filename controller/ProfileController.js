var express=require('express');
var router=express.Router();
var app= express();
var dobj=require('../model/connectionDB');
var bodyparser = require('body-parser');
var session = require('express-session');
var userDB = require('../model/UserDB');
var userConnectionDB = require('../model/userConnectionDB');
var UserConnection = require('../model/UserConnection');
var UserProfile = require('../model/UserProfile');
const { buildSanitizeFunction } = require('express-validator');
const sanitizeBody = buildSanitizeFunction('body');
var { check, validationResult } = require('express-validator');
var urlEncodedParser = bodyparser.urlencoded({ extended: false });

var userProfile;
router.use( (req, res, next) => {
 res.locals.user = req.session.theUser;
 next();
});

router.get('/', function (req, res) {
    res.render('index', {user:req.session.theUser});//render home page
  });

router.get('/index', function (req, res) {
    res.render('index', {user:req.session.theUser});//render home page
});

router.get('/signup', function (req, res) {
  //console.log("in this");
  var alert ="";
    res.render('userRegistration', {user:req.session.theUser,alert:alert});//render home page
});

router.get('/Login',function(req,res){
  if(!req.session.theUser){
  var alert='';
  res.render('Login',{alert:alert});
}
else{
  var alert="You are already logged in";
  res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser});
}
});

router.get('/connections',async function(req, res) {
  var data = await dobj.getConnections();
  var topics = await dobj.getConnectionTopic();
  //console.log(data);
  res.render('connections',{data:data,topics:topics,user:req.session.theUser});//render connections page where data is dynamically loaded through getConnections method
  });

router.get('/connection', async function(req,res){
      // var usProf = req.session.UserProfile;
    //  passing the connection data from getConnection function defined in ConnectionDB
       //console.log(req.query.connectionID);
      var alert = req.query.alert;
      if(req.query.connectionID!==null && req.query.connectionID!== undefined){
            var connectionData= await dobj.getConnection(req.query.connectionID);

            res.render('connection', {connectionData:connectionData,alert:alert,user:req.session.theUser});
               }
        else{
  			res.send('invalid code');
        }
});

router.get('/savedConnections', async function(req, res) {
  if(req.session.theUser){
    var alert = '';
    var userConnections = await addUserConnections(req.session.theUser.userId);
    userProfile.userConnectionList= userConnections;
    req.session.userProfile = userProfile;
    res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser}); //render savedConnections page
  }else{
    var alert = "Please login to view saved connections page"
    res.render('Login',{alert:alert,user:req.session.theUser});
  }
  });

router.get('/contact', function(req,res){
      res.render('contact', {user:req.session.theUser});   //render contact page
});

router.get('/about', function(req,res){
      res.render('about', {user:req.session.theUser});   //render about page
});

router.get('/newConnection', function(req, res) {
    if(req.session.userProfile){
  var alert='';
  res.render('newConnection', {user:req.session.theUser,alert:alert});//render newConnection page
  }else{
    var alert = "Please login to start a new connections"
    res.render('Login',{alert:alert,user:req.session.theUser});
  }
});

//user logout functionality
router.get('/signout',function(req,res){
 if(req.session.theUser){
   userProfile.emptyProfile();
   req.session.destroy();
   res.redirect('/');
 }else{
    res.redirect('/');
 }
});

router.get('/*',function(req,res){
res.send("404 error.Unable to find the page you are searching for");
});

router.post('/newConnection',urlEncodedParser,[
  check('ID').isAlphanumeric().withMessage('No special characters allowed'),
  check('topic').custom((topic) => {return Allcheck(topic)}),
  check('topic', 'Topic should not be less than 4 and more than 50 characters').isLength({min:4, max:50}), // validates Topic length
  check('name').custom((name) => {return Allcheck(name)}),
  check('name', 'Name should not be less than 4 and more than 50 characters').isLength({min:4, max:50}), // validates Name length
  check('detail').custom((detail) => {return Allcheck(detail)}), // validates Description not to be empty
  check('detail', 'Description should not be more than 500 characters').isLength({max:500}),
  check('location').custom((location) => {return Allcheck(location)}),
  check('location', 'location should not be less than 4 and more than 50 characters').isLength({min:4, max:50}),
  check('date', "Date should be today or ahead of today's date").isAfter()
], async function(req,res){
  const error = validationResult(req);
  if (error.isEmpty()){
    if(req.session.theUser){
      try{
        var alert='';
        isExistconnID = await dobj.getConnection(req.body.ID);
        if(isExistconnID.length!==0){
          var alert='connectionID already exists';
          res.render('newConnection', {user: req.session.theUser,alert:alert});
        }else{
   await userConnectionDB.addConnection(req.body,req.session.theUser.userId);
 }
 }catch(err){
        console.error(err);
      }
  res.redirect('/connections');
}
else{
     var alert='Please Login to create a new connection!';
      res.render('newConnection', {user: req.session.theUser,alert:alert});
    }
  }
  else{
      console.log(error);
      var alert='';
      if(error.errors[0].msg){
        res.render('newConnection', {user: req.session.theUser,  alert:error.errors[0].msg});
      }
    }
  });

// user login functionality
router.post('/Login',urlEncodedParser, [check('username').isAlphanumeric().withMessage('No special characters allowed')
.isLength({min:6, max:15}).withMessage('Username length should be equal to 6-15 characters!!'),
  check('password').isAlphanumeric().isLength({min:4}).withMessage('must be Alphabets')], async function(req,res){
  // if(!req.session.theUser){
  var errors = validationResult(req);
  if(!errors.isEmpty()){
  return res.status(422).json({ errors: errors.array() });
}else{
  var users=await userDB.getUser(req.body.username);
  if(users[0]== null){
      var alert="User not found";
      res.render('Login',{alert:alert});
  }else  {
     //console.log(users[0].salt);
      var getHash=userDB.getHash(req.body.password,users[0].salt);
      var retreivedHash= users[0].hash;
          if (getHash==retreivedHash) {
            var alert="You are logged in";
            req.session.theUser = users[0];
            userProfile = new UserProfile(users[0]);
            //console.log(userProfile);
            var userConnections = await addUserConnections(users[0].userId);
            userProfile.userConnectionList= userConnections;
            req.session.userProfile = userProfile;
            //console.log(userProfile);
            res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser});
          }else{
            var alert="Password doesn't match";
            res.render('Login',{alert:alert});
              }
            }
}
});

router.post('/signup',urlEncodedParser, [check('firstName').isAlphanumeric().withMessage('No special characters allowed')
.isLength({min:6, max:15}).withMessage('firstName length should be equal to 6-15 characters!!'),
check('firstName').custom((firstName) => {return Allcheck(firstName)}),
check('firstName', 'firstName should not be less than 4 and more than 15 characters').isLength({min:4,max:15}),
  check('lastName').custom((lastName) => {return Allcheck(lastName)}),
  check('lastName', 'lastName should not be less than 4 and more than 15 characters').isLength({min:4,max:15}), // validates Topic length
  check('emailAddress').isEmail().withMessage('should be an email!!'),
  check('emailAddress', 'emailAddress should not be less than 4 and more than 20 characters').isLength({min:4, max:20}),
  check('password').isAlphanumeric().isLength({min:4}).withMessage('must be Alphabets'), // validates Topic length
  check('address1').custom((address1) => {return Allcheck(address1)}),
  check('address1', 'address1 should not be less than 4 and more than 15 characters').isLength({min:4,max:15}),
  check('address2').custom((address2) => {return Allcheck(address2)}),
  check('address2', 'address2 should not be less than 4 and more than 15 characters').isLength({min:4,max:15}),
  check('city').custom((city) => {return Allcheck(city)}),
  check('city', 'city should not be less than 4 and more than 15 characters').isLength({min:4,max:15}),
  check('state').custom((state) => {return Allcheck(state)}),
  check('state', 'state should not be less than 4 and more than 15 characters').isLength({min:4,max:15}),
  check('zipCode').custom((zipCode) => {return Allcheck(zipCode)}),
  check('zipCode', 'zipCode should not be less than 4 and more than 15 characters').isLength({min:4,max:15}),
  check('country').custom((country) => {return Allcheck(country)}),
  check('country', 'country should not be less than 4 and more than 15 characters').isLength({min:4,max:15})], async function(req, res){
    const error = validationResult(req);
    if (error.isEmpty()){
      isExistUserName = await userDB.getUser(req.body.firstName);
  isExistUserId = await userDB.getUserbyId(req.body.userId);
  if(isExistUserName.length!== 0 ){
    var alert = "username already exists.It should be unique";
    res.render('userRegistration', {user:req.session.theUser,alert:alert});
  }else if(isExistUserId.length!== 0 || req.body.userId == "default"){
      var alert = "userId already exists.It should be unique";
      res.render('userRegistration', {user:req.session.theUser,alert:alert});
    }  else{
    var alert ="user succefully added";
    await userDB.addUser(req.body);
    res.render('userRegistration', {user:req.session.theUser,alert:alert});
  }
}else{
      console.log(error);
      var alert=error.errors[0].msg;
      if(error.errors[0].msg){

      res.render('userRegistration', {user:req.session.theUser,alert:alert});
      }
    }
});

router.post('/updateNewConnection',urlEncodedParser, async function(req, res){
  connectionid=req.query.connuserid;
  userid=req.query.uuserId;
  buttonaction=req.body.action;
  if(buttonaction== 'updateconn'){
  var data=  await dobj.getConnection(connectionid);
  var alert ='';
  res.render('UpdateNewConnection',{data:data,alert:alert,user:req.session.theUser});
}else if(buttonaction== 'deleteconn'){
    //console.log("in delete conn");
    //console.log(connectionid);
    //console.log(userid);
  await dobj.deleteConnection(connectionid,userid);
  var connInAnyUserprofile=await userConnectionDB.getUserConnection(connectionid);
  console.log(connInAnyUserprofile);
  if(connInAnyUserprofile.length!==0)
  {
    await userConnectionDB.removeRSVPbyconnId(connectionid);
  }
  var data = await dobj.getConnections();
  var topics = await dobj.getConnectionTopic();
  //console.log(data);
  res.render('connections',{data:data,topics:topics,user:req.session.theUser});
  }
});

router.post('/updatedNewConnection',urlEncodedParser,[
  check('topic').custom((topic) => {return Allcheck(topic)}),
  check('topic', 'Topic should not be less than 4 and more than 50 characters').isLength({min:4, max:50}), // validates Topic length
  check('name').custom((name) => {return Allcheck(name)}),
  check('name', 'Name should not be less than 4 and more than 50 characters').isLength({min:4, max:50}), // validates Name length
  check('detail').custom((detail) => {return Allcheck(detail)}), // validates Description not to be empty
  check('detail', 'Description should not be more than 500 characters').isLength({max:500}),
  check('location').custom((location) => {return Allcheck(location)}),
  check('location', 'location should not be less than 4 and more than 50 characters').isLength({min:4, max:50}),
  check('date', "Date should be today or ahead of today's date").isAfter()
],  async function(req, res){
  const error = validationResult(req);
  if (error.isEmpty()){
  console.log(req.body);
  console.log(req.query.ID);
  console.log(req.query.userId);
  var alert='';
  await dobj.updateConnection(req.body,req.query.ID,req.query.userId);
  var connectionData= await dobj.getConnection(req.query.ID);
  console.log(connectionData[0].userId);
  //console.log(req.session.theUser.userId);
  res.render('connection', {connectionData:connectionData,alert:alert,user:req.session.theUser});
}else{
      console.log(error);
      var alert='';
      if(error.errors[0].msg){
        var data=  await dobj.getConnection(req.query.ID);

        res.render('UpdateNewConnection', {data:data,user: req.session.theUser,  alert:error.errors[0].msg});
      }
    }
});
//changes to user connections by using save,update, delete functionalities of user profile
router.post('/savedConnections',urlEncodedParser, async function(req, res){
  if(req.body.action== undefined){
    res.render('savedConnections',{data:req.session.userProfile,user:req.session.theUser});
  }else if(req.session.theUser == undefined){
    res.render('index',{user:req.session.theUser});
  }else{
    var connectionId = req.query.connectionID;
    var rsvp = req.query.rsvp;
    var action = req.body.action;
    var connection = await dobj.getConnection(connectionId);
    if(action == 'save'){
      var connection_exists = userProfile.checkIfExists(connectionId);
      if(connection_exists == 0){
        var alert='';
        await  addConnectionRSVP(connection[0],req.session.theUser.userId,rsvp);
        var userConnections = await addUserConnections(req.session.theUser.userId);
        userProfile.userConnectionList= userConnections;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser});
      }else{
        var alert='';
        var  userconnection = UserConnection(connection[0],rsvp);
        await updateConnectionRSVP(userconnection,req.session.theUser.userId);
        var userConnections = await addUserConnections(req.session.theUser.userId);
        userProfile.userConnectionList= userConnections;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser});
      }
    }else if(action == 'delete'){
      var connection_exists = userProfile.checkIfExists(connectionId);
      if(connection_exists == 1){
        var alert='';
        await removeConnectionRSVP(connection[0],req.session.theUser.userId);
        var userConnections = await addUserConnections(req.session.theUser.userId);
        userProfile.userConnectionList= userConnections;
        req.session.userProfile = userProfile;
        res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser});
      }else{
        var alert='';
        res.render('savedConnections',{data:req.session.userProfile,alert:alert,user:req.session.theUser});
      }
    }
  }
});

async function addConnectionRSVP(connection,userId,rsvp){
  //userId=userId;
var data = await userConnectionDB.addRSVP(connection.connectionID,userId,rsvp);
}

async function removeConnectionRSVP(connection,userId){
//userId=userId;
await userConnectionDB.removeRSVP(connection.connectionID,userId);
}

async function updateConnectionRSVP(userConnection,userId){
//userId=userId;
await userConnectionDB.updateRSVP(userConnection.Connection.connectionID,userId,userConnection.rsvp);
}

async function addUserConnections(userID){
 var userConnectionList =[];
 var userConnections = await userConnectionDB.getUserProfile(userID);
 for(var i=0 ; i< userConnections.length; i++){
   var connection= await dobj.getConnection(userConnections[i].connectionID);
   var rsvp = userConnections[i].rsvp;
   var userConnection = UserConnection(connection[0],rsvp);
  userConnectionList.push(userConnection);
}
 return userConnectionList
}

const Allcheck = function(attribute){ //to disallow specific special chars
  let regexp = /[`~$%^.*_+=;<>/?|]+/;
  if(!regexp.test(attribute)){
    return attribute
  } else{
    throw new Error('Special characters are not allowed');
  }
}

module.exports = router;
