"use client";

import { motion } from "motion/react";
import Header from "../components/Header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-26 pb-16 flex flex-col justify-center items-center px-6 text-center  text-white">
     <Header />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl space-y-6 pt-10" >
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
            DWeb for Creators is led by a team of experienced instructors working at multiple intersections of the decentralized web. They represent the leading-edge of global organizing and studio art practices involving DWeb technologies. 
            <br/>
            <br/>
            Learn more about the course  <Link  href="https://grayarea.org/course/dweb/" target="_blank" className="Aunderline IBMmedium">Dweb for Creators ↗</Link>
           <br/>
              DWeb for Creators is made possible by the support of <Link className="Aunderline IBMmedium" href="https://ffdweb.org/" target="_blank">Filecoin Foundation for the Decentralized Web ↗</Link>
        </motion.p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block mt-10"
        >
          <Link
            href="/projects"
           className="lg:px-8 px-4 py-3 IBMregular bg-white/5 backdrop-blur-sm border border-white text-white font-semibold rounded-lg cursor-pointer hover:bg-white/10 transition"
          >
            Explore Projects
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
