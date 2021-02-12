// Init variables
let renderer = null,
  images = [],
  uniforms = { intensity: { value: 1, type: "f", min: 0, max: 3 } },
  duration = 1,
  easing = "easeInOut",
  fragment = `
  uniform float time;
  uniform float progress;
  uniform float intensity;
  uniform float width;
  uniform float scaleX;
  uniform float scaleY;
  uniform float transition;
  uniform float radius;
  uniform float swipe;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform sampler2D displacement;
  uniform vec4 resolution;
  varying vec2 vUv;
  mat2 getRotM(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
  }
  const float PI = 3.1415;
  const float angle1 = PI *0.25;
  const float angle2 = -PI *0.75;
  void main()	{
    vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
    vec4 disp = texture2D(displacement, newUV);
    vec2 dispVec = vec2(disp.r, disp.g);
    vec2 distortedPosition1 = newUV + getRotM(angle1) * dispVec * intensity * progress;
    vec4 t1 = texture2D(texture1, distortedPosition1);
    vec2 distortedPosition2 = newUV + getRotM(angle2) * dispVec * intensity * (1.0 - progress);
    vec4 t2 = texture2D(texture2, distortedPosition2);
    gl_FragColor = mix(t1, t2, progress);
  }
`,
  width = 0,
  height = 0,
  scene = null,
  vertex = `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}`,
  camera = null,
  container = null,
  time = 0,
  current = 0,
  textures = [],
  imageAspect = null,
  ligth = null,
  btnStarGameCross = null,
  btnStarGameCircle = null,
  backGame = null,
  restartGame = null,
  isRunning = false,
  raycaster = null,
  mouse = null,
  objLoader = null,
  mousclickEvent=null,
  flagFirst = "cpu";
//variables gato
let geometryPlane = null,
  materialPlane = null,
  planeTopLeft = null,
  planeTopCenter = null,
  planeTopRight = null,
  planeMidLeft = null,
  planeMidCenter = null,
  planeMidRight = null,
  planeBotLeft = null,
  planeBotCenter = null,
  planeBotRight = null,
  geometryLineVertival = null,
  geometryLineHorizontal = null,
  materialLine = null,
  lineVertical1 = null,
  lineVertical2 = null,
  lineHorizontal1 = null,
  lineHorizontal2 = null;
//variables cross circle
let objectsList = [],
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ],
  scores = {
    cross: 10,
    circle: -10,
    tie: 0,
  },
  boardPosition = [
    [
      { x: -0.18, y: 0.18 },
      { x: 0, y: 0.18 },
      { x: 0.18, y: 0.18 },
    ],
    [
      { x: -0.18, y: 0 },
      { x: 0, y: 0 },
      { x: 0.18, y: 0 },
    ],
    [
      { x: -0.18, y: -0.18 },
      { x: 0, y: -0.18 },
      { x: 0.18, y: -0.18 },
    ],
  ],
  playerChoice = "circle",
  cpuChoice = "cross";
//variables audio
let listener = null,
  audioLoader = null,
  soundBackground = null,
  soundStart = null,
  soundBack = null,
  soundClick = null;
//Init scene and render
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer();
width = window.innerWidth;
height = window.innerHeight;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
renderer.setClearColor(0xeeeeee, 1);
btnStarGameCross = document.getElementById("startGameCross");
btnStarGameCircle = document.getElementById("startGameCircle");
backGame = document.getElementById("backGame");
restartGame = document.getElementById("restartGame");
container = document.getElementById("sliderImage");
images = JSON.parse(container.getAttribute("data-images"));
container.appendChild(renderer.domElement);
camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.001,
  1000
);
objLoader = new THREE.OBJLoader();
camera.position.set(0, 0, 2);
ligth = new THREE.DirectionalLight(new THREE.Color("hsl(30, 100%, 75%)"), 1.0);
ligth.position.set(-100, 0, 100);
scene.add(ligth);

//
listener = new THREE.AudioListener();
camera.add(listener);
audioLoader = new THREE.AudioLoader();
soundBackground = new THREE.Audio(listener);
soundStart = new THREE.Audio(listener);
soundBack = new THREE.Audio(listener);
soundClick = new THREE.Audio(listener);
audioLoader.load("sounds/background.mp3", (buffer) => {
  soundBackground.setBuffer(buffer);
  soundBackground.setLoop(true);
  soundBackground.setVolume(0.5);
  btnStarGameCross.style.display="block"
  btnStarGameCircle.style.display="block"
  document.getElementById("lds-default").style.display="none";
  
});
audioLoader.load("sounds/starts.wav", (buffer) => {
  soundStart.setBuffer(buffer);
  soundStart.setLoop(false);
  soundStart.setVolume(0.5);
});
audioLoader.load("sounds/back.wav", (buffer) => {
  soundBack.setBuffer(buffer);
  soundBack.setLoop(false);
  soundBack.setVolume(0.5);
});
soundClick = new Audio("sounds/click.wav");




