var c = new Client();
var serverurl = "https://encrypted-data-search-thijsvanede512475.codeanyapp.com/";

function search() {
  L = [];
  l = [];
  for(i = 1; i <= 5; i++) {
    val = $('input[name=sfield'+i+']').val();
    if(val !== "") {
      L[i-1] = stringToBigInt(val).toString();
      l.push(i);
    }
  }
  
  c.Trpdor(L,l, function(C, l2) {
    
    var data = {
      C: C.toString(),
      l: l2
    };
    
    postdata = JSON.stringify(data);
  
    $.ajax({
      url: serverurl+'api/search',
      type: 'post',
      dataType: 'json',
      contentType: 'application/json',
      data: postdata
    }).done(function(data) {
      if(data.result == 'ok') {
        
        $('#result').html("");
        parseResults(data);
        resetForms();
        
      } else {
        $('#result').hide();
        $('#search').show();
        msg = 'Error while searching data';
        setAlert($('#search'), 'danger', msg);
      }
    }).fail(function() {
      $('#result').hide();
      $('#search').show();
      msg = 'Error while searching data';
      setAlert($('#search'), 'danger', msg);
    })
    
  })
}

function upload() {
  R = [];
  for(i = 1; i <= 5; i++) {
    val = $('input[name=ufield'+i+']').val();
    
    R[i-1] = stringToBigInt(val);
  }
  // make CSI
  c.IndGen(R, function(){});
  // encrypt R
  c.DatUpl(function(){});
    
  data = {SgR: c.SgR, CSIR: c.CSIR};
  postdata = JSON.stringify(data);
  
  $.ajax({
    url: serverurl+'api/datupl',
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: postdata
  }).done(function(data) {
    $('#result').hide();
    $('#upload').show();
    
    if(data.result == 'ok') {
      msg = 'Data upload success';
      setAlert($('#upload'), 'success', msg);
      resetForms();
    } else {
      msg = 'Error while uploading data';
      setAlert($('#upload'), 'danger', msg);
    }
  }).fail(function() {
    $('#result').hide();
    $('#upload').show();
    msg = 'Error while uploading data';
    setAlert($('#upload'), 'danger', msg);
  })
}

function parseResults(data) {
  console.log(data);
  // TODO
}

function setAlert(element, type, msg) {
  $('<div/>', {
    id: 'resultmessage',
    text: msg,
    class: 'alert alert-'+type
  }).prependTo(element);
  
  $('#resultmessage').fadeTo(3000, 500).slideUp(500, function(){
    $('#resultmessage').slideUp(500);
  });
}

function resetForms() {
  $('#uploadform').trigger('reset');
  $('#searchform').trigger('reset');
}

$(document).ready(function() {
  // get cryptographic parameters
  $.getJSON(serverurl+'api/sysset', function(data) {
    if(data.result === 'ok') {
      par = data.params;
      
      g = bigInt(par.g);
      gamma = bigInt(par.gamma);
      P = bigInt(par.P);
      Sg = [bigInt(par.Sg[0]),bigInt(par.Sg[1])];
      n = bigInt(par.n);
      u = bigInt(par.u);
      
      f = {};
      f.u = u;
      
      c.receivePKg(null, g, gamma, f, P, n, Sg, function(){});
    }
  })
  
  // Event handlers
  
  $('#upl-link').click(function() {
    $('#result').hide();
    $('#search').hide();
    $('#upload').show();
  });
  
  $('#srch-link').click(function() {
    $('#result').hide();
    $('#upload').hide();
    $('#search').show();
  });
  
  $('#uploadform').submit(function(e) {
    e.preventDefault();
    $('#upload').hide();
    $('#result').show();
    upload();
  });
  
  $('#searchform').submit(function(e) {
    e.preventDefault();
    $('#search').hide();
    $('#result').show();
    search();
  });
});