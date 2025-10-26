"use client";

import { motion } from "motion/react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from "../app/components/Header";
import GlobeSection from "../app/components/GlobeSection";
import { useTransition } from '../util/TransitionProvider';

export default function Home() {
  const router = useRouter();
  const { setIsTransitioning } = useTransition();
  const [isExpanding, setIsExpanding] = useState(false);

  const handleExploreClick = async () => {
    setIsExpanding(true);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/projects');
    }, 1000);
  };


  return (
    <div className="fixed inset-0 flex flex-col text-white overflow-hidden">
      <Header />

      {/* Main Content */}
     <main className="pt-30 lg:pt-0 flex flex-col md:flex-row justify-between items-center relative md:px-0 overflow-hidden">
      {/* Left Text */}
        <motion.div 
          className="md:w-[60%] z-10 text-left lg:pl-16 px-6"
          animate={{ opacity: isExpanding ? 0 : 1 }}
          transition={{ duration: 0.5 }}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl  z-10 text-left relative IBMbold 
                      lg:pb-16 pb-8
                      bg-[url('/wave1.svg')] bg-no-repeat bg-[length:70%] 
                      bg-[position:50%_50%]">
            DWeb for Creators
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="lg:text-sm text-xs IBMregular text-white max-w-4xl z-10 text-left leading-relaxed mb-0"
          >
            Decentralized Web (DWeb) for Creators is an 8-week online course that empowers artists, designers, archivists, gallerists, curators, and others with the knowledge and tools necessary for exploring the decentralized web. Through lecture, discussion, and hands-on practice with emerging technologies, participants in DWeb for Creators will use an intersectional lens to study the theoretical frameworks that shape the decentralized web. Participants will engage with technologies like blockchain and mesh networks; examine case studies in curation, publishing, data sovereignty, and community building; and apply decolonial approaches to world building as they envision the future of DWeb technologies. Culminating in an online salon where students will present their projects and ideas developed during the course, this course provides the necessary background, skills, and support to adopt decentralized technology into every creative practice.
             </motion.p>
       </motion.div>

        {/* Right Globe */}
        <motion.div 
          className="w-full md:w-[50%] flex justify-start items-center relative md:translate-x-[15%]"
          layoutId="globe-container"
          animate={{
            x: isExpanding ? "0%" : "0%",
            y: isExpanding ? "-10%" : "0%",
            scale: isExpanding ? 4.5 : 1,
           
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
        >
          <div className="w-full h-full md:min-w-[800px]">
            <GlobeSection />
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
          <div className="w-1/2 flex items-center justify-start md:px-10 px-6 py-4">
            <h1 className="md:text-xl text-base text-white IBMbold">
              2025 Student Project Gallery
            </h1>
          </div>

          {/* Right side */}
        <div className="w-1/2 flex items-center justify-end lg:px-8 px-6 py-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={handleExploreClick}
              className="lg:px-8 px-4 py-3 md:text-base text-sm IBMmedium bg-white/5 backdrop-blur-sm border border-white text-white rounded-lg cursor-pointer hover:bg-white/10 transition"
            >
              Explore Projects
            </motion.button>
          </div>
       </motion.footer>
    </div>
  );
}