//init board
createBoard();

//back menu listener click
backGame.addEventListener("click", () => {
  backGame.style.display = "none";
  restartGame.style.display = "none";
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  soundBack.play();
  soundBackground.stop();
  scene.remove(planeTopLeft);
  scene.remove(planeTopCenter);
  scene.remove(planeTopRight);
  scene.remove(planeMidLeft);
  scene.remove(planeMidCenter);
  scene.remove(planeMidRight);
  scene.remove(planeBotLeft);
  scene.remove(planeBotCenter);
  scene.remove(planeBotRight);
  scene.remove(lineVertical1);
  scene.remove(lineVertical2);
  scene.remove(lineHorizontal1);
  scene.remove(lineHorizontal2);
  objectsList.forEach((obj) => scene.remove(obj));
  window.removeEventListener("click", mousclickEvent, false);
  next();
  flagFirst = "cpu";
  document.getElementById("Endgame").style.display = "none";
  setTimeout(() => {
    document.getElementById("Menu").style.display = "initial";
  }, 1000);
});

//restart game listener click
restartGame.addEventListener("click", () => {
  soundBack.play();
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ];
  window.addEventListener("click", mousclickEvent, false);
  document.getElementById("Endgame").style.display = "none";
  objectsList.forEach((obj) => scene.remove(obj));
  flagFirst = flagFirst == "cpu" ? "player" : "cpu";
  if (flagFirst == "cpu") {
    cpuMove();
  }
});

//start game whit circle
btnStarGameCircle.addEventListener("click", () => {
  playerChoice = "circle";
  cpuChoice = "cross";
  scores = {
    cross: 10,
    circle: -10,
    tie: 0,
  };
  initGame();
});
//start game whit cross
btnStarGameCross.addEventListener("click", () => {
  playerChoice = "cross";
  cpuChoice = "circle";
  scores = {
    cross: -10,
    circle: 10,
    tie: 0,
  };
  initGame();
});

// add board and click in three js
function initGame() {
  soundStart.play();
  next();
  document.getElementById("Menu").style.display = "none";
  setTimeout(() => {
    restartGame.style.display = "block";
    backGame.style.display = "block";
    soundBackground.play();
    scene.add(planeTopLeft);
    scene.add(planeTopCenter);
    scene.add(planeTopRight);
    scene.add(planeMidLeft);
    scene.add(planeMidCenter);
    scene.add(planeMidRight);
    scene.add(planeBotLeft);
    scene.add(planeBotCenter);
    scene.add(planeBotRight);
    scene.add(lineVertical1);
    scene.add(lineVertical2);
    scene.add(lineHorizontal1);
    scene.add(lineHorizontal2);
    setTimeout(cpuMove(), 500);
    // click events
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mousclickEvent= (event)=> {
      event.preventDefault();
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 1) {
        try {
          intersects[1].object.callback();
        } catch (error) {}
      }
    }
    window.addEventListener("click", mousclickEvent, false);
  }, 1000);
}
// load object fom model
function loadObject(name, x, y) {
  objLoader.load("models/" + name + ".obj", (object) => {
    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        if (name == "cross") child.material.color.setHex(0xff0000);
        else child.material.color.setHex(0x29abe0);
      }
    });
    object.rotation.x = 1.5;
    if (name == "cross") object.rotation.y = 0.3;
    object.position.z = 0.2;
    object.position.x = x;
    object.position.y = y;
    objectsList.push(object);
    scene.add(object);
  });
}

