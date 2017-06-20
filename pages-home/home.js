$(function() {
  
  // Example: Reload view
  // –––––––––––––––––––––––––––––––––––––––––––––––––– //
  // HBS.bind is similar to jQuery's $().on() function, but will
  // always rebind itself after a partial have been re-rendered
  HBS.bind('[data-btn="reloadView"]', 'click', function() {
    var queries = {
      'example': null
    }
    var loadingCancel = HBS.setLoading('home-main')
    api.query(queries, loadingCancel)
      .done(function(data) {
        HBS.render('home-main', data)
      })
  })
  
})