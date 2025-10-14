"use client";

import { motion } from "motion/react";
import GlobeSection from "../../app/components/GlobeSection";
import Header from "../components/Header";

export default function Projects() {
  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden">
    <Header />

      <motion.div 
        className="w-[40%] h-screen fixed left-0 top-0 flex items-center justify-center"
        layoutId="globe-container"
        initial={{ x: '100%' }}
        animate={{ x: '0%' }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
      >
        <div className="w-full h-full">
          <GlobeSection />
        </div>
      </motion.div>

      <motion.div 
        className="w-[60%] ml-auto p-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8">Project Gallery</h1>
        {/* Add your projects content here */}
      </motion.div>
    </div>
  );
}