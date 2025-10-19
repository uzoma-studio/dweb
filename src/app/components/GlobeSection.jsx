'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import projectData from "@/data/dweb-project-data.json";

export default function GlobeSection({projects, openProject }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let scene, camera, renderer, globe, particles, connections, innerParticles, hotspots;
    let outwardParticles, outwardVelocities = [];
    let mouse = { x: 0, y: 0 }, targetRotation = { x: 0, y: 0 };
    let hotspotData = [], raycaster, mouseVector;
    let autoRotationY = 0;

    const OLD_PARTICLE_RADIUS = 3.1;
    const NEW_GLOBE_RADIUS = 5.5;
    const PARTICLE_RADIUS = NEW_GLOBE_RADIUS + 0.1;
    const INNER_PARTICLE_MAX = 1.5 * (NEW_GLOBE_RADIUS / 3);

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.set(0, 0, 12);

      raycaster = new THREE.Raycaster();
      mouseVector = new THREE.Vector2();

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h, false);
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      createGlobe();
      createParticles();
      createConnections();
      createInnerParticles();
      createOutwardParticles();
      createHotspots();

      containerRef.current.addEventListener('mousemove', onMouseMove);
      containerRef.current.addEventListener('mouseleave', onMouseLeave);
      //containerRef.current.addEventListener('wheel', onMouseWheel);
      containerRef.current.addEventListener('click', onMouseClick);
      window.addEventListener('resize', onWindowResize);

      animate();
    }

    function createGlobe() {
      const geometry = new THREE.SphereGeometry(NEW_GLOBE_RADIUS, 32, 16);
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xff6b9d, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.3 
      });
      globe = new THREE.Mesh(geometry, material);
      scene.add(globe);

      const glowGeometry = new THREE.SphereGeometry(NEW_GLOBE_RADIUS - 0.2, 32, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x4facfe, 
        transparent: true, 
        opacity: 0.08, 
        side: THREE.BackSide 
      });
      const innerGlow = new THREE.Mesh(glowGeometry, glowMaterial);
      globe.add(innerGlow);
    }

    function createParticles() {
      const particleCount = 300;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        const radius = PARTICLE_RADIUS;
        positions[i*3] = radius * Math.cos(theta) * Math.sin(phi);
        positions[i*3+1] = radius * Math.cos(phi);
        positions[i*3+2] = radius * Math.sin(theta) * Math.sin(phi);
        const colorValue = Math.random();
        if (colorValue > 0.7) { 
          colors[i*3] = 1; 
          colors[i*3+1] = 0.4; 
          colors[i*3+2] = 0.6; 
        } else { 
          colors[i*3] = 0.3; 
          colors[i*3+1] = 0.7; 
          colors[i*3+2] = 1; 
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({ 
        size: 0.06, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.85 
      });
      particles = new THREE.Points(geometry, material);
      scene.add(particles);
    }

    function createConnections() {
      const geometry = new THREE.BufferGeometry();
      const positions = [], colors = [];
      const particlePositions = particles.geometry.attributes.position.array;
      const particleCount = particlePositions.length / 3;
      const scaleFactor = PARTICLE_RADIUS / OLD_PARTICLE_RADIUS;
      const distanceThreshold = 1.25 * scaleFactor;
      let addedConnections = 0, maxConnections = 1400;
      
      for (let i = 0; i < particleCount; i++) {
        const xi = particlePositions[i*3];
        const yi = particlePositions[i*3+1];
        const zi = particlePositions[i*3+2];
        
        for (let j = i + 1; j < particleCount; j++) {
          const xj = particlePositions[j*3];
          const yj = particlePositions[j*3+1];
          const zj = particlePositions[j*3+2];
          
          const d = Math.sqrt((xi-xj)**2 + (yi-yj)**2 + (zi-zj)**2);
          if (d < distanceThreshold && Math.random() < 0.65) {
            positions.push(xi, yi, zi, xj, yj, zj);
            colors.push(0.45, 0.85, 1, 0.25, 0.65, 1);
            if (++addedConnections >= maxConnections) break;
          }
        }
        if (addedConnections >= maxConnections) break;
      }
      
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const material = new THREE.LineBasicMaterial({ 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.85, 
        blending: THREE.AdditiveBlending, 
        depthWrite: false 
      });
      connections = new THREE.LineSegments(geometry, material);
      scene.add(connections);
    }

    function createInnerParticles() {
      const particleCount = 500;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * INNER_PARTICLE_MAX;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i*3+2] = radius * Math.cos(phi);
        
        colors[i*3] = 0.6 + Math.random() * 0.4;
        colors[i*3+1] = 0.7 + Math.random() * 0.3;
        colors[i*3+2] = 1;
      }
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({ 
        size: 0.08, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.2 
      });
      innerParticles = new THREE.Points(geometry, material);
      scene.add(innerParticles);
    }

    function createOutwardParticles() {
      const particleCount = 800;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const minR = INNER_PARTICLE_MAX * 0.5;
        const maxR = INNER_PARTICLE_MAX * 0.9;
        const radius = minR + Math.random() * (maxR - minR);
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;
        
        colors[i*3] = 0.9 + Math.random() * 0.1;
        colors[i*3+1] = 0.7 + Math.random() * 0.2;
        colors[i*3+2] = 1.0;
        
        const coneAngle = 0.25;
        outwardVelocities.push(
          new THREE.Vector3(
            (Math.random() - 0.5) * coneAngle,
            (Math.random() - 0.5) * coneAngle,
            1
          ).normalize().multiplyScalar(0.02 + Math.random() * 0.03)
        );
      }
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      outwardParticles = new THREE.Points(geometry, material);
      scene.add(outwardParticles);
    }

  function createHotspots() {
  const projects = projectData.projects || projectData;

  const hotspotGeometry = new THREE.BufferGeometry();
  const hotspotPositions = [];
  const hotspotColors = [];
  const hotspotData = [];

  const greenColor = new THREE.Color("#BBFF00"); // your green

  // Helper: random point on a sphere
  function randomPointOnSphere(radius) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    // Slightly above globe radius so it doesn't get hidden
    const pos = randomPointOnSphere(NEW_GLOBE_RADIUS + 0.05);

    hotspotPositions.push(pos.x, pos.y, pos.z);
    hotspotColors.push(greenColor.r, greenColor.g, greenColor.b);

    hotspotData.push({
      id: i,
      position: pos,
      title: project.projectName || "Untitled Project",
      description: project.artistName || "No artist available",
      project,
    });
  }

  hotspotGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(hotspotPositions, 3)
  );
  hotspotGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(hotspotColors, 3)
  );

  const hotspotMaterial = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthTest: false, // ensures hotspots are always on top
  });

  hotspots = new THREE.Points(hotspotGeometry, hotspotMaterial);
  hotspots.userData = hotspotData;
  hotspots.renderOrder = 999; // makes sure they render on top of the globe

  scene.add(hotspots);
}


    function onMouseMove(event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotation.y = mouseX * 0.3;
      targetRotation.x = mouseY * 0.9;
      mouseVector.x = mouseX;
      mouseVector.y = mouseY;
      checkHotspotHover();
    }

    function onMouseLeave() {
      targetRotation.x = 0;
      targetRotation.y = 0;
      hideNotification();
    }

    //function onMouseWheel(e) {
    //  camera.position.z = Math.max(7, Math.min(25, camera.position.z + e.deltaY * 0.01));
   // }

    function onWindowResize() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }


    function onMouseClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(hotspots);
      if (intersects.length > 0) {
        const index = intersects[0].index; // index of clicked point
        const clickedProject = hotspots.userData[index]; // 🔥 this now works

        if (clickedProject && openProject) {
          const projectName =
            clickedProject.project?.projectName || clickedProject.projectName;
           if (!projectName) return;
          const formatted = projects.find((p) => p.projectName === projectName);
          if (formatted) openProject(formatted);
        }
      }
    }

    function checkHotspotHover() {
      raycaster.setFromCamera(mouseVector, camera);
      if (containerRef.current) {
        containerRef.current.style.cursor = 
          raycaster.intersectObject(hotspots).length > 0 ? 'pointer' : 'default';
      }
    }

    function showNotification(info) {
      const n = document.getElementById('hotspot-notification');
      if (n) {
        n.innerHTML = `<strong>${info.title}</strong><br>${info.description}`;
        n.classList.add('show');
        setTimeout(hideNotification, 4000);
      }
    }

    function hideNotification() {
      const n = document.getElementById('hotspot-notification');
      if (n) n.classList.remove('show');
    }

    function pulseHotspot() {
      const orig = hotspots.material.size;
      let t = 0;
      const interval = setInterval(() => {
        hotspots.material.size = orig * (1 + 0.6 * Math.abs(Math.sin(t)));
        t += 0.4;
        if (t > 6) {
          clearInterval(interval);
          hotspots.material.size = orig;
        }
      }, 30);
    }

    function animate() {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      const rotationSpeed = 0.003;
      autoRotationY += rotationSpeed;
      const desiredY = autoRotationY + targetRotation.y;
      
      globe.rotation.y += (desiredY - globe.rotation.y) * 0.1;
      globe.rotation.x += (targetRotation.x - globe.rotation.x) * 0.1;

      [particles, connections, hotspots].forEach(o => {
        if(o) o.rotation.copy(globe.rotation);
      });

      if (innerParticles) {
        const pos = innerParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i] += Math.sin(time + i) * 0.0015;
          pos[i + 1] += Math.cos(time * 1.2 + i) * 0.0015;
          pos[i + 2] += Math.sin(time * 0.8 + i) * 0.0015;
        }
        innerParticles.geometry.attributes.position.needsUpdate = true;
        innerParticles.material.opacity = 0.6 + Math.sin(time * 2) * 0.1;
      }

      if (hotspots) hotspots.material.opacity = 0.85 + Math.sin(time * 3) * 0.15;
      if (particles) particles.material.opacity = 0.8 + Math.sin(time * 1.5) * 0.3;
      if (connections && connections.material) {
        connections.material.opacity = 0.45 + Math.sin(time * 1.2) * 0.15;
      }

      if (outwardParticles) {
        const pos = outwardParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length / 3; i++) {
          pos[i * 3] += outwardVelocities[i].x;
          pos[i * 3 + 1] += outwardVelocities[i].y;
          pos[i * 3 + 2] += outwardVelocities[i].z;

          const dist = Math.sqrt(
            pos[i * 3] ** 2 + 
            pos[i * 3 + 1] ** 2 + 
            pos[i * 3 + 2] ** 2
          );

          if (dist >= NEW_GLOBE_RADIUS - 0.5) {
            const minR = INNER_PARTICLE_MAX * 0.5;
            const maxR = INNER_PARTICLE_MAX * 0.9;
            const radius = minR + Math.random() * (maxR - minR);
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = radius * Math.cos(phi);
            
            outwardVelocities[i] = new THREE.Vector3(
              pos[i * 3],
              pos[i * 3 + 1],
              pos[i * 3 + 2]
            ).normalize().multiplyScalar(0.01 + Math.random() * 0.02);
          }
        }
        outwardParticles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    init();

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', onMouseMove);
        containerRef.current.removeEventListener('mouseleave', onMouseLeave);
        //containerRef.current.removeEventListener('wheel', onMouseWheel);
        containerRef.current.removeEventListener('click', onMouseClick);
      }
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
    };
  }, []);


return (
  <div className="container">
    <div id="canvas-container" ref={containerRef}></div>
  </div>
);
}