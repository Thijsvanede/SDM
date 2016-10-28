/**************************************************/
/**                   Imports                    **/
/**************************************************/
var NodeRSA = require('node-rsa');
var bigInt = require('big-integer');
var random = require('random-gen');
var forge = require('node-forge');

/**************************************************/
/**                  Definitions                 **/
/**************************************************/

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var Henk = function() {
  //Defining attributes
  this.l = bigInt(512);
  this.u = 1;
  this.n = null;
  this.q = 0;
  this.p = 0;
  this.k = null;
	this.D = null;
};

/***************************************************
/**               Private functions              **/
/**************************************************/

/**
 * Function f
 */
Henk.prototype.f = function(u, x) {
  return u.modPow(x, this.n);
}

/**
 * Function to generate an element of M.
 */
Henk.prototype.getM = function() {
  var B = this.n;
  var tmp = null;
  
  do{
    forge.prime.generateProbablePrime(this.k, function(err, num){
      tmp = bigInt(num.toString());
    });
  }while(tmp == null || tmp.gt(B) || tmp.lt(2) || tmp.eq(this.p) || tmp.eq(this.q));
  return tmp;
}

/**
 * Computes pow-th element from generator.
 */
Henk.prototype.G1 = function(gen, pow) {
  return gen.modPow(exp, this.n);
}

/**
 * Generate u function.
 */
Henk.prototype.genu = function(){
  return bigInt(Math.floor(Math.random() * 100000)).modPow(2,bigInt(this.n));
}

Henk.prototype.blindsigs = function(){
  var x = Math.floor((Math.random() * 100000000) + 1);
  var md = forge.md.sha256.create();
  var hash = md.update(x);
  
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
    pins[i] = this.getM();
  }  
  
  var pinGM = null;
  var stop = true;
  
  while(pinGM == null || stop){
    stop = false;
    pinGM = this.getM();
    for (i = 0; i < G.length; i++){
      if(pins[i] == pinGM)
        stop = true;
    }
  }
  
  //GrpAuth step 2
  var ci = bigInt(1);
  for(i = 0; i < G.length; i++){
    ci = ci.multiply(this.u.modPow(pins[i], this.n)).mod(this.n);
  }
  
  callback(ci);
}
  

Henk.prototype.SysSet = function(k, callback) {
  //rsa shit
  //var bp = bigInt(this.p.toString());
  //var bq = bigInt(this.p.toString());
  //while(!bq.isProbablePrime(2000) && !bp.isProbablePrime(2000)){
  this.k = k;
    var key = new NodeRSA({b: k});
    components = key.exportKey('components');
    this.p = components.p;
    this.q = components.q;
    //bp = bigInt(this.p.toString('hex'), 16).minus(bigInt(1)).divide(bigInt(2));
    //bq = bigInt(this.q.toString('hex'), 16).minus(bigInt(1)).divide(bigInt(2));
  //}
  this.n = bigInt(components.n.toString('hex'), 16);
  var zn = this.f(bigInt(k),this.l);
  this.u = this.genu();
  
  //paillier shit
  var pkeys = paillier.generateKeys(100);
  var public = pkeys.pub;
  var priv = pkeys.sec;
  var sigma = bigInt(Math.floor((Math.random() * 100000000) + 2)); 
  var lmb = priv.lambda;
  var beta = sigma.multiply(lmb).mod(public.n2);
  var lfunc = public.np1.modPow(priv.lambda, public.n2).subtract(bigInt.one).divide(public.n);
  var gamma = sigma.multiply(lfunc).mod(public.n);
  
  //blind signatures
  
  //PKg = {public.np1, gamma, f, P, this.n, S}
  //PKs = {m, beta, lfunc, this.n}
  //SK = {sigma, lmb, S'}
  callback(/* TODO sending parameters */);
}

paillier = {
	publicKey: function(bits, n) {
		this.bits = bits;
		this.n = n;
		this.n2 = n.square();
		this.np1 = n.add(bigInt.one);
		this.rncache = [];
	},
	privateKey: function(lambda, pubkey) {
		this.lambda = lambda;
		this.pubkey = pubkey;
		this.x = pubkey.np1.modPow(this.lambda,pubkey.n2).subtract(bigInt.one).divide(pubkey.n).modInv(pubkey.n);
	},
	generateKeys: function(modulusbits) {
		var p, q, n, keys = {};
		do {
			do {
				p = bigInt.randBetween(bigInt(2).pow(modulusbits-2), bigInt(2).pow(modulusbits+2));//new bigInt(modulusbits>>1,1,rng);
			} while (!p.isProbablePrime(10));

			do {
				q = bigInt.randBetween(bigInt(2).pow(modulusbits-2), bigInt(2).pow(modulusbits+2));//new bigInt(modulusbits>>1,1,rng);
			} while(!q.isProbablePrime(10));

			n = p.multiply(q);
		} while(!(n.and(bigInt(1).shiftLeft(modulusbits - 1))) || (p.compareTo(q) == 0));
		keys.pub = new paillier.publicKey(modulusbits,n);
		lambda = bigInt.lcm(p.subtract(bigInt.one),q.subtract(bigInt.one));
		keys.sec = new paillier.privateKey(lambda, keys.pub);
		return keys;
	}
}



/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.Henk = Henk;