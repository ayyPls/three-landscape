import { BufferGeometry, Clock, AxesHelper, Mesh, PerspectiveCamera, Scene, WebGLRenderer, Vector3, DirectionalLight, AmbientLight, MeshLambertMaterial, Points, PointsMaterial, Box3, MeshBasicMaterial, BufferAttribute} from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Delaunator from 'delaunator';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import {shittyPoints} from './points.js'
import {shittyPolygons} from './polygons.js'
console.log(shittyPoints)
// NOTE: sources
// https://codepen.io/prisoner849/pen/bQWOjY
// https://www.youtube.com/watch?v=r_aJQKMlHQg&list=PLEXzUhnWfEhgTVL_r3_njztkZdeQGNJCR&index=11
// https://github.com/josephg/noisejs noise library
// https://www.npmjs.com/package/delaunator delaunay triangulation lib
// https://habr.com/ru/articles/446682/ todo: watch web worker + webgl/threejs
// https://discourse.threejs.org/t/split-slice-3d-models-using-three-js/14826/2
// https://threejs.org/examples/?q=stencil#webgl_clipping_stencil slice model
// https://threejs.org/examples/#webgl_clipping_intersection 
// https://www.youtube.com/watch?v=zCKet0lnUA0
// https://codesandbox.io/p/sandbox/facemesh-4lzxrr?file=%2Fsrc%2FFacemesh.jsx%3A69%2C24
// https://github.com/pmndrs/react-three-offscreen

// init mesh material
// const material = new MeshBasicMaterial({






// NOTE: performance
// only points & light ~30fps ~40ms 120mb
// only points ~40fps ~30ms 120mb


const material = new MeshLambertMaterial({
    color: "yellow",
    wireframe: false
})
// init gui  
const gui = new GUI();
gui.add(material, "wireframe");

const getRandomGeometry = ()=>{
    // const size = { x: 200, z: 200 };
    // let points = [];

    const points = []
    for (let i = 0; i < shittyPoints.length; i+=3) {

      let x = shittyPoints[i];
      let y = shittyPoints[i+1]
      let z = shittyPoints[i+2];
      points.push(new Vector3(x, y, z));
    }

    // const polygons = []
    // for (let i = 0; i <= shittyPoints.length; i++) {
    //     polygons.push(

    //     )
    // }


    // const indeces = []

    // let polygons = []
    // for(let i =0; i<=shittyPolygons.length; i++){
    //     // let x = points.at(i).x
    //     // let y = points.at()
    //     // let z = shittyPolygons[i+2]
    //     polygons.push(points.at(i));
    // }

    // console.log(polygons)
    
    const geometry = new BufferGeometry().setFromPoints(points)
    // geometry.setIndex(polygons)
    // geometry.computeVertexNormals()

    // geometry.setAttribute('position', new BufferAttribute(points, 3))

    // const geometry = new BufferGeometry().setFromPoints(points);
    // geometry.setIndex(shittyPolygons)

    // geometry.computeVertexNormals()
    // const indexDelaunay = Delaunator.from(
    //     points.map(v => {
    //     return [v.x, v.z];
    //     })
    // );
    
    // const meshIndex = []; // delaunay index => three.js index
    // for (let i = 0; i < indexDelaunay.triangles.length; i++){
    //     meshIndex.push(indexDelaunay.triangles[i]);
    // }
    
    // geometry.setIndex(meshIndex); // add three.js index to the existing geometry
    // geometry.computeVertexNormals();

    // const landscapeMesh = new Mesh(geometry, material)

    // landscapeMesh.scale.set(0.001)
    const pointsGeometry = new Points(
        geometry,
        new PointsMaterial({ color: 0x99ccff, size: 1 })
      );
    //   pointsGeometry.position
    //   landscapeMesh.position.set(0, 0, 0)

    // center model
    const box = new Box3().setFromObject(pointsGeometry)
    const center = new Vector3()
    box.getCenter(center)
    // pointsGeometry.rotateOnAxis(new Vector3(0, 0, 1), 90)
    // landscapeMesh.position.sub(center)
    pointsGeometry.position.sub(center)
    // landscapeMesh.position.sub(center)
    
    return [
        // landscapeMesh,
        pointsGeometry
    ]

}

// init scene
const scene = new Scene()

// init light
const light = new DirectionalLight(0xffffff, 1.5);
light.position.setScalar(1000);
scene.add(light);
scene.add(new AmbientLight(0xffffff, 0.5));
// scene.position.setScalar(1000)
// init renderer
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.className = 'renderer'
document.body.appendChild(renderer.domElement);

// init helpers
const clock = new Clock()
const stats = new Stats()
document.body.appendChild(stats.dom)
const axesHelper = new AxesHelper(50);

// init camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.x = 1000
camera.position.y = 1000
camera.position.z = 1000

scene.add(axesHelper);
scene.add(camera)

// init controls
const controls = new OrbitControls(camera, renderer.domElement)

const generatedGeometry = getRandomGeometry()

scene.add(...generatedGeometry)
// scene.add(generatedGeometry.geometry)
// camera.position.set(generatedGeometry.pointsGeometry.geometry.attributes['position'][0])

console.log(scene)
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
    // to prevent blurring output canvas ?
    renderer.setPixelRatio(window.devicePixelRatio);
}
window.addEventListener('resize', onWindowResize, false)
