// TODO: POBLAR ESCENARI
// TODO: MÉS ANIMACIONS I/O OBJECTES
// POSSIBLE: CAMERA SEGUINT PEIX
// POSSIBLE: MONEDES (COVER/DISC) CHEST
var gl, program;

var pointsOfInterest = [];

var ESCALA_GLOBAL = 12;

let renderMode = 2;

// Objecte camera, conté tots els mètodes i variables pertanyents a la visualització de l'escenari.
var camera = {
	pitch: 0,
	yaw: 0,
	position: [0, 1, -3],

	target: [0, 0, 0],
	upVector: [0, 1, 0],
	fieldOfView: Math.PI / 2,
	sensitivity : 0.003,

	moveSpeed: 0.05,
	forwardVector : [0,0,1],
	rightVector : [1,0,0],

	updateForwardVector() {
		this.forwardVector = [
            Math.cos(this.pitch) * Math.sin(this.yaw),
            Math.sin(this.pitch),
            Math.cos(this.pitch) * Math.cos(this.yaw),
        ];
		this.rightVector = vec3.cross(vec3.create(), this.forwardVector, this.upVector);
		vec3.normalize(this.rightVector, this.rightVector);
	},

	setProjectionMatrix() {
		var projectionMatrix = mat4.create();
		mat4.perspective(projectionMatrix, this.fieldOfView, 1.0, 0.1, 100.0);
		gl.uniformMatrix4fv(program.projectionMatrixIndex, false, projectionMatrix);
	},

	getCameraMatrix() {
		this.updateForwardVector()
		this.target = [
			this.position[0] + this.forwardVector[0],
			this.position[1] + this.forwardVector[1],
			this.position[2] + this.forwardVector[2],
		];
		return mat4.lookAt(mat4.create(), this.position, this.target, this.upVector);
	},

	move(movementVector, direction) {
		vec3.scale(movementVector, movementVector, this.moveSpeed*direction);
		vec3.add(this.position, this.position, movementVector);
	},

	saveState() {
		return {
			pitch: this.pitch,
			yaw: this.yaw,
			position: [...this.position],
			target: [...this.target],
			fieldOfView: this.fieldOfView
		}
	},

	restoreState(savedState) {
		this.pitch = savedState.pitch;
		this.yaw = savedState.yaw;
		this.position = [...savedState.position];
		this.target = [...savedState.target];
		this.fieldOfView = savedState.fieldOfView;
	}
}

