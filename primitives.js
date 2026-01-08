var cubeModel = {  // 8 vértices, 12 triángulos

    "vertices": [-0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5],

    "indices": [0, 1, 2, 0, 2, 3,
        1, 5, 6, 1, 6, 2,
        3, 2, 6, 3, 6, 7,
        5, 4, 7, 5, 7, 6,
        4, 0, 3, 4, 3, 7,
        4, 5, 1, 4, 1, 0]

};

var planeModel = {  // 4 vértices, 2 triángulos

    "vertices": [-0.5, 0.0, 0.5,
        0.5, 0.0, 0.5,
        0.5, 0.0, -0.5,
    -0.5, 0.0, -0.5],

    "indices": [0, 1, 2, 0, 2, 3]

};

var sphereModel = {  // 42 vértices, 80 triángulos

    "vertices": [0.000000, 0.850651, 0.525731,
        -0.309017, 0.500000, 0.809017,
        0.309017, 0.500000, 0.809017,
        -0.525731, 0.000000, 0.850651,
        0.000000, 0.000000, 1.000000,
        0.525731, 0.000000, 0.850651,
        -0.850651, 0.525731, 0.000000,
        -0.809017, 0.309017, 0.500000,
        -0.500000, 0.809017, 0.309017,
        0.000000, 0.850651, -0.525731,
        -0.500000, 0.809017, -0.309017,
        0.000000, 1.000000, 0.000000,
        0.500000, 0.809017, -0.309017,
        0.500000, 0.809017, 0.309017,
        0.850651, 0.525731, 0.000000,
        0.809017, 0.309017, 0.500000,
        0.850651, -0.525731, 0.000000,
        1.000000, 0.000000, 0.000000,
        0.809017, -0.309017, 0.500000,
        0.525731, 0.000000, -0.850651,
        0.809017, 0.309017, -0.500000,
        0.809017, -0.309017, -0.500000,
        0.309017, 0.500000, -0.809017,
        -0.525731, 0.000000, -0.850651,
        -0.309017, 0.500000, -0.809017,
        0.000000, 0.000000, -1.000000,
        0.000000, -0.850651, -0.525731,
        -0.309017, -0.500000, -0.809017,
        0.309017, -0.500000, -0.809017,
        0.500000, -0.809017, -0.309017,
        0.000000, -0.850651, 0.525731,
        0.000000, -1.000000, 0.000000,
        0.500000, -0.809017, 0.309017,
        -0.850651, -0.525731, 0.000000,
        -0.500000, -0.809017, -0.309017,
        -0.500000, -0.809017, 0.309017,
        -0.809017, -0.309017, 0.500000,
        -0.309017, -0.500000, 0.809017,
        0.309017, -0.500000, 0.809017,
        -1.000000, 0.000000, 0.000000,
        -0.809017, -0.309017, -0.500000,
        -0.809017, 0.309017, -0.500000],

    "indices": [1, 2, 0, 4, 1, 3, 2, 4, 5, 4, 2, 1, 7, 8, 6, 1, 7, 3, 8, 1, 0, 1, 8, 7, 10, 11, 9, 8, 10, 6,
        11, 8, 0, 8, 11, 10, 11, 12, 9, 13, 11, 0, 12, 13, 14, 13, 12, 11, 13, 15, 14, 2, 13, 0, 15, 2, 5, 2, 15, 13,
        17, 18, 16, 15, 17, 14, 18, 15, 5, 15, 18, 17, 20, 21, 19, 17, 20, 14, 21, 17, 16, 17, 21, 20, 22, 20, 19, 12, 22, 9,
        20, 12, 14, 12, 20, 22, 24, 25, 23, 22, 24, 9, 25, 22, 19, 22, 25, 24, 27, 28, 26, 25, 27, 23, 28, 25, 19, 25, 28, 27,
        29, 21, 16, 28, 29, 26, 21, 28, 19, 28, 21, 29, 31, 32, 30, 29, 31, 26, 32, 29, 16, 29, 32, 31, 34, 35, 33, 31, 34, 26,
        35, 31, 30, 31, 35, 34, 36, 37, 3, 35, 36, 33, 37, 35, 30, 35, 37, 36, 4, 38, 5, 37, 4, 3, 38, 37, 30, 37, 38, 4,
        38, 18, 5, 32, 38, 30, 18, 32, 16, 32, 18, 38, 7, 36, 3, 39, 7, 6, 36, 39, 33, 39, 36, 7, 39, 40, 33, 41, 39, 6,
        40, 41, 23, 41, 40, 39, 41, 24, 23, 10, 41, 6, 24, 10, 9, 10, 24, 41, 27, 40, 23, 34, 27, 26, 40, 34, 33, 34, 40, 27]

};

var discModel = {  // 13 vértices, 12 triángulos

    "vertices": [1, 0, 0, 0.866, 0.5, 0, 0.5, 0.866, 0,
        0, 1, 0, -0.5, 0.866, 0, -0.86, 0.5, 0,
        -1, 0, 0, -0.866, -0.5, 0, -0.5, -0.866, 0,
        0, -1, 0, 0.5, -0.866, 0, 0.866, -0.5, 0,
        0, 0, 0],

    "indices": [0, 1, 12, 1, 2, 12, 2, 3, 12, 3, 4, 12, 4, 5, 12, 5, 6, 12,
        6, 7, 12, 7, 8, 12, 8, 9, 12, 9, 10, 12, 10, 11, 12, 11, 0, 12]

};

