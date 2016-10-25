/**************************************************/
/**                   Imports                    **/
/**************************************************/
var NodeRSA = require('node-rsa');
var bigInt = require('big-integer');
var random = require('random-gen');

/**************************************************/
/**                  Definitions                 **/
/**************************************************/

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var Henk = function() {
  //Defining attributes
  this.l = bigInt(4);
  this.u = 1;
  this.n = null;
  this.q = 0;
  this.p = 0;
};

/***************************************************
/**               Private functions              **/
/**************************************************/

/**
 * Function f
 */
var f = function(u, x, n) {
  console.log(n);
  return u.modPow(x, n);
}

/**
 *
 */
var getM = function() {
  
}

/**
*  Generate u
*/
var genu = function(){
  return random.lower(2).modPow(2,bigInt(this.n));
}

/***************************************************
/**               Public functions               **/
/**************************************************/

/**
 * is executed by GM to make authentication codes for the orig-
 * inal group. It takes as input all members M1,...,MN in the group G,
 * outputs PIN numbers di and secure codes ci for all members, and a secure
 * test code STC for the server.
 */
Henk.prototype.GrpAuth = function(G, callback) {
  //GrpAuth step 1
  var pins = [];
  for (var i = 0; i < G.length; i++) {
    pins[i] = this.M;
  }
  var pinGM = this.M;
  
  //GrpAuth step 2
  var ci = bigInt(1);
  for(i = 0; i < G.length; i++){
    ci = ci.multiply(this.u.modPow(pins[i], this.n)).mod(this.n);
  }
  
  callback(ci);
}
  

Henk.prototype.SysSet = function(k) {
  //rsa shit
  var bp = bigInt(this.p.toString());
  var bq = bigInt(this.p.toString());
  while(!bq.isProbablePrime(2000) && !bp.isProbablePrime(2000)){
    var key = new NodeRSA({b: 512});
    components = key.exportKey('components');
    this.p = components.p;
    this.q = components.q;
    bp = bigInt(this.p.toString('hex'), 16).minus(bigInt(1)).divide(bigInt(2));
    bq = bigInt(this.q.toString('hex'), 16).minus(bigInt(1)).divide(bigInt(2));
  }
  console.log(bigInt(this.p.toString('hex'), 16).toString());
  console.log(bp.toString());
  console.log(bigInt(this.q.toString('hex'), 16).toString());
  console.log(bq.toString());
  this.n = bigInt(components.n.toString('hex'), 16);
  console.log(this.n);
  var zn = f(bigInt(k),this.l, this.n);
  var u = genuu();
  var m = getM();
  //paillier shit
  
}

/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.Henk = Henk;