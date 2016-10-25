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

var app          = express();


/**************************************************/
/**             Server initialisation            **/
/**************************************************/
var server       = http.Server(app);

// parse JSON bodies
app.use(bodyParser.json())

/**************************************************/
/**          View engine initialisation          **/
/**************************************************/
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + '/public'));

/** Initialising home page to index.html */
app.get('/', function(req, res) {
  res.render('./client/html/index.html');
});

/**************************************************/
/**              Database connection             **/
/**************************************************/
var MongoDBCon   = require('./server/database/database.js').MongoDBCon;

// Open database connection.
var database = new MongoDBCon();

/**************************************************/
/**                  Server API                  **/
/**************************************************/
//var API = require('./server/modules/Henk.js').Henk;
//var api = new API();


app.get('/api/', function(req, res){
  //TODO maybe documentation page about the API?
});

app.use('/api/sysset/', function(req, res) {
  console.log(req);
  console.log('body: ' + req.body);
  console.log('a: ' + req.body.a);
  res.send('done');
  // get PK_s
  // api.SysSet(PK_s)
});
app.post('/api/grpaut/', function(req, res) {
  // get groupID, STC
  // api.GrpAut(groupID, STC)
})
app.post('/api/datupl/', function(req, res) {
  // get S_g(R), CSI_R
  // api.DatUpl(S_g(R),CSI_R)
})
app.post('/api/search/', function(req, res) {
  // get trapdoor (L',l), PIN (d_i), secure code (s_i)
  // api.MemChk(d_i,s_i,STC)
  // -> api.SrhInd(T_L, CSI_R)
  // -> return api.DatDwn()
})



/**************************************************/
/**                Starting server               **/
/**************************************************/
console.log("Starting server at " + SERVER_IP + ":" + SERVER_PORT);
server.listen(SERVER_PORT, SERVER_IP);