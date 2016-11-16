var bigInt = require('big-integer');

var Init = require('./server/modules/Init.js').Init;
var Server = require('./server/modules/Server.js').Server;
var Client = require('./server/modules/DeEkteClient.js').Client;
var GM = require('./server/modules/GM.js').GM;

// Name, address, tel
var R = [bigInt(5), bigInt(10), bigInt(20)];
var L = [bigInt(20)];
var l = [3]; //locations start at index 1

var myServer = new Server();
var myClients = [new Client(1, myServer), new Client(2, myServer)];
var myGM = new GM(myServer, myClients, 512);

myGM.GrpAuth(function(){
  console.log("Group authenticated.");
});

myClients[0].UploadData(R, function(){
  console.log("Data uploaded.");
});

myClients[0].sendTrpdor(L, l, function(){
  console.log("Trapdoor sent.");
});