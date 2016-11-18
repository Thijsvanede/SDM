var c = new Client();
var serverurl = "https://encrypted-data-search-thijsvanede512475.codeanyapp.com/";

function search() {
  L = [];
  l = [];
  for(i = 1; i <= 5; i++) {
    val = $('input[name=sfield'+i+']').val();
    if(val !== "") {
      L.push(stringToBigInt(val));
      l.push(i);
    }
  }
  if(L.length === 0) {
    $('#result').hide();
    $('#search').show();
    msg = 'Nothing filled in';
    setAlert($('#search'), 'danger', msg);
    return;
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
        if(data.docs.length > 0) {
          $('#result').html("");
          parseResults(data);
          resetForms();
        } else {
          $('#result').hide();
          $('#search').show();
          msg = 'No documents found';
          setAlert($('#search'), 'danger', msg);
        }
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
  for(i = 1; i <= 4; i++) {
    val = $('input[name=ufield'+i+']').val();
    
    R[i-1] = stringToBigInt(val);
  }
  R[4] = stringToBigInt($('#txtarea').val());
  
  
  // make CSI
  c.IndGen(R, function(){});
  // encrypt R
  c.DatUpl(function(){});
  
  // convert bigints to string for transport
  var SgR = c.SgR;
  var CSIR = c.CSIR;
  for(i = 0; i < SgR.length; i++) {
    SgR[i] = SgR[i].toString();
  }
  for(i = 0; i < CSIR.length; i++) {
    CSIR[i] = CSIR[i].toString();
  }
  
  data = {SgR: SgR, CSIR: CSIR};
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
  var docs = data.docs;
  
  $('#result').append('<h1>Search results</h1>');
  
  var table = $('<table></table>').addClass('table table-striped table-bordered table-hover');
  var head = $('<thead><tr><th>#</th><th>Field1</th><th>Field2</th><th>Field3</th>' +
              '<th>Field4</th><th>Field5</th></tr></thead>').addClass('thead-inverse').appendTo(table);
  var tbody = $('<tbody></tbody>').appendTo(table);
  
  for(i = 0; i < docs.length; i++) {
    var row = $('<tr></tr>').appendTo(tbody);
    $('<td>'+ (i+1) +'</td>').appendTo(row);
    for(j = 0; j < docs[i].length; j++) {
      $('<td>' + bigIntToString(bigInt(docs[i][j])) + '</td>').appendTo(row);
    }
  }
  
  table.appendTo($('#result'));
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
    $('#result').html('<div class="row"><div class="loading col-md-2 col-md-offset-5">' +
                    '<span class="glyphicon glyphicon-refresh spinning"></span></div></div>');
  });
  
  $('#srch-link').click(function() {
    $('#result').hide();
    $('#upload').hide();
    $('#search').show();
    $('#result').html('<div class="row"><div class="loading col-md-2 col-md-offset-5">' +
                    '<span class="glyphicon glyphicon-refresh spinning"></span></div></div>');
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