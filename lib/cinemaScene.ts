import * as THREE from "three";

/** Original projection chamber. No external models, shaders, or reference media. */
export function createCinemaScene(
  canvas: HTMLCanvasElement,
  context: WebGL2RenderingContext,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x0b1018, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b1018, 0.027);
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 90);
  const amber = new THREE.Color("#F1AE64"),
    teal = new THREE.Color("#7FC9C2");
  const room = new THREE.Group();
  scene.add(room);
  const resources: Array<{ dispose: () => void }> = [];
  const box = new THREE.BoxGeometry(1, 1, 1);
  const glowPlane = new THREE.PlaneGeometry(1, 1);
  resources.push(box, glowPlane);
  const frames: THREE.Group[] = [];
  for (let i = 0; i < 9; i++) {
    const frame = new THREE.Group();
    frame.position.set(0, 0.1, 3 - i * 5);
    const glow = (vertical: boolean) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: i % 3 === 0 ? teal : amber },
          uOpacity: { value: 0.62 - i * 0.045 },
          uVertical: { value: vertical ? 1 : 0 },
        },
        transparent: true,
        depthWrite: false,
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `uniform vec3 uColor;uniform float uOpacity;uniform float uVertical;varying vec2 vUv;void main(){float edge=abs(mix(vUv.y,vUv.x,uVertical)-.5);float core=1.-smoothstep(.025,.09,edge);float halo=pow(max(0.,1.-edge*2.),3.)*.24;gl_FragColor=vec4(uColor,(core+halo)*uOpacity);}`,
      });
      resources.push(material);
      return material;
    };
    const vertical = glow(true),
      horizontal = glow(false);
    for (const [x, y, w, h] of [
      [-9, 0, 0.3, 10],
      [9, 0, 0.3, 10],
      [0, 5, 18, 0.3],
      [0, -5, 18, 0.3],
    ]) {
      const bar = new THREE.Mesh(glowPlane, w < h ? vertical : horizontal);
      bar.position.set(x, y, 0);
      bar.scale.set(w, h, 0.055);
      frame.add(bar);
    }
    // Dark architectural ribs give the luminous edges physical thickness.
    const ribMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e2933,
      roughness: 0.4,
      metalness: 0.65,
    });
    resources.push(ribMaterial);
    for (const x of [-9.15, 9.15]) {
      const rib = new THREE.Mesh(box, ribMaterial);
      rib.position.set(x, 0, -0.1);
      rib.scale.set(0.2, 10, 0.38);
      frame.add(rib);
    }
    frames.push(frame);
    room.add(frame);
  }
  scene.add(new THREE.HemisphereLight(0x7fc9c2, 0x0b1018, 1.5));
  const warm = new THREE.PointLight(0xf1ae64, 80, 35, 1.7);
  warm.position.set(5, 2, 2);
  const cool = new THREE.PointLight(0x7fc9c2, 50, 30, 1.7);
  cool.position.set(-6, -1, -8);
  scene.add(warm, cool);

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uAmber: { value: amber },
    uTeal: { value: teal },
  };
  const ribbonGeometry = new THREE.PlaneGeometry(2.4, 48, 8, 96);
  resources.push(ribbonGeometry);
  const vertexShader = `
    uniform float uTime; uniform float uProgress;
    varying vec2 vUv; varying float vDepth;
    void main(){
      vUv=uv; vec3 p=position;
      p.z += sin(p.y*.22+uTime*.45)*.65 + sin(p.y*.5-uTime*.3)*.16;
      p.x += sin(p.y*.12+uTime*.18)*.45;
      vec4 mv=modelViewMatrix*vec4(p,1.); vDepth=-mv.z;
      gl_Position=projectionMatrix*mv;
    }`;
  const ribbons: THREE.Mesh[] = [];
  for (let i = 0; i < 2; i++) {
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      fragmentShader: `
        uniform float uTime; uniform float uProgress; uniform vec3 uAmber; uniform vec3 uTeal;
        varying vec2 vUv; varying float vDepth;
        void main(){
          float running=fract(vUv.y*17.-uTime*.065);
          float perforation=step(.34,running)*step(running,.68);
          float edge=step(vUv.x,.13)+step(.87,vUv.x);
          if(edge>.5 && perforation>.5) discard;
          float border=step(vUv.x,.035)+step(.965,vUv.x);
          float frameLine=1.-smoothstep(.01,.025,abs(running-.12));
          vec3 tone=mix(uAmber,uTeal,smoothstep(.05,.95,vUv.y+uProgress*.25));
          float density=.10 + edge*.13 + border*.42 + frameLine*.12;
          float fog=exp(-vDepth*.035);
          gl_FragColor=vec4(tone*(.45+border*.6),density*fog);
        }`,
    });
    resources.push(material);
    const ribbon = new THREE.Mesh(ribbonGeometry, material);
    ribbon.rotation.set(-Math.PI / 2, i ? -0.12 : 0.1, i ? -0.5 : 0.42);
    ribbon.position.set(i ? 8 : -7.7, i ? 1.2 : -1.1, -14);
    room.add(ribbon);
    ribbons.push(ribbon);
  }
  const floorGeometry = new THREE.PlaneGeometry(90, 90);
  const floorMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
      uniform float uTime; uniform float uProgress; uniform vec3 uAmber; uniform vec3 uTeal; varying vec2 vUv;
      void main(){
        float ripple=sin(vUv.y*180.-uTime*.8+sin(vUv.x*35.)*.5)*.5+.5;
        float warm=exp(-abs(vUv.x-.56+sin(vUv.y*14.+uTime*.2)*.006)*45.);
        float cool=exp(-abs(vUv.x-.43)*50.);
        float distanceFade=1.-smoothstep(.18,.75,abs(vUv.y-.5)*2.);
        vec3 light=(uAmber*warm+uTeal*cool)*(.14+ripple*.10)*distanceFade;
        gl_FragColor=vec4(light,.75);
      }`,
  });
  resources.push(floorGeometry, floorMaterial);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -5, -20);
  scene.add(floor);

  let ratio = Math.min(devicePixelRatio || 1, 1.25);
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    // Fixed fill-rate ceiling, independent of monitor resolution.
    const scale = Math.min(
      1,
      1440 / Math.max(width, 1),
      1000 / Math.max(height, 1),
    );
    renderer.setPixelRatio(ratio * scale);
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  let smoothed = 0;
  const render = (
    time: number,
    progress: number,
    pointer: { x: number; y: number },
  ) => {
    smoothed += (progress - smoothed) * 0.1;
    uniforms.uTime.value = time;
    uniforms.uProgress.value = smoothed;
    camera.position.set(
      Math.sin(time * 0.09) * 0.25 + pointer.x * 0.4 + smoothed * 2.1,
      0.5 + pointer.y * 0.25 - smoothed * 0.7,
      12 - smoothed * 8,
    );
    camera.lookAt(-smoothed * 1.5, 0.2, -20);
    room.rotation.z = Math.sin(time * 0.08) * 0.012 + smoothed * 0.035;
    frames.forEach((frame, i) => {
      frame.rotation.z = Math.sin(time * 0.18 + i * 0.24) * 0.025;
    });
    ribbons.forEach((ribbon, i) => {
      ribbon.position.y =
        (i ? 1.2 : -1.1) + Math.sin(time * 0.24 + i * 2) * 0.3;
    });
    warm.intensity = 70 + Math.sin(time * 0.4) * 12 + smoothed * 30;
    cool.position.x = -6 + Math.sin(time * 0.16) * 2;
    renderer.render(scene, camera);
  };
  resize();
  return {
    render,
    resize,
    downgrade() {
      ratio = 0.7;
      resize();
    },
    dispose() {
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
