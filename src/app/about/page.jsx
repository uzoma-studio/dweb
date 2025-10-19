"use client";

import { motion } from "motion/react";
import Header from "../components/Header";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center  text-white">
     <Header />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl space-y-6"
      >
        <h1 className="text-3xl md:text-5xl IBMbold tracking-tight">
          About DWeb for Creators
        </h1>

         <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="lg:text-sm text-xs IBMregular text-white max-w-4xl z-10 text-center leading-relaxed mb-0"
          >
            Decentralized Web (DWeb) for Creators is an 8-week online course that empowers artists, designers, archivists, gallerists, curators, and others with the knowledge and tools necessary for exploring the decentralized web. Through lecture, discussion, and hands-on practice with emerging technologies, participants in DWeb for Creators will use an intersectional lens to study the theoretical frameworks that shape the decentralized web. Participants will engage with technologies like blockchain and mesh networks; examine case studies in curation, publishing, data sovereignty, and community building; and apply decolonial approaches to world building as they envision the future of DWeb technologies. Culminating in an online salon where students will present their projects and ideas developed during the course, this course provides the necessary background, skills, and support to adopt decentralized technology into every creative practice.
        </motion.p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block mt-8"
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