// La llista amb tots els objectes que es dibuixen a l'escenari.
// La llista consisteix de Objectes(), la classe pare de tots els objectes que es dibuixen.
var arrayObjs = [
	new Objecte("Fl1", new Floor(7, 0.25, color=[140/255, 100/255, 20/255, 1]), S= [1,1,1], rAngl=Math.PI, R=[0,1,1], T=[-6.5,-6.5,-.5]),

	// Fishes
	new Objecte("F1", new Fish(8), S = [1, 1, 1], rAngl = Math.PI / 3, R = [0, 1, 0], T = [-2, 2, 2]),
	new Objecte("F2", new Fish(1), S = [1.5, 0.7, 0.7], rAngl = Math.PI, R = [0, 1, 0], T = [-2, 2, 2]),
	new Objecte("F3", new Fish(5), S = [0.7, 1, 0.7], rAngl = Math.PI/2, R = [0, 1, 0], T = [-2, 0.5, -2]),
	new Objecte("F4", new Fish(26, moves=false), S = [0.4, 0.27, 0.27], rAngl = -Math.PI/3, R = [0, 1, 0], T = [2.3, -1.3, -13]),
	new Objecte("F5", new Fish(3285), S = [1.5,1.5, 1.5], rAngl=Math.PI/8, R=[0,1,-1], T=[0,0.5,-1]),
	new Objecte("F6", new Fish(54, moves=true, threshold=20), S = [0.3,0.3, 0.3], rAngl=0, R=[0,0,0], T=[-5,3,3]),

	new Objecte("F7", new Fish(12, moves=false), S = [1,0.5, 1.5], rAngl=Math.PI/4, R=[0,-1,0], T=[-3,1,2]),
	new Objecte("F8", new Fish(25, moves=false), S = [0.2, 0.2, 0.2], rAngl = Math.PI, R = [0, 1, 0], T = [-24.5, -1.7, 4.7]),
	new Objecte("F9", new Fish(26, moves=false), S = [0.4, 0.27, 0.27], rAngl = -Math.PI/3, R = [0, 1, 0], T = [2.3, -1.3, -13]),

	// Els objectes estan declarats desde la pedra grossa de la cantonada en ordre de les agulles del rellotge
	new Objecte("R1", new Rock(5, 0.5), S = [3, 3, 3], rAngl = 0, R = [0, 0, 0], T = [1.3, .2, 1.3]),
	new Objecte("R2", new Rock(6, 0.4), S = [2, 1, 1], rAngl = 0, R = [0, 0, 0], T = [0, -0.5, 4.9]),

	new Objecte("CH1", new Chest(7), S = [1, 1, 1], rAngl = Math.PI / 2, R = [1, 0, 0], T = [0, ESCALA_GLOBAL/2-1, -0.8]),

	new Objecte("P1", new Plant(1, 15), S=[1,1,1], rAngl=0, R=[0,0,0], T=[-1.55,0,4.9]), // 1, 3, 4
	new Objecte("P2", new Plant(2, 15), S=[1,1,1], rAngl=0, R=[0,0,0], T=[-1.6,0,5.2]),
	new Objecte("P3", new Plant(3, 15), S=[1,1,1], rAngl=0, R=[0,0,0], T=[-1.7,0,5.15]),
	new Objecte("P4", new Plant(4, 15), S=[1,1,1], rAngl=0, R=[0,0,0], T=[-1.8,0,5]),
	new Objecte("P5", new Plant(5, 15), S=[1,1,1], rAngl=0, R=[0,0,0], T=[-1.45,0,5.15]),
	
	new Objecte("R3", new Rock(7, 0.8), S = [2, 2, 2], rAngl = 0, R = [0, 0, 0], T = [-2, .2, 2]),
	new Objecte("B1", new Bush(2, 15, 4,), S=[1,1,2], rAngl=Math.PI/2, R=[0,1,0], T=[-1.35,0,-5]),
	new Objecte("R4", new Rock(7, 0.3, color=[227/255, 212/255, 143/255, 1]), S = [3, 1, 5], rAngl = Math.PI/4, R = [-1, 0, 0], T = [-1.5, 0.15, -0.5]),

	new Objecte("P6", new Plant(6, 9), S=[0.85,0.7,0.85], rAngl=0, R=[0,0,0], T=[-6, 0, -5]),
	new Objecte("P7", new Plant(7, 5), S=[1,0.7,1], rAngl=0, R=[0,0,0], T=[-5, 0, -5]),
	new Objecte("P8", new Plant(8, 5), S=[0.9,0.7,0.9], rAngl=0, R=[0,0,0], T=[-5, 0, -5]),

	new Objecte("C1", new Coral(3, color=[1,1,0,1]), S=[1,1.3,1], rAngl=0.1, R=[0,1,0], T=[-1.3,-0.7,-6.3]),
	new Objecte("B3", new Bush(4, 15, 3,), S=[1,0.35,1.3], rAngl=0, R=[0,0,0], T=[-1.7,0,-4.7]),

	new Objecte("R5", new Rock(12, 0.4), S = [1.3, 0.5, 0.5], rAngl = 0, R = [0, 0, 0], T = [2, -1, -12]),
	new Objecte("C2", new Coral(3, color=[1,1,0,1]), S=[1.1,1.5,1.1], rAngl=0.1, R=[0,0,0], T=[3.7,-0.7,-5.7]),
	new Objecte("C3", new Coral(3), S=[1,1.3,1], rAngl=0.1, R=[0,0,0], T=[3.5,-0.7,-5.5]),

	new Objecte("R6", new Rock(8, 0.4), S = [0.5, 0.5, 0.5], rAngl = 0, R = [0, 0, 0], T = [10, -0.25, -9]),
	new Objecte("R7", new Rock(9, 0.4), S = [1, 2, 0.8], rAngl = 0, R = [0, 0, 0], T = [5, 0, -7]),
	new Objecte("R8", new Rock(9, 0.4), S = [0.3, 0.3, 0.3], rAngl = 0, R = [0, 0, 0], T = [18, -0.4, -13.5]),
	
	new Objecte("B2", new Bush(3, 15, 6,), S=[1,0.3,2], rAngl=Math.PI/3, R=[0,-1,0], T=[1.7,0,-5]),
	new Objecte("B3", new Bush(4, 15, 4,), S=[1,0.7,2], rAngl=Math.PI/2, R=[0,-1,0], T=[-1.7,0,-5]),
	
	new Objecte("V1", new Volcano(1), S=[1,2.6,1], rAngl=Math.PI/2, R=[-1,0,0], T=[5.1,-0.2,-0.22]),
	new Objecte("V2", new Volcano(2), S=[1,2.4,1], rAngl=Math.PI/2, R=[-1,0,0], T=[4.9,0.0,-0.22]),
	new Objecte("V3", new Volcano(3), S=[1,2.0,1], rAngl=Math.PI/2, R=[-1,0,0], T=[4.3,-0.4,-0.22]),
	new Objecte("V4", new Volcano(4), S=[0.5,1.0,0.5], rAngl=Math.PI/2, R=[-1,0,0], T=[9,9.6,-0.5]),

	
	new Objecte("R9", new Rock(8, 0.4), S = [0.3, 0.3, 0.3], rAngl = 0, R = [0, 0, 0], T = [5, -1, -7]),
	new Objecte("R10", new Rock(9, 0.4), S = [0.3, 0.5, 0.3], rAngl = 0, R = [0, 0, 0], T = [5, -1, -9]),
	new Objecte("P9", new Plant(9, 5), S=[1,0.15,1], rAngl=0, R=[0,0,0], T=[1.3, -3, -2]),
	new Objecte("P10", new Plant(12, 5), S=[1,0.3,1], rAngl=0, R=[0,0,0], T=[1.3, -3, -2.4]),
	new Objecte("B4", new Bush(5, 7, 7), S=[1,0.2,1], rAngl=0, R=[0,0,0], T=[0.9,-0.2,-2]),
	new Objecte("B5", new Bush(5, 7, 7), S=[1,0.2,1], rAngl=Math.PI/2, R=[0,1,0], T=[2,0,1.5]),
];

