// Funció que reb una llavor i retorna una funció que genera números pseudoaleatoris 
// segons aquesta llavor inicial. La funció de retorn se li pot acotar un rang.
function seededRandom(seed) {
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;

    let state = seed;

    return function (range = [0, 1]) {
        state = (a * state + c) % m;
        return range[0] + (state / m) * (range[1] - range[0])
    };
}

// Encapsula els objectes a dibuixar: els transforma a la seva posició correcta i els dibuixa
class Objecte {
    constructor(id, obj, S = [1, 1, 1], rAngl = 0, R = [0, 0, 0], T = [0, 0, 0],) {
        this.id = id;
        this.objecte = obj;
        this.Scaling = S;
        this.rAngl = rAngl;
        this.Rotation = R;
        this.Translation = T;
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        this.objecte.initBuffers();
    }

    // Dibuixa l'objecte segons ModelMatrix i les transformacions declarades al constructor.
    draw(ModelMatrix) {
        var M = mat4.create();
        var S = mat4.create();
        var T = mat4.create();
        var R = mat4.create();

        mat4.fromScaling(S, this.Scaling);
        mat4.multiply(M, ModelMatrix, S);

        mat4.fromRotation(R, this.rAngl, this.Rotation);
        mat4.multiply(M, M, R);

        mat4.fromTranslation(T, this.Translation);
        mat4.multiply(M, M, T);

        this.objecte.draw(M);
    }
}

// El terra, que consisteix d'un pla rugós
class Floor {
    constructor(seed, roughness, color) {
        this.random = seededRandom(seed);
        this.floorModel = generateIrregularPlane(12,24,seed,roughness);
        this.color = color;
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.floorModel);
    }

    // Dibuixa el terra segons la matriu M
    draw(M) {
        // Dibuixant el pla irregular
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, M);
        draw(this.floorModel, this.color);
    }
}

// El coral, que consisteix d'una estructura en forma d'arbre de cilindres i esferes.
class Coral {
    constructor(seed, color=[1,0,0,1]) {
        this.random = seededRandom(seed);
        this.stemModel = cylinderModel;
        this.endStem = sphereModel;
        this.color = color;
        this.stems = this.createStemsStructure(5, 4);
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.stemModel);
        initBuffers(this.endStem);
    }

    generateStems(maxDepth, currentLevel, nStemsPerLevel) {
        if (currentLevel > maxDepth) return []; // Cas base
    
        // Create the structure for the current stem
        return Array.from({ length: nStemsPerLevel }, (_, index) => ({
            thisStem: {
                nTotalStemsThisLevel: nStemsPerLevel,
                nStemThisLevel: index + 1,
                scaling: [0.5, 0.5, 1.1],           
                rotation: index * Math.PI*2/nStemsPerLevel
                        },
            growingStems: this.generateStems( // Crida recursiva
                maxDepth,
                currentLevel + 1,
                nStemsPerLevel - 1
            )
        }));
    }
    
    createStemsStructure(maxDepth = 3, nStemsPerLevel) {
        return {
            thisStem: {
                nTotalStemsThisLevel: 1,
                nStemThisLevel: 1,
                scaling: [1, 1, 1],
                rotation: 0
            },
            growingStems: this.generateStems(maxDepth, 1, nStemsPerLevel)
        };
    }

    // Dibuixa recursivament l'estructura.
    drawStems(M, stem, inicial=false) {
        var S = mat4.create();
        var T = mat4.create();
        var R = mat4.create();
        var aux = mat4.create();
        var sphereMat = mat4.create();

        mat4.fromRotation(R, stem.thisStem.rotation, [0, 0, 1]);
        mat4.multiply(aux, M, R);
        
        if (!inicial) {
            mat4.fromRotation(R, Math.PI/5, [1, 1, 0]);
            mat4.multiply(aux, aux, R);
        }
        mat4.fromTranslation(T, [0, 0, stem.thisStem.scaling[2]]);
        mat4.multiply(aux, aux, T);

        mat4.fromScaling(S, stem.thisStem.scaling);
        mat4.multiply(aux, aux, S);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
        draw(this.stemModel, this.color);


        mat4.fromTranslation(T, [0, 0, stem.thisStem.scaling[2]*0.8]);
        mat4.multiply(sphereMat, aux, T);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, sphereMat);
        draw(this.endStem, this.color);

        for (var growingStem of stem.growingStems)
            this.drawStems(aux, growingStem);
    }

    // Dibuixa el coral (cilindres) segons M
    draw(M) {

        var stemMat = mat4.create();
        var sphereMat = mat4.create();
        var S = mat4.create();
        var T = mat4.create();
        var R = mat4.create();

        mat4.fromRotation(R, Math.PI / 2, [-1, 0, 0]);
        mat4.multiply(stemMat, M, R);

        mat4.fromScaling(S, [0.15, 0.15, 0.35]);
        mat4.multiply(stemMat, stemMat, S);

        mat4.fromTranslation(T, [0, 0, 2]);
        mat4.multiply(sphereMat, stemMat, T);

        // Dibuix de l'esfera al final de la tija
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, sphereMat);
        draw(this.endStem, this.color);

        // Dibuix de la tija
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, stemMat);
        draw(this.stemModel, this.color);

        this.drawStems(stemMat, this.stems, true);

    }
}

