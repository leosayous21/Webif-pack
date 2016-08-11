/* These are functions from functions.js */
/* Cleaned up so I can read the bloody thing */

var mySmoothie={ip:"192.168.2.99"};

jQuery(document).ready(function() {
 var pos = jQuery('#pos');

 function Command(value){
   this.value=value;
   this.return="";
   this.result=function(){};
   this.treat=function(val){
     this.return=val;
     var status=val.split(",");
     this.result({status:status[0].replace("<",""),
                  x: parseFloat(status[4].replace("WPos:","")),
                  y: parseFloat(status[5]),
                  z: parseFloat(status[6].replace(">","").replace(/[\n\r]/g, ''))});
   }
 }

 function updatePos() {
   var getStatus=new Command("get status");
   getStatus.result=function(val){
     $("#status").html(val.status);
     if(val.status=="Run"){
       $(".panel-heading").parent().removeClass("panel-default");
       $(".panel-heading").parent().removeClass("panel-danger");
       $(".panel-heading").parent().addClass("panel-primary");
     }
     else if(val.status=="Alarm"){
       $(".panel-heading").parent().removeClass("panel-primary");
       $(".panel-heading").parent().removeClass("panel-default");
       $(".panel-heading").parent().addClass("panel-danger");
     }
     else{
       $(".panel-heading").parent().removeClass("panel-primary");
       $(".panel-heading").parent().removeClass("panel-danger");
       $(".panel-heading").parent().addClass("panel-default");
     }
     $("#position_x").val(val.x);
     $("#position_y").val(val.y);
     $("#position_z").val(val.z);
     myView.drawCNC(val);
   };
   runCommandCallback(getStatus.value, function(data){getStatus.treat(data)});
 }

 updatePos();
 setInterval(updatePos, 1000); // 1 * 500 miliseconds
});

$(document).keypress(function(e){
  //ENTER
  if(e.keyCode==13){
    runCommand("G0 F1000 X"+$("#position_x_pointe").val()+" Y"+$("#position_y_pointe").val(),true);
  }
});

function runCommand(d,b)
{ var a=$("#commandForm");
  d+="\n";url=b?"/command_silent":"/command";
  console.log(url);
  var c=$.post("http://"+mySmoothie.ip+url,d);
  if(!b)
  {c.done(function(e){$("#result").empty();$.each(e.split("\n"),function(f){$("#result").append(this+"<br/>")})})}}

function runCommandSilent(a){runCommand(a,true)}

function runCommandCallback(cmd,callback) {
    var url = "http://"+mySmoothie.ip+"/command";
    cmd += "\n";
    var posting = $.post( url, cmd, callback);

}

function jogXYClick(a){runCommand("G91 G0 "+a+" F"+document.getElementById("xy_velocity").value+" G90",true)}

function jogZClick(a){runCommand("G91 G0 "+a+" F"+document.getElementById("z_velocity").value+" G90",true)}

function extrude(g,d,c)
{ var f=document.getElementById("extrude_length").value;
  var e=document.getElementById("extrude_velocity").value;
  var h=(g.currentTarget.id=="extrude")?1:-1;
  runCommand("G91 G0 E"+(f*h)+" F"+e+" G90",true)}

function motorsOff(a){runCommand("M18",true)}

function handleFileSelect(a){var d=a.target.files;var b=[];for(var c=0,e;e=d[c];c++){b.push("<li><strong>",escape(e.name),"</strong> (",e.type||"n/a",") - ",e.size," bytes, last modified: ",e.lastModifiedDate?e.lastModifiedDate.toLocaleDateString():"n/a","</li>")}document.getElementById("list").innerHTML="<ul>"+b.join("")+"</ul>"}

function upload()
{ $("#progress").empty();
  $("#uploadresult").empty();
  var b=document.getElementById("files").files[0];
  var a=new FileReader();a.readAsBinaryString(b);
  a.onloadend=function(c){xhr=new XMLHttpRequest();
  xhr.open("POST","http://"+mySmoothie.ip+"/upload",true);
  xhr.setRequestHeader("X-Filename",b.name);
  XMLHttpRequest.prototype.mySendAsBinary=function(k)
    {
      var h=new ArrayBuffer(k.length);
       var f=new Uint8Array(h,0);
       for (var g=0;g<k.length;g++)
         { f[g]=(k.charCodeAt(g)&255)
         }
       if(typeof window.Blob=="function") {
         var e=new Blob([h])
       } else {
         var j=new (window.MozBlobBuilder||window.WebKitBlobBuilder||window.BlobBuilder)();
         j.append(h);
        var e=j.getBlob()
      }
      this.send(e)
    };
    var d=xhr.upload||xhr;
    d.addEventListener("progress",function(i) {
       var f=i.position||i.loaded;
       var h=i.totalSize||i.total;
       var g=Math.round((f/h)*100);
       $("#progress").empty().append("uploaded "+g+"%")
    } );
   xhr.onreadystatechange=function() {
      if(xhr.readyState==4) {
       if(xhr.status==200) {
            $("#uploadresult").empty().append("Uploaded "+b.name+" OK")
        } else {
            $("#uploadresult").empty().append("Uploading "+b.name+" Failed")
       }
    }
  };
  xhr.mySendAsBinary(c.target.result)}
}

