var api = {};
api.query = function (queries, loadingCancel) {
  return $.ajax({
    url : '/index.php',
    dataType: 'json',
    type: 'post',
    data: {
      'api': queries,
    },
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.log('API Error:', textStatus, errorThrown, jqXHR.responseText);
  }).done(function( data ) {
    // Cancel loading and timeout
    if (loadingCancel)
      var targetID = loadingCancel();
    // Check for API errors
    for (var key in data) {
      if (data[key] && data[key]['error']) {
        if (loadingCancel)
          $('[data-hbs="'+targetID+'"]').html( HBS['error'](data[key]) );
        throw 'API Error: '+data[key]['error'];
      }
    }
  });
};
