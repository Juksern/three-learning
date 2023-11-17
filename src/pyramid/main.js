import * as THREE from 'three';
import * as dat from 'dat.gui';

// hjelper funksjon for å konvertere hex til rgb
function hex_to_vec3(col) {
    const int = parseInt(col.replace(/^#/, ''), 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;

    return new THREE.Vector3(r/255, g/255, b/255);
}

const gui = new dat.GUI();

let cam = {
    x: 0, 
    y: .01, 
    z: 0,
    zoom: 5
};

gui.add(cam, 'x', 0, .02);
gui.add(cam, 'y', 0, .02);
gui.add(cam, 'z', 0, .02);
gui.add(cam, 'zoom', 0, 10);

let colors = {
    color1: '#FF0000',
    color2: '#FFAA00'
};

const colorUniforms = {
    ucol0: { value: hex_to_vec3(colors.color1) },
    ucol1: { value: hex_to_vec3(colors.color2) },
};

gui.addColor(colors, 'color1').onChange(function(v) {
    // vi må oppdatere fargen når den endres
    colorUniforms.ucol0.value.copy(hex_to_vec3(v));
});

gui.addColor(colors, 'color2').onChange(function(v) {
    // vi må oppdatere fargen når den endres
    colorUniforms.ucol1.value.copy(hex_to_vec3(v));
});


let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let geometry = new THREE.BufferGeometry();

let vertices = new Float32Array([
    -1, -1, 1,  // blc
    1, -1, 1,   // brc
    1, -1, -1,  // trc
    -1, -1, -1, // tlc
    0, 1, 0     // apex
]);

let indices = new Uint16Array([
    0, 1, 2, // base 1
    0, 2, 3, // base 2
    0, 1, 4, // side 1
    1, 2, 4, // side 2
    2, 3, 4, // side 3
    3, 0, 4  // side 4
]);

let normals = new Float32Array([
    0, -1, 0,   // blc
    0, -1, 0,   // brc
    0, -1, 0,   // trc
    0, -1, 0,   // tlc
    0, 1, 0     // apex
]);

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
geometry.setIndex(new THREE.BufferAttribute(indices, 1));

//vertex shader
const vs = `
    varying vec3 vpos;
    varying vec3 vnormal;

    void main() {
        vpos = position;
        vnormal = normalMatrix * normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

//fragment shader
const fs = `
    varying vec3 vpos;
    varying vec3 vnormal;
    uniform vec3 ucol0;
    uniform vec3 ucol1;

    void main() {
        vec3 I = normalize(vpos - cameraPosition);
        vec3 R = reflect(I, normalize(vnormal));

        //simple vertical gradient
        vec3 reflection = vec3(0.5) + vec3(0.5) * R.y;

        float gradient = (vpos.y + 1.0) * 0.5;
        vec3 gradient_color = mix(ucol1, ucol0, gradient);

        vec3 final = mix(reflection, gradient_color, 0.5);

        gl_FragColor = vec4(final, 1.0);
    }
`;

const material = new THREE.ShaderMaterial({
    uniforms: colorUniforms,
    vertexShader: vs,
    fragmentShader: fs,
    side: THREE.DoubleSide, // ellers er bunnen svart
});

let pyramid = new THREE.Mesh(geometry, material);
scene.add(pyramid);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

function animate() {
    requestAnimationFrame(animate);

    pyramid.rotation.x += cam.x;
    pyramid.rotation.y += cam.y;
    pyramid.rotation.z += cam.z;
    camera.position.z = cam.zoom;

    renderer.render(scene,camera);
}

animate();