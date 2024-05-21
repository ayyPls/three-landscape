import { BufferGeometry, AxesHelper, Mesh, PerspectiveCamera, Scene, WebGLRenderer, Vector3, DirectionalLight, AmbientLight, MeshLambertMaterial, Points, PointsMaterial, Box3, MeshBasicMaterial, BufferAttribute, Group} from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
// import Delaunator from 'delaunator';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';

import polygonsFile from "./polygons.txt?raw"
import pointsFile from "./points.txt?raw"

const material = new MeshLambertMaterial({
    color: "white",
    wireframe: true
})

const points = pointsFile.split('\r\n').flatMap(
    point=>{
        const dataArray = point.split(",").map(coord=>+Number(coord))
        return new Vector3(dataArray[0], dataArray[1], dataArray[2])
    }
)

const indexes = polygonsFile.split('\r\n').flatMap(
    polygon=>{
        const dataArray = polygon.split(",").map(index=>+Number(index))
        return [dataArray[0] - 1 , dataArray[1] - 1, dataArray[2] - 1]
    }
)

const geometry = new BufferGeometry().setFromPoints(points)

geometry.setIndex(indexes)
geometry.computeVertexNormals()
const mesh = new Mesh(geometry, material)
const pointsMesh = new Points(geometry, new PointsMaterial({ color: 0x99ccff, size: 1 }))


const group = new Group()
group.add(mesh)
// group.add(pointsMesh)
// just a random point in the middle of array to get somewhere center of the model
group.position.sub(points[290000])

// init gui  
const gui = new GUI();
gui.add(material, "wireframe");


// init scene
const scene = new Scene()

// init light
const light = new DirectionalLight(0xffffff, 1.5);
light.position.setScalar(1000);
scene.add(light);
scene.add(new AmbientLight(0xffffff, 0.8));
// scene.position.setScalar(1000)
// init renderer
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.className = 'renderer'
document.body.appendChild(renderer.domElement);

// init helpers
const stats = new Stats()
document.body.appendChild(stats.dom)
const axesHelper = new AxesHelper(50);

// init camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 200000);
camera.position.x = 1000
camera.position.y = 1000
camera.position.z = 1000

scene.add(axesHelper);
scene.add(camera)

// init controls
const controls = new OrbitControls(camera, renderer.domElement)


scene.add(group)

function animate() {
    requestAnimationFrame(animate);
    controls.update()
    stats.update();
    renderer.render(scene, camera);

}
animate();


const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio);
}
window.addEventListener('resize', onWindowResize, false)
