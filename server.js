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

/**************************************************/
/**          View engine initialisation          **/
/**************************************************/
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + '/public'));

/** Initialising home page to index.html */
app.use('/', function(req, res) {
  res.render('./client/html/index.html');
});

/**************************************************/
/**              Database connection             **/
/**************************************************/

/* URL to initiate connection with database. */
var databaseURL = 'mongodb://0.0.0.0:27017/SDM';

/* Connecting to database server. */
MongoClient.connect(databaseURL, function(err, db){
  assert.equal(null, err);
  console.log("Successfully connected to database.");
  db.close();
});

/**************************************************/
/**                  Server API                  **/
/**************************************************/
//TODO




var MongoDBCon   = require('./server/database/database.js').MongoDBCon;
var c = new MongoDBCon();
c.insertDocument('restaurants', {
      "address" : {
         "street" : "2 Avenue",
         "zipcode" : "10075",
         "building" : "1480",
         "coord" : [ -73.9557413, 40.7720266 ]
      },
      "borough" : "Manhattan",
      "cuisine" : "Italian",
      "grades" : [
         {
            "date" : new Date("2014-10-01T00:00:00Z"),
            "grade" : "A",
            "score" : 11
         },
         {
            "date" : new Date("2014-01-16T00:00:00Z"),
            "grade" : "B",
            "score" : 17
         }
      ],
      "name" : "Vella",
      "restaurant_id" : "41704620"
   });

c.find('restaurants', {"grades.grade": "B"}, function(doc){
  console.log(doc);
});


/**************************************************/
/**                Starting server               **/
/**************************************************/
console.log("Starting server at " + SERVER_IP + ":" + SERVER_PORT);
server.listen(SERVER_PORT, SERVER_IP);