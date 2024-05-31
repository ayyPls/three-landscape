import { BufferGeometry, AxesHelper, Mesh, PerspectiveCamera, Scene, WebGLRenderer, Vector3, DirectionalLight, AmbientLight, MeshLambertMaterial, Points, PointsMaterial, Box3, MeshBasicMaterial, BufferAttribute, Group, DirectionalLightHelper, PointLight, PointLightHelper, MeshPhongMaterial, MeshDepthMaterial, MeshNormalMaterial, DoubleSide, Plane, Color, SRGBColorSpace, PlaneHelper, BoxHelper, Box3Helper, BackSide, IncrementWrapStencilOp, FrontSide, DecrementWrapStencilOp, AlwaysStencilFunc, MeshStandardMaterial, PlaneGeometry, NotEqualStencilFunc, ReplaceStencilOp, BoxGeometry} from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';


// import models csv data
import pt1 from "./csv/pt1.csv?raw"
import wr1 from "./csv/wr1.csv?raw"

import pt2 from "./csv/pt2.csv?raw"
import wr2 from "./csv/wr2.csv?raw"

import pt3 from "./csv/pt3.csv?raw"
import wr3 from "./csv/wr3.csv?raw"

// init scene
const scene = new Scene()

// init clipping places
const clipPlanes = [
    new Plane(new Vector3(-1, 0, 0), 0),
    new Plane(new Vector3(0, -1, 0), 0),
    new Plane(new Vector3(0, 0, -1), 0),
]

const params = {
    clipIntersection: true,
    planeConstant: 0,
    showHelpers: false,
    alphaToCoverage: true,
};


// init gui
const initGui = new GUI({title: "scene GUI"})

/**
 * Reads points from a file and returns an array of Vector3 objects.
 *
 * @param {string} file - The file to read points from.
 * @return {Vector3[]} An array of Vector3 objects representing the points.
 */
function readPointsFromFile(file){
    return file.split('\r\n').flatMap(
        point=>{
            const dataArray = point.split(",").map(coord=>+Number(coord))
            return new Vector3(dataArray[0], dataArray[1], dataArray[2])
        }
    )
}

/**
 * Reads polygons from a file and returns an array of indices of polygons.
 *
 * @param {string} file - The file to read polygons from.
 * @return {number[][]} An array of arrays, where each inner array represents a polygon and contains three indices.
 */
function readPolygonsFromFile(file){
    return file.split('\r\n').flatMap(
        polygon=>{
            const dataArray = polygon.split(",").map(index=>+Number(index))
            return [dataArray[0] - 1 , dataArray[1] - 1, dataArray[2] - 1]
        }
    )
}


/**
 * Retrieves a model from the given files of points and polygons.
 *
 * @param {string} pointsFile - The file containing the points.
 * @param {string} polygonsFile - The file containing the polygons.
 * @return {{points: Vector3[], indeces: number[][]}} An object containing the points and indices of the model.
 */
function getModelFromFiles(pointsFile, polygonsFile){
    return {
        points: readPointsFromFile(pointsFile),
        indeces: readPolygonsFromFile(polygonsFile)
    }
}

/**
 * Generates a mesh from a given model and mesh name.
 *
 * @param {{points: Vector3[], indeces: number[][]}} model - The model object containing points and indices.
 * @param {string | undefined} meshName - The name of the mesh. Defaults to "Unknown Mesh" if not provided.
 * @return {Mesh} The generated mesh.
 */
function getModelMesh(model, meshName){
    const geometry = new BufferGeometry().setFromPoints(model.points)
    geometry.setIndex(model.indeces)
    geometry.computeVertexNormals()
    

    geometry.computeBoundingSphere()

    geometry.computeBoundingSphere()

    const meshTitle = meshName ?? "Unknown Mesh"
    const meshGui = new GUI({title: meshTitle, parent: initGui})
    const material = new MeshPhongMaterial({
        color: new Color().setHSL(Math.random(), 0.5, 0.5, SRGBColorSpace),
        depthTest: true,
        depthWrite: true,
        reflectivity: 1,
        shininess: 50,
        side: DoubleSide,
        clippingPlanes: clipPlanes,
        clipIntersection: params.clipIntersection,
        alphaToCoverage: true
    })
    
    const mesh = new Mesh(geometry, material)
    meshGui.add(mesh, "visible")
    meshGui.add(material, "wireframe")
    return mesh
}


