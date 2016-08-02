var myView;
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var camera, controls, scene, renderer;

var cross;

init();
animate();

function init() {

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.z = 100;

  controls = new THREE.TrackballControls( camera );

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
  renderer.setSize( window.innerWidth, window.innerHeight );

  container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  container.appendChild( stats.dom );

  //

  window.addEventListener( 'resize', onWindowResize, false );
  //

  render();

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

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

  this.drawCircle=function(){
    var geometry = new THREE.CircleGeometry( 2, 32 );
    var material = new THREE.MeshBasicMaterial( { color: "red" } );
    var circle = new THREE.Mesh( geometry, material );
    scene.add( circle );
  }

  this.show=function(){
    renderer.setClearColor("white", 1);
    renderer.render( scene, camera );
  }

  this.drawGrid=function(){
    myView.drawCircle();
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

    var material = new THREE.MeshBasicMaterial( {color: "blue"} );
    var cone = new THREE.Mesh( geometry, material );
    scene.add( cone );

    this.drawLines([{x:position.x,y:position.y, z:25+position.z},{x:position.x,y:position.y, z:200}], "blue",2);
  }
  this.gcode="";
  this.drawGCode=function(gcode){
    this.gcode=gcode;
    this.drawGrid();
    this.show();
  }

  this.drawCNC=function(position){
    scene = new THREE.Scene();
    myView.drawGrid();
    myView.drawCone(position);
    myView.show();
  }
}

myView=new Viewer();



myView.gCode="";