//===========================================================================
//===========================================================================
//===========================================================================
//===========================================================================

function getWebGLContext() {

	var canvas = document.getElementById("myCanvas");

	try {
		return canvas.getContext("webgl2", { antialias: true });
	}
	catch (e) {
	}

	return null;
}

function initShaders() {

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(vertexShader));
		return null;
	}

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(fragmentShader));
		return null;
	}

	program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);

	gl.useProgram(program);


	program.vertexPositionAttribute = gl.getAttribLocation(program, "VertexPosition");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);

	program.modelViewMatrixIndex = gl.getUniformLocation(program, "modelViewMatrix");
	program.projectionMatrixIndex = gl.getUniformLocation(program, "projectionMatrix");

	idMyColor = gl.getUniformLocation(program, "myColor");
}

function initBuffers(model) {
	model.idBufferVertices = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

	model.idBufferIndices = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

}

function initRendering() {
	gl.clearColor(0.1, 0.1, 0.6, 1.0);
	gl.lineWidth(1.5);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);

}

function initPrimitives() {
	// Itera per tots els objectes de la llista arrayObjs inicialitzant els buffers
	// dels models que utilitza cada objecte.
	arrayObjs.forEach((obj) => obj.initBuffers());
}

function draw(model, colorFaces = [0, 1, 1, 1], colorVertexes = [0, 0, 0, 1]) {

	gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
	gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
	for (var i = 0; i < model.indices.length; i += 3) {
		if (renderMode == 0 || renderMode == 2) {
			gl.uniform4f(idMyColor, colorVertexes[0], colorVertexes[1], colorVertexes[2], colorVertexes[3]);
			gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i * 2);
		}
		if (renderMode == 1 || renderMode == 2) {
			gl.uniform4f(idMyColor, colorFaces[0], colorFaces[1], colorFaces[2], colorFaces[3]);
			gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, i * 2);
		}
	}
}

function drawScene() {

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//gl.uniform1i(renderModeLocation, renderMode);

	camera.setProjectionMatrix();

	// Es crea la matriu modelViewMatrix i s'aplica la transformació per renderitzar
	// desde el punt de vista de la càmera.
	var modelMatrix = mat4.create();
	var modelViewMatrix = mat4.create();
	mat4.fromScaling(modelMatrix, [0.5, 0.5, 0.5]);
	mat4.multiply(modelViewMatrix, camera.getCameraMatrix(), modelMatrix);
	//----------------------------------------------------------------

	// Dibuixant tots els objectes.
	arrayObjs.forEach(obj => obj.draw(modelViewMatrix)); 

	requestAnimationFrame(drawScene);
}

