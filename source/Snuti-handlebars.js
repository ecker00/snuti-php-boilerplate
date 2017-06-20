// Snuti - Handlebars wrapper
// –––––––––––––––––––––––––––––––––––––––––––––––––– //

// Register all the templates as partials on load
for (var tag in HBS) {
  Handlebars.registerPartial(tag, HBS[tag]);
}

// Render HTML to DOM
HBS.render = function( tag, data, target ) {
  if (!target) target = '[data-hbs="'+tag+'"]'; // Default or override target
	data = Object.assign(data, HBS.defaultData);
  if (data.error) {
    $(target).html( HBS['error']( data ) );
  } else {
    var template = tag.split('#')[0];
    if (!HBS[template]) {
      var errorMsg = 'HBS Render: Template "'+template+'" does not exsist.';
      $(target).html( HBS['error']({'error': errorMsg}) );
      console.log(errorMsg);
    } else {
      console.log(target);
      $(target).html( HBS[template]( data ) );
    }
  }
  HBS.rebind();
};

// Append HTML to DOM
HBS.append = function( tag, data, target ) {
  if (!target) target = '[data-hbs="'+tag+'"]'; // Default or override target
  if (data.error) {
    $(target).append( HBS['error']( data ) );
  } else {
    $(target).append( HBS[tag]( data ) );
  }
  HBS.rebind();
};

// Bind all interactive functions
HBS.events = [];
HBS.bind = function(selector, action, callback) {
  HBS.events.push({
    selector: selector,
    action:   action,
    callback: callback,
  });
}

HBS.clickDelay = 0;
HBS.rebind = function() { // Note: This only allows items to have one click event (as a function is not specified in the click off(), because it's an anonymus function)
  HBS.events.forEach(function (event, i) { // Clear previous binding, to refresh
    if (event.action == 'run') {
      event.callback.call(this);
    } else if (event.action == 'click') { // Prevent accidental spam clicks
      $(event.selector).off(event.action); // event.callback
      $(event.selector).on(event.action, function(e) {
        if (HBS.clickDelay < Date.now()) {
          HBS.clickDelay = Date.now() + 500; // Windows default double click is 500ms
          event.callback.call(this, e); // Pass on the context correctly
        }
      });
    } else { // Regular event
      $(event.selector).off(event.action, event.callback);
      $(event.selector).on(event.action, event.callback);
    }
  });
}
$(function() { // Bind everything on pageload
  setTimeout(HBS.rebind, 100);
});

// Hanlebars helpers
// –––––––––––––––––––––––––––––––––––––––––––––––––– //
// Note: All helpers have to be implemented both JS and PHP (for client & server rendering)

// Logic operator helper
Handlebars.registerHelper('logic', function (v1, operator, v2, options) {
  switch (operator) {
    case '==' : if (v1 ==  v2) return options.fn(this); break;
    case '===': if (v1 === v2) return options.fn(this); break;
    case '!=' : if (v1 !=  v2) return options.fn(this); break;
    case '!==': if (v1 !== v2) return options.fn(this); break;
    case '<'  : if (v1 <   v2) return options.fn(this); break;
    case '<=' : if (v1 <=  v2) return options.fn(this); break;
    case '>'  : if (v1 >   v2) return options.fn(this); break;
    case '>=' : if (v1 >=  v2) return options.fn(this); break;
    case '&&' : if (v1 &&  v2) return options.fn(this); break;
    case '||' : if (v1 ||  v2) return options.fn(this); break;
    default: break;
  }
  if (options.inverse)
    return options.inverse(this);
});

// Render dynamic partials
Handlebars.registerHelper('include',  function (tag, context) {
  console.log(context);
	return HBS.render(tag, context['_this']);
});

// Encode data as JSON
// Note: Useful for inspecting contents of HBS variables, or passing data to JS
Handlebars.registerHelper('json', function(data, context) {
  return JSON.stringify(data);
});

// Combine strings
// Note: Useful for passing two variables as one argument
Handlebars.registerHelper('concat', function() {
  var values = []; // Extract arguments
  for(var i=0; i<arguments.length; i++){
    var v = arguments[i];
    if (i+1 == arguments.length) var context = v; // Last argument is always the context
    else values.push(v); // Values to join
  }
  return values.join('');
});

