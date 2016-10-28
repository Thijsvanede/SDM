/**************************************************/
/**                   Imports                    **/
/**************************************************/
var NodeRSA = require('node-rsa');
var bigInt = require('big-integer');
var random = require('random-gen');
var forge = require('node-forge');

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var Thijs = function() {
  //Defining attributes
  this.l = bigInt(4);
  this.u = 1;
  this.n = null;
  this.q = 0;
  this.p = 0;
};

/**
 *
 */
Thijs.prototype.getM = function() {  
  var B = this.n;
  var tmp = null;
  
  do{
    forge.prime.generateProbablePrime(this.k, function(err, num){
      tmp = bigInt(num.toString());
    });
  }while(tmp == null || tmp.gt(B) || tmp.lt(2) || tmp.eq(this.p) || tmp.eq(this.q));
  return tmp;
}

/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.Thijs = Thijs;