// Un volcà, que consisteix d'un volcà (cono truncat) i una probabilitat de que apareixin Bombolles.
class Volcano {
    constructor(seed, probability = 50) {
        this.random = seededRandom(seed);
        this.volcanoModel = makeTruncatedCone(10, 1, 0.2);
        this.color = [80 / 255, 80 / 255, 80 / 255, 1];
        this.bubbles = [];
        this.probability = probability;
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.volcanoModel);
    }

    // Dibuixa les bombolles i el cono segons a matriu M
    draw(M) {

        // Probabilitat a cada frame de que surti una bombolla
        if (Math.round(this.random([0, this.probability])) == 1)
            this.bubbles.push(new Bubble());

        // Eliminar bombolles de la llista
        if (this.bubbles.length > 10) this.bubbles.shift();

        // Dibuixant cada bombolla
        this.bubbles.forEach((bubble) => bubble.draw(M));

        // Dibuixant el volcà
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, M);
        draw(this.volcanoModel, this.color);
    }
}

// Un arbust, que consisteix en una graella de nxm plans
class Bush {
    constructor(seed, n, m, height = 3) {
        this.random = seededRandom(seed);
        this.leaveModel = planeModel;
        this.color = [10 / 255, 200 / 255, 10 / 255, 1]
        this.leaves = [];
        this.grid = [n, m];
        this.height = height;
        this.createLeaves()
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.leaveModel);
    }

    // Creació de cada una de les fulles, amb posició, escala i rotació aleatòries.
    createLeaves() {
        for (var i = 0; i < this.grid[0]; i++) {
            for (var j = 0; j < this.grid[1]; j++) {
                this.leaves.push({
                    translation: [i * 1.35 + this.random([0.5, 1.5]), j * 1.35 + this.random([0.5, 1.5]), 0],
                    scaling: [this.random([0.9, 1.1]), this.random([0.9, 1.1]), this.random([0.7, this.height])],
                    rotation: { angle: this.random([0, 0.5]), axis: [1, 1, 1] }
                });
            }
        }
    }

    // Dibuixa la graella de fulles segons la matriu M
    draw(M) {
        var aux = mat4.create();
        var LeaveMat = mat4.create();
        var S = mat4.create();
        var T = mat4.create();
        var R = mat4.create();

        // S'orienten totes les fulles correctament
        mat4.fromRotation(R, Math.PI / 2, [-1, 0, 0]);
        mat4.multiply(LeaveMat, M, R);

        mat4.fromScaling(S, [0.05, 0.05, 2]);
        mat4.multiply(LeaveMat, LeaveMat, S);

        // Per cada fulla, orientar-la tal com s'ha inicialitzat
        for (var leave of this.leaves) {

            mat4.fromTranslation(T, leave.translation)
            mat4.multiply(aux, LeaveMat, T);

            mat4.fromScaling(S, leave.scaling);
            mat4.multiply(aux, aux, S);

            mat4.fromRotation(R, leave.rotation.angle, leave.rotation.axis);
            mat4.multiply(aux, aux, R);

            // Se li suma una rotació aleatòria a cada frame per donar sensació de moviment
            mat4.fromRotation(R, this.random([-0.1, 0.1]), [1, 1, 0]);
            mat4.multiply(aux, aux, R);

            gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
            draw(this.leaveModel, this.color);
        }
    }
}

