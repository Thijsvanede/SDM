var c = new Client();

function search() {
  
}

function upload() {
  R = [];
  for(i = 1; i <= 5; i++) {
    val = $('input[name=field'+i+']').val();
    R[i-1] = val; // todo convert to bigint
  }
  indGen(R, function() {
    // CSI gen done
  });
  
}

$(document).ready(function() {
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
    upload();
    $('#upload').hide();
    $('#upload').trigger('reset');
    $('#result').show();
  });
  
  $('#searchform').submit(function(e) {
    e.preventDefault();
    search();
    $('#search').hide();
    $('#search').trigger('reset');
    $('#result').show();
  });
});