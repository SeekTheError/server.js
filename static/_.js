
 _ =  function (params) {

var serverUrl=params.serverUrl;'http://localhost'

$(document).ready(function(){
$("#title").html("Welcome to _<br>");
socket = io.connect(serverUrl);
$("#input_message").focus();


$("#input_message").keyup(function(event){
  if(event.which == 13){
  toSend=name + ">" +$("#input_message").val();
  $("#input_message").val("");
  appendMessage("#chat_area",toSend);
  socket.emit('message',toSend);
  }
   
});

  
  socket.on("message", function (data) {
  appendMessage("#chat_area",data)
});

});

function appendMessage(target,toAppend){
  $(target).append(toAppend);
  $(target).append("<br/>");

}

var getQueryParameter = function (name)
{
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

var name = getQueryParameter("name");

}


_.prototype.addHandler = function (eventName,func){
this.socket.on(eventName , func);
};
