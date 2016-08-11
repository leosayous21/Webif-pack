var myView;
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, controls, scene, renderer;

var cross;

$( document ).ready(function() {
init();
animate();
});

$("#gcode_viewer").click(function(event){
  var elem = renderer.domElement,
    boundingRect = elem.getBoundingClientRect(),
    x = (event.clientX - boundingRect.left) * (elem.width / boundingRect.width),
    y = (event.clientY - boundingRect.top) * (elem.height / boundingRect.height);

var vector = new THREE.Vector3(
    ( x / $( '#gcode_viewer' ).width()) * 2 - 1,
    - ( y / $( '#gcode_viewer' ).height()) * 2 + 1,
    0.5
);
projector = new THREE.Projector();
//projector.unprojectVector( vector, camera );
vector.unproject(camera);
var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
var intersects = ray.intersectObjects( scene.children );

  if(intersects.length>0){
    if(intersects[0].point){
      $("#position_x_pointe").val(Math.round(intersects[0].point.x));
      $("#position_y_pointe").val(Math.round(intersects[0].point.y));
      $("#position_z_pointe").val("");
    }
  }
});



function init() {
  $( '#gcode_viewer' ).height(window.innerHeight);

  camera = new THREE.PerspectiveCamera( 60, $( '#gcode_viewer' ).width() / $( '#gcode_viewer' ).height(), 1, 1000 );
  camera.position.z = 100;

  controls = new THREE.TrackballControls( camera , document.getElementById('gcode_viewer'));

  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.noZoom = false;
  controls.noPan = false;

  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  controls.keys = [ 65, 83, 68 ];

  controls.addEventListener( 'change', render );

  // world

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );



  // lights

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );

  light = new THREE.DirectionalLight( 0x002288 );
  light.position.set( -1, -1, -1 );
  scene.add( light );

  light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );


  // renderer

  renderer = new THREE.WebGLRenderer( { antialias: false } );
  renderer.setClearColor( scene.fog.color );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( $( '#gcode_viewer' ).width(), $( '#gcode_viewer' ).height() );

  container = document.getElementById('gcode_viewer' );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  container.appendChild( stats.dom );

  //

  window.addEventListener( 'resize', onWindowResize, false );
  //

  render();

}

function onWindowResize() {

  camera.aspect = $( '#gcode_viewer' ).width()/ $( '#gcode_viewer' ).height();
  camera.updateProjectionMatrix();

  renderer.setSize( $( '#gcode_viewer' ).width(), $( '#gcode_viewer' ).height() );

  controls.handleResize();

  render();

}

function animate() {

  requestAnimationFrame( animate );
  controls.update();

}

function render() {
  renderer.render( scene, camera );
  stats.update();

}


var Viewer=function(){

  this.drawLines=function(vectors, color, thickness){
    thickness=typeof thickness=="undefined"?1:thickness;


    var material = new THREE.LineBasicMaterial({
      color: color,
      linewidth:thickness
    });

    var geometry = new THREE.Geometry();
    for(var i=0; i<vectors.length; i++){
      geometry.vertices.push(new THREE.Vector3(vectors[i].x,vectors[i].y,vectors[i].z));
    }

    var line = new THREE.Line( geometry, material );
    scene.add( line );
  }

  this.drawCircle=function(position,radius, color){
    var geometry = new THREE.CircleGeometry( 2, radius);
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation(position.x,position.y,position.z));
    var material = new THREE.MeshBasicMaterial( { color: color } );
    var circle = new THREE.Mesh( geometry, material );
    scene.add( circle );
  }

  this.show=function(){
    renderer.setClearColor("white", 1);
    renderer.render( scene, camera );
  }

  this.drawGrid=function(){
    myView.drawCircle(0,0,32,"red");
    //vertical
    for(var i=-50; i<50; i++){
      this.drawLines([{x:i*10, y:-500, z:0},{x:i*10, y:500, z:0}], "gray");
    }

    //horizontal
    for(var i=-50; i<50; i++){
      this.drawLines([{x:-500, y:i*10, z:0},{x:500, y:i*10, z:0}], "gray");
    }

    //drawX;
    this.drawLines([{x:0, y:0, z:0},{x:100, y:0, z:0}], "red",2);
    //drawY;
    this.drawLines([{x:0, y:0, z:0},{x:0, y:100, z:0}], "green",2);

  }
  this.drawCone=function(position){
    var geometry = new THREE.ConeGeometry( 5, 50, 50);
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX(-Math.PI/2));
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation(position.x,position.y,25+position.z));

    var material = new THREE.MeshBasicMaterial( {color: "blue",opacity: 0.5} );
    var cone = new THREE.Mesh( geometry, material );
    scene.add( cone );

    this.drawLines([{x:position.x,y:position.y, z:0},{x:position.x,y:position.y, z:200}], "blue",2);

    //projection
    this.drawCircle({x:position.x,y:position.y,z:0}, 10, "blue");
  }
  this.gcode="";
  this.allGCode=[];
  this.drawGCode=function(gcode){
    this.gcode=gcode;
    var lines=gcode.split('\r\n');
    var gcodePositions={x:0,y:0,z:0};
    for(var i=0; i<lines.length; i++){
      if(lines[i][0]==";")
      {
        continue;
      }
      var coord=lines[i].match(/[XYZ][-\d.]+/g);
      if(!coord)
        continue;

      for(var j=0; j<coord.length; j++){
        if(coord[j][0]=="X")
        {
          var value=parseFloat(coord[j].replace("X",""));
          gcodePositions.x=value;
        }
        else if(coord[j][0]=="Y")
        {
          var value=parseFloat(coord[j].replace("Y",""));
          gcodePositions.y=value;
        }
        else if(coord[j][0]=="Z")
        {
          var value=parseFloat(coord[j].replace("Z",""));
          gcodePositions.z=value;
        }
      }
      this.allGCode.push({x:gcodePositions.x, y:gcodePositions.y,z:gcodePositions.z});
    }

  }

  this.drawCNC=function(position){
    scene = new THREE.Scene();
    myView.drawGrid();
    myView.drawCone(position);
    this.drawLines(this.allGCode, "blue");
    myView.show();
  }
}

myView=new Viewer();



myView.gCode="";