//init gato plane
function createBoard() {
  // init material angeometry for a board click panel
  geometryPlane = new THREE.PlaneGeometry(0.15, 0.15, 1);
  materialPlane = new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
  });

  materialPlane.opacity = 0.01;
  materialPlane.transparent = true;
  planeTopLeft = new THREE.Mesh(geometryPlane, materialPlane);
  planeTopLeft.callback = () => {
    if (board[0][0] == "") {
      board[0][0] = playerChoice;
      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, -0.18, 0.18);
      cpuMove();
    }
  };
  planeTopLeft.position.set(-0.2, 0.2, 0);
  planeTopCenter = new THREE.Mesh(geometryPlane, materialPlane);
  planeTopCenter.callback = () => {
    if (board[0][1] == "") {
      board[0][1] = playerChoice;
      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, 0, 0.18);
      cpuMove();
    }
  };
  planeTopCenter.position.set(0, 0.2, 0);
  planeTopRight = new THREE.Mesh(geometryPlane, materialPlane);
  planeTopRight.callback = () => {
    if (board[0][2] == "") {
      board[0][2] = playerChoice;
      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, 0.18, 0.18);
      cpuMove();
    }
  };
  planeTopRight.position.set(0.2, 0.2, 0);
  planeMidLeft = new THREE.Mesh(geometryPlane, materialPlane);
  planeMidLeft.position.set(-0.2, 0, 0);
  planeMidLeft.callback = () => {
    if (board[1][0] == "") {
      board[1][0] = playerChoice;
     
      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, -0.18, 0);
      cpuMove();
    }
  };
  planeMidCenter = new THREE.Mesh(geometryPlane, materialPlane);
  planeMidCenter.callback = () => {
    if (board[1][1] == "") {
      board[1][1] = playerChoice;

      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, 0, 0);
      cpuMove();
    }
  };
  planeMidRight = new THREE.Mesh(geometryPlane, materialPlane);
  planeMidRight.position.set(0.2, 0, 0);
  planeMidRight.callback = () => {
    if (board[1][2] == "") {
      board[1][2] = playerChoice;

      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, 0.18, 0);

      cpuMove();
    }
  };
  planeBotLeft = new THREE.Mesh(geometryPlane, materialPlane);
  planeBotLeft.position.set(-0.2, -0.2, 0);
  planeBotLeft.callback = () => {
    if (board[2][0] == "") {
      board[2][0] = playerChoice;

      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, -0.18, -0.18);
      cpuMove();
    }
  };
  planeBotCenter = new THREE.Mesh(geometryPlane, materialPlane);
  planeBotCenter.position.set(0, -0.2, 0);
  planeBotCenter.callback = () => {
    if (board[2][1] == "") {
      board[2][1] = playerChoice;
      
      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, 0, -0.18);
      cpuMove();
    }
  };
  planeBotRight = new THREE.Mesh(geometryPlane, materialPlane);
  planeBotRight.position.set(0.2, -0.2, 0);
  planeBotRight.callback = () => {
    if (board[2][2] == "") {
      board[2][2] = playerChoice;
      
      soundClick.currentTime=0;
      soundClick.play();
      loadObject(playerChoice, 0.18, -0.18);
      cpuMove();
    }
  };

  geometryLineVertival = new THREE.PlaneGeometry(0.05, 0.6, 1);
  geometryLineHorizontal = new THREE.PlaneGeometry(0.6, 0.05, 1);
  materialLine = new THREE.MeshBasicMaterial({
    color: "#000000",
    side: THREE.DoubleSide,
  });
  lineVertical1 = new THREE.Mesh(geometryLineVertival, materialLine);
  lineVertical1.position.set(-0.1, 0, 0);
  lineVertical2 = new THREE.Mesh(geometryLineVertival, materialLine);
  lineVertical2.position.set(0.1, 0, 0);
  lineHorizontal1 = new THREE.Mesh(geometryLineHorizontal, materialLine);
  lineHorizontal1.position.set(0, -0.1, 0);
  lineHorizontal2 = new THREE.Mesh(geometryLineHorizontal, materialLine);
  lineHorizontal2.position.set(0, 0.1, 0);
}
// ia cpu minimax
function minimax(boardx, depth, isMaximizing) {
  let result = checkWinner();
  if (result !== null) {
    return scores[result];
  }
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (boardx[i][j] == "") {
          boardx[i][j] = cpuChoice;
          let score = minimax(boardx, depth + 1, false);
          boardx[i][j] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
    }

    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (boardx[i][j] == "") {
          boardx[i][j] = playerChoice;
          let score = minimax(boardx, depth + 1, true);
          boardx[i][j] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
    }

    return bestScore;
  }
}