function createPlaneStencilGroup( geometry, plane, renderOrder ) {

    const group = new Group();
    const baseMat = new MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = AlwaysStencilFunc;

    // back faces
    const mat0 = baseMat.clone();
    mat0.side = BackSide;
    mat0.clippingPlanes = [ plane ];
    mat0.stencilFail = IncrementWrapStencilOp;
    mat0.stencilZFail = IncrementWrapStencilOp;
    mat0.stencilZPass = IncrementWrapStencilOp;

    const mesh0 = new Mesh( geometry, mat0 );
    mesh0.renderOrder = renderOrder;
    group.add( mesh0 );

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = FrontSide;
    mat1.clippingPlanes = [ plane ];
    mat1.stencilFail = DecrementWrapStencilOp;
    mat1.stencilZFail = DecrementWrapStencilOp;
    mat1.stencilZPass = DecrementWrapStencilOp;

    const mesh1 = new Mesh( geometry, mat1 );
    mesh1.renderOrder = renderOrder;

    group.add( mesh1 );

    return group;

}





const model1 = getModelFromFiles(pt1, wr1)
const model2 = getModelFromFiles(pt2, wr2)
const model3 = getModelFromFiles(pt3, wr3)


const modelsSet = [
    model1,
    model2,
    model3
]

const meshes = modelsSet.map((modelData, index)=>getModelMesh(modelData, `Mesh ${index}`))

const modelsGroup = new Group()
modelsGroup.name = "models group"
modelsGroup.add(...meshes)


// just a random point in the middle of array to get somewhere center of the model (model1)
modelsGroup.position.sub(model1.points[(model1.points.length/2).toFixed()])
scene.add(modelsGroup)

// init light
const ambLight = new AmbientLight(0xffffff, 0.8)
const light = new DirectionalLight(0xffffff, 0.8);
light.castShadow = true
light.position.set(5000, 5000, 5000)

const lightGroup = new Group()
lightGroup.name = "light group"
lightGroup.add(light, ambLight)
scene.add(lightGroup)

// init renderer
const renderer = new WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.localClippingEnabled = true
renderer.domElement.className = 'renderer'
document.body.appendChild(renderer.domElement);


// init stats to display
const stats = new Stats()
document.body.appendChild(stats.dom)

// init helpers
const axesHelper = new AxesHelper(50);
const lightHelper = new DirectionalLightHelper( light, 20, 'yellow' );

const helpersGroup = new Group()

const modelsGroupBoundingBox = new Box3()
modelsGroupBoundingBox.setFromObject(modelsGroup)

// const modelViewBoxHelper = new Box3Helper(modelsGroupBoundingBox)
helpersGroup.name = "helpers group"
// modelViewBoxHelper.name = "model view box helper"
helpersGroup.add(lightHelper, axesHelper)

let planeObjects = []

const planeGeometry = new PlaneGeometry(5000, 5000)
const object = new Group()

clipPlanes.forEach((plane, i, array)=>{
    const poGroup = new Group()
    const stencilGroup = createPlaneStencilGroup(modelsGroup[0], plane, i+1)

    const planeMaterial = new MeshStandardMaterial({
        color: 0xE91E63,
		metalness: 0.1,
		roughness: 0.75,
		clippingPlanes: array.filter( p => p !== plane),
		stencilWrite: true,
		stencilRef: 0,
		stencilFunc: NotEqualStencilFunc,
		stencilFail: ReplaceStencilOp,
		stencilZFail: ReplaceStencilOp,
		stencilZPass: ReplaceStencilOp,
    })

    const po = new Mesh(planeGeometry, planeMaterial)
    po.onAfterRender = function(renderer){
        renderer.clearStencil()
    }

    po.renderOrder = i + 1.1
    object.add(stencilGroup)
    poGroup.add(po)
    planeObjects.push(po)
    scene.add(poGroup)
    
})

const testMaterial = new MeshStandardMaterial({
    color: 0xFFC107,
    metalness: 0.1,
    roughness: 0.75,
    clippingPlanes: clipPlanes,
    clipShadows: true,
    shadowSide: DoubleSide,
})

const clippedColorFront = new Mesh( modelsGroup[0], testMaterial );
clippedColorFront.castShadow = true;
clippedColorFront.renderOrder = 6;
object.add( clippedColorFront );


// TODO: size of the clipping panels
helpersGroup.add(new PlaneHelper(clipPlanes[0], 10000, 0xff0000 ))
helpersGroup.add(new PlaneHelper(clipPlanes[1], 10000, 0x00ff00  ))
helpersGroup.add(new PlaneHelper(clipPlanes[2], 10000, 0x0000ff  ))



const clippingPanelsGui = new GUI({title: "Clipping Panels GUI", parent: initGui})

clipPlanes.forEach((plane)=>{
    clippingPanelsGui.add(plane, "constant", -10000, 10000)
    clippingPanelsGui.add(plane, 'negate')
})

clippingPanelsGui.add(helpersGroup, 'visible')

scene.add(helpersGroup)
// init camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 200000);
camera.position.x = 1000
camera.position.y = 1000
camera.position.z = 1000

scene.add(camera)

// init controls
const controls = new OrbitControls(camera, renderer.domElement)


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
    renderer.setPixelRatio(window.devicePixelRatio);
}
window.addEventListener('resize', onWindowResize, false)
