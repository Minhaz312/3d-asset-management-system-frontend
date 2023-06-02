import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function ModalLoader(modalContainer,progressElement, fileLocation, bgColor=null) {
  
  const canvas = document.createElement("canvas");
  const clock = new THREE.Clock()
  let animation
  let mixer
  const backgroundColor = bgColor===null? new THREE.Color().set('rgb(200, 200, 200)') :new THREE.Color().set(bgColor)
//   let modalContainer = modalContainer
//   let canvas = document.querySelector('#modal')
  const scene = new THREE.Scene()
  const containerRatio = modalContainer.clientWidth / modalContainer.clientHeight;
  const camera = new THREE.PerspectiveCamera(
    30,
    modalContainer.clientWidth / modalContainer.clientHeight,
    0.1,
    1000,
  )
  const renderer = new THREE.WebGL1Renderer({
    canvas: canvas,
    antialias: false,
  })
  const controls = new OrbitControls(camera, renderer.domElement)

  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(modalContainer.clientWidth, modalContainer.clientHeight)
  renderer.shadowMap.enabled = false
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputEncoding = THREE.sRGBEncoding
  camera.position.set(0, -0.09, 1)

  scene.translateY(-0.001)
  scene.castShadow = false

  renderer.render(scene, camera)

  const loader = new GLTFLoader()

  loader.load(
    fileLocation,
    function (glb) {
      const model = glb.scene

      camera.position.x = -0.5
      camera.position.y = 0.3


      var rotation = false

      // document
      //   .getElementsByClassName('slider-image')[0]
      //   .addEventListener('mouseover', () => {
      //     rotation = true
      //   })

      // modal sizing and scaling

      const box = new THREE.Box3().setFromObject(model)
      var size = new THREE.Vector3()
      box.getSize(size)
      var center = new THREE.Vector3()
      box.getCenter(center)

      let scale = Math.min(1.0 / size.x, 1.0 / size.y, 1.0 / size.z) //modalContainer.clientHeight / modalContainer.clientWidth


      // if (size.y > 15) {
      //   scale = scale / 2.5
      // } else {
      //   scale = scale / 1.5
      // }

      scale=scale/1.4

      if ((size.y < size.x) & (window.innerWidth < 768)) {
        scale = scale / 2.5
      }

      model.scale.setScalar(scale)

      model.position.sub(center.multiplyScalar(scale))

      scene.background = backgroundColor;

      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000000, 1000000),
        new THREE.MeshStandardMaterial({
          color: backgroundColor,
        }),
      )

      plane.castShadow = false
      plane.rotation.x = -Math.PI / 2

      // if (extension == 'gltf') {
      //   plane.position.y = -size.y
      //   plane.receiveShadow = false
      // } else {
      //   plane.receiveShadow = true
      //   plane.position.y = -size.y / 3
      // }
      // if (size.y < 1) {
      //   plane.position.y = -size.y
      // } else {
      //   plane.translateY(0) //-(size.y * (1 / size.y))
      // }

      // model.add(plane)


      scene.add(model)

      animation = false
      // mixer
      if (glb.animations.length > 0) {
        animation = true
        mixer = new THREE.AnimationMixer(model)
        mixer.clipAction(glb.animations[0]).play()
      }

      modalContainer
        .addEventListener('mouseover', () => {
          modalContainer.style.cursor = 'grab'
        })
      modalContainer
        .addEventListener('mousedown', () => {
          modalContainer.style.cursor = 'grabbing'
        })
      modalContainer
        .addEventListener('mouseup', () => {
          modalContainer.style.cursor = 'grab'
        })
      modalContainer
        .addEventListener('mouseout', () => {
          modalContainer.style.cursor = 'normal'
        })

      // function animateGLB() {
      //   if (rotation == true) {
      //     var timer = Date.now() * 0.001
      //     camera.position.x = Math.cos(timer) * 10
      //     camera.position.z = Math.sin(timer) * 10
      //     camera.lookAt(scene.position)
      //   }
      //   requestAnimationFrame(animateGLB)

      //   controls.update()
      //   renderer.render(scene, camera)
      // }
      // animateGLB()
    },
    function (xhr) {
      let progressDiv = progressElement
      progressDiv.style.display = 'flex'
      progressDiv.style.height = '100%'
      progressDiv.style.width = '100%'
      let total = xhr.total
      let loaded = xhr.loaded

      const prevCanvas = modalContainer.getElementsByTagName("canvas");
  if(prevCanvas.length>0){
    for (let i = 0; i < prevCanvas.length; i++) {
      prevCanvas[i].remove()
    }
  }

      modalContainer.appendChild(canvas)

      let loadedPercentage = Math.round((loaded / total) * 100)
      // progressDiv.innerText = `Loaded ${loadedPercentage}%`
      console.log("loaded% : ",loadedPercentage)
      if (loadedPercentage >= 100) {
        progressDiv.style.display = 'none'
      }
    },
    function (error) {
    },
  )
  const topDirlight = new THREE.DirectionalLight(0xffffff, 0.7)
  const frontDirlight = new THREE.DirectionalLight(0xffffff, 0.7)
  const backDirLight = new THREE.DirectionalLight(0xffffff, 0.7)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)

  ambientLight.position.set(0, 0.5, 3)

  topDirlight.position.set(-5, 5, 10) //0.5, 5, 0
  frontDirlight.position.set(5, 5, 10)
  backDirLight.position.set(0, 1, -10)

  // topDirlight.castShadow = true
  // frontDirlight.castShadow = true
  // backDirLight.castShadow = true

  scene.add(topDirlight)
  scene.add(frontDirlight)
  scene.add(backDirLight)
  scene.add(ambientLight)

  

  window.addEventListener('resize', function (e) {
    camera.aspect = window.innerWidth / window.innerHeight
    
    // modalContainer.clientWidth, modalContainer.clientHeight
    renderer.setSize(modalContainer.clientWidth, modalContainer.clientHeight)
    // renderer.setSize(window.innerWidth, modalContainer.clientHeight)
  })

  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    if (animation == true) {
      const delta = clock.getDelta()
      mixer.update(delta)
    }
    renderer.render(scene, camera)
  }
  animate()
}
