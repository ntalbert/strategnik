/**
 * Brand Gravity Ecosystem - Interactive Background Visualization
 * Self-contained WebGL visualization for strategnik.com homepage
 * With camera dragging and timeline slider controls
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    categories: {
      search: { primary: '#3B82F6', secondary: '#1E40AF', glow: '#60A5FA', appearPhase: 0.25 },
      community: { primary: '#8B5CF6', secondary: '#5B21B6', glow: '#A78BFA', appearPhase: 0.35 },
      developer: { primary: '#10B981', secondary: '#047857', glow: '#34D399', appearPhase: 0.45 },
      marketplace: { primary: '#F59E0B', secondary: '#B45309', glow: '#FBBF24', appearPhase: 0.55 },
      integration: { primary: '#EAB308', secondary: '#A16207', glow: '#FACC15', appearPhase: 0.65 },
      comparison: { primary: '#14B8A6', secondary: '#0F766E', glow: '#2DD4BF', appearPhase: 0.75 }
    }
  };

  const ALL_ICONS = [
    { id: 'google', name: 'Google', icon: 'fa-brands fa-google', category: 'search' },
    { id: 'microsoft', name: 'Bing', icon: 'fa-brands fa-microsoft', category: 'search' },
    { id: 'robot', name: 'AI/LLMs', icon: 'fa-solid fa-robot', category: 'search' },
    { id: 'reddit', name: 'Reddit', icon: 'fa-brands fa-reddit', category: 'community' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin', category: 'community' },
    { id: 'stackoverflow', name: 'Stack Overflow', icon: 'fa-brands fa-stack-overflow', category: 'community' },
    { id: 'discord', name: 'Discord', icon: 'fa-brands fa-discord', category: 'community' },
    { id: 'slack', name: 'Slack', icon: 'fa-brands fa-slack', category: 'community' },
    { id: 'xtwitter', name: 'X/Twitter', icon: 'fa-brands fa-x-twitter', category: 'community' },
    { id: 'github', name: 'GitHub', icon: 'fa-brands fa-github', category: 'developer' },
    { id: 'code', name: 'Dev Portals', icon: 'fa-solid fa-code', category: 'developer' },
    { id: 'server', name: 'MCP/Servers', icon: 'fa-solid fa-server', category: 'developer' },
    { id: 'aws', name: 'AWS', icon: 'fa-brands fa-aws', category: 'marketplace' },
    { id: 'salesforce', name: 'Salesforce', icon: 'fa-brands fa-salesforce', category: 'marketplace' },
    { id: 'hubspot', name: 'HubSpot', icon: 'fa-brands fa-hubspot', category: 'marketplace' },
    { id: 'cloud', name: 'Cloud Marketplaces', icon: 'fa-solid fa-cloud', category: 'marketplace' },
    { id: 'plug', name: 'Native Integrations', icon: 'fa-solid fa-plug', category: 'integration' },
    { id: 'bolt', name: 'Automation', icon: 'fa-solid fa-bolt', category: 'integration' },
    { id: 'wikipedia', name: 'Wikipedia', icon: 'fa-brands fa-wikipedia-w', category: 'comparison' },
    { id: 'chartbar', name: 'Reviews/Analysts', icon: 'fa-solid fa-chart-bar', category: 'comparison' },
  ];

  // ============================================
  // GLOBALS
  // ============================================
  let scene, camera, renderer, canvas, container;
  let icons = [];
  let currentPhase = 0;
  let cameraAngle = { x: 0.4, y: 0 };
  const cameraDistance = 14;
  let labelContainer;
  let gravityWellMesh, gravityWellGeometry;
  const GRID_SIZE = 80;
  const GRID_SEGMENTS = 40;
  let centralOrb, centralGlow;
  let gasParticles, gasGeometry;
  const GAS_PARTICLE_COUNT = 400;
  let gasParticleData = [];

  // Interaction
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  // Auto-loop
  let autoPlay = true;
  let animationDirection = 1;
  const AUTO_PLAY_SPEED = 0.00333; // Cycles month 6-48 in ~5 seconds
  let animationId = null;

  // UI elements
  let phaseLabel, monthDisplay;

  // ============================================
  // UI CREATION
  // ============================================
  function createUI() {
    // Brand label
    const brandLabel = document.createElement('div');
    brandLabel.className = 'brand-gravity-label';
    brandLabel.innerHTML = `
      <span id="brand-gravity-phase-label">BRAND GRAVITY ECOSYSTEM | Rev A</span>
      <span id="brand-gravity-month-display">MONTH: 6</span>
    `;
    document.body.appendChild(brandLabel);

    // Category legend
    const legend = document.createElement('div');
    legend.className = 'brand-gravity-legend';
    legend.innerHTML = `
      <div class="legend-item"><span class="legend-dot search"></span>Search</div>
      <div class="legend-item"><span class="legend-dot community"></span>Community</div>
      <div class="legend-item"><span class="legend-dot developer"></span>Developer</div>
      <div class="legend-item"><span class="legend-dot marketplace"></span>Marketplace</div>
      <div class="legend-item"><span class="legend-dot integration"></span>Integration</div>
      <div class="legend-item"><span class="legend-dot comparison"></span>Comparison</div>
    `;
    document.body.appendChild(legend);

    // Get references
    phaseLabel = document.getElementById('brand-gravity-phase-label');
    monthDisplay = document.getElementById('brand-gravity-month-display');

    // Inject styles
    injectStyles();
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .brand-gravity-label {
        position: fixed;
        bottom: 20px;
        right: 20px;
        text-align: right;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: opacity 0.3s ease;
      }

      #brand-gravity-phase-label {
        display: block;
        color: #60A5FA;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 2px;
      }

      #brand-gravity-month-display {
        display: block;
        color: rgba(255,255,255,0.5);
        font-size: 11px;
        margin-top: 4px;
      }

      .brand-gravity-legend {
        position: fixed;
        top: 280px;
        left: 24px;
        background: rgba(10, 20, 40, 0.8);
        padding: 16px;
        border-radius: 12px;
        border: 1px solid rgba(100, 150, 255, 0.2);
        backdrop-filter: blur(10px);
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transition: opacity 0.3s ease;
      }

      @media (min-width: 768px) {
        .brand-gravity-legend {
          left: 32px;
          top: 300px;
        }
      }

      @media (min-width: 1024px) {
        .brand-gravity-legend {
          left: 48px;
          top: 320px;
        }
      }

      .brand-gravity-legend .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        color: rgba(255,255,255,0.8);
        font-size: 13px;
      }

      .brand-gravity-legend .legend-item:last-child { margin-bottom: 0; }

      .brand-gravity-legend .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .brand-gravity-legend .legend-dot.search { background: #3B82F6; }
      .brand-gravity-legend .legend-dot.community { background: #8B5CF6; }
      .brand-gravity-legend .legend-dot.developer { background: #10B981; }
      .brand-gravity-legend .legend-dot.marketplace { background: #F59E0B; }
      .brand-gravity-legend .legend-dot.integration { background: #EAB308; }
      .brand-gravity-legend .legend-dot.comparison { background: #14B8A6; }

      @media (max-width: 768px) {
        .brand-gravity-legend { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function updatePhaseDisplay() {
    const month = Math.round(6 + currentPhase * 42);
    let revLabel = 'Rev A';
    if (currentPhase >= 0.66) revLabel = 'Rev C';
    else if (currentPhase >= 0.33) revLabel = 'Rev B';

    if (phaseLabel) phaseLabel.textContent = `BRAND GRAVITY ECOSYSTEM | ${revLabel}`;
    if (monthDisplay) monthDisplay.textContent = `MONTH: ${month}`;
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) {
      console.error('Brand Gravity: Container not found:', containerId);
      return;
    }

    // Create canvas
    canvas = document.createElement('canvas');
    canvas.id = 'brand-gravity-canvas';
    container.appendChild(canvas);

    // Create label container for icons
    labelContainer = document.createElement('div');
    labelContainer.id = 'brand-gravity-labels';
    container.appendChild(labelContainer);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    updateCameraPosition();

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create scene elements
    createGravityWell();
    createCentralOrb();
    createIcons();

    // Create UI
    createUI();

    // Setup event listeners
    setupEventListeners();

    // Start animation
    animate();
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function setupEventListeners() {
    // Resize
    window.addEventListener('resize', () => {
      if (container) {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
      }
    });

    // Camera dragging
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraAngle.y += deltaX * 0.005;
      cameraAngle.x = Math.max(-0.3, Math.min(0.8, cameraAngle.x + deltaY * 0.005));

      updateCameraPosition();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Mouse down for dragging
    document.addEventListener('mousedown', (e) => {
      // Don't drag if clicking on controls
      if (e.target.closest('.brand-gravity-legend, .brand-gravity-label')) return;
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    // Mouse up
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Scroll handler to fade legend with the animation
    const legend = document.querySelector('.brand-gravity-legend');
    const brandLabel = document.querySelector('.brand-gravity-label');
    if (legend) {
      window.addEventListener('scroll', () => {
        const parallaxContainer = document.querySelector('.parallax-container');
        if (!parallaxContainer) return;

        const rect = parallaxContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Start fading when bottom of parallax container reaches 60% of viewport
        // Fully hidden when bottom reaches 10% of viewport
        const fadeStart = windowHeight * 0.6;
        const fadeEnd = windowHeight * 0.1;

        if (rect.bottom > fadeStart) {
          legend.style.opacity = '1';
          if (brandLabel) brandLabel.style.opacity = '1';
        } else if (rect.bottom < fadeEnd) {
          legend.style.opacity = '0';
          if (brandLabel) brandLabel.style.opacity = '0';
        } else {
          const progress = (rect.bottom - fadeEnd) / (fadeStart - fadeEnd);
          legend.style.opacity = progress.toString();
          if (brandLabel) brandLabel.style.opacity = progress.toString();
        }
      });
    }

    // Icon clicks
    icons.forEach(icon => {
      icon.element.addEventListener('click', () => {
        icon.element.style.transform = 'translate(-50%, -50%) scale(1.5)';
        setTimeout(() => {
          icon.element.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 300);
      });
    });
  }

  // ============================================
  // GRAVITY WELL
  // ============================================
  function createGravityWell() {
    const gridLines = [];
    const step = GRID_SIZE / GRID_SEGMENTS;
    const half = GRID_SIZE / 2;

    for (let i = 0; i <= GRID_SEGMENTS; i++) {
      const z = -half + i * step;
      for (let j = 0; j < GRID_SEGMENTS; j++) {
        const x1 = -half + j * step;
        const x2 = -half + (j + 1) * step;
        gridLines.push(x1, 0, z, x2, 0, z);
      }
    }
    for (let i = 0; i <= GRID_SEGMENTS; i++) {
      const x = -half + i * step;
      for (let j = 0; j < GRID_SEGMENTS; j++) {
        const z1 = -half + j * step;
        const z2 = -half + (j + 1) * step;
        gridLines.push(x, 0, z1, x, 0, z2);
      }
    }

    gravityWellGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(gridLines);
    gravityWellGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.8
    });

    gravityWellMesh = new THREE.LineSegments(gravityWellGeometry, material);
    scene.add(gravityWellMesh);
    gravityWellGeometry.userData.originalPositions = new Float32Array(positions);
  }

  function updateGravityWell() {
    const positions = gravityWellGeometry.attributes.position;
    const original = gravityWellGeometry.userData.originalPositions;
    const maxDepth = currentPhase * 8;
    const wellRadius = 6 + currentPhase * 6;

    for (let i = 0; i < positions.count; i++) {
      const x = original[i * 3];
      const z = original[i * 3 + 2];
      const distFromCenter = Math.sqrt(x * x + z * z);
      let depression = 0;
      if (distFromCenter < wellRadius) {
        const normalizedDist = distFromCenter / wellRadius;
        depression = maxDepth * Math.pow(1 - normalizedDist, 1.5);
      }
      positions.array[i * 3 + 1] = -depression;
    }
    positions.needsUpdate = true;
    gravityWellMesh.material.opacity = 0.6 + currentPhase * 0.4;
  }

  // ============================================
  // CENTRAL ORB & GAS CLOUD
  // ============================================
  function createCentralOrb() {
    const coreGeometry = new THREE.SphereGeometry(1, 64, 64);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a4a8a,
      transparent: true,
      opacity: 0
    });
    centralOrb = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(centralOrb);

    const glowGeometry = new THREE.SphereGeometry(1.3, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide
    });
    centralGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(centralGlow);

    createGasCloud();
  }

  function createGasCloud() {
    const positions = new Float32Array(GAS_PARTICLE_COUNT * 3);
    const colors = new Float32Array(GAS_PARTICLE_COUNT * 3);

    for (let i = 0; i < GAS_PARTICLE_COUNT; i++) {
      const spreadX = (Math.random() - 0.5) * 8;
      const spreadY = (Math.random() - 0.5) * 4;
      const spreadZ = (Math.random() - 0.5) * 6;
      const clumpFactor = Math.random() < 0.3 ? 0.3 : 1.0;
      const x = spreadX * clumpFactor;
      const y = spreadY * clumpFactor;
      const z = spreadZ * clumpFactor;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      gasParticleData.push({
        spreadX: x, spreadY: y, spreadZ: z,
        targetX: (Math.random() - 0.5) * 0.3,
        targetY: (Math.random() - 0.5) * 0.3,
        targetZ: (Math.random() - 0.5) * 0.3,
        phaseOffset: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.3 + Math.random() * 0.8,
        wobbleAmount: 0.5 + Math.random() * 1.0,
        driftX: (Math.random() - 0.5) * 0.5,
        driftY: (Math.random() - 0.5) * 0.3,
        driftZ: (Math.random() - 0.5) * 0.5
      });

      colors[i * 3] = 0.15 + Math.random() * 0.1;
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.4 + Math.random() * 0.2;
    }

    gasGeometry = new THREE.BufferGeometry();
    gasGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    gasGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const gasMaterial = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });

    gasParticles = new THREE.Points(gasGeometry, gasMaterial);
    scene.add(gasParticles);
  }

  function updateCentralOrb() {
    const time = Date.now() * 0.001;
    const wellDepth = currentPhase * 8;
    const sinkDepth = wellDepth * 0.7;
    const positions = gasGeometry.attributes.position;

    for (let i = 0; i < GAS_PARTICLE_COUNT; i++) {
      const data = gasParticleData[i];
      const coalesceProgress = Math.min(1, currentPhase * 1.5);

      let x = data.spreadX + (data.targetX - data.spreadX) * coalesceProgress;
      let y = data.spreadY + (data.targetY - data.spreadY) * coalesceProgress;
      let z = data.spreadZ + (data.targetZ - data.spreadZ) * coalesceProgress;

      const turbulence = (1 - coalesceProgress * 0.8) * data.wobbleAmount;
      x += Math.sin(time * data.wobbleSpeed + data.phaseOffset) * turbulence;
      y += Math.cos(time * data.wobbleSpeed * 1.3 + data.phaseOffset) * turbulence;
      z += Math.sin(time * data.wobbleSpeed * 0.7 + data.phaseOffset * 2) * turbulence;

      const driftAmount = (1 - coalesceProgress) * 0.5;
      x += Math.sin(time * 0.2 + data.phaseOffset) * data.driftX * driftAmount;
      y += Math.cos(time * 0.15 + data.phaseOffset * 0.7) * data.driftY * driftAmount;
      z += Math.sin(time * 0.25 + data.phaseOffset * 1.3) * data.driftZ * driftAmount;
      y -= sinkDepth;

      positions.array[i * 3] = x;
      positions.array[i * 3 + 1] = y;
      positions.array[i * 3 + 2] = z;
    }
    positions.needsUpdate = true;

    const gasFade = currentPhase < 0.4 ? 1 : Math.max(0, 1 - (currentPhase - 0.4) / 0.3);
    gasParticles.material.opacity = gasFade * 0.4;
    gasParticles.visible = gasFade > 0.01;

    const sphereAppear = currentPhase < 0.35 ? 0 : Math.min(1, (currentPhase - 0.35) / 0.25);
    centralOrb.visible = sphereAppear > 0.01;
    centralGlow.visible = sphereAppear > 0.01;

    const minSize = 0.3;
    const maxSize = 2.0;
    const size = minSize + (maxSize - minSize) * currentPhase;
    centralOrb.scale.set(size, size, size);
    centralGlow.scale.set(size, size, size);

    centralOrb.material.opacity = sphereAppear * 0.9;
    centralGlow.material.opacity = sphereAppear * (0.15 + currentPhase * 0.35);
    centralOrb.position.y = -sinkDepth;
    centralGlow.position.y = centralOrb.position.y;
  }

  // ============================================
  // ICONS
  // ============================================
  function createHTMLIcon(iconData, orbitRadius, angle) {
    const category = CONFIG.categories[iconData.category];

    const label = document.createElement('div');
    label.className = 'brand-gravity-icon';
    label.style.background = `radial-gradient(circle at 30% 30%, ${category.glow}, ${category.primary} 60%, ${category.secondary})`;
    label.style.boxShadow = `0 0 20px ${category.glow}40, 0 0 40px ${category.primary}30, inset 0 0 20px rgba(255,255,255,0.1)`;
    label.style.pointerEvents = 'auto';
    label.style.cursor = 'pointer';

    const icon = document.createElement('i');
    icon.className = iconData.icon;
    label.appendChild(icon);
    label.title = iconData.name;
    labelContainer.appendChild(label);

    const anchor = new THREE.Object3D();
    scene.add(anchor);

    return {
      ...iconData,
      element: label,
      anchor: anchor,
      orbitRadius: orbitRadius,
      orbitRadiusX: orbitRadius * 1.3,
      currentAngle: angle,
      orbitSpeed: 0.15 + Math.random() * 0.1,
      baseY: (Math.random() - 0.5) * 0.5
    };
  }

  function createIcons() {
    const categoryIcons = {};
    ALL_ICONS.forEach(iconData => {
      if (!categoryIcons[iconData.category]) categoryIcons[iconData.category] = [];
      categoryIcons[iconData.category].push(iconData);
    });

    const categoryOrbits = {
      search: 3.5, community: 5, developer: 6.5,
      marketplace: 8, integration: 4.2, comparison: 7.2
    };

    Object.entries(categoryIcons).forEach(([category, categoryIconList]) => {
      const orbitRadius = categoryOrbits[category];
      const angleStep = (Math.PI * 2) / categoryIconList.length;
      categoryIconList.forEach((iconData, index) => {
        const angle = index * angleStep + Math.random() * 0.3;
        icons.push(createHTMLIcon(iconData, orbitRadius, angle));
      });
    });
  }

  function updateIconPositions() {
    const tempVector = new THREE.Vector3();

    icons.forEach(icon => {
      const speedMultiplier = 0.5 + currentPhase * 1.5;
      icon.currentAngle += icon.orbitSpeed * 0.002 * speedMultiplier;

      const x = Math.cos(icon.currentAngle) * icon.orbitRadiusX;
      const z = Math.sin(icon.currentAngle) * icon.orbitRadius;

      const distFromCenter = Math.sqrt(x * x + z * z);
      const wellRadius = 6 + currentPhase * 6;
      const maxDepth = currentPhase * 8;
      let wellY = 0;
      if (distFromCenter < wellRadius && currentPhase > 0.1) {
        const normalizedDist = distFromCenter / wellRadius;
        wellY = -maxDepth * Math.pow(1 - normalizedDist, 1.5) * 0.5;
      }

      const y = icon.baseY + wellY + 0.5;
      icon.anchor.position.set(x, y, z);

      tempVector.setFromMatrixPosition(icon.anchor.matrixWorld);
      tempVector.project(camera);

      const rect = canvas.getBoundingClientRect();
      const widthHalf = rect.width / 2;
      const heightHalf = rect.height / 2;

      const screenX = (tempVector.x * widthHalf) + widthHalf + rect.left;
      const screenY = -(tempVector.y * heightHalf) + heightHalf + rect.top;

      const categoryConfig = CONFIG.categories[icon.category];
      let opacity = 0;
      if (currentPhase >= categoryConfig.appearPhase) {
        opacity = Math.min(1, (currentPhase - categoryConfig.appearPhase) / 0.1);
      }
      if (tempVector.z > 1) opacity = 0;

      const distance = icon.anchor.position.distanceTo(camera.position);
      const scale = Math.max(0.6, Math.min(1.2, 12 / distance));

      icon.element.style.left = `${screenX}px`;
      icon.element.style.top = `${screenY}px`;
      icon.element.style.opacity = opacity;
      icon.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    });
  }

  function updateCameraPosition() {
    camera.position.x = Math.sin(cameraAngle.y) * Math.cos(cameraAngle.x) * cameraDistance;
    camera.position.y = Math.sin(cameraAngle.x) * cameraDistance;
    camera.position.z = Math.cos(cameraAngle.y) * Math.cos(cameraAngle.x) * cameraDistance;
    const wellDepth = currentPhase * 8 * 0.3;
    camera.lookAt(0, -wellDepth, 0);
  }

  // ============================================
  // ANIMATION
  // ============================================
  function animate() {
    animationId = requestAnimationFrame(animate);

    // Auto-loop animation
    if (autoPlay) {
      currentPhase += AUTO_PLAY_SPEED * animationDirection;
      if (currentPhase >= 1) {
        currentPhase = 1;
        animationDirection = -1;
      } else if (currentPhase <= 0) {
        currentPhase = 0;
        animationDirection = 1;
      }
      updatePhaseDisplay();
    }

    updateGravityWell();
    updateCentralOrb();
    updateIconPositions();
    renderer.render(scene, camera);
  }

  // ============================================
  // PUBLIC API
  // ============================================
  window.BrandGravity = {
    init: init,
    setPhase: function(phase) {
      currentPhase = Math.max(0, Math.min(1, phase));
      if (slider) slider.value = currentPhase;
      updatePhaseDisplay();
    },
    getPhase: function() {
      return currentPhase;
    },
    setAutoPlay: function(enabled) {
      autoPlay = enabled;
    },
    destroy: function() {
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (labelContainer) labelContainer.remove();
      if (canvas) canvas.remove();
      document.querySelectorAll('.brand-gravity-label, .brand-gravity-legend').forEach(el => el.remove());
    }
  };

})();
