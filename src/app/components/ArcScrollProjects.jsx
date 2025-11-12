"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from "motion/react";
import projectsData from '../../data/dweb-project-data.json';
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

const ArcScrollProjects = ({ openProject, selectedProject }) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const arcContainerRef = useRef(null); // NEW: ref for arc touch area
  const [highlightIndex, setHighlightIndex] = useState(0); 
  const mobileScrollRef = useRef(null);
  const rafRef = useRef(null);
  const tickingRef = useRef(false);

  const targetOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isPausedRef = useRef(false);

  // Touch handling refs
  const touchStartYRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const touchVelocityRef = useRef(0);

  const formattedProjects = useMemo(
    () =>
      projectsData.map((p) => ({
        ...p,
        slug: p.projectName
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+$/, ""),
      })),
    []
  );

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
  
  const [projects, setProjects] = useState(formattedProjects);

  useEffect(() => {
    const shuffled = [...formattedProjects].sort(() => Math.random() - 0.5);
    setProjects(shuffled);
  }, [formattedProjects]);

  const n = projects.length;

  // Original wheel scroll effect
  useEffect(() => {
    const handleWheel = (e) => {
      if (isPausedRef.current) return;
      velocityRef.current += e.deltaY * 0.0002;
    };

    const animate = () => {
      if (!isPausedRef.current) {
        velocityRef.current *= 0.92;
        targetOffsetRef.current += velocityRef.current;
        currentOffsetRef.current +=
          (targetOffsetRef.current - currentOffsetRef.current) * 0.08;

        setScrollOffset((currentOffsetRef.current % 1 + 1) % 1);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // 🔥 FIXED: Touch handling specifically for arc container on iPad Pro
  useEffect(() => {
    const arcContainer = arcContainerRef.current;
    if (!arcContainer || windowSize.width < 1280) return;

    const handleTouchStart = (e) => {
      if (isPausedRef.current) return;
      touchStartYRef.current = e.touches[0].clientY;
      lastTouchYRef.current = e.touches[0].clientY;
      touchVelocityRef.current = 0;
    };

    const handleTouchMove = (e) => {
      if (isPausedRef.current) return;
      
      // Prevent pull-to-refresh and default scrolling
      e.preventDefault();
      
      const currentY = e.touches[0].clientY;
      const deltaY = lastTouchYRef.current - currentY;
      
      // Apply velocity similar to wheel
      velocityRef.current += deltaY * 0.0008;
      
      lastTouchYRef.current = currentY;
    };

    const handleTouchEnd = (e) => {
      if (isPausedRef.current) return;
      touchVelocityRef.current = 0;
    };

    // Attach to the arc container specifically
    arcContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
    arcContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
    arcContainer.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      arcContainer.removeEventListener("touchstart", handleTouchStart);
      arcContainer.removeEventListener("touchmove", handleTouchMove);
      arcContainer.removeEventListener("touchend", handleTouchEnd);
    };
  }, [windowSize.width]);


// Keyboard controls
useEffect(() => {
  const handleKeyDown = (e) => {
    if (isPausedRef.current) return;

    const projectStep = 1 / projects.length;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const direction = e.key === "ArrowDown" ? -1 : 1;

      // move exactly one item, let your animation loop ease toward targetOffsetRef
      targetOffsetRef.current += direction * projectStep;
    }

    if (e.key === "PageDown" || e.key === "PageUp") {
      e.preventDefault();
      const direction = e.key === "PageDown" ? -1 : 1;

      // jump two projects
      targetOffsetRef.current += direction * projectStep * 2;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [projects.length]);



  // Scrollbar dragging
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();

    const handleScroll = () => {
      if (isPausedRef.current) return;
      
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const deltaY = currentScrollY - lastScrollY;
      const deltaTime = currentTime - lastTime;
      
      if (Math.abs(deltaY) > 0 && deltaTime > 0) {
        const scrollVelocity = deltaY / deltaTime;
        velocityRef.current += scrollVelocity * 0.002;
      }
      
      lastScrollY = currentScrollY;
      lastTime = currentTime;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    isPausedRef.current = !!selectedProject;
  }, [selectedProject]);

  const getProjectPosition = (index) => {
    if (!mounted) return { x: 0, y: 0, opacity: 0, scale: 0, normalizedOffset: 0, isCenter: false, rotation: 0 };
    
    const total = projects.length;
    const projectOffset = (scrollOffset + (index / total)) % 1;
    const normalizedOffset = projectOffset < 0 ? projectOffset + 1 : projectOffset;
    
    const arcRadius = 390;
    const arcStartAngle = -Math.PI * 0.4;
    const arcEndAngle = Math.PI * 0.4;
    const angle = arcStartAngle + (arcEndAngle - arcStartAngle) * normalizedOffset;

    const centerX = windowSize.width * 0.08;
    const centerY = windowSize.height / 2;

    const x = centerX + Math.cos(angle) * arcRadius;
    const y = centerY + Math.sin(angle) * arcRadius;

    const distanceFromCenter = Math.abs(normalizedOffset - 0.5);
    const opacity = Math.max(0.2, 1 - (distanceFromCenter * 1.5));
    const scale = Math.max(0.5, 1 - (distanceFromCenter * 0.8));
    
    const isCenter = distanceFromCenter < 0.05;
    const rotation = isCenter ? 0 : (normalizedOffset - 0.5) * 90;
    
    return { x, y, opacity, scale, normalizedOffset, isCenter, rotation };
  };
  
  // Mobile helpers
  const mobileInitialChildIndex = () => n + Math.floor(n / 2);

  const centerMobileOnMiddle = () => {
    const container = mobileScrollRef.current;
    if (!container) return;
    const children = Array.from(container.children);
    const midIdx = mobileInitialChildIndex();
    const midChild = children[midIdx];
    if (!midChild) return;
    const scrollLeft = midChild.offsetLeft - container.offsetWidth / 2 + midChild.offsetWidth / 2;
    container.scrollLeft = scrollLeft;
    setHighlightIndex(midIdx % n);
  };

  const handleMobileScroll = (e) => {
    const container = e.target;
    if (!container) return;
    if (tickingRef.current) return;
    tickingRef.current = true;

    rafRef.current = requestAnimationFrame(() => {
      const scrollLeft = container.scrollLeft;
      const children = Array.from(container.children);
      const visibleCenter = scrollLeft + container.offsetWidth / 2;

      let closestIndex = 0;
      let minDist = Infinity;
      children.forEach((child, i) => {
        const boxCenter = child.offsetLeft + child.offsetWidth / 2;
        const d = Math.abs(visibleCenter - boxCenter);
        if (d < minDist) {
          minDist = d;
          closestIndex = i;
        }
      });
      const realIndex = ((closestIndex % n) + n) % n;
      setHighlightIndex(realIndex);
      tickingRef.current = false;
    });
  };

  useEffect(() => {
    const container = mobileScrollRef.current;
    if (!container) return;

    let scrollTimeout;

    const handleScrollEnd = () => {
      const totalWidth = container.scrollWidth;
      const singleBlockWidth = totalWidth / 3;

      if (container.scrollLeft < singleBlockWidth * 0.5) {
        container.scrollLeft += singleBlockWidth;
      } else if (container.scrollLeft > singleBlockWidth * 1.5) {
        container.scrollLeft -= singleBlockWidth;
      }
    };

    const onScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScrollEnd, 100);
    };

    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimeout);
    };
  }, [n]);

  useEffect(() => {
    if (windowSize.width < 1280) {
      requestAnimationFrame(() => setTimeout(centerMobileOnMiddle, 80));
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [windowSize.width, n]);

  return (
    <div 
      ref={containerRef}
      className="lg:fixed medium-force-relative relative w-full lg:min-h-[300vh]" >
      {mounted && windowSize.width >= 1280 ? (
        <div 
          ref={arcContainerRef}
          className="sticky top-0 h-screen w-full"
          style={{ touchAction: 'none' }}
        >
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
            const { x, y, opacity, scale, isCenter, rotation } = getProjectPosition(index);
            
            return (
              <div
                key={index}
                className="absolute pointer-events-auto"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) scale(${scale}) rotateZ(${rotation}deg)`,
                  opacity: opacity,
                }}>
                <div 
                  onClick={isCenter ? () => openProject(project) : undefined}
                  className={`${isCenter ? 'bg-transparent cursor-pointer py-4' : 'bg-transparent py-20'} w-75 h-20 rounded-xl transition-all flex items-center cursor-arrow select-none justify-start px-4  relative group`}>
                  <div>
                    <p className={`${isCenter ? 'text-white IBMbold text-lg' : 'text-gray-300'} text-base transition-colors leading-none`}>
                      {project.projectName}
                    </p>
                    {isCenter && (
                      <p className="text-white text-sm pt-2 textgreen IBMregular leading-none">{project.artistName}</p>
                    )}
                  </div>
                  
                  {isCenter && (
               <div className="absolute left-full ml-0  top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/80 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20 w-max max-w-[300px] break-words">
                  <p className="text-white IBMregular leading-snug whitespace-normal break-words text-sm text-left">
                    {project.artistName}
                  </p>
                </div>
              </div>

                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full overflow-hidden lg:py-10 py-4">
          <div
            ref={mobileScrollRef}
            className="flex items-center space-x-6 px-6 snap-x snap-mandatory overflow-x-scroll no-scrollbar"
            onScroll={handleMobileScroll}
          >
            {[...projects, ...projects, ...projects].map((project, idx) => {
              const realIndex = idx % n;
              const isCenter = realIndex === highlightIndex;
              return (
                <motion.div
                  onClick={isCenter ? () => openProject(project) : undefined}
                  key={idx}
                  className={`snap-center px-4 shrink-0 w-[260px] h-[140px] rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 border
                    ${isCenter ? "scale-105 border-none bg-white/5 backdrop-blur-sm" : "bg-white/5 border-white/10"}
                  `}
                  whileTap={{ scale: 0.97 }}
                >
                  <p
                    className={`text-base leading-none ${
                      isCenter ? "text-white IBMmedium" : "text-gray-400 IBMregular"
                    }`}
                  >
                    {project.projectName}
                  </p>

                  {isCenter && (
                    <p className="text-sm leading-none mt-2 text-gray-200 transition-opacity duration-300 IBMregular textgreen">
                      {project.artistName}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {mounted && (
        <>
        <div className="hidden lg:inline fixed w-36 leading-none bottom-6 text-right right-4 text-white/50 lg:text-sm text-xs pointer-events-none">
          <div className="flex items-center gap-1">
            <span>scroll to navigate or use arrow keys</span>
            <div>
              <FiArrowUp className="text-white/50" />
              <FiArrowDown className="text-white/50" />
            </div>
          </div>
        </div>
        <div className="fixed w-36 leading-none bottom-6 text-right right-4 text-white/50 text-xs pointer-events-none  lg:hidden">
          <span>scroll to navigate</span>
        </div>
        </>
      )}
    </div>
  );
};

export default ArcScrollProjects;