// Una planta, que consisteix d'una tija (cilindre) i unes fulles (cover)
class Plant {
    constructor(height, seed = 2) {
        this.stemModel = cylinderModel;
        this.leaveModel = discModel;
        this.height = height;
        this.leaves = [];
        this.createLeaves(seed);
        this.color = [10 / 255, 200 / 255, 10 / 255, 1]
    }

    // Creació de cada una de les fulles, amb posició, escala i rotació aleatòries.
    createLeaves(seed) {
        const random = seededRandom(seed); // 
        for (var i = 0; i < Math.round(random([this.height / 2, this.height * 2])); i++) {
            this.leaves.push({
                translation: [random([-0.25, 0.25]), random([-0.25, 0.25]), random([0.1, this.height - 0.1])],
                scaling: [random([0.2, 0.4]), random([0.1, 0.5]), 1],
                rotation: { angle: random([0, 0.1]), axis: [1, 1, 1] }
            });
        }
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.stemModel);
        initBuffers(this.leaveModel);
    }

    // Dibuixa la tija i les fulles segons la matriu M
    draw(M) {
        var aux = mat4.create();
        var S = mat4.create();
        var T = mat4.create();
        var R = mat4.create();
        var Leave = mat4.create();
        var Stem = mat4.create();

        // Es col·loca i dibuixa correctament la tija
        mat4.fromRotation(R, Math.PI / 2, [-1, 0, 0]);
        mat4.multiply(Stem, M, R);

        mat4.fromScaling(S, [.04, .04, this.height]);
        mat4.multiply(Stem, Stem, S);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, Stem);
        draw(this.stemModel, this.color);

        // Orienten les fulles correctament
        mat4.fromRotation(R, Math.PI / 2, [-1, 0, 0]);
        mat4.multiply(Leave, M, R);

        // Dibuixar cada fulla segons s'ha inicialitzat anteriorment
        for (var leave of this.leaves) {

            var aux = mat4.create();

            mat4.fromTranslation(T, leave.translation);
            mat4.multiply(aux, Leave, T);

            mat4.fromScaling(S, leave.scaling);
            mat4.multiply(aux, aux, S);

            mat4.fromRotation(R, leave.rotation.angle, leave.rotation.axis);
            mat4.multiply(aux, aux, R)

            gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
            draw(this.leaveModel, this.color);
        }
    }
}