// cpu turn to move
function cpuMove() {
  if (checkEndgame()) return;
  if (win != "" && win != null) {
    document.getElementById("Endgame").style.display = "initial";
    return;
  }
  let bestScore = -Infinity;
  let move;
  try {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] == "") {
          board[i][j] = cpuChoice;
          let score = minimax(board, 0, false);

          board[i][j] = "";
          if (score > bestScore) {
            bestScore = score;
            move = { i, j };
          }
        }
      }
    }
    board[move.i][move.j] = cpuChoice;
    const positionCPU = boardPosition[move.i][move.j];
    loadObject(cpuChoice, positionCPU.x, positionCPU.y);
    checkEndgame();
  } catch (error) {}
}
// check lines equals to win
function equals3(a, b, c) {
  return a == b && b == c && a != "";
}
// chec if win in move
function checkWinner() {
  let winner = null;
  for (let i = 0; i < 3; i++) {
    if (equals3(board[i][0], board[i][1], board[i][2])) {
      winner = board[i][0];
    }
  }

  for (let i = 0; i < 3; i++) {
    if (equals3(board[0][i], board[1][i], board[2][i])) {
      winner = board[0][i];
    }
  }

  if (equals3(board[0][0], board[1][1], board[2][2])) {
    winner = board[0][0];
  }
  if (equals3(board[2][0], board[1][1], board[0][2])) {
    winner = board[2][0];
  }

  let openSpots = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] == "") {
        openSpots++;
      }
    }
  }

  if (winner == null && openSpots == 0) {
    return "tie";
  } else {
    return winner;
  }
}

function checkEndgame() {
  win = checkWinner();
  if (win != "" && win != null) {
    let mensaje = win === playerChoice ? "Ganaste!" : "Perdiste";
    if (win == "tie") mensaje = "Empate";
    window.removeEventListener("click", mousclickEvent, false);
    document.getElementById("Endgame").style.display = "initial";
    document.getElementById("Endgame").children[0].innerText = mensaje;
    return true;
  }
  return false;
}
// init images
function initiate(pro) {
  const promises = [];
  images.forEach((url, i) => {
    let promise = new Promise((resolve) => {
      textures[i] = new THREE.TextureLoader().load(url, resolve);
    });
    promises.push(promise);
  });

  Promise.all(promises).then(() => {
    pro();
  });
}
function setupResize() {
  window.addEventListener("resize", resize.bind(this));
}
function settings() {
  settings = { progress: 0.5 };

  Object.keys(uniforms).forEach((item) => {
    settings[item] = uniforms[item].value;
  });
}
function resize() {
  width = container.offsetWidth;
  height = container.offsetHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;

  // image cover
  imageAspect = textures[0].image.height / textures[0].image.width;
  let a1;
  let a2;
  if (height / width > imageAspect) {
    a1 = (width / height) * imageAspect;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = height / width / imageAspect;
  }

  material.uniforms.resolution.value.x = width;
  material.uniforms.resolution.value.y = height;
  material.uniforms.resolution.value.z = a1;
  material.uniforms.resolution.value.w = a2;

  const dist = camera.position.z;
  const h2 = 1;
  camera.fov = 2 * (180 / Math.PI) * Math.atan(h2 / (2 * dist));

  plane.scale.x = camera.aspect;
  plane.scale.y = 1;

  camera.updateProjectionMatrix();
}
function addObjects() {
  material = new THREE.ShaderMaterial({
    extensions: {
      derivatives: "#extension GL_OES_standard_derivatives : enable",
    },
    side: THREE.DoubleSide,
    uniforms: {
      time: { type: "f", value: 0 },
      progress: { type: "f", value: 0 },
      border: { type: "f", value: 0 },
      intensity: { type: "f", value: 0 },
      scaleX: { type: "f", value: 40 },
      scaleY: { type: "f", value: 40 },
      transition: { type: "f", value: 40 },
      swipe: { type: "f", value: 0 },
      width: { type: "f", value: 0 },
      radius: { type: "f", value: 0 },
      texture1: { type: "f", value: textures[0] },
      texture2: { type: "f", value: textures[1] },
      displacement: {
        type: "f",
        value: new THREE.TextureLoader().load("img/disp1.jpeg"),
      },
      resolution: { type: "v4", value: new THREE.Vector4() },
    },
    // wireframe: true,
    vertexShader: vertex,
    fragmentShader: fragment,
  });

  geometry = new THREE.PlaneGeometry(1, 1, 2, 2);

  plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
}
function next() {
  if (isRunning) return;
  isRunning = true;
  let len = textures.length;
  let nextTexture = textures[(current + 1) % len];
  material.uniforms.texture2.value = nextTexture;
  let tl = new TimelineMax();
  tl.to(material.uniforms.progress, duration, {
    value: 1,
    ease: Power2[easing],
    onComplete: () => {
      current = (current + 1) % len;
      material.uniforms.texture1.value = nextTexture;
      material.uniforms.progress.value = 0;
      isRunning = false;
    },
  });
}
function render() {
  time += 0.05;
  material.uniforms.time.value = time;
  Object.keys(uniforms).forEach((item) => {
    material.uniforms[item].value = settings[item];
  });
  requestAnimationFrame(render.bind(this));
  renderer.render(scene, camera);
}
initiate(() => {
  setupResize();
  settings();
  addObjects();
  resize();
  render();
});
