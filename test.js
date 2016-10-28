var Thijs = require('./server/modules/Thijs.js').Thijs;
var Henk = require('./server/modules/Henk.js').Henk;

var myThijs = new Thijs();
var myHenk = new Henk();

myHenk.SysSet(512, function(){
  console.log("Finished setting up.");
});

myHenk.GrpAuth([1,2,3,4], function(data){
  console.log(data);
  console.log("Finished GrpAuth.");
});