"use client";

import React, { useState, useEffect, useRef } from 'react';
import projectsData from '../../data/dweb-project-data.json'; // Adjust path as needed

const ArcScrollProjects = () => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const projects = projectsData;

  useEffect(() => {
    let animationFrame;
    let targetOffset = 0;
    let currentOffset = 0;
    let velocity = 0;
    let isUserScrolling = false;

    const handleWheel = (e) => {
      // Add scroll velocity (scroll faster = stronger impulse)
      velocity += e.deltaY * 0.0002;
      isUserScrolling = true;
    };

    const animate = () => {
      // Apply damping for smooth deceleration
      velocity *= 0.92;

      // Add velocity to target offset
      targetOffset += velocity;

      // Smoothly interpolate current offset toward target offset (lerp)
      currentOffset += (targetOffset - currentOffset) * 0.08;

      // Update state (with modulo for looping)
      setScrollOffset((currentOffset % 1 + 1) % 1);

      // Continue animation
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);


  const getProjectPosition = (index) => {
    // ✅ CHANGE 1: Added isCenter and rotation to return values to track which project is in the middle
    if (!mounted) return { x: 0, y: 0, opacity: 0, scale: 0, normalizedOffset: 0, isCenter: false, rotation: 0 };
    
    const total = projects.length;
    const projectOffset = (scrollOffset + (index / total)) % 1;
    const normalizedOffset = projectOffset < 0 ? projectOffset + 1 : projectOffset;
    
    const arcRadius = 390;
    const arcStartAngle = -Math.PI * 0.4;
    const arcEndAngle = Math.PI * 0.4;
    const angle = arcStartAngle + (arcEndAngle - arcStartAngle) * normalizedOffset;

    // ✅ Move arc even closer to the left (was 0.15)
    const centerX = windowSize.width * 0.08;
    const centerY = windowSize.height / 2;

    const x = centerX + Math.cos(angle) * arcRadius;
    const y = centerY + Math.sin(angle) * arcRadius;

    const distanceFromCenter = Math.abs(normalizedOffset - 0.5);
    const opacity = Math.max(0.2, 1 - (distanceFromCenter * 1.5));
    const scale = Math.max(0.5, 1 - (distanceFromCenter * 0.8));
    
    // ✅ CHANGE 2: Check if this project is centered (threshold of 0.05)
    const isCenter = distanceFromCenter < 0.05;
    
    // ✅ CHANGE 3: Calculate rotation based on position
    // Top of arc (normalizedOffset = 0) -> -30deg
    // Center (normalizedOffset = 0.5) -> 0deg
    // Bottom of arc (normalizedOffset = 1) -> 30deg
    const rotation = isCenter ? 0 : (normalizedOffset - 0.5) * 90;
    
    // ✅ CHANGE 4: Return isCenter flag and rotation
    return { x, y, opacity, scale, normalizedOffset, isCenter, rotation };
  };

  return (
    <div 
      ref={containerRef}
      style={{ minHeight: '300vh' }}
      className="relative w-full"
    >
      {mounted && (
        <div className="sticky top-0 h-screen w-full pointer-events-none">
          {/* ✅ Arc path moved left */}
          <svg className="absolute inset-0 opacity-10 pointer-events-none">
            <defs>
              <radialGradient id="arcGradient">
                <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path
              d={`M ${windowSize.width * 0.05 + Math.cos(-Math.PI * 0.45) * 320} ${windowSize.height / 2 + Math.sin(-Math.PI * 0.45) * 320}
                  A 320 320 0 0 1 ${windowSize.width * 0.05 + Math.cos(Math.PI * 0.45) * 320} ${windowSize.height / 2 + Math.sin(Math.PI * 0.45) * 320}`}
              stroke="url(#arcGradient)"
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {projects.map((project, index) => {
            // ✅ CHANGE 5: Destructure isCenter and rotation from getProjectPosition
            const { x, y, opacity, scale, isCenter, rotation } = getProjectPosition(index);
            
            return (
              <div
                key={index}
                className="absolute pointer-events-auto"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  // ✅ CHANGE 6: Use dynamic rotation value (0deg for center, -30deg to 30deg for top to bottom)
                  transform: `translate(-50%, -50%) scale(${scale}) rotateZ(${rotation}deg)`,
                  opacity: opacity,
                  transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
                }}
              >
                <div 
                  // ✅ CHANGE 7: Conditional class - use project.color when centered, grey when not
                  className={`${isCenter ? project.color  : ' bg-transparent py-20'} w-80 h-20 rounded-xl cursor-pointer transition-all flex items-center justify-start px-4 relative group`}
                >
                  <div>
                    <p className={`${isCenter ? 'text-white IBMbold text-lg' : 'text-gray-300'} text-base transition-colors leading-none`}>
                    {project.projectName}
                    </p>
                   {isCenter && (
                    <p className="text-white text-sm pt-2 textgreen IBMregular leading-none">{project.artistName}</p>
                    
                  )}
                  </div>
                  
                  {/* ✅ CHANGE 8: Text color - white when centered, grey when not */}
               
                  
                  {/* ✅ CHANGE 9: Tooltip only shows when project is centered */}
                  {isCenter && (
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                        <p className="text-white font-medium">{project.artistName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {mounted && (
        <div className="fixed bottom-8 right-8 text-white/50 text-sm pointer-events-none">
          Scroll to navigate
        </div>
      )}
    </div>
  );
};

export default ArcScrollProjects;