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
passport.use(new LocalStrategy(function(username, password, callback) {
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
var demclient = new demoClient(Sapi);
var APIGM = require('./server/modules/GM.js').GM;
var GMapi = new APIGM(1, Sapi, [demclient], 128);
GMapi.GrpAuth(function(){
  console.log("Group authenticated.");
});

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
        password: req.body.password
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
      demclient.Sg[0].toString(),
      demclient.Sg[1].toString()
    ]
    
    var params = {
      g: demclient.g.toString(),
      gamma: demclient.gamma.toString(),
      u: demclient.u.toString(),
      P: demclient.P.toString(),
      n: demclient.n.toString(),
      Sg: Sg2
    }
    res.json({result: 'ok', params: params});
  }
})

// upload encrypted data from the client
app.post('/api/datupl/', function(req, res) {
  if(!req.user) {
    res.json({result: 'fail'});
  } else {
    var SgR = req.body.SgR;
    var CSIR = req.body.CSIR;
    
    console.log('ENCRYPTED DATA RECEIVED:');
    console.log(SgR);
    
    // convert strings back to bigints
    for(var i = 0; i < SgR.length; i++) {
      SgR[i] = bigInt(SgR[i]);
    }
    for(var i = 0; i < CSIR.length; i++) {
      CSIR[i] = bigInt(CSIR[i]);
    }
    
    Sapi.receiveSgR(1, SgR, CSIR, function() {
      res.json({result: 'ok'});
    });
  }
});

// search in encrypted data
app.post('/api/search/', function(req, res) {
  if(!req.user) {
    res.json({result: 'fail'});
  } else {
    var C = bigInt(req.body.C);
    var l = req.body.l;
    
    // get from democlient for the demonstration
    var di = demclient.PIN;
    var ci = demclient.ci;
    
    console.log("finding docs");
    
    Sapi.receiveTrpdor(1, C, l, di, ci, function(docs) {
      // data found, now decrypt at GM
      var plaindata = [];
      
      // temporary hack because bugs (returned data is one big list)
      var tempdocs = [];
      for(var d = 0; d < docs.length; d += 5) {
        var onedoc = [docs[d],docs[d+1],docs[d+2],docs[d+3],docs[d+4]];
        tempdocs.push(onedoc);
      }
      docs = tempdocs;
      
      for(var c = 0; c < docs.length; c++) {
        var doc = docs[c];
        var plaindoc = [];
        for(var d = 0; d < doc.length; d++) {
          var docword = doc[d];
          GMapi.receiveSgR(docword, function(plain) {
            plaindoc.push(plain.toString());
          });
        }
        plaindata.push(plaindoc);
      }
      
      console.log(plaindata);
      
      var body = {
        result: 'ok',
        docs: plaindata
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

