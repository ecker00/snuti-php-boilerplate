this.HBS=this.HBS||{},this.HBS.error=Handlebars.template({1:function(container,depth0,helpers,partials,data){var stack1;return"    <pre>"+(null!=(stack1=(helpers.json||depth0&&depth0.json||helpers.helperMissing).call(null!=depth0?depth0:container.nullContext||{},depth0,{name:"json",hash:{},data:data}))?stack1:"")+"</pre>\n"},compiler:[7,">= 4.0.0"],main:function(container,depth0,helpers,partials,data){var stack1;return'<div class="error">\n  Sorry, something went wrong.\n  <a href="javascript:location.reload();">Reload?</a>\n'+(null!=(stack1=helpers.if.call(null!=depth0?depth0:container.nullContext||{},depth0,{name:"if",hash:{},fn:container.program(1,data,0),inverse:container.noop,data:data}))?stack1:"")+"</div>\n\n"},useData:!0}),this.HBS["home-main"]=Handlebars.template({compiler:[7,">= 4.0.0"],main:function(container,depth0,helpers,partials,data){var helper;return"<p>\n\tThis view have been called "+container.escapeExpression((helper=null!=(helper=helpers.example||(null!=depth0?depth0.example:depth0))?helper:helpers.helperMissing,"function"==typeof helper?helper.call(null!=depth0?depth0:container.nullContext||{},{name:"example",hash:{},data:data}):helper))+' times.\n  <button data-btn="reloadView">Reload view</button>\n</p>\n'},useData:!0}),this.HBS.loading=Handlebars.template({compiler:[7,">= 4.0.0"],main:function(container,depth0,helpers,partials,data){return'<div class="loading">\n  <img src="img/loading.svg">\n  Loading…\n</div>\n'},useData:!0}),this.HBS.template=Handlebars.template({compiler:[7,">= 4.0.0"],main:function(container,depth0,helpers,partials,data){var stack1,helper,alias1=container.lambda,alias2=container.escapeExpression,alias3=null!=depth0?depth0:container.nullContext||{},alias4=helpers.helperMissing;return'<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <title>Your project – '+alias2(alias1(null!=(stack1=null!=depth0?depth0.currentPage:depth0)?stack1.title:stack1,depth0))+'</title>\n\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t\t<meta name="keywords" content="boilerplate,php">\n    <meta name="description" content="Your project description">\n    <link rel="stylesheet" href="/style.css?v='+alias2((helper=null!=(helper=helpers.version||(null!=depth0?depth0.version:depth0))?helper:alias4,"function"==typeof helper?helper.call(alias3,{name:"version",hash:{},data:data}):helper))+'">\n\t\t<script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"><\/script>\n\t\t<script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.6/handlebars.runtime.min.js"><\/script>\n    <script src="/script.js?v='+alias2((helper=null!=(helper=helpers.version||(null!=depth0?depth0.version:depth0))?helper:alias4,"function"==typeof helper?helper.call(alias3,{name:"version",hash:{},data:data}):helper))+'"><\/script>\n    <script>HBS.defaultData = '+(null!=(helper=null!=(helper=helpers.defaultData||(null!=depth0?depth0.defaultData:depth0))?helper:alias4,stack1="function"==typeof helper?helper.call(alias3,{name:"defaultData",hash:{},data:data}):helper)?stack1:"")+'<\/script>\n  </head>\n  \n  <body>\n    <header>\n      <h1>Your project</h1>\n    </header>\n    <div data-hbs="'+alias2(alias1(null!=(stack1=null!=depth0?depth0.currentPage:depth0)?stack1.hbs:stack1,depth0))+'">\n      '+(null!=(stack1=(helpers.include||depth0&&depth0.include||alias4).call(alias3,null!=(stack1=null!=depth0?depth0.currentPage:depth0)?stack1.hbs:stack1,{name:"include",hash:{},data:data}))?stack1:"")+'\n    </div>\n\t\t<footer>\n\t\t\tPage footer <a href="example.com">example.com</a> '+alias2((helper=null!=(helper=helpers.year||(null!=depth0?depth0.year:depth0))?helper:alias4,"function"==typeof helper?helper.call(alias3,{name:"year",hash:{},data:data}):helper))+"\n\t\t</footer>\n  </body>\n</html>\n\n"},useData:!0});var api={};api.query=function(queries,loadingCancel){return $.ajax({url:"/index.php",dataType:"json",type:"post",data:{api:queries}}).fail(function(jqXHR,textStatus,errorThrown){console.log("API Error:",textStatus,errorThrown,jqXHR.responseText)}).done(function(data){if(loadingCancel)var targetID=loadingCancel();for(var key in data)if(data[key]&&data[key].error)throw loadingCancel&&$('[data-hbs="'+targetID+'"]').html(HBS.error(data[key])),"API Error: "+data[key].error})};for(var tag in HBS)Handlebars.registerPartial(tag,HBS[tag]);HBS.render=function(tag,data,target){if(target||(target='[data-hbs="'+tag+'"]'),(data=Object.assign(data,HBS.defaultData)).error)$(target).html(HBS.error(data));else{var template=tag.split("#")[0];if(HBS[template])console.log(target),$(target).html(HBS[template](data));else{var errorMsg='HBS Render: Template "'+template+'" does not exsist.';$(target).html(HBS.error({error:errorMsg})),console.log(errorMsg)}}HBS.rebind()},HBS.append=function(tag,data,target){target||(target='[data-hbs="'+tag+'"]'),data.error?$(target).append(HBS.error(data)):$(target).append(HBS[tag](data)),HBS.rebind()},HBS.events=[],HBS.bind=function(selector,action,callback){HBS.events.push({selector:selector,action:action,callback:callback})},HBS.clickDelay=0,HBS.rebind=function(){HBS.events.forEach(function(event,i){"run"==event.action?event.callback.call(this):"click"==event.action?($(event.selector).off(event.action),$(event.selector).on(event.action,function(e){HBS.clickDelay<Date.now()&&(HBS.clickDelay=Date.now()+500,event.callback.call(this,e))})):($(event.selector).off(event.action,event.callback),$(event.selector).on(event.action,event.callback))})},$(function(){setTimeout(HBS.rebind,100)}),Handlebars.registerHelper("logic",function(v1,operator,v2,options){switch(operator){case"==":if(v1==v2)return options.fn(this);break;case"===":if(v1===v2)return options.fn(this);break;case"!=":if(v1!=v2)return options.fn(this);break;case"!==":if(v1!==v2)return options.fn(this);break;case"<":if(v1<v2)return options.fn(this);break;case"<=":if(v1<=v2)return options.fn(this);break;case">":if(v1>v2)return options.fn(this);break;case">=":if(v1>=v2)return options.fn(this);break;case"&&":if(v1&&v2)return options.fn(this);break;case"||":if(v1||v2)return options.fn(this)}if(options.inverse)return options.inverse(this)}),Handlebars.registerHelper("include",function(tag,context){return console.log(context),HBS.render(tag,context._this)}),Handlebars.registerHelper("json",function(data,context){return JSON.stringify(data)}),Handlebars.registerHelper("concat",function(){for(var values=[],i=0;i<arguments.length;i++){var v=arguments[i];if(i+1==arguments.length);else values.push(v)}return values.join("")}),Handlebars.registerHelper("deepLookup",function(){for(var keys=[],i=0;i<arguments.length;i++){var a=arguments[i];if(i+1!=arguments.length)if(0!=i)i>0&&keys.push(a);else var input=a;else;}for(i=0;i<keys.length;i++){var key=keys[i];if(void 0===input[key])return null;input=input[key]}return input}),Handlebars.registerHelper("calc",function(v1,operator,v2,context){var v=0;switch(operator){case"+":v=parseFloat(v1)+parseFloat(v2);break;case"-":v=parseFloat(v1)-parseFloat(v2);break;case"*":v=parseFloat(v1)*parseFloat(v2);break;case"/":v=parseFloat(v1)/parseFloat(v2)}return v===1/0&&(v=0),isNaN(v)&&(v=0),v}),Handlebars.registerHelper("toParagraph",function(str,context){return str&&(str=(str=str.replace(/\n/g,"</p><p>")).replace("<p></p>","")),"<p>"+str+"</p>"}),HBS.setLoading=function(targetID,loadingStyle){loadingStyle=void 0!==loadingStyle?loadingStyle:"loading";var loadingTimer=setTimeout(function(){$('[data-hbs="'+targetID+'"]').html(HBS[loadingStyle]({})),loadingTimer=setTimeout(function(){$('[data-hbs="'+targetID+'"]').html(HBS.error({}))},15e3)},1e3);return function(){return clearTimeout(loadingTimer),targetID}},HBS.quickLoading=function(target,type,permanent){var initial;"select"==type?(initial=$(target).html(),$(target).html("<a>Loading…</a>")):"val"==type?(initial=$(target).val(),$(target).val("<a>Loading…</a>")):"str"==type?(initial=$(target).html(),$(target).html("<a>Loading…</a>")):"img"==type?(initial=$(target).attr("src"),$(target).attr("src","/img/loading.svg")):(initial=$(target).html(),$(target).html(HBS.loading({})));var timeoutTimer=setTimeout(function(){"select"==type?$(target).html("<option>Sorry, something went wrong.</option>"):"val"==type?$(target).val("Sorry, something went wrong."):"str"==type?$(target).html("Sorry, something went wrong."):$(target).html(HBS.error({}))},15e3);return function(){return clearTimeout(timeoutTimer),permanent||("select"==type?$(target).html(initial):"val"==type?$(target).val(initial):"str"==type?$(target).html(initial):"img"==type?$(target).attr("src",initial):$(target).html(initial)),target}},$(function(){HBS.bind('[data-btn="reloadView"]',"click",function(){var queries={example:null},loadingCancel=HBS.setLoading("home-main");api.query(queries,loadingCancel).done(function(data){HBS.render("home-main",data)})})});
//# sourceMappingURL=script.js.map