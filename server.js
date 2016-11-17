'use strict';

/**************************************************/
/**                  Definitions                 **/
/**************************************************/
var SERVER_IP = "0.0.0.0"
var SERVER_PORT = "3000"

/**************************************************/
/**                   Imports                    **/
/**************************************************/
var express      = require('express');
var http         = require('http');
var path         = require('path');
var bodyParser   = require('body-parser');
var MongoClient  = require('mongodb').MongoClient;
var assert       = require('assert');
var passport     = require('passport');
var LocalStrategy= require('passport-local').Strategy;
var session      = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser   = require("body-parser");
var bigInt       = require('big-integer');

var app          = express();

app.use(cookieParser()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/**************************************************/
/**             Server initialisation            **/
/**************************************************/
var server       = http.Server(app);

// socket io
var io = require('socket.io')(server);

/**************************************************/
/**              Database connection             **/
/**************************************************/
var MongoDBCon   = require('./server/database/database.js').MongoDBCon;

// Open database connection.
var database = new MongoDBCon();


/**************************************************/
/**          Passport initialisation             **/
/**************************************************/
passport.use(new LocalStrategy(function(username, password, callback) {;
  database.find('users', {'username': username}, function(userdoc) {
    if(userdoc.length === 0) {
      return callback(null, false, {message: "Username does not exist"});
    } else {
      var user = userdoc[0];
      if(user.password !== password) {
        return callback(null, false, {message: "Incorrect password"});
      } else {
        return callback(null, user);
      }
    }
  });
}));

passport.serializeUser(function(user, callback) {
  // serialize on username. Ugly but sufficient for now
  callback(null, user.username);
});

passport.deserializeUser(function(user, callback) {
  database.find('users', {username: user}, function (userdoc) {
    if (userdoc.length !== 0) {
      return callback(null, userdoc[0]);
    } else {
      return callback(null, false);
    }
  });
});

app.use(session({
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

/**************************************************/
/**          View engine initialisation          **/
/**************************************************/
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + '/public'));


var APIServer = require('./server/modules/Server.js').Server;
var Sapi = new APIServer();
var demoClient = require('./server/modules/DeEkteClient.js').Client;
var client = new demoClient();
var APIGM = require('./server/modules/GM.js').GM;
var GMapi = new APIGM(Sapi, [client], 512);

/**************************************************/
/**                 Public routes                **/
/**************************************************/
app.get('/', function(req, res) {
  if(!req.user) {
    res.redirect('/login');
  } else {
    res.render('./client/pages/index', {user: req.user});
  }
});

app.get('/login', function(req, res) {
  res.render('./client/pages/login');
});

app.post('/login',passport.authenticate('local', {successRedirect: '/'}), function(req, res) {
  // authentication failure
  res.redirect('/login', {alerts: [{msg: 'Incorrect username/password'}]});
});

app.get('/register', function(req, res) {
  res.render('./client/pages/register');
});

app.post('/register', function(req, res) {
  // find existing user
  database.find('users', {'username': req.body.username}, function(userdoc) {
    if(userdoc.length === 0) {
      // determine encryption keys for user
      // skipped for demo!
      
      // insert new user
      var user = {
        username: req.body.username,
        password: req.body.password,
        di: client.PIN.toString(),
        ci: client.ci.toString()
      };
      database.insert('users', user, {}, function() {
          // login and redirect to index
          passport.authenticate('local', {failureRedirect: '/login' }); //TODO check if this works
          res.redirect('/');
      });
      
    } else {
      // return with error
      var alerts = [{'msg': 'Username already exists'}];
      res.render('./client/pages/register', {'alerts': alerts});
    }
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});



/**************************************************/
/**                  Server API                  **/
/**************************************************/
// retreives the public parameters and sends these to the client.
app.get('/api/sysset', function(req, res) {
  if(!req.user) {
    res.json({result: 'fail'});
  } else {
    var Sg2 = [
      client.Sg[0].toString(),
      client.Sg[1].toString()
    ]
    
    var params = {
      g: client.g.toString(),
      gamma: client.gamma.toString(),
      u: client.u.toString(),
      P: client.P.toString(),
      n: client.n.toString(),
      Sg: Sg2
    }
    res.json({result: 'ok', params: params});
  }
})

app.post('/api/datupl/', function(req, res) {
  if(!req.user) {
    res.json({result: 'fail'});
  } else {
    var SgR = req.body.SgR;
    var CSIR = req.body.CSIR;
    Sapi.receiveSgR(SgR, CSIR, function() {
      res.json({result: 'ok'});
    });
  }
});

app.post('/api/search/', function(req, res) {
  if(!req.user) {
    res.json({result: 'fail'});
  } else {
    var C = bigInt(req.body.C);
    var l = req.body.l;
    var PIN = bigInt(req.user.di);
    var ci = bigInt(req.user.ci);
    
    Sapi.receiveTrpdor(C, l, PIN, ci, function(docs) {
      // data found, now decrypt at GM
      console.log(docs);
      
      // TODO
      var body = {
        result: 'ok',
        docs: docs
      };
      
      res.json(body);
    });
  }
});



/**************************************************/
/**                Starting server               **/
/**************************************************/
console.log("Starting server at " + SERVER_IP + ":" + SERVER_PORT);
server.listen(SERVER_PORT, SERVER_IP);


/**************************************************/
/**            Socket IO Communication           **/
/**************************************************/

io.on('connection', function(socket){
  //console.log("a client connected");
  socket.on('disconnect', function(){
    //console.log("A client disconnected");
  })
});

/**************************************************/
/**            Anirudh stuff                     **/
/**************************************************/

/*
database.find("Users", {username:"adminn"},function(doc){
  console.log(doc);
});

app.post('/login',function(req,res){
  var uname = req.body.username;
  var pword = req.body.password
  console.log(uname);
  console.log(pword);
  
  database.find("Users", {username:uname},function(doc){
    console.log(doc);
    if(doc.username == uname){
      console.log("Success!");
    }
  });
  
  res.redirect("/");
});
*/

