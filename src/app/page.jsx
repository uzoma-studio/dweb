"use client";

import { motion } from "motion/react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from "../app/components/Header";
import GlobeSection from "../app/components/GlobeSection";
import { useTransition } from '../util/TransitionProvider';
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { setIsTransitioning } = useTransition();
  const [isExpanding, setIsExpanding] = useState(false);

      const handleExploreClick = async () => {
      setIsExpanding(true);
      setIsTransitioning(true);

        // Shorter delay to sync with the fade-out
        setTimeout(() => {
          router.push('/projects');
        }, 800);
      };


  return (
    <div className="fixed inset-0 flex flex-col text-white overflow-hidden">
      <Header />

      {/* Main Content */}
     <main className="pt-32 lg:pt-10 md:pt-22 flex flex-col md:flex-row justify-between items-center relative md:px-0 overflow-hidden">
      {/* Left Text */}
        <motion.div 
        className="
          md:w-[70%]
          flex flex-col
          z-10
          text-left
          lg:pl-16 px-6 lg:pr-0
         
          scrollbar-thin scrollbar-thumb-white/20
        "
        animate={{ opacity: isExpanding ? 0 : 1 }}
        transition={{ duration: 0.5 }}>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl lg:text-6xl text50 z-10 text-left relative IBMbold 
                      lg:pb-6 pb-4 ">
            DWeb for Creators
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className=" text-sm lg:pr-10 leading-5 IBMregular text-white max-w-4xl z-10 text-left  mb-2">
           Explore research, sketches, and projects developed in DWeb for Creators, Gray Area’s online education program that empowers artists, designers, archivists, gallerists, curators, and others with the knowledge and tools necessary for building and shaping the decentralized web. Program participants engage with technologies like blockchain and mesh networks; examine case studies in curation, publishing, data sovereignty, and community building; and apply decolonial approaches to world building as they envision the future of DWeb technologies.
          </motion.p>
            
             <div className="flex items-center justify-start py-6 gap-8">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200, duration: 1 }}
                  onClick={handleExploreClick}
                  className="lg:px-8 px-4 py-3 text-base lg:text-sm IBMmedium bg-white/5 backdrop-blur-sm border border-white text-white rounded-lg cursor-pointer hover:bg-white/10 transition"
                >
                  View Projects
                </motion.button>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className=" lg:text-sm text-base text-white max-w-4xl z-10 text-left leading-relaxed">
                  <Link  href="/about"  className="Aunderline IBMmedium">Learn More</Link>
                </motion.p>
              </div>
            
       </motion.div>

        {/* Right Globe */}
      <motion.div 
        className="w-full md:w-[50%] flex flex-auto justify-start items-center relative"
        layoutId="globe-container"
   initial={{ opacity: 0, scale: 0.8 }}
      
        animate={{
          x: isExpanding ? "0%" : "0%",
          y: isExpanding ? "-10%" : "0%",
          scale: isExpanding ? 3 : 1,
          opacity: isExpanding ? 0 : 1, // 👈 Fade out when expanding
        }}
        transition={{
          type: "spring",
          stiffness: 60,
          damping: 80,
          opacity: { duration: 0.6 }, // smoother fade
        }}>

        
        <div className="w-full h-full md:min-w-[800px]">
          <GlobeSection key="home-globe"/>
        </div>
      </motion.div>

      </main>

      {/* Footer with text left, button right */}
        <motion.footer 
            className="fixed bottom-0 left-0 w-full flex"
            animate={{ opacity: isExpanding ? 0 : 1 }}
            transition={{ duration: 0.5 }}
          >
          {/* Left side */}
          <div className="w-100 flex items-center justify-start md:px-10 px-6 py-4">
            <h1 className="md:text-xl text-base text-white IBMbold leading-none">
             Student Project Gallery
            </h1>
          </div>

     
       </motion.footer>
    </div>
  );
}
