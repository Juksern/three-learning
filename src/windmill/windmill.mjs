import * as THREE from 'three';
import * as dat from 'dat.gui';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const vs = `
    varying vec3 vpos;
    varying vec3 vnormal;

    void main() {
        vpos = position;
        vnormal = normalMatrix * normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

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

document.addEventListener('DOMContentLoaded', function() {
    const gui = new dat.GUI();
    const scene = new THREE.Scene();
    const loader = new GLTFLoader();
    
    scene.add(new THREE.AxesHelper(5));
    
    const light = new THREE.SpotLight();
    light.position.set(5, 5, 5);
    scene.add(light);
    
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 100;
    
    const renderer = new THREE.WebGL1Renderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    
    function hex_to_vec3(col) {
        const int = parseInt(col.replace(/^#/, ''), 16);
        const r = (int >> 16) & 255;
        const g = (int >> 8) & 255;
        const b = int & 255;
    
        return new THREE.Vector3(r/255, g/255, b/255);
    }
    
    let data = {
        color1: '#FF0000',
        color2: '#FFAA00',
        animation_speed: 1.0
    };
    
    const colorUniforms = {
        ucol0: { value: hex_to_vec3(data.color1) },
        ucol1: { value: hex_to_vec3(data.color2) },
    };
    
    
    gui.addColor(data, 'color1').onChange(function(v) {
        // vi må oppdatere fargen når den endres
        colorUniforms.ucol0.value.copy(hex_to_vec3(v));
    });
    
    gui.addColor(data, 'color2').onChange(function(v) {
        // vi må oppdatere fargen når den endres
        colorUniforms.ucol1.value.copy(hex_to_vec3(v));
    });
    
    gui.add(data, 'animation_speed', 0, 5, 0.1);
    
    const material = new THREE.ShaderMaterial({
        uniforms: colorUniforms,
        vertexShader: vs,
        fragmentShader: fs,
        side: THREE.DoubleSide,
    });
    
    let mixer;
    
    loader.load(
        'resources/windmill.glb',
        function(gltf) {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    child.material = material;
                }
            });
            scene.add(gltf.scene);
            console.log(gltf.animations);
    
            mixer = new THREE.AnimationMixer(gltf.scene);
    
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        (error) => {
            console.log(error);
        }
    );
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        render();
    }, false);
    
    const clock = new THREE.Clock();
    
    function animate() {
        const delta = clock.getDelta();
    
        if (mixer) {
            mixer.timeScale = data.animation_speed;
            mixer.update(delta);
        }
    
        renderer.render(scene, camera);
    }
    
    function render() {
        requestAnimationFrame(render);
        controls.update()
        animate();
    }
    
    render();
});

