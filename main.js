import { BufferGeometry, Clock, AxesHelper, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer, MathUtils, Vector3} from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Delaunator from 'delaunator';


// NOTE: sources
// https://codepen.io/prisoner849/pen/bQWOjY
// https://www.youtube.com/watch?v=r_aJQKMlHQg&list=PLEXzUhnWfEhgTVL_r3_njztkZdeQGNJCR&index=11
// https://github.com/josephg/noisejs noise library
// https://www.npmjs.com/package/delaunator delaunay triangulation lib
// https://habr.com/ru/articles/446682/ todo: watch web worker + webgl/threejs


// init mesh material
const material = new MeshBasicMaterial({
    color: "yellow",
    wireframe: true
})

const getRandomGeometry = (amount = 50)=>{
    const size = { x: 200, z: 200 };
    const pointsCount = 1000;
    let points = [];
    for (let i = 0; i < pointsCount; i++) {
      let x = MathUtils.randFloatSpread(size.x);
      let z = MathUtils.randFloatSpread(size.z);
      let y = MathUtils.randFloatSpread(amount / 2)
      points.push(new Vector3(x, y, z));
    }
    
    const geometry = new BufferGeometry().setFromPoints(points);
    
    const indexDelaunay = Delaunator.from(
        points.map(v => {
        return [v.x, v.z];
        })
    );
    
    const meshIndex = []; // delaunay index => three.js index
    for (let i = 0; i < indexDelaunay.triangles.length; i++){
        meshIndex.push(indexDelaunay.triangles[i]);
    }
    
    geometry.setIndex(meshIndex); // add three.js index to the existing geometry
    geometry.computeVertexNormals();
    return new Mesh(
        geometry, // re-use the existing geometry
        material
    );
}

// awaited format of polygons from backend

// const polygons = [
//     {
//         points: [
//             {
//                 x,y,z
//             },
//             {
//                 x,y,z
//             },
//             {
//                 x,y,z
//             }
//         ]
// }
// ]




// init scene
const scene = new Scene()
// init renderer
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.className = 'renderer'
document.body.appendChild(renderer.domElement);

// init helpers
const clock = new Clock()
const stats = new Stats()
const axesHelper = new AxesHelper(5);

// init camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.y = 100
camera.position.x = 100
camera.position.z = 200

scene.add(axesHelper);
scene.add(camera)

// init controls
const controls = new OrbitControls(camera, renderer.domElement)

const mesh = getRandomGeometry()
scene.add(mesh)

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
