import "./style.css"
import * as THREE from "three"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 10000)

const renderer = new THREE.WebGLRenderer()
document.body.appendChild(renderer.domElement)
renderer.setSize(
    renderer.domElement.clientWidth * devicePixelRatio,
    renderer.domElement.clientHeight * devicePixelRatio,
    false,
)
onresize = () => {
    renderer.setSize(
        renderer.domElement.clientWidth * devicePixelRatio,
        renderer.domElement.clientHeight * devicePixelRatio,
        false,
    )
}

const skyCtx = document.createElement("canvas").getContext("2d")
skyCtx.canvas.width = 1000
skyCtx.canvas.height = 1000
const skyTexture = new THREE.CanvasTexture(skyCtx.canvas)
const skyboxGeometry = new THREE.SphereGeometry(1000, 100, 100)
const skyboxMaterial = new THREE.MeshBasicMaterial({
    map: skyTexture,
    opacity: 0.3,
    transparent: true,
})
skyboxMaterial.side = THREE.DoubleSide
const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
scene.add(skyboxMesh)

let newBlobTick = 0

let blobs = []

let lastTime = 0

function animate(time) {
    const delta = time - lastTime
    lastTime = time
    while (newBlobTick > 1000) {
        newBlobTick -= 1000
        blobs.push({
            x: Math.random() * skyCtx.canvas.width,
            y: Math.random() * skyCtx.canvas.height,
            radius: skyCtx.canvas.width / 3,
            opacity: 2,
            color: `${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}`,
        })
        blobs.push(
            {
                ...blobs[blobs.length - 1],
                x: blobs[blobs.length - 1].x - skyCtx.canvas.width,
            },
            {
                ...blobs[blobs.length - 1],
                x: blobs[blobs.length - 1].x + skyCtx.canvas.width,
            },
        )
    }
    newBlobTick += delta
    skyCtx.clearRect(0, 0, skyCtx.canvas.width, skyCtx.canvas.height)
    skyCtx.fillStyle = "black"
    skyCtx.fillRect(0, 0, skyCtx.canvas.width, skyCtx.canvas.height)
    blobs.forEach((blob) => {
        const gradient = skyCtx.createRadialGradient(
            blob.x,
            blob.y,
            0,
            blob.x,
            blob.y,
            blob.radius,
        )
        skyCtx.globalAlpha =
            blob.opacity > 1 ? 1 - (blob.opacity - 1) : blob.opacity
        gradient.addColorStop(0, `rgba(${blob.color}, 1)`)
        gradient.addColorStop(1, `rgba(${blob.color}, 0)`)
        skyCtx.fillStyle = gradient
        skyCtx.fillRect(
            blob.x - blob.radius,
            blob.y - blob.radius,
            blob.radius * 2,
            blob.radius * 2,
        )
        blob.opacity -= delta / 10000
    })
    skyCtx.globalAlpha = 1
    blobs = blobs.filter((x) => x.opacity > 0)
    skyTexture.needsUpdate = true
    //camera.rotation.y = time / 1000
    renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)