// Un peix, que consisteix d'un cos (conjunt de cubs), i les aletes (covers)
class Fish {
    constructor(seed, moves = true, threshold=13) {
        this.random = seededRandom(seed);

        this.cube = cubeModel;
        this.fin = discModel;
        this.color = [this.random(), this.random(), this.random(), 1];

        this.bubbles = []
        this.bubbleProb = 150;

        this.position = 0;
        this.velocity = (moves) ? this.random([0.025, 0.1]) : 0;
        this.angle = Math.PI * (this.velocity * 2);
        this.stepAnim = 0;
        this.migPeriode = Math.round(1 / (this.velocity / 1.5));
        this.direccio = 1;
        this.threshold = threshold;
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.cube);
        initBuffers(this.fin);
    }

    // Dibuixa totes les parts del peix, a més de transformar-lo 
    // segons la seva velocitat segons la matriu M
    draw(M) {
        var aux = mat4.create();
        var S = mat4.create();
        var T = mat4.create();
        var R = mat4.create();
        var Head = mat4.create();
        var Fin = mat4.create();
        var bubbleMat = mat4.create();

        // Moviment
        mat4.fromTranslation(T, [this.position, 0, 0])
        mat4.multiply(aux, M, T);

        // Escalat cos (Un cub transformat)
        mat4.fromScaling(S, [1, 0.45, 0.35]);
        mat4.multiply(aux, aux, S);

        // Rotació general del cos (el cos pivota lleugerament amb la cua)
        mat4.fromRotation(R, this.angle / (this.migPeriode * 10) * this.stepAnim, [0, 1, 0]);
        mat4.multiply(aux, aux, R);

        mat4.fromTranslation(T, [0, 1, 0]);
        mat4.multiply(aux, aux, T);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
        draw(this.cube, this.color);


        // Aleta superior (Un cover)
        mat4.fromScaling(S, [0.3, 0.8, 0.3]);
        mat4.multiply(Fin, aux, S);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, Fin);
        draw(this.fin, this.color);


        // Aletes horitzontals (Un cover transformat horitzontalment cap a la part inferior del cos)
        mat4.fromScaling(S, [0.2, 1.5, 1]);
        mat4.multiply(Fin, aux, S);

        mat4.fromRotation(R, Math.PI / 2, [1, 0, 0]);
        mat4.multiply(Fin, Fin, R);

        mat4.fromTranslation(T, [1.2, 0, 0.22]);
        mat4.multiply(Fin, Fin, T);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, Fin);
        draw(this.fin, this.color);


        // Cap (Un cub transformat davant el cos)
        mat4.fromScaling(S, [0.5, 0.9, 0.5]);
        mat4.multiply(Head, aux, S);

        mat4.fromTranslation(T, [1, 0, 0]);
        mat4.multiply(Head, Head, T);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, Head);
        draw(this.cube, this.color);


        // Bombolles
        mat4.fromRotation(T, Math.PI/2, [-1, 0, 0]);
        mat4.multiply(bubbleMat, Head, T);
        
        mat4.fromScaling(S, [1, 1/0.45, 1/0.35]);
        mat4.multiply(bubbleMat, bubbleMat, S);
        
        if (Math.round(this.random([0, this.bubbleProb])) == 1)
            this.bubbles.push(new Bubble());

        // Eliminar bombolles de la llista
        if (this.bubbles.length > 2) this.bubbles.shift();

        // Dibuixant cada bombolla
        this.bubbles.forEach((bubble) => bubble.draw(bubbleMat));


        // Cua (Un cub transformat darrera el cos, que pivota per "nedar")
        mat4.fromScaling(S, [0.8, 0.9, 0.8]);
        mat4.multiply(aux, aux, S);

        mat4.fromTranslation(T, [-.8, 0, 0]);
        mat4.multiply(aux, aux, T);

        mat4.fromRotation(R, this.angle / 2, [0, 1, 0]);
        mat4.multiply(aux, aux, R);

        mat4.fromRotation(R, this.angle / this.migPeriode * this.stepAnim, [0, 1, 0]);
        mat4.multiply(aux, aux, R);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
        draw(this.cube, this.color);


        // Aleta posterior (Un cover que pivota amb la cua per "nedar")
        mat4.fromScaling(S, [0.95, 0.5, 0.3]);
        mat4.multiply(Fin, aux, S);
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, Fin);
        draw(this.fin, this.color);

        // Cada this.migPeriode frames, la cua pivota cap a l'altra direcció.
        if (this.stepAnim % (this.migPeriode) == 0) this.direccio *= -1;
        this.stepAnim += this.direccio;

        // Es suma la velocitat a la poisició, si s'arriba al límit de l'escenari apareix a l'altre costat
        if (this.position > this.threshold) this.position = -this.threshold;
        this.position += this.velocity;
    }
}

// Una roca, que consisteix d'una esfera amb alguns vèrtexs canviats.
class Rock {
    constructor(seed, roughness, color = [120 / 255, 120 / 255, 120 / 255, 1]) {
        this.seed = seed;
        this.rockModel = makeRock(this.seed, roughness);
        this.color = color;
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.rockModel);
    }

    // Dibuixa la pedra segons la matriu M
    draw(M) {
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, M);
        draw(this.rockModel, this.color);
    }
}

// Una bombolla, que consisteix en una esfera que augmenta la seva altura constantment.
class Bubble {
    constructor(start = [0, 0, 0]) {
        this.bubble = sphereModel;
        this.start = start;
        this.color = [0, 1, 1, 0.5];

        this.stepAnim = 0;
        this.velocity = 20;
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.bubble);
    }

    // Dibuixa la bombolla segons la matriu M.
    draw(M) {
        if (this.stepAnim >= 250) return;

        var aux = mat4.create();
        var S = mat4.create();
        var T = mat4.create();

        mat4.fromScaling(S, [0.1, 0.1, 0.1]);
        mat4.multiply(aux, S, aux);

        mat4.fromTranslation(T, this.start);
        mat4.multiply(aux, T, aux);

        // Moviment de la bombolla a cada frame
        mat4.fromTranslation(T, [
            (Math.random() - .5) * 0.06,    // Moviment aleatori cap als costats
            (Math.random() - .5) * 0.06,    // Moviment aleatori cap als costats
            0.03 * this.stepAnim           // Moviment amunt
        ]);
        mat4.multiply(aux, T, aux);

        mat4.multiply(aux, M, aux);

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
        draw(this.bubble, this.color);

        this.stepAnim++;
    }
}