var cylinderModel = {  // 24 vértices, 24 triángulos

    "vertices": [1, 0, 0, 0.866, 0.5, 0, 0.5, 0.866, 0,
        0, 1, 0, -0.5, 0.866, 0, -0.86, 0.5, 0,
        -1, 0, 0, -0.866, -0.5, 0, -0.5, -0.866, 0,
        0, -1, 0, 0.5, -0.866, 0, 0.866, -0.5, 0,
        1, 0, 1, 0.866, 0.5, 1, 0.5, 0.866, 1,
        0, 1, 1, -0.5, 0.866, 1, -0.86, 0.5, 1,
        -1, 0, 1, -0.866, -0.5, 1, -0.5, -0.866, 1,
        0, -1, 1, 0.5, -0.866, 1, 0.866, -0.5, 1],

    "indices": [0, 1, 12, 1, 2, 13, 2, 3, 14, 3, 4, 15, 4, 5, 16, 5, 6, 17,
        6, 7, 18, 7, 8, 19, 8, 9, 20, 9, 10, 21, 10, 11, 22, 11, 0, 23,
        1, 13, 12, 2, 14, 13, 3, 15, 14, 4, 16, 15, 5, 17, 16, 6, 18, 17,
        7, 19, 18, 8, 20, 19, 9, 21, 20, 10, 22, 21, 11, 23, 22, 0, 12, 23]

};

// Igual que makeCylinder però para a mitja circumferència.
function createHalfCylinder(radius, height, nSides) {
    let halfCylinder = {
        "vertices": [],
        "indices": []
    };

    if (nSides < 3) nSides = 3;

    // Generant els vèrtexs.
    for (var i = 0; i <= nSides; i++) {
        var phi = i / nSides * Math.PI; // Para a Math.PI
        var cphi = radius * Math.cos(phi);
        var sphi = radius * Math.sin(phi);

        halfCylinder.vertices.push(cphi, height / 2, sphi);
        halfCylinder.vertices.push(cphi, -height / 2, sphi);
    }

    var n = nSides * 2 + 2;
    for (var i = 0; i < n; i += 2) {
        halfCylinder.indices.push(i, (i + 2) % n, i + 1);
        halfCylinder.indices.push((i + 2) % n, (i + 3) % n, i + 1);
    }

    // Crea les tapes del mig cilindre
    for (let i = 2; i < n; i += 2) {
        halfCylinder.indices.push(0, (i + 2) % n, i);
        halfCylinder.indices.push(nSides * 2 + 1, (i + 1) % n, i - 1);
    }

    return halfCylinder;
}

// Agafa el model sphereModel i li suma un número aleatòri 
// a cada punt per crear una esfera rugosa
function makeRock(seed, roughness) {
    var rock = {
        "vertices": [],
        "indices": sphereModel.indices,
    };

    const random = seededRandom(seed);

    // Generant els vèrtexs.
    for (v of sphereModel.vertices)
        rock.vertices.push(v + (random() - 0.5) * roughness)

    return rock;
}

// Crea un cono truncat amb una tapa a la part truncada
function makeTruncatedCone(nSides, coneHeight, truncatedHeight) {
    var cone = {
        "vertices": [],
        "indices": []
    };

    if (nSides < 3) nSides = 3;

    truncatedHeight = Math.min(Math.max(truncatedHeight, 0.0), coneHeight);
    var truncationScale = truncatedHeight / coneHeight;

    // Generant els vèrtexs.
    for (var i = 0; i < nSides; i++) {
        var phi = (i / nSides) * 2.0 * Math.PI;
        var cphi = Math.cos(phi);
        var sphi = Math.sin(phi);

        cone.vertices.push(cphi, sphi, 0.0);

        cone.vertices.push(cphi * truncationScale, sphi * truncationScale, coneHeight);
    }

    var n = nSides * 2;
    for (var i = 0; i < n; i += 2) {
        cone.indices.push(i + 1, i, (i + 2) % n);
        cone.indices.push(i + 1, (i + 2) % n, (i + 3) % n);
    }

    // Crear el vèrtex on es genera la tapa.
    var topCenterIndex = cone.vertices.length / 3;
    cone.vertices.push(0.0, 0.0, coneHeight-0.3);

    // Generar la tapa de la part truncada
    for (var i = 0; i < nSides; i++) {
        var currentIndex = i * 2 + 1;
        var nextIndex = ((i + 1) % nSides) * 2 + 1;
        cone.indices.push(topCenterIndex, currentIndex, nextIndex);
    }

    return cone;
}


function generateIrregularPlane(sideLength, nSquares, seed, roughness=0.5) {
    // Generant els vèrtex
    var irregularPlane = {
        "vertices": [],
        "indices": []
    };
    var stepX = sideLength / (nSquares - 1);
    var stepY = sideLength / (nSquares - 1);

    const random = seededRandom(seed);

    for (let row = 0; row < nSquares; row++) {
        for (let col = 0; col < nSquares; col++) {
            irregularPlane.vertices.push(
                col * stepX - (sideLength / 2) * random([-roughness/10, roughness/10]),
                row * stepY - (sideLength / 2) * random([-roughness/10, roughness/10]),
                random([-roughness, roughness]));
        }
    }

    const indices = [];
    for (let row = 0; row < nSquares - 1; row++) {
        for (let col = 0; col < nSquares - 1; col++) {
            // Creant els dos triangles que formen un pla (una secció)
            const topLeft = row * nSquares + col;
            const topRight = row * nSquares + col + 1;
            const bottomLeft = (row + 1) * nSquares + col;
            const bottomRight = (row + 1) * nSquares + col + 1;

            irregularPlane.indices.push(topLeft, bottomLeft, topRight);
            irregularPlane.indices.push(topRight, bottomLeft, bottomRight);
        }
    }

    return irregularPlane;
}