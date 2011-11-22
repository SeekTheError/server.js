//CUSTOM Node.js webserver

//global configuration
var port= 1337;
var listenTo = "127.0.0.1";

//route configuration
GET = {}
POST = {}
PUT = {}
DELETE = {}

var path = require('path');
var fs = require('fs');
var mime = require('mime');

function _static() {
  //use scope instead of this to have a single scope for the request
  var scope=this;
  var filePath = '.' + this.requestItems.path;
  if(filePath == "./static/"){_403.apply(scope);return; }
    path.exists(filePath, function(exists) {
    if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    _500.apply(scope);
                }
                else {
                    var fileMime=mime.lookup(filePath);
                    _wsc(scope,200,fileMime);
                    _we(scope,content);
                }
            });
        }
        else {
  	    _404.apply(scope);;
        }
});
}

// note, io.listen() will create a http server for you

GET["/static/.*"]= _static;

_403 =  function () {_wsc(this,403,  'text/plain');_we(this,"403, Forbidden");}
_404 =  function () {_wsc(this,404,  'text/plain');_we(this,"404, Page not found");}
_500 =  function () {_wsc(this,500,  'text/plain');_we(this,"500, Server Error");}

GET["/favicon.ico"] = function () { this.requestItems.path = "/static/favicon.ico"; GET["/static/.*"].apply(this);  }

GET["_404"]= _404;
GET["_500"]= _500;


//server
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
app.listen(port);

function handler(req, res) {
  //the content response
  var content;
  var requestItems=parseUri(req.url);
  var requestPath=Utils.stripTrailingSlash(requestItems.path);

  var scope=Utils.createScope(res,req,requestItems);
  console.log(req.method+" "+requestPath);
  var fToCall;var httpMethod = Utils.defineMethod(req.method);
  if(requestPath == ""){fToCall= httpMethod["/static/.*"];scope.requestItems.path = "/static/hp.html";}
  
  else for (route in httpMethod) {
  //console.log("trying route: "+route);
  if (requestPath.match(route)){
    fToCall = httpMethod[route];
    //console.log("match, using route: "+route);
    break;
  }
 }
  if( typeof fToCall === "undefined"){
  fToCall= GET["_404"] ;
  }
  fToCall.apply(scope);
}
console.log("server running at "+listenTo+":"+port);

//io.sockets.in("GLOBAL ROOM").emit('message',{data:});
io.sockets.on('connection', function (socket) {
if(typeof (socket.rooms) === "undefined") socket.rooms=new Array(); 
console.log(socket)
socket.rooms.push("GLOBAL ROOM");
socket.join("GLOBAL ROOM");

io.sockets.in("GLOBAL ROOM").emit('message',"new user");
socket.on('join room', function (data) {
   socket.rooms.push("GLOBAL ROOM");
  });

socket.on('message', function (data) {
    var rooms =socket.rooms;
    data.source = socket.id;
    for ( r in rooms){
    io.sockets.in(rooms[r]).emit('message',data);
    }
  });
});



////////////////////////////////////////////////
//UTILS part


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
Utils.writeEnd = function(scope,content,encoding){
if(typeof encoding == "undefined"){encoding="utf-8";}
scope.res.end(content);
}

Utils.defineMethod=function(requestMethod){
  if(requestMethod == "GET") return GET;
  if(requestMethod == "POST") return POST;
  if(requestMethod == "PUT") return PUT;
  if(requestMethod == "DELETE") return DELETE;
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




