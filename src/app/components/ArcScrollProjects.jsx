"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from "framer-motion";
import projectsData from '../../data/dweb-project-data.json';
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

const ArcScrollProjects = ({ openProject, selectedProject }) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const arcContainerRef = useRef(null);
  const [highlightIndex, setHighlightIndex] = useState(0); 
  const mobileScrollRef = useRef(null);
  const rafRef = useRef(null);
  const tickingRef = useRef(false);
  const [isHoveringCenter, setIsHoveringCenter] = useState(false);
  const [isHoveringNonCenter, setIsHoveringNonCenter] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const hoverStartedWhileScrollingRef = useRef(false);

  const targetOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isPausedRef = useRef(false);
  const currentProjectIndexRef = useRef(0);
  const isSnappingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  // Touch handling refs
  const touchStartYRef = useRef(0);
  const lastTouchYRef = useRef(0);

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

  // Snap to nearest project
  const snapToNearestProject = () => {
    const projectStep = 1 / projects.length;
    const currentIndex = Math.round(targetOffsetRef.current / projectStep);
    const targetIndex = currentIndex;
    targetOffsetRef.current = targetIndex * projectStep;
    currentProjectIndexRef.current = targetIndex;
    isSnappingRef.current = true;
  };

  // Improved wheel scroll with snap-to-project
  useEffect(() => {
    let scrollAccumulator = 0;
    let scrollTimeout;

    const handleWheel = (e) => {
      if (isPausedRef.current) return;
      
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTimeRef.current;
      lastScrollTimeRef.current = now;

      // Reset accumulator if too much time has passed
      if (timeSinceLastScroll > 200) {
        scrollAccumulator = 0;
      }

      scrollAccumulator += e.deltaY;
      
      // Threshold for moving to next project (lower = more sensitive)
      const threshold = 40;
      
      if (Math.abs(scrollAccumulator) > threshold) {
        const direction = scrollAccumulator > 0 ? 1 : -1;
        const projectStep = 1 / projects.length;
        
        // Move to next/prev project
        currentProjectIndexRef.current += direction;
        targetOffsetRef.current = currentProjectIndexRef.current * projectStep;
        
        scrollAccumulator = 0;
        isSnappingRef.current = false;
      }
      
      setIsScrolling(true);
      setHasMouseMoved(false); // Reset mouse movement on scroll
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isSnappingRef.current) {
          snapToNearestProject();
        }
        // Delay the isScrolling state change slightly to prevent flicker
        setTimeout(() => setIsScrolling(false), 50);
      }, 150);
    };

    const animate = () => {
      if (!isPausedRef.current) {
        // Smooth interpolation to target
        const diff = targetOffsetRef.current - currentOffsetRef.current;
        const speed = isSnappingRef.current ? 0.15 : 0.12;
        currentOffsetRef.current += diff * speed;

        // Stop snapping when close enough
        if (isSnappingRef.current && Math.abs(diff) < 0.001) {
          currentOffsetRef.current = targetOffsetRef.current;
          isSnappingRef.current = false;
        }

        setScrollOffset((currentOffsetRef.current % 1 + 1) % 1);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [projects.length]);

  // Touch handling for iPad Pro with snap
  useEffect(() => {
    const arcContainer = arcContainerRef.current;
    if (!arcContainer || windowSize.width < 1280) return;

    let touchScrollAccumulator = 0;
    let touchTimeout;

    const handleTouchStart = (e) => {
      if (isPausedRef.current) return;
      touchStartYRef.current = e.touches[0].clientY;
      lastTouchYRef.current = e.touches[0].clientY;
      touchScrollAccumulator = 0;
    };

    const handleTouchMove = (e) => {
      if (isPausedRef.current) return;
      e.preventDefault();
      
      const currentY = e.touches[0].clientY;
      const deltaY = lastTouchYRef.current - currentY;
      
      touchScrollAccumulator += deltaY;
      
      // Threshold for moving to next project
      const threshold = 50;
      
      if (Math.abs(touchScrollAccumulator) > threshold) {
        const direction = touchScrollAccumulator > 0 ? 1 : -1;
        const projectStep = 1 / projects.length;
        
        currentProjectIndexRef.current += direction;
        targetOffsetRef.current = currentProjectIndexRef.current * projectStep;
        
        touchScrollAccumulator = 0;
        isSnappingRef.current = false;
      }
      
      setIsScrolling(true);
      setHasMouseMoved(false); // Reset mouse movement on touch
      clearTimeout(touchTimeout);
      touchTimeout = setTimeout(() => {
        if (!isSnappingRef.current) {
          snapToNearestProject();
        }
        setTimeout(() => setIsScrolling(false), 50);
      }, 150);
      
      lastTouchYRef.current = currentY;
    };

    const handleTouchEnd = () => {
      if (isPausedRef.current) return;
      clearTimeout(touchTimeout);
      touchTimeout = setTimeout(() => {
        snapToNearestProject();
        setTimeout(() => setIsScrolling(false), 50);
      }, 100);
    };

    arcContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
    arcContainer.addEventListener("touchmove", handleTouchMove, { passive: false });
    arcContainer.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      arcContainer.removeEventListener("touchstart", handleTouchStart);
      arcContainer.removeEventListener("touchmove", handleTouchMove);
      arcContainer.removeEventListener("touchend", handleTouchEnd);
      clearTimeout(touchTimeout);
    };
  }, [windowSize.width, projects.length]);

  // Keyboard controls with snap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPausedRef.current) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const direction = e.key === "ArrowDown" ? -1 : 1;
        const projectStep = 1 / projects.length;
        
        currentProjectIndexRef.current += direction;
        targetOffsetRef.current = currentProjectIndexRef.current * projectStep;
        isSnappingRef.current = false;
        
        setIsScrolling(true);
        setHasMouseMoved(false); // Reset mouse movement on keyboard
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 400);
      }

      if (e.key === "PageDown" || e.key === "PageUp") {
        e.preventDefault();
        const direction = e.key === "PageDown" ? -1 : 1;
        const projectStep = 1 / projects.length;
        
        currentProjectIndexRef.current += direction * 3;
        targetOffsetRef.current = currentProjectIndexRef.current * projectStep;
        isSnappingRef.current = false;
        
        setIsScrolling(true);
        setHasMouseMoved(false); // Reset mouse movement on keyboard
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 600);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projects.length]);

  // Scrollbar dragging with snap
  useEffect(() => {
    let scrollAccumulator = 0;
    let scrollbarTimeout;

    const handleScroll = () => {
      if (isPausedRef.current) return;
      
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - (window.lastScrollY || 0);
      window.lastScrollY = currentScrollY;
      
      scrollAccumulator += deltaY;
      
      const threshold = 30;
      
      if (Math.abs(scrollAccumulator) > threshold) {
        const direction = scrollAccumulator > 0 ? 1 : -1;
        const projectStep = 1 / projects.length;
        
        currentProjectIndexRef.current += direction;
        targetOffsetRef.current = currentProjectIndexRef.current * projectStep;
        
        scrollAccumulator = 0;
        isSnappingRef.current = false;
      }
      
      setIsScrolling(true);
      setHasMouseMoved(false); // Reset mouse movement on scrollbar
      clearTimeout(scrollbarTimeout);
      scrollbarTimeout = setTimeout(() => {
        if (!isSnappingRef.current) {
          snapToNearestProject();
        }
        setTimeout(() => setIsScrolling(false), 50);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollbarTimeout);
    };
  }, [projects.length]);

  useEffect(() => {
    isPausedRef.current = !!selectedProject;
  }, [selectedProject]);

  const getProjectPosition = (index) => {
    if (!mounted) return { x: 0, y: 0, opacity: 0, scale: 0, normalizedOffset: 0, isCenter: false, rotation: 0 };
    
    const total = projects.length;
    const projectOffset = (scrollOffset + (index / total)) % 1;
    const normalizedOffset = projectOffset < 0 ? projectOffset + 1 : projectOffset;
    
    const arcRadius = 400;
    const arcStartAngle = -Math.PI * 0.5;
    const arcEndAngle = Math.PI * 0.5;
    const angle = arcStartAngle + (arcEndAngle - arcStartAngle) * normalizedOffset;

    const centerX = windowSize.width * 0.09;
    const centerY = windowSize.height / 2;

    const x = centerX + Math.cos(angle) * arcRadius;
    const y = centerY + Math.sin(angle) * arcRadius;

    const distanceFromCenter = Math.abs(normalizedOffset - 0.5);
    const opacity = Math.max(0.2, 1 - (distanceFromCenter * 1.5));
    const scale = Math.max(0.5, 1 - (distanceFromCenter * 0.8));
    
    const centerThreshold = Math.min(0.05, 0.5 / total);
    const isCenter = distanceFromCenter < centerThreshold;
    const rotation = isCenter ? 0 : (normalizedOffset - 0.5) * 95;
    
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
                }}
                onMouseEnter={() => {
                  if (isCenter) {
                    setIsHoveringCenter(true);
                    setIsHoveringNonCenter(false);
                  } else {
                    // Track if hover started while scrolling
                    hoverStartedWhileScrollingRef.current = isScrolling;
                    setIsHoveringNonCenter(true);
                    setIsHoveringCenter(false);
                  }
                }}
                onMouseLeave={() => {
                  setIsHoveringCenter(false);
                  setIsHoveringNonCenter(false);
                  hoverStartedWhileScrollingRef.current = false;
                }}
              >
                <div 
                  onClick={isCenter ? () => openProject(project) : undefined}
                  className={`${isCenter ? 'bg-transparent cursor-pointer py-4' : 'bg-transparent py-20'} w-75 h-20 rounded-xl transition-all flex items-center cursor-arrow select-none justify-start px-4  relative group`}>
                  <div>
                    <p className={`${isCenter ? 'text-white IBMbold text-lg' : 'text-gray-300 text-sm'}  IBMregular transition-colors leading-none`}>
                      {project.projectName}
                    </p>
                    {isCenter && (
                      <p className="text-white text-sm pt-2 textgreen IBMregular leading-none">{project.artistName}</p>
                    )}
                  </div>
                  
                  {isCenter && (
                    <div className="absolute left-full ml-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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

          {/* Centered scroll instructions - only show when mouse has moved, hovering non-center, not scrolling, and not hovering center */}
           <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 ${
              isHoveringNonCenter && !isScrolling && !hoverStartedWhileScrollingRef.current ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center gap-2 ml-12 border border-white p-4 rounded-lg text-white/50 ml-26">
              <span className="text-sm IBMregular whitespace-nowrap">scroll to navigate <br /> or use arrow keys</span>
              <div className="flex flex-col">
                <FiArrowUp className="text-white/50" />
                <FiArrowDown className="text-white/50" />
              </div>
            </div>
          </div>
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

      {/* Scroll instructions - mobile only */}
      {mounted && (
        <div className="fixed w-36 leading-none bottom-4 text-right right-4 text-white/50 text-xs pointer-events-none lg:hidden">
          <span>scroll to navigate</span>
        </div>
      )}
    </div>
  );
};

export default ArcScrollProjects;