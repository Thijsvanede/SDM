/**************************************************/
/**                   Imports                    **/
/**************************************************/

/**************************************************/
/**                  Definitions                 **/
/**************************************************/

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var TTP = function() {
  //Defining attributes
};

/***************************************************
/**               Private functions              **/
/**************************************************/


/***************************************************
/**               Public functions               **/
/**************************************************/

/**
* SystemSetup is to instantiate the scheme. It has one algorithm SysSet(k)
* executed by GM, which takes as input a secure parameter s, and outputs a
* tuple of keys (PKg,PKs,SK), where PKg is published to the group, PKs is
* sent to the server, and SK is kept secret by GM.
*/
TTP.prototype.SysSet = function(k) {
  
}

/**
* GrpAut(G) is executed by GM to make authentication codes for the orig-
* inal group. It takes as input all members M1,...,MN in the group G,
* outputs PIN numbers di and secure codes ci for all members, and a secure
* test code STC for the server.
*/
TTP.prototype.GrpAut = function(G) {
  
}

/**
* DatDcp(Sg (R)) is executed by a member interacting with the
* GM, which takes as input an encrypted data Sg(R), outputs the data R.
*/
TTP.prototype.DatDcp = function(SgR) {
  
}


exports.TTP = TTP;