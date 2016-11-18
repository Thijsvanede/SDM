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
var LnotAvailable = [bigInt(10)];
var l = [3]; //locations start at index 1
var lwronglocation = [2];

var myServer = new Server();
var myServer2 = new Server();
var client1 = new Client(myServer);
var client2 = new Client(myServer);
var client3 = new Client(myServer2);
var client4 = new Client(myServer2);
var myClients1 = [client1, client2];
var myClients2 = [client3, client4];
var myGM1 = new GM(0, myServer, myClients1, 512);
var myGM2 = new GM(1, myServer2, myClients2, 512);

myGM1.GrpAuth(function(){
  console.log("Group authenticated.");
}); 

myGM2.GrpAuth(function(){
  console.log("Group authenticated.");
});

myClients1[0].UploadData(R, function(){
  console.log("Data uploaded.");
});

myClients1[1].UploadData(R2, function(){
  console.log("Data uploaded.");
});

myClients1[0].UploadData(R3, function(){
  console.log("Data uploaded.");
});
                        
myClients1[0].initQuery(L, l, function(){
  console.log("Trapdoor sent.");
});  

myClients2[0].initQuery(L, l, function(){
  console.log("Trapdoor sent.");
});   
                        
myClients1[0].initQuery(LnotAvailable, l, function(){
  console.log("Trapdoor sent.");
});    

myClients1[0].initQuery(L, lwronglocation, function(){
  console.log("Trapdoor sent.");
});