// Multi-dimensional lookup helper
// Diving into specific numeric indexes with children keys can be impossible and messy in handlebars.
// With this approach you do: {{deepLookup inputArray key1 key2 key3...}}
Handlebars.registerHelper('deepLookup', function() {
  var keys = []; // Extract arguments
  for(var i=0; i<arguments.length; i++){
    var a = arguments[i];
    if (i+1 == arguments.length) { var context = a; continue; } // Last argument is always the context
    if (i == 0) { var input = a; continue; } // First argument is always the input
    if (i > 0) { keys.push(a); continue; } // The other arguments are the keys
  }
  for(var i=0; i<keys.length; i++){
    var key = keys[i];
		if (input[key] === undefined) // Key doesn't exsist
			return null; // Return null or undefined? To be, or not to be...
		input = input[key];
	}
	return input;
});

// Simple math calculations
Handlebars.registerHelper('calc', function(v1, operator, v2, context) {
  var v = 0;
  switch (operator) {
    case '+': v = parseFloat(v1) + parseFloat(v2); break;
    case '-': v = parseFloat(v1) - parseFloat(v2); break;
    case '*': v = parseFloat(v1) * parseFloat(v2); break;
    case '/': v = parseFloat(v1) / parseFloat(v2); break;
    default: break;
  }
  if (v === Infinity) v = 0;
  if (isNaN(v)) v = 0;
  return v;
});


// Convert line breaks to paragraphs
Handlebars.registerHelper('toParagraph', function(str, context) {
  if (str) {
    str = str.replace(/\n/g, '</p><p>')
    str = str.replace('<p></p>', '') // Remove empty paragraphs
  }
  return '<p>'+str+'</p>';
});

// –––––––––––––––––––––––––––––––––––––––––––––––––– //
// Handlebars extended functionality
// –––––––––––––––––––––––––––––––––––––––––––––––––– //

// Loading timeout display
HBS.setLoading = function( targetID, loadingStyle ) {
  loadingStyle = (typeof loadingStyle !== 'undefined')?  loadingStyle:'loading';
  // Show loading if it takes longer than 1000ms
  var loadingTimer = setTimeout(function() {
    $('[data-hbs="'+targetID+'"]').html( HBS[loadingStyle]({}) );
    // Timeout after 15 sec
    loadingTimer = setTimeout(function() {
      $('[data-hbs="'+targetID+'"]').html( HBS['error']({}) );
    }, 15000);
  }, 1000);
  // Clear loading
  return function() {
    clearTimeout(loadingTimer);
    return targetID; // Pass targetID along for futher use
  }
}

// Instant loading display, with timeout error
HBS.quickLoading = function( target, type, permanent ) { // Default type is HTML
  var initial;
  if (type=='select')   { initial = $(target).html(); $(target).html('<a>Loading…</a>'); }
  else if (type=='val') { initial = $(target).val();  $(target).val('<a>Loading…</a>'); }
  else if (type=='str') { initial = $(target).html(); $(target).html('<a>Loading…</a>'); }
  else if (type=='img') { initial = $(target).attr('src'); $(target).attr('src', '/img/loading.svg'); }
  else                  { initial = $(target).html(); $(target).html(HBS['loading']({})); }
  
  // Timeout after 15 sec
  var timeoutTimer = setTimeout(function() {
    if (type=='select')   { $(target).html('<option>Sorry, something went wrong.</option>'); }
    else if (type=='val') { $(target).val('Sorry, something went wrong.'); }
    else if (type=='str') { $(target).html('Sorry, something went wrong.'); }
    else                  { $(target).html(HBS['error']({})); }
  }, 15000);
  
  // Clear loading timeout
  return function() {
    clearTimeout(timeoutTimer);
    if (!permanent) {
      if (type=='select')   { $(target).html( initial ); }
      else if (type=='val') { $(target).val(  initial ); }
      else if (type=='str') { $(target).html( initial ); }
      else if (type=='img') { $(target).attr('src', initial); }
      else                  { $(target).html( initial ); }
    }
    return target; // Pass target along for futher use
  }
}

