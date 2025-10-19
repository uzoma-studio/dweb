"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from "motion/react";
import projectsData from '../../data/dweb-project-data.json';
import SelectedProjectModal from "./SelectedProjectModal";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const ArcScrollProjects = () => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const [highlightIndex, setHighlightIndex] = useState(0); // real project index (0..n-1)
  const mobileScrollRef = useRef(null); // mobile horizontal scroller
  const rafRef = useRef(null);
  const tickingRef = useRef(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug");
  const targetOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isPausedRef = useRef(false);


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

  // When user clicks a project
  const openProject = (project) => {
    setSelectedProject(project);
    router.push(`/projects?slug=${project.slug}`, { shallow: true });
  };

  // Sync modal state with URL slug
  useEffect(() => {
    if (slugParam) {
      // Open modal if slug exists and no project is selected
      const found = formattedProjects.find((p) => p.slug === slugParam);
      if (found) setSelectedProject(found);
    } else {
      // Close modal if slug is removed from URL
      setSelectedProject(null);
    }
  }, [slugParam, formattedProjects]);


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
  
  const projects = formattedProjects;

  const n = projects.length


useEffect(() => {
    const handleWheel = (e) => {
      if (isPausedRef.current) return; // Pause while modal is open
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

  // 🔹 React to modal open/close (pause/resume scroll)
  useEffect(() => {
    isPausedRef.current = !!selectedProject;
  }, [selectedProject]);



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
  // =========== MOBILE: helpers =============
  // compute index inside the tripled list that corresponds to "center of middle repetition"
  const mobileInitialChildIndex = () => {
    // children length = n * 3; middle is at index floor(n*3/2) = n + floor(n/2)
    return n + Math.floor(n / 2);
  };

  // center the mobile scroller on the chosen child (called after layout)
  const centerMobileOnMiddle = () => {
    const container = mobileScrollRef.current;
    if (!container) return;
    const children = Array.from(container.children);
    if (children.length === 0) return;
    const midIdx = mobileInitialChildIndex();
    const midChild = children[midIdx];
    if (!midChild) return;

    const scrollLeft = midChild.offsetLeft - container.offsetWidth / 2 + midChild.offsetWidth / 2;
    container.scrollLeft = scrollLeft;

    // set highlight to the real project in the middle
    setHighlightIndex(midIdx % n);
  };

  // onScroll handler optimized with RAF; calculates which child is centered
  const handleMobileScroll = (e) => {
    const container = e.target;
    if (!container) return;

    // throttle via requestAnimationFrame
    if (tickingRef.current) return;
    tickingRef.current = true;

    rafRef.current = requestAnimationFrame(() => {
      const scrollLeft = container.scrollLeft;
      const visibleCenter = scrollLeft + container.offsetWidth / 2;
      const children = Array.from(container.children);
      let closestIndex = 0;
      let closestDistance = Infinity;

      children.forEach((child, i) => {
        const boxCenter = child.offsetLeft + child.offsetWidth / 2;
        const d = Math.abs(visibleCenter - boxCenter);
        if (d < closestDistance) {
          closestDistance = d;
          closestIndex = i;
        }
      });

      // map to real project index (0..n-1) since we duplicated list 3x
      const realIndex = ((closestIndex % n) + n) % n;
      setHighlightIndex(realIndex);

      // loop seam fix: if the user scrolls to the cloned edges, jump back to center block
      // but keep visual continuity by mapping equivalent offset.
      const totalWidth = container.scrollWidth;
      // left boundary: near 0, right boundary: near totalWidth - visibleWidth
      const visibleWidth = container.offsetWidth;
      const leftThreshold = Math.floor(n * 0.5) * children[0]?.offsetWidth || 0;
      const rightThreshold = totalWidth - visibleWidth - leftThreshold;

      // If we reach near the left / right extremes, jump to middle repetition preserving center child
      if (scrollLeft < 10 || scrollLeft > totalWidth - visibleWidth - 10) {
        // Calculate equivalent center child in middle block:
        const middleIdx = mobileInitialChildIndex();
        const offsetFromBlockStart = closestIndex % n;
        const targetChild = children[middleIdx + offsetFromBlockStart];
        if (targetChild) {
          const newScroll =
            targetChild.offsetLeft - container.offsetWidth / 2 + targetChild.offsetWidth / 2;
          container.scrollLeft = newScroll;
        }
      }
      tickingRef.current = false;
    });
  };

  // center at initial load on small screens
  useEffect(() => {
    if (windowSize.width < 1024) {
      // wait a frame for layout to settle then center
      requestAnimationFrame(() => {
        // additional small delay to ensure images/fonts/layout measured
        setTimeout(centerMobileOnMiddle, 50);
      });
    }
    // cleanup any pending rAF
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [windowSize.width, n]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full lg:min-h-[300vh]"
    >
      {mounted && windowSize.width >= 1024 ?  (
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
                  // ✅ CHANGE 6: Use dynamic rotation value (0deg for center, -50deg to 50deg for top to bottom)
                  transform: `translate(-50%, -50%) scale(${scale}) rotateZ(${rotation}deg)`,
                  opacity: opacity,
                  transition: 'transform 0.1s ease-out, opacity 0.1s ease-out'
                }}>
                <div 
                 onClick={isCenter ? () => openProject(project) : undefined}
                  className={`${isCenter ? 'bg-transparent'  : ' bg-transparent py-20'} w-80 h-20 rounded-xl cursor-pointer transition-all flex items-center justify-start px-4 relative group`}>
                  <div>
                    <p className={`${isCenter ? 'text-white IBMbold text-lg' : 'text-gray-300'} text-base transition-colors leading-none`}>
                    {project.projectName}
                    </p>
                   {isCenter && (
                    <p className="text-white text-sm pt-2 textgreen IBMregular leading-none">{project.artistName}</p>
                    )}
                  </div>
                  
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
        ) : (
        // ---------- MOBILE: looped horizontal scroller ----------
        <div className="relative w-full overflow-hidden py-10">
          <div
            ref={mobileScrollRef}
            className="flex items-center space-x-6 px-6 snap-x snap-mandatory overflow-x-scroll no-scrollbar"
            onScroll={handleMobileScroll}
          >
            {/* triple the list so we can loop seamlessly */}
            {[...projects, ...projects, ...projects].map((project, idx) => {
              const realIndex = idx % n;
              const isCenter = realIndex === highlightIndex;
              return (
                <motion.div
                  onClick={isCenter ? () => openProject(project) : undefined}
                  key={idx}
                  className={`snap-center shrink-0 w-[260px] h-[140px] rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 border
                    ${isCenter ? " scale-105 border-none bg-white/5 backdrop-blur-sm" : "bg-white/5 border-white/10"}
                  `}
                  whileTap={{ scale: 0.97 }}
                >
                  <p
                    className={`text-base leading-none ${
                      isCenter ? "text-white IBMmedium " : "text-gray-400 IBMregular"
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

        {/* Modal */}
        {selectedProject && (
          <SelectedProjectModal
            project={selectedProject}
            onClose={() => router.replace("/projects", { shallow: true })}
          />
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