import * as THREE from 'three';

export class SpaceScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = canvasContainer.clientWidth || window.innerWidth;
    this.height = canvasContainer.clientHeight || window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.shipGroup = null;
    this.materials = [];
    this.thrusterParticles = null;
    this.starField = null;
    this.spaceDust = null;
    this.engineLights = [];
    this.sunLight = null;

    // View states
    this.isWireframe = false;
    this.isBoosted = false;
    this.lightingMode = 'orbit'; // 'orbit' or 'deep'
    this.autoRotate = true;

    // Camera target interpolation
    this.currentCamPos = new THREE.Vector3(0, 2.5, 9);
    this.targetCamPos = new THREE.Vector3(0, 2.5, 9);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    this.targetLookAt = new THREE.Vector3(0, 0, 0);

    // Mouse / Interaction tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.isUserInteracting = false;
    this.interactionStart = { x: 0, y: 0 };
    this.manualRotation = { x: 0, y: 0 };

    this.clock = new THREE.Clock();
    this.animationFrameId = null;

    this.viewPresets = {
      orbit: {
        pos: new THREE.Vector3(0, 2.5, 9),
        lookAt: new THREE.Vector3(0, 0, 0)
      },
      propulsion: {
        pos: new THREE.Vector3(2.8, -0.6, -4.8),
        lookAt: new THREE.Vector3(0, -0.2, -1.8)
      },
      avionics: {
        pos: new THREE.Vector3(1.2, 1.4, 4.2),
        lookAt: new THREE.Vector3(0, 0.4, 2.4)
      },
      wings: {
        pos: new THREE.Vector3(-6.2, 3.8, 1.2),
        lookAt: new THREE.Vector3(0, 0, 0)
      }
    };

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x06080d, 0.015);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
    this.camera.position.copy(this.currentCamPos);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Build components
    this.setupLighting();
    this.buildStars();
    this.buildCosmicDust();
    this.buildEarthHorizon();
    this.buildSpacecraft();
    this.setupThrusters();

    // 5. Event listeners
    this.setupEventListeners();

    // 6. Start Loop
    this.animate();
  }

  setupLighting() {
    // Ambient light for void contrast
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    this.scene.add(ambientLight);

    // Main primary Sun Light (crisp speculars)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    this.sunLight.position.set(12, 15, 10);
    this.scene.add(this.sunLight);

    // Earthshine / Cosmic blue rim fill
    const earthshine = new THREE.DirectionalLight(0x38bdf8, 1.4);
    earthshine.position.set(-10, -8, -5);
    this.scene.add(earthshine);

    // Engine thrust glow point lights (Cyan)
    const engineLight1 = new THREE.PointLight(0x00f0ff, 2.5, 8);
    engineLight1.position.set(0.65, 0, -2.6);
    this.scene.add(engineLight1);
    this.engineLights.push(engineLight1);

    const engineLight2 = new THREE.PointLight(0x00f0ff, 2.5, 8);
    engineLight2.position.set(-0.65, 0, -2.6);
    this.scene.add(engineLight2);
    this.engineLights.push(engineLight2);
  }

  buildStars() {
    const starCount = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorChoices = [
      new THREE.Color(0xffffff), // Pure white
      new THREE.Color(0xa5f3fc), // Cyan tint
      new THREE.Color(0x93c5fd), // Blue tint
      new THREE.Color(0xfef08a)  // Warm yellow
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 80 + Math.random() * 220;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.starField = new THREE.Points(geometry, material);
    this.scene.add(this.starField);
  }

  buildCosmicDust() {
    const dustCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.spaceDust = new THREE.Points(geometry, material);
    this.scene.add(this.spaceDust);
  }

  buildEarthHorizon() {
    // Distant planetary curve representing low Earth orbit horizon
    const planetRadius = 75;
    const geometry = new THREE.SphereGeometry(planetRadius, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.4);
    
    const material = new THREE.MeshStandardMaterial({
      color: 0x071e3d,
      roughness: 0.7,
      metalness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.18
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(0, -planetRadius - 5, -15);
    planet.rotation.x = Math.PI * 0.1;
    this.scene.add(planet);

    // Atmospheric limb glow arc
    const atmoGeometry = new THREE.TorusGeometry(planetRadius + 0.3, 0.6, 16, 120, Math.PI * 0.8);
    const atmoMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const atmoRing = new THREE.Mesh(atmoGeometry, atmoMaterial);
    atmoRing.position.set(0, -planetRadius - 5, -15);
    atmoRing.rotation.x = Math.PI * 0.5 + 0.1;
    atmoRing.rotation.z = Math.PI * 0.1;
    this.scene.add(atmoRing);
  }

  buildSpacecraft() {
    this.shipGroup = new THREE.Group();

    // 1. Materials
    const titaniumMaterial = new THREE.MeshStandardMaterial({
      color: 0x161922,
      metalness: 0.88,
      roughness: 0.22,
      wireframe: false
    });
    this.materials.push(titaniumMaterial);

    const darkHullMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0e14,
      metalness: 0.7,
      roughness: 0.35,
      wireframe: false
    });
    this.materials.push(darkHullMaterial);

    const solarPanelMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a1e3f,
      emissive: 0x003366,
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: false
    });
    this.materials.push(solarPanelMaterial);

    const goldFoilMaterial = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xd97706,
      emissiveIntensity: 0.2
    });
    this.materials.push(goldFoilMaterial);

    const cockpitGlassMaterial = new THREE.MeshStandardMaterial({
      color: 0x030712,
      metalness: 0.95,
      roughness: 0.05,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.08
    });
    this.materials.push(cockpitGlassMaterial);

    const engineInteriorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.8,
      roughness: 0.1
    });
    this.materials.push(engineInteriorMaterial);

    // 2. Main Fuselage (Tapered modular lifting body)
    const fuselageLength = 5.2;
    const fuselageGeom = new THREE.ConeGeometry(0.95, fuselageLength, 8);
    fuselageGeom.rotateX(Math.PI * 0.5);
    fuselageGeom.scale(1.2, 0.65, 1);
    const fuselage = new THREE.Mesh(fuselageGeom, titaniumMaterial);
    fuselage.position.z = 0.2;
    this.shipGroup.add(fuselage);

    // Cockpit Canopy
    const canopyGeom = new THREE.CylinderGeometry(0.35, 0.65, 1.8, 6);
    canopyGeom.rotateX(Math.PI * 0.5);
    canopyGeom.scale(1.0, 0.45, 1);
    const canopy = new THREE.Mesh(canopyGeom, cockpitGlassMaterial);
    canopy.position.set(0, 0.38, 1.6);
    this.shipGroup.add(canopy);

    // Sensory Nosecone Dome
    const noseGeom = new THREE.SphereGeometry(0.35, 16, 12);
    noseGeom.scale(0.8, 0.5, 1.6);
    const nose = new THREE.Mesh(noseGeom, darkHullMaterial);
    nose.position.set(0, 0.05, 2.9);
    this.shipGroup.add(nose);

    // Dorsal Spine & Avionics Ridge
    const spineGeom = new THREE.BoxGeometry(0.3, 0.25, 3.4);
    const spine = new THREE.Mesh(spineGeom, darkHullMaterial);
    spine.position.set(0, 0.35, -0.2);
    this.shipGroup.add(spine);

    // Modular Payload Cargo Bay Door Seams
    const bayGeom = new THREE.BoxGeometry(1.1, 0.05, 1.8);
    const bay = new THREE.Mesh(bayGeom, goldFoilMaterial);
    bay.position.set(0, 0.28, 0.2);
    this.shipGroup.add(bay);

    // 3. Dual Swept-back Wings
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(3.2, -1.6);
    wingShape.lineTo(3.0, -2.4);
    wingShape.lineTo(0, -1.8);
    wingShape.closePath();

    const extrudeSettings = { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const wingGeom = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeom.rotateX(Math.PI * 0.5);

    // Starboard Wing
    const rightWing = new THREE.Mesh(wingGeom, titaniumMaterial);
    rightWing.position.set(0.6, 0.05, 0.4);
    this.shipGroup.add(rightWing);

    // Port Wing
    const leftWingGeom = wingGeom.clone();
    leftWingGeom.scale(-1, 1, 1);
    const leftWing = new THREE.Mesh(leftWingGeom, titaniumMaterial);
    leftWing.position.set(-0.6, 0.05, 0.4);
    this.shipGroup.add(leftWing);

    // Solar Array Panels mounted on wings
    const solarGeom = new THREE.BoxGeometry(1.9, 0.03, 0.9);
    
    const rightSolar = new THREE.Mesh(solarGeom, solarPanelMaterial);
    rightSolar.position.set(1.9, 0.12, -0.8);
    rightSolar.rotation.y = -0.2;
    this.shipGroup.add(rightSolar);

    const leftSolar = new THREE.Mesh(solarGeom, solarPanelMaterial);
    leftSolar.position.set(-1.9, 0.12, -0.8);
    leftSolar.rotation.y = 0.2;
    this.shipGroup.add(leftSolar);

    // Wingtip Telemetry Winglets / Stabilizers
    const finGeom = new THREE.BoxGeometry(0.06, 0.8, 0.9);
    
    const rightFin = new THREE.Mesh(finGeom, darkHullMaterial);
    rightFin.position.set(3.5, 0.35, -1.4);
    rightFin.rotation.z = -0.25;
    this.shipGroup.add(rightFin);

    const leftFin = new THREE.Mesh(finGeom, darkHullMaterial);
    leftFin.position.set(-3.5, 0.35, -1.4);
    leftFin.rotation.z = 0.25;
    this.shipGroup.add(leftFin);

    // 4. Orbital Sensor Gyro Ring (Rotating collar around mid-body)
    const ringGeom = new THREE.TorusGeometry(1.4, 0.04, 8, 36);
    this.sensorRing = new THREE.Mesh(ringGeom, goldFoilMaterial);
    this.sensorRing.position.set(0, 0, -0.8);
    this.shipGroup.add(this.sensorRing);

    // 5. Dual Magnetoplasmadynamic Ion Engine Thrusters
    const engineRadius = 0.36;
    const engineGeom = new THREE.CylinderGeometry(engineRadius * 0.8, engineRadius, 1.2, 16);
    engineGeom.rotateX(Math.PI * 0.5);

    // Right Thruster Nozzle
    const rightEngine = new THREE.Mesh(engineGeom, titaniumMaterial);
    rightEngine.position.set(0.65, 0, -2.4);
    this.shipGroup.add(rightEngine);

    const rightCore = new THREE.Mesh(new THREE.CircleGeometry(engineRadius * 0.7, 16), engineInteriorMaterial);
    rightCore.position.set(0.65, 0, -3.01);
    rightCore.rotation.y = Math.PI;
    this.shipGroup.add(rightCore);

    // Left Thruster Nozzle
    const leftEngine = new THREE.Mesh(engineGeom, titaniumMaterial);
    leftEngine.position.set(-0.65, 0, -2.4);
    this.shipGroup.add(leftEngine);

    const leftCore = new THREE.Mesh(new THREE.CircleGeometry(engineRadius * 0.7, 16), engineInteriorMaterial);
    leftCore.position.set(-0.65, 0, -3.01);
    leftCore.rotation.y = Math.PI;
    this.shipGroup.add(leftCore);

    // Center auxiliary booster
    const centerEngineGeom = new THREE.CylinderGeometry(0.2, 0.28, 0.9, 12);
    centerEngineGeom.rotateX(Math.PI * 0.5);
    const centerEngine = new THREE.Mesh(centerEngineGeom, titaniumMaterial);
    centerEngine.position.set(0, 0.22, -2.3);
    this.shipGroup.add(centerEngine);

    this.scene.add(this.shipGroup);
  }

  setupThrusters() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    const nozzlePositions = [
      new THREE.Vector3(0.65, 0, -3.0),
      new THREE.Vector3(-0.65, 0, -3.0)
    ];

    for (let i = 0; i < particleCount; i++) {
      const nozzle = nozzlePositions[i % 2];
      const spread = 0.15;
      
      positions[i * 3] = nozzle.x + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = nozzle.y + (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = nozzle.z - Math.random() * 3.5;

      colors[i * 3] = 0.0;     // R
      colors[i * 3 + 1] = 0.94; // G (Cyan)
      colors[i * 3 + 2] = 1.0;  // B

      velocities.push({
        z: -(0.18 + Math.random() * 0.28),
        spreadX: (Math.random() - 0.5) * 0.015,
        spreadY: (Math.random() - 0.5) * 0.015,
        initialZ: nozzle.z
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.thrusterParticles = new THREE.Points(geometry, material);
    this.thrusterVelocities = velocities;
    this.shipGroup.add(this.thrusterParticles);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse movement parallax
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.targetMouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });

    // Interactive canvas drag control
    this.container.addEventListener('mousedown', (e) => {
      this.isUserInteracting = true;
      this.autoRotate = false;
      this.interactionStart.x = e.clientX;
      this.interactionStart.y = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isUserInteracting = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isUserInteracting) return;
      const deltaX = e.clientX - this.interactionStart.x;
      const deltaY = e.clientY - this.interactionStart.y;
      this.interactionStart.x = e.clientX;
      this.interactionStart.y = e.clientY;

      if (this.shipGroup) {
        this.shipGroup.rotation.y += deltaX * 0.008;
        this.shipGroup.rotation.x += deltaY * 0.008;
      }
    });
  }

  setCameraView(viewKey) {
    const preset = this.viewPresets[viewKey];
    if (preset) {
      this.targetCamPos.copy(preset.pos);
      this.targetLookAt.copy(preset.lookAt);
    }
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    this.materials.forEach((mat) => {
      mat.wireframe = this.isWireframe;
      if (this.isWireframe) {
        mat.emissive = new THREE.Color(0x00f0ff);
        mat.emissiveIntensity = 0.6;
      } else {
        mat.emissiveIntensity = 0.15;
      }
    });
    return this.isWireframe;
  }

  setEngineBoost(active) {
    this.isBoosted = active;
    const intensity = active ? 6.5 : 2.5;
    this.engineLights.forEach((light) => {
      light.intensity = intensity;
      light.distance = active ? 16 : 8;
    });
  }

  toggleLighting() {
    this.lightingMode = this.lightingMode === 'orbit' ? 'deep' : 'orbit';
    if (this.lightingMode === 'deep') {
      this.sunLight.intensity = 0.8;
      this.sunLight.color.setHex(0x93c5fd);
    } else {
      this.sunLight.intensity = 3.0;
      this.sunLight.color.setHex(0xffffff);
    }
    return this.lightingMode;
  }

  onResize() {
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth mouse lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // 2. Spacecraft Idle Micro-Oscillation & Auto-Rotation
    if (this.shipGroup) {
      if (this.autoRotate && !this.isUserInteracting) {
        this.shipGroup.rotation.y = Math.sin(elapsedTime * 0.3) * 0.25 + this.mouseX * 0.35;
        this.shipGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.08 - this.mouseY * 0.25;
        this.shipGroup.rotation.z = Math.sin(elapsedTime * 0.25) * 0.05;
        this.shipGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.12;
      }

      // Rotate sensor gyro ring
      if (this.sensorRing) {
        this.sensorRing.rotation.z += 0.015;
      }
    }

    // 3. Camera Smooth Interpolation
    this.currentCamPos.lerp(this.targetCamPos, 0.05);
    this.currentLookAt.lerp(this.targetLookAt, 0.05);

    // Apply camera shake if engine boosted
    if (this.isBoosted) {
      const shakeIntensity = 0.025;
      this.camera.position.set(
        this.currentCamPos.x + (Math.random() - 0.5) * shakeIntensity,
        this.currentCamPos.y + (Math.random() - 0.5) * shakeIntensity,
        this.currentCamPos.z + (Math.random() - 0.5) * shakeIntensity
      );
    } else {
      this.camera.position.copy(this.currentCamPos);
    }
    this.camera.lookAt(this.currentLookAt);

    // 4. Starfield & Cosmic Dust Motion
    if (this.starField) {
      this.starField.rotation.y += 0.0002;
    }
    if (this.spaceDust) {
      const positions = this.spaceDust.geometry.attributes.position.array;
      const speed = this.isBoosted ? 0.35 : 0.08;
      for (let i = 2; i < positions.length; i += 3) {
        positions[i] += speed;
        if (positions[i] > 25) {
          positions[i] = -25;
        }
      }
      this.spaceDust.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Thruster Particle Exhaust Animation
    if (this.thrusterParticles) {
      const positions = this.thrusterParticles.geometry.attributes.position.array;
      const boostMultiplier = this.isBoosted ? 2.8 : 1.0;

      for (let i = 0; i < this.thrusterVelocities.length; i++) {
        const vel = this.thrusterVelocities[i];
        const idx = i * 3;

        positions[idx + 2] += vel.z * boostMultiplier;

        // Reset particle if reached exhaust trail distance
        if (positions[idx + 2] < -8.0) {
          const nozzleX = (i % 2 === 0) ? 0.65 : -0.65;
          positions[idx] = nozzleX + (Math.random() - 0.5) * 0.15;
          positions[idx + 1] = (Math.random() - 0.5) * 0.15;
          positions[idx + 2] = -3.0;
        }
      }
      this.thrusterParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 6. Pulse Engine Lights
    const pulse = 1.0 + Math.sin(elapsedTime * 18) * 0.15;
    const baseIntensity = this.isBoosted ? 6.5 : 2.5;
    this.engineLights.forEach((light) => {
      light.intensity = baseIntensity * pulse;
    });

    // 7. Render
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', () => this.onResize());
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
