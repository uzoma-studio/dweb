"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import projectData from "@/data/dweb-project-data.json";

export default function GlobeSection({ projects, openProject }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let scene, camera, renderer, blobMesh, particles, connections, innerParticles, hotspots;
    let outwardParticles, outwardVelocities = [];
    let mouse = { x: 0, y: 0 }, targetRotation = { x: 0, y: 0 };
    let raycaster, mouseVector;
    let autoRotationY = 0;
    let isHoveringHotspot = false;

    const isDraggingRef = { current: false };
    const lastPointer = { x: 0, y: 0 };
    const dragSensitivity = 0.005;

    const BLOB_RADIUS = 5.5;
    const NETWORK_RADIUS = BLOB_RADIUS + 0.8;
    const INNER_PARTICLE_MAX = 1.5 * (BLOB_RADIUS / 3);

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

      createBlob();
      createNetworkNodes();
      createConnections();
      createInnerParticles();
      createOutwardParticles();
      createHotspots();

      containerRef.current.addEventListener('pointerdown', onPointerDown, { passive: false });
      containerRef.current.addEventListener('pointermove', onPointerMove, { passive: false });
      containerRef.current.addEventListener('pointerup', onPointerUp, { passive: false });
      containerRef.current.addEventListener('pointercancel', onPointerUp, { passive: false });
      containerRef.current.addEventListener('mouseleave', onPointerLeave, { passive: true });
      containerRef.current.addEventListener('click', onMouseClick);
      window.addEventListener('resize', onWindowResize);

      animate();
    }

    function createBlob() {
      // Create organic blob shape - invisible but still used for distortion structure
      const geometry = new THREE.SphereGeometry(BLOB_RADIUS, 64, 64);
      
      const positionAttribute = geometry.attributes.position;
      const originalPositions = new Float32Array(positionAttribute.count * 3);
      for (let i = 0; i < positionAttribute.count; i++) {
        originalPositions[i * 3] = positionAttribute.getX(i);
        originalPositions[i * 3 + 1] = positionAttribute.getY(i);
        originalPositions[i * 3 + 2] = positionAttribute.getZ(i);
      }
      geometry.userData.originalPositions = originalPositions;
      
      // Make it invisible
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x000000, 
        wireframe: false, 
        transparent: true, 
        opacity: 0,
        visible: false
      });
      
      blobMesh = new THREE.Mesh(geometry, material);
      scene.add(blobMesh);
    }
// Replace these two functions in your GlobeSection component:

