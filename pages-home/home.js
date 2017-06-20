$(function() {
  // Toggle description view
  // –––––––––––––––––––––––––––––––––––––––––––––––––– //
  HBS.bind('.frontSide, .backSide', 'click', function() {
    var parent = $(this).closest('.meal')
    var frontSide = parent.find('.frontSide')
    var backSide = parent.find('.backSide')
    if ($(this).hasClass('frontSide')) {
      $('.backSide').not(backSide).slideUp(400) // Deactivate others
      $('.frontSide').not(frontSide).slideDown(400)
      $(frontSide).slideUp(400)
      $(backSide).slideDown(400)
    } else {
      $(frontSide).slideDown(400)
      $(backSide).slideUp(400)
    }
  })
  
  // Heart the meal
  // –––––––––––––––––––––––––––––––––––––––––––––––––– //
  HBS.bind('[data-btn="vote"]', 'click', function() {
    var mealID = $(this).closest('[data-mealID]').data('mealid')
    var queries = {
      'voteMeal': {
        'mealID': mealID
      }
    }
    var loadingCancel = HBS.quickLoading(this, 'img')
    api.query(queries, loadingCancel)
      .done(function(data) {
        updateDetails(mealID); // Refresh view
      })
      
  })
  
  function updateDetails( mealID ) {
    var queries = {
      'getMeal': {
        'mealID': mealID
      }
    }
    var loadingCancel = HBS.quickLoading(this, 'img')
    api.query(queries, loadingCancel)
      .done(function(data) {
        HBS.render('home-mealDetails#'+mealID, data.getMeal)
      })
  }
  
  // Load more items on scroll
  // –––––––––––––––––––––––––––––––––––––––––––––––––– //
  var loadingOffset = 0;
  var loadingMore = false;
  var loadMore = $('[data-event="loadMore"]');
  $(window).on('scroll', loadMoreInView);
  
  // Start loading when loadMore is in view
  function loadMoreInView() {
    if (!loadMore.length) return;
    var scrollPos = $(window).scrollTop() + $(window).height();
    var loadPos = $(loadMore).offset().top;
    var inView = (loadPos <= scrollPos)? true:false;
    if (inView && !loadingMore) {
      loadingMore = true;
      loadingOffset += 20;
      loadMoreMeals();
    }
  }
  // Load more items and append
  function loadMoreMeals() {
    var queries = {
      'getMeals': {
        'offset': loadingOffset,
      }
    }
    $(loadMore).css('opacity', 1);
    var loadingCancel = HBS.quickLoading(this, 'img')
    api.query(queries, loadingCancel)
      .done(function(data) {
        $(loadMore).remove();
        for (i in data.getMeals.items)
          HBS.append('home-meal', data.getMeals.items[i], '[data-target="meals"]');
        if (data.getMeals.next)
          HBS.append('home-loadMore', {}, '[data-target="meals"]');
        loadMore = $('[data-event="loadMore"]');
        loadingMore = false;
      })
  }
})