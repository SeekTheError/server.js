//CUSTOM Node.js webserver

//global configuration
var port= 1337;
var listenTo = "127.0.0.1";

//route configuration
Dispatcher = {}

var path = require('path');
var fs = require('fs');
Dispatcher["/static/.*"]= function () {
  var filePath = '.' + this.requestItems.path;
  var scope = this;
  console.log("file path: "+filePath);
    path.exists(filePath, function(exists) {
    if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    scope.res.writeHead(500);
                    scope.res.end();
                }
                else {
                    scope.res.writeHead(200);
                    scope.res.end(content, 'utf-8');
                }
            });
        }
        else {
  	    _404.apply(scope);
            //scope.res.writeHead(404, { 'Content-Type': 'text/html' });
            //scope.res.end("File Not Found", 'utf-8');
        }
});
}
Dispatcher["index.html"]= function () {_wsc(this,200,"text/plain");_we(this,"Hello World on HP");}

_404 =  function () {_wsc(this,404,  'text/plain');_we(this,"404, Page not found");}

Dispatcher["/favicon.ico"] = function () { this.requestItems.path = "/static/favicon.ico"; Dispatcher["/static/.*"].apply(this);  }

Dispatcher["_404"]= _404;



//server

var http = require('http');
http.Dispatcher=Dispatcher;
http.createServer(function (req, res) {
  //the content response
  var content;
  var requestItems=parseUri(req.url);
  var requestPath=Utils.stripTrailingSlash(requestItems.path);
  console.log("request:"+requestPath);
  var fToCall;
  for (route in Dispatcher) {
  if( requestPath == ""){fToCall = Dispatcher["index.html"]}
  console.log("trying route: "+route);
  if (requestPath.match(route)){
    fToCall = Dispatcher[route];
    console.log("match, using route: "+route);
    break;
  }
 }
  if( typeof fToCall === "undefined"){
  fToCall= Dispatcher["_404"] ;
  }
  Utils.createScope(res,req,requestItems);
  content = fToCall.apply(scope);
}).listen(port,listenTo);
console.log("server running at "+listenTo+":"+port);

////////////////////////////////////////////////
//UTILS part

Constant = {}
Constant.contentType= {}
Constant.contentType.plainText = 'text/plain';

Utils = {}

Utils.stripTrailingSlash = function (str) {
    if(str.substr(-1) == '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
}


Utils.createScope= function (res,req,requestItems){
  scope={}
  scope.res=res;
  scope.req=req;
  scope.requestItems = requestItems;
  return scope;
}

Utils.writeStatusContentType = function (scope,status,contentType){
 scope.res.writeHead(status, {'Content-Type': contentType});
}
Utils.writeEnd = function(scope,content){
scope.res.end(content);
}
_wsc = Utils.writeStatusContentType ;
_we  = Utils.writeEnd;

///////////////////////
// LIBS

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

// 