// Un cofre, que consisteix d'un cos (cub transformat), una tapa (mitj cilindre) que s'obre, i bombolles
class Chest {
    lid; box;
    constructor(nBubbles) {
        this.color = [65 / 255, 40 / 255, 10 / 255, 1]
        this.box = cubeModel;
        this.lid = createHalfCylinder(0.5, 0.2, 8);
        this.coinsModel = discModel;
        this.bubbles = [];
        
        // S'inicia la posició aleatòria de les bombolles
        for (var i = 0; i < nBubbles; i++) {
            this.bubbles.push(new Bubble([
                (Math.random() - .5) * 2 * 0.85,
                (Math.random() - .5) * 0.8,
                (Math.random() - .5) * 0.8,
            ]));
        }
        this.nSteps = 64;
        this.obrint = false;
        this.stepAnim = 0;
        this.bubblesOut = false;

        this.coins = [];
        this.createCoins();
    }

    // Retorna una matriu que significa la transformació de la tapa al obrir-se.
    open() {
        var aux = mat4.create();
        var T = mat4.create();
        var R = mat4.create();

        mat4.fromRotation(R, (Math.PI / 2 / this.nSteps) * this.stepAnim, [0, 1, 0]);
        mat4.multiply(aux, aux, R);

        mat4.fromTranslation(T, [
            -0.5 / this.nSteps * this.stepAnim,
            0,
            0.5 / this.nSteps * this.stepAnim,
        ]);
        mat4.multiply(aux, aux, T);


        if (this.obrint) {
            if (this.stepAnim >= this.nSteps) {
                this.obrint = false;
                this.bubblesOut = true;
            }
            else this.stepAnim++;
        }

        return aux;
    }

    // Inici dels buffers de l'objecte
    initBuffers() {
        initBuffers(this.box);
        initBuffers(this.lid);
        this.bubbles.forEach((bubble) => bubble.initBuffers());
        initBuffers(this.coinsModel)
    }

    createCoins() {
        for (var i = 0; i < 100; i++) {
            this.coins.push({
                translation : [ // (Math.random()-0.5)*4
                    (Math.random()-0.5)*14,
                    (Math.random()-0.5)*6,
                    (Math.random()*0.1)-5.15,
                ],
                rotation : {
                    angle : Math.random()*Math.PI/10,
                    axis : [0, Math.round(Math.random()), Math.round(Math.random())]
                }
            });
        }
    }

    // Dibuixa el cofre segons M
    draw(M) {

        var aux = mat4.create();
        var S = mat4.create();
        var T = mat4.create();
        var R = mat4.create();
        var matBub = mat4.create();
        var matDis = mat4.create();

        mat4.fromScaling(S, [2, 1, 1]);
        mat4.multiply(aux, M, S);

        // Dibuixant la caixa
        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
        draw(this.box, this.color);

        mat4.fromScaling(S, [0.1,0.1,0.1]);
        mat4.multiply(matDis, M, S);
        
        for (var coin of this.coins) {
            mat4.fromTranslation(T, coin.translation);
            mat4.multiply(aux, matDis, T);
            mat4.fromRotation(R, coin.rotation.angle, coin.rotation.axis);
            mat4.multiply(aux, aux, R);

            gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
            draw(discModel, [1,1,0,1]);
        }

        //gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, matDis);
        //draw(discModel, [1,1,0,1]);

        // Dibuixant la tapa
        var aux = mat4.create();
        mat4.fromScaling(S, [1, 10, 1]);
        mat4.multiply(aux, S, aux);

        mat4.fromRotation(R, Math.PI, [1, 1, 0]);
        mat4.multiply(aux, R, aux);

        mat4.fromTranslation(T, [0, 0, -0.5 + 0.05]);
        mat4.multiply(aux, T, aux);

        mat4.multiply(aux, M, aux);

        // Es transforma la tapa per les transformacions de quan s'obre la tapa
        mat4.multiply(aux, aux, this.open(this.stepAnim));

        gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, aux);
        draw(this.lid, this.color);

        mat4.fromRotation(R, Math.PI, [1, 0, 0]);
        mat4.multiply(matBub, M, R);

        // Si el cofre ja s'ha obert el dibuixen les bombolles
        if (this.bubblesOut)
            this.bubbles.forEach((bubble) => bubble.draw(matBub));
    }
}