function copyofupload(){$("#progress").empty();$("#uploadresult").empty();var b=document.getElementById("files").files[0];var a=new FileReader();a.readAsBinaryString(b);a.onloadend=function(c){xhr=new XMLHttpRequest();xhr.open("POST","upload",true);xhr.setRequestHeader("X-Filename",b.name);XMLHttpRequest.prototype.mySendAsBinary=function(k){var h=new ArrayBuffer(k.length);var f=new Uint8Array(h,0);for(var g=0;g<k.length;g++){f[g]=(k.charCodeAt(g)&255)}if(typeof window.Blob=="function"){var e=new Blob([h])}else{var j=new (window.MozBlobBuilder||window.WebKitBlobBuilder||window.BlobBuilder)();j.append(h);var e=j.getBlob()}this.send(e)};var d=xhr.upload||xhr;d.addEventListener("progress",function(i){var f=i.position||i.loaded;var h=i.totalSize||i.total;var g=Math.round((f/h)*100);$("#progress").empty().append("uploaded "+g+"%")});xhr.onreadystatechange=function(){if(xhr.readyState==4){if(xhr.status==200){$("#uploadresult").empty().append("Uploaded OK")}else{$("#uploadresult").empty().append("Upload Failed")}}};xhr.mySendAsBinary(c.target.result)}}

function playFile(a){runCommandSilent("play /sd/"+a)}

function readFile(a){runCommandCallback("cat /sd/"+a, function(val){
  //console.log(val.replace(/N\d{2,}\s/gm, ""));
  myView.drawGCode(val);
  /*var lines=val.split("\r\n");
  for(var i=0; i<val.length; i++){
    console.log(val[i]);
  }*/
})}

function refreshFiles()
{ document.getElementById("fileList").innerHTML="";
   runCommandCallback("M20",function(a)
      { $.each(a.split("\n"),function(c){var e=this.trim();if(e.match(/\.g(code)?$/)){var d=document.getElementById("fileList");var g=d.insertRow(-1);var b=g.insertCell(0);var f=document.createTextNode(e);b.appendChild(f);b=g.insertCell(1);b.innerHTML="[<a href='javascript:void(0);' onclick='playFile(\""+e+"\");'>Play</a>][<a href='javascript:void(0);' onclick='readFile(\""+e+"\");'>Read</a>]"}})})};

function getgcodeFiles()
{ document.getElementById("fileList").innerHTML="";   runCommandCallback("M20",function(a)
      { $.each(a.split("\n"),function(c){var e=this.trim();if(e.match(/\.g(code)?$/)){var d=document.getElementById("fileList");var g=d.insertRow(-1);var b=g.insertCell(0);var f=document.createTextNode(e);b.appendChild(f);b=g.insertCell(1);b.innerHTML="[<a href='javascript:void(0);' onclick='checkfile(\""+e+"\");'>Run GCode</a>][<a href='javascript:void(0);' onclick='readFile(\""+e+"\");'>Read</a>]"}})})};

function checkfile(e)
{ if (confirm('Start the CNC machining of file? \n'+e))
      playFile(e);   /* was playFile(\""+e+\""); */
}

/* These are new CNC specific functions */

function zeroX(a){runCommand("G92 X0",true)}
function zeroY(a){runCommand("G92 Y0",true)}
function zeroZ(a){runCommand("G92 Z0",true)}
function zero(a){runCommand("G0 X0 Y0",true);
                 setTimeout(function(){runCommand("G0 Z0",true);},1000)}
function zeroXY(a){runCommand("G0 X0 Y0",true);}

function posXset()
{ var x=document.getElementById("x_override").value;
  runCommand("G92 X"+x,false);
}

function posYset()
{ var x=document.getElementById("y_override").value;
  runCommand("G92 Y"+x,false);
}

function posZset()
{ var x=document.getElementById("z_override").value;
  runCommand("G92 Z"+x,false);
}

function getPosition(){runCommand("M114",false)}

function getEndStops()
{ var d=$("M119");
  //var a=$("#endstops");
  d+="\n";
  url="http://"+mySmoothie.ip+"/command";
  var c=$.post(url,d);
  c.done(function(e){$("#end_stops").empty();$.each(e.split("\n"),function(f){$("#end_stops").append(this)})})}



function spindleON(){runCommand("M3",true)}

function spindleOFF(){runCommand("M5",true)}

var progress_down=false;
$("#progress_spindle").mousedown(function(){
  progress_down=true;
});
$("#progress_spindle").mouseup(function(){
  progress_down=false;
});
$("#progress_spindle").mousemove(function(e){
  if(progress_down){
    var valeur=e.offsetX/$("#progress_spindle").width()*100;
    $('.progress-bar').css('width', valeur+'%').attr('aria-valuenow', valeur);
    $('#progress_value').html(Math.round(e.offsetX/$("#progress_spindle").width()*10000)/100);
  }
});
