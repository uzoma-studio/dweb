"use client";

import { motion } from "motion/react";
import GlobeSection from "../../app/components/GlobeSection";
import Header from "../components/Header";
import ArcScrollProjects from "../components/ArcScrollProjects";

export default function Projects() {
  return (
    <div className="min-h-screen text-white relative">
      <Header />
      
      {/* Large screen: side by side layout */}
      <div className="hidden lg:flex h-screen">
        {/* Globe section - 50% width, fixed */}
        <motion.div
          className="w-1/2 h-screen fixed left-0 z-100"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <GlobeSection />
        </motion.div>

        {/* Projects section - 50% width, aligned left close to globe */}
        <motion.div
          className="w-1/2 absolute left30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ArcScrollProjects />
        </motion.div>
      </div>
      

      {/* Small screen: stacked layout */}
      <div className="lg:hidden h-screen flex flex-col overflow-hidden">
        {/* Globe at top */}
        <motion.div
          className="w-full h-screen"
          layoutId="globe-container"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <GlobeSection />
        </motion.div>

        {/* Arc scroll below */}
         <motion.div
          className="w-full absolute bottom-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ArcScrollProjects />
        </motion.div>
     
      </div>

        <motion.footer 
          className="fixed bottom-0 left-0 w-full flex"
          transition={{ duration: 0.5 }}
        >
          {/* Left side */}
          <div className="w-1/2 flex items-center justify-start lg:px-10 px-6 py-4">
            <h1 className="text-xl font-bold text-white IBMbold leading-none">
              DWeb for Creators 2025
            </h1>
          </div>
        </motion.footer>
    </div>
  );
}