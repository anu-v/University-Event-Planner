var express=require('express');
var router=express.Router();
var dobj=require('../util/connectionDB');

router.get('/', function(req, res) {
  res.render('index');  //render home page
});

router.get('/index', function(req, res) {
    res.render('index');   //render home page
});

router.get('/connections',function(req, res) {
  var data = dobj.getConnections();
  var topics =  getconnectionTopic();
  res.render('connections',{data:data,topics:topics}); //render connections page where data is dynamically loaded through getConnections method
});

router.get('/connection', function(req,res){
//       passing the connection data from getConnection function defined in ConnectionDB
      if(req.query.connectionID!==null && req.query.connectionID!== undefined){
            var connectionData= dobj.getConnection(req.query.connectionID);

            res.render('connection', {connectionData:connectionData});
        }
        else{

  			res.send('invalid code');
        }
});

router.get('/savedConnections', function(req, res) {
  res.render('savedConnections'); //render savedConnections page
});

router.get('/contact', function(req,res){
      res.render('contact');   //render contact page
});

router.get('/about', function(req,res){
      res.render('about');   //render about page
});

router.get('/newConnection', function(req, res) {
  res.render('newConnection'); //render newConnection page
});


router.get('*',function(req,res){
      res.send("404 error.Unable to find the page you are searching for");
});


var getconnectionTopic= function(){

     var topics=[];
     var data = dobj.getConnections();

     data.forEach(function (item) {
     if(!topics.includes(item.connectionTopic)){
     topics.push(item.connectionTopic);
//     console.log(item.connectionTopic);
//      console.log(topics);
     }
         });

 return topics;


};

module.exports=router;
