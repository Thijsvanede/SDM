var bigInt = require('big-integer');

var Init = require('./server/modules/Init.js').Init;
var Server = require('./server/modules/Server.js').Server;
var Client = require('./server/modules/DeEkteClient.js').Client;
var GM = require('./server/modules/GM.js').GM;

// Name, address, tel
var R = [bigInt(5), bigInt(10), bigInt(20)];
var R2 = [bigInt(2), bigInt(3), bigInt(20)];
var R3 = [bigInt(7), bigInt(5), bigInt(12)];
var L = [bigInt(20)];
var l = [3]; //locations start at index 1

var myServer = new Server();
var myClients = [new Client(myServer), new Client(myServer)];
var myGM = new GM(myServer, myClients, 512);

myGM.GrpAuth(function(){
  console.log("Group authenticated.");
});

myClients[0].UploadData(R, function(){
  console.log("Data uploaded.");
});

myClients[0].UploadData(R2, function(){
  console.log("Data uploaded.");
});

myClients[0].UploadData(R3, function(){
  console.log("Data uploaded.");
});
                        
myClients[0].initQuery(L, l, function(){
  console.log("Trapdoor sent.");
});   

myClients[1].initQuery(L, l, function(){
  console.log("Trapdoor sent.");
});   