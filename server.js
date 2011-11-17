//CUSTOM Node.js webserver

//global configuration
var port= 1337;
var listenTo = "127.0.0.1";

//route configuration
Dispatcher= function () {return "Hello World on HP";}

Dispatcher["hello"]= function () {var response = "Hello World, acces url was "+this.req.url;return response;}

Dispatcher["hello"]["tcm"] = function() {return "Hello tcm";}

var http = require('http');
http.Dispatcher=Dispatcher;
http.createServer(function (req, res) {
  //the content response
  var content;
  var param = req.url.split("/");
  var route =Array();
  console.log("url:"+req.url);
  for (var p in param){if(param[p] != "") {route.push(param[p]);console.log(p);}}
    
  console.log("target length:"+route.length);
  var fToCall;
  if (route.length == 0){
  fToCall = Dispatcher;
    }
  else if (route.length == 1 ){
  fToCall = Dispatcher[route[0]];
    }
  else if (route.length == 2 ) {
  fToCall = Dispatcher[route[0]][route[1]];
    }
  if( typeof fToCall === "undefined"){
   res.writeHead(404, {'Content-Type': 'text/plain'});
   res.end("404, Page not found");
  }else {
  scope={}
  scope.res=res;
  scope.req=req;
  content = fToCall.apply(scope);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  console.log(content);
  res.end(content);}
}).listen(port,listenTo);
console.log("server running at "+listenTo+":"+port);