function initHandlers() {

	var mouseDown = false;
	var lastMouseX;
	var lastMouseY;
	var canvas = document.getElementById("myCanvas");

	// Quan botó del ratolí premut, es guarden les seves coordenades.
	canvas.addEventListener("mousedown",
		function (event) {
			mouseDown = true;
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
		},
		false);
	
	canvas.addEventListener("mouseup",
		function () {
			mouseDown = false;
		},
		false);
	
	// Si s'actua la rodeta del ratolí i es té premut el shift, 
	// es canvia el fieldOfView de la camera
	canvas.addEventListener("wheel",
		function (event) {

			var delta = 0.0;

			if (event.deltaMode == 0)
				delta = event.deltaY * 0.001;
			else if (event.deltaMode == 1)
				delta = event.deltaY * 0.03;
			else
				delta = event.deltaY;

			if (event.shiftKey == 1) { // fovy
				camera.fieldOfView *= Math.exp(delta)
				camera.fieldOfView = Math.max(0.1, Math.min(3.0, camera.fieldOfView));
			}

			event.preventDefault();
		},
		false);
	
	// Quan es mou el ratolí s'actualitza la posició del cursor i
	// es calculen el pitch i yaw de la camera.
	canvas.addEventListener("mousemove",
		function (event) {

			if (!mouseDown) {
				return;
			}

			var newX = event.clientX;
			var newY = event.clientY;

			camera.yaw += (newX - lastMouseX) *camera.sensitivity;
			camera.pitch += (newY - lastMouseY) * camera.sensitivity;

			var margin = 0.01;
			camera.pitch = Math.max(Math.min(camera.pitch, Math.PI / 2 - margin), -Math.PI / 2 + margin);

			lastMouseX = newX
			lastMouseY = newY;

			event.preventDefault();
		},
		false);
}

function handleKeyDown(event) {
	switch (event.keyCode) {

		// Control per obrir el cofre.
		case 32: // space key
			arrayObjs.forEach(obj => {
				if (obj.id == "CH1") obj.objecte.obrint=true;
			});
			break;
		
		// Tecles per el control de posició de la càmera.
		case 87: // 'W' key
			camera.move(camera.forwardVector, 1);
			break;
		case 65: // 'A' key
			camera.move(camera.rightVector, -1);
			break;
		case 83: // 'S' key
			camera.move(camera.forwardVector, -1);
			break;
		case 68: // 'D' key
			camera.move(camera.rightVector, 1);
			break;
		
		// Es guarda un nou punt d'interès.
		case 13: // 'Enter' key
			if (pointsOfInterest.length < 9) {
				pointsOfInterest.push(camera.saveState());
				console.log("New Point of Interest saved at", pointsOfInterest.length);
				
				var htmlPOI = document.getElementById("POI");
				const newItem = document.createElement("ul");
				newItem.textContent = "Prem la tecla ["+  pointsOfInterest.length + "]";
				htmlPOI.appendChild(newItem);
			} else console.log("Points of interest list is full!")


			break;
		// Si es prem un botó de 1-9 es torna al punt d'interès guardat a aquesta posició.
		case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57:
			try {
				camera.restoreState(pointsOfInterest[event.keyCode-49]);
			}
			catch (e) { console.log("POINT OF INTEREST NOT AVAILABLE") }
			break;
		
		// Canviar el mode de renderització amb la R
		case 82: // 'R' key
			renderMode = (renderMode+1) % 3
			var htmlRenderMode = document.getElementById("renderMode");
			if (renderMode==0) 		htmlRenderMode.innerHTML = "Wireframe";
			else if (renderMode==1) htmlRenderMode.innerHTML = "Polígons sòlids"
			else 					htmlRenderMode.innerHTML = "Wireframe amb polígons sòlids"
			break;
	}
}

function initWebGL() {

	gl = getWebGLContext();

	if (!gl) {
		alert("WebGL 2.0 no está disponible");
		return;
	}

	document.onkeydown = handleKeyDown;
	initShaders();
	initPrimitives();
	initRendering();
	initHandlers();

	requestAnimationFrame(drawScene);
}

initWebGL();