function createNetworkNodes() {
  // Create nodes distributed throughout the volume, not just on surface
  const particleCount = 400;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    // Distribute nodes in 3D space with varying distances from center
    const radius = (Math.random() * 0.7 + 0.3) * NETWORK_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    positions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i*3+2] = radius * Math.cos(phi);
    
    // Randomly assign either blue or red color
    if (Math.random() > 0.5) {
      // Blue nodes (existing blue)
      colors[i*3] = 0.3; 
      colors[i*3+1] = 0.7; 
      colors[i*3+2] = 1;
    } else {
      // Red nodes (0xff6b9d)
   // Red nodes (sharp modern red)
colors[i*3]   = 1.0;   // R: 255
colors[i*3+1] = 0.18;  // G: 46
colors[i*3+2] = 0.25;  // B: 64

    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ 
    size: 0.08, 
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
  const particleColors = particles.geometry.attributes.color.array;
  const particleCount = particlePositions.length / 3;
  const distanceThreshold = 2.5;
  let addedConnections = 0, maxConnections = 1800;
  
  for (let i = 0; i < particleCount; i++) {
    const xi = particlePositions[i*3];
    const yi = particlePositions[i*3+1];
    const zi = particlePositions[i*3+2];
    
    // Get color of particle i
    const ri = particleColors[i*3];
    const gi = particleColors[i*3+1];
    const bi = particleColors[i*3+2];
    
    for (let j = i + 1; j < particleCount; j++) {
      const xj = particlePositions[j*3];
      const yj = particlePositions[j*3+1];
      const zj = particlePositions[j*3+2];
      
      const d = Math.sqrt((xi-xj)**2 + (yi-yj)**2 + (zi-zj)**2);
      if (d < distanceThreshold && Math.random() < 0.5) {
        positions.push(xi, yi, zi, xj, yj, zj);
        
        // Get color of particle j
        const rj = particleColors[j*3];
        const gj = particleColors[j*3+1];
        const bj = particleColors[j*3+2];
        
        // Use colors from the connected particles
        colors.push(ri, gi, bi, rj, gj, bj);
        
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
    opacity: 0.7, 
    blending: THREE.AdditiveBlending, 
    depthWrite: false 
  });
  connections = new THREE.LineSegments(geometry, material);
  scene.add(connections);
}

    function createInnerParticles() {
      const particleCount = 600;
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
        size: 0.06, 
        vertexColors: true, 
        transparent: true, 
        opacity: 0.3 
      });
      innerParticles = new THREE.Points(geometry, material);
      scene.add(innerParticles);
    }

    function createOutwardParticles() {
      const particleCount = 900;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const minR = INNER_PARTICLE_MAX * 0.5;
        const maxR = INNER_PARTICLE_MAX * 0.9;
        const radius = minR + Math.random() * (maxR - minR);
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i*3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i*3+1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i*3+2] = radius * Math.cos(phi);
        
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
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      outwardParticles = new THREE.Points(geometry, material);
      scene.add(outwardParticles);
    }

    function createHotspots() {
      // Use projects prop first, fallback to projectData
      const projectsList = projects || projectData.projects || projectData;
      
      // Safety check - ensure we have valid data
      if (!projectsList || !Array.isArray(projectsList) || projectsList.length === 0) {
        console.warn('No project data available for hotspots');
        // Create empty hotspot object so code doesn't break
        hotspots = new THREE.Points(
          new THREE.BufferGeometry(),
          new THREE.PointsMaterial()
        );
        hotspots.userData = [];
        scene.add(hotspots);
        return;
      }

      const hotspotGeometry = new THREE.BufferGeometry();
      const hotspotPositions = [];
      const hotspotColors = [];
      const hotspotDataList = [];
      const greenColor = new THREE.Color("#BBFF00");

      function randomPointInVolume(radius) {
        // Distribute hotspots throughout the network volume
        const r = (Math.random() * 0.6 + 0.4) * radius;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
      }

      for (let i = 0; i < projectsList.length; i++) {
        const project = projectsList[i];
        const pos = randomPointInVolume(NETWORK_RADIUS);

        hotspotPositions.push(pos.x, pos.y, pos.z);
        hotspotColors.push(greenColor.r, greenColor.g, greenColor.b);

        hotspotDataList.push({
          id: i,
          position: pos,
          title: project.projectName || "Untitled Project",
          description: project.artistName || "No artist available",
          project,
        });
      }

      hotspotGeometry.setAttribute("position", new THREE.Float32BufferAttribute(hotspotPositions, 3));
      hotspotGeometry.setAttribute("color", new THREE.Float32BufferAttribute(hotspotColors, 3));

      const hotspotMaterial = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
      });

      hotspots = new THREE.Points(hotspotGeometry, hotspotMaterial);
      hotspots.userData = hotspotDataList;
      hotspots.renderOrder = 999;
      scene.add(hotspots);
    }

    function onPointerMove(event) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = event.clientX;
      const clientY = event.clientY;

      if (isDraggingRef.current) {
        const dx = clientX - lastPointer.x;
        const dy = clientY - lastPointer.y;
        targetRotation.y += dx * dragSensitivity;
        targetRotation.x += dy * dragSensitivity;
        lastPointer.x = clientX;
        lastPointer.y = clientY;
        mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        checkHotspotHover();
        return;
      }

      const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;
      targetRotation.y = mouseX * 0.3;
      targetRotation.x = mouseY * 0.9;
      mouseVector.x = mouseX;
      mouseVector.y = mouseY;
      checkHotspotHover();
    }

    function onPointerDown(event) {
      isDraggingRef.current = true;
      lastPointer.x = event.clientX;
      lastPointer.y = event.clientY;
      try {
        containerRef.current.setPointerCapture(event.pointerId);
      } catch (err) {}
    }

    function onPointerUp(event) {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      try {
        containerRef.current.releasePointerCapture(event.pointerId);
      } catch (err) {}
    }

    function onPointerLeave() {
      isDraggingRef.current = false;
      targetRotation.x = 0;
      targetRotation.y = 0;
      isHoveringHotspot = false;
      hideTooltip();
    }

    function onWindowResize() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function onMouseClick(event) {
      if (!hotspots || !hotspots.userData || hotspots.userData.length === 0) {
        return; // No hotspots to click
      }
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(hotspots);
      
      if (intersects.length > 0) {
        const index = intersects[0].index;
        const clickedProject = hotspots.userData[index];
        
        if (clickedProject && clickedProject.project && openProject) {
          openProject(clickedProject.project);
        }
      }
    }

    function checkHotspotHover() {
      if (!hotspots || !hotspots.userData || hotspots.userData.length === 0) {
        return; // No hotspots to check
      }
      
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObject(hotspots);
      isHoveringHotspot = intersects.length > 0;
      
      if (containerRef.current) {
        containerRef.current.style.cursor = isHoveringHotspot ? 'pointer' : 'default';
      }

      if (isHoveringHotspot && intersects.length > 0) {
        const index = intersects[0].index;
        const hoveredProject = hotspots.userData[index];
        if (hoveredProject) {
          showTooltip(hoveredProject);
        }
      } else {
        hideTooltip();
      }
    }

    function showTooltip(projectInfo) {
      let tooltip = document.getElementById('globe-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'globe-tooltip';
        tooltip.style.cssText = `
          position: fixed;
          background: rgba(0, 0, 0, 0.9);
          color: #fff;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          pointer-events: none;
          z-index: 1000;
          border: 1px solid rgba(187, 255, 0, 0.3);
          box-shadow: 0 4px 12px rgba(187, 255, 0, 0.2);
          opacity: 0;
          transition: opacity 0.2s ease;
          white-space: normal;      
          max-width: 250px;        
          word-break: break-word;   
        `;
        document.body.appendChild(tooltip);
      }

      tooltip.textContent = projectInfo.title;
      tooltip.style.opacity = '1';

      const updateTooltipPosition = (e) => {
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
      };

      if (!tooltip.positionListener) {
        tooltip.positionListener = updateTooltipPosition;
        containerRef.current.addEventListener('pointermove', tooltip.positionListener);
      }
    }

    function hideTooltip() {
      const tooltip = document.getElementById('globe-tooltip');
      if (tooltip) {
        tooltip.style.opacity = '0';
        if (tooltip.positionListener && containerRef.current) {
          containerRef.current.removeEventListener('pointermove', tooltip.positionListener);
          tooltip.positionListener = null;
        }
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      const baseRotationSpeed = 0.003;
      const hoverSlowdownFactor = 0.25;
      const rotationSpeed = isHoveringHotspot ? baseRotationSpeed * hoverSlowdownFactor : baseRotationSpeed;
      
      autoRotationY += rotationSpeed;
      const desiredY = autoRotationY + targetRotation.y;
      
      blobMesh.rotation.y += (desiredY - blobMesh.rotation.y) * 0.1;
      blobMesh.rotation.x += (targetRotation.x - blobMesh.rotation.x) * 0.1;

      // Animate blob distortion
      if (blobMesh && blobMesh.geometry.userData.originalPositions) {
        const posAttr = blobMesh.geometry.attributes.position;
        const origPos = blobMesh.geometry.userData.originalPositions;
        
        for (let i = 0; i < posAttr.count; i++) {
          const ox = origPos[i * 3];
          const oy = origPos[i * 3 + 1];
          const oz = origPos[i * 3 + 2];
          
          const n1 = Math.sin(ox * 2.5 + time * 0.8) * Math.cos(oy * 2.3 + time * 0.6);
          const n2 = Math.sin(oz * 2.8 + time * 0.5) * Math.cos(ox * 2.6 + time * 0.7);
          const n3 = Math.sin(oy * 2.7 + time * 0.4) * Math.cos(oz * 2.4 + time * 0.9);
          const n4 = Math.sin(ox * 1.9 + oy * 2.1 + time * 0.6) * Math.cos(oz * 2.2 + time * 0.8);
          const n5 = Math.sin(ox * 3.1 + oz * 1.8 + time * 0.7) * Math.cos(oy * 2.9 + time * 0.5);
          const n6 = Math.sin(oy * 3.5 + time * 0.9) * Math.cos(ox * 3.2 + oz * 2.8 + time * 0.4);
          
          const dist = (n1 * 5.0 + n2 * 4.5 + n3 * 5.5 + n4 * 4.0 + n5 * 4.8 + n6 * 5.2) * 0.55;
          
          const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
          const nx = ox / len, ny = oy / len, nz = oz / len;
          
          posAttr.setXYZ(i, ox + nx * dist, oy + ny * dist, oz + nz * dist);
        }
        
        posAttr.needsUpdate = true;
        blobMesh.geometry.computeVertexNormals();
      }

      [particles, connections, hotspots].forEach(o => {
        if(o) o.rotation.copy(blobMesh.rotation);
      });

      if (innerParticles) {
        const pos = innerParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
          pos[i] += Math.sin(time + i) * 0.0015;
          pos[i + 1] += Math.cos(time * 1.2 + i) * 0.0015;
          pos[i + 2] += Math.sin(time * 0.8 + i) * 0.0015;
        }
        innerParticles.geometry.attributes.position.needsUpdate = true;
        innerParticles.material.opacity = 0.5 + Math.sin(time * 2) * 0.15;
      }

      if (hotspots) hotspots.material.opacity = 0.85 + Math.sin(time * 3) * 0.15;
      if (particles) particles.material.opacity = 0.75 + Math.sin(time * 1.5) * 0.25;
      if (connections && connections.material) {
        connections.material.opacity = 0.5 + Math.sin(time * 1.2) * 0.2;
      }

      if (outwardParticles) {
        const pos = outwardParticles.geometry.attributes.position.array;
        for (let i = 0; i < pos.length / 3; i++) {
          pos[i * 3] += outwardVelocities[i].x;
          pos[i * 3 + 1] += outwardVelocities[i].y;
          pos[i * 3 + 2] += outwardVelocities[i].z;

          const dist = Math.sqrt(pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2);

          if (dist >= BLOB_RADIUS - 0.5) {
            const minR = INNER_PARTICLE_MAX * 0.5;
            const maxR = INNER_PARTICLE_MAX * 0.9;
            const radius = minR + Math.random() * (maxR - minR);
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            
            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = radius * Math.cos(phi);
            
            outwardVelocities[i] = new THREE.Vector3(
              pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]
            ).normalize().multiplyScalar(0.01 + Math.random() * 0.02);
          }
        }
        outwardParticles.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }

    init();

    return () => {
      const tooltip = document.getElementById('globe-tooltip');
      if (tooltip) {
        if (tooltip.positionListener && containerRef.current) {
          containerRef.current.removeEventListener('pointermove', tooltip.positionListener);
        }
        tooltip.remove();
      }

      if (containerRef.current) {
        containerRef.current.removeEventListener('pointerdown', onPointerDown);
        containerRef.current.removeEventListener('pointermove', onPointerMove);
        containerRef.current.removeEventListener('pointerup', onPointerUp);
        containerRef.current.removeEventListener('pointercancel', onPointerUp);
        containerRef.current.removeEventListener('mouseleave', onPointerLeave);
        containerRef.current.removeEventListener('click', onMouseClick);
      }
      window.removeEventListener('resize', onWindowResize);
      try {
        renderer.dispose();
      } catch (err) {}
    };
  }, []);

  return (
    <div className="container">
      <div id="canvas-container" ref={containerRef}></div>
    </div>
  );
}
