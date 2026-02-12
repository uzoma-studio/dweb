"use client";

import { motion } from "motion/react";
import Header from "../components/Header";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 flex flex-col justify-center items-center px-6 text-center  text-white">
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
                      pb-0">
            DWeb for Creators
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-sm Bodytext IBMregular text-white max-w-4xl z-10 text-left leading-relaxed mb-2">
           <Link  href="https://dweb.grayarea.org/" target="_blank" className="Aunderline IBMmedium">Dweb for Creators</Link> is an 8-week online course that empowers artists, designers, archivists, gallerists, curators, and others with the knowledge and tools necessary for exploring the decentralized web. Participants engage with technologies like blockchain and mesh networks; examine case studies in curation, publishing, data sovereignty, and community building; and apply decolonial approaches to world building as they envision the future of DWeb technologies. The 2025 edition of the course culminated in a public salon where students presented their research, sketches, and projects developed during the course.
          </motion.p>
          <motion.p
           initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-sm Bodytext IBMregular text-white max-w-4xl z-10 text-left leading-relaxed mb-2"> 
            The course’s <a className="Aunderline" target="_blank" href="https://github.com/GrayAreaorg/dweb-curriculum-2025">open-source curriculum</a> was created by Gray Area and a team of experienced instructors and advisors working at multiple intersections of the decentralized web: <a className="Aunderline" target="_blank" href="https://ayanazairecotton.com/">Ayana Zaire Cotton</a>, <a className="Aunderline" target="_blank" href="https://kelaninichole.com/">  Kelani Nichole</a>, 
             <a className="Aunderline" target="_blank" href="https://maisutton.net/"> mai ishikawa sutton</a>, <a className="Aunderline" target="_blank" href="https://grayarea.org/community-entry/ngoc-trieu/">ngọc triệu</a>, <a className="Aunderline" target="_blank" href="https://grayarea.org/community-entry/regina-harsanyi/">Regina Harsanyi</a>, <a className="Aunderline" target="_blank" href="https://isthisa.com/">Sarah Friend</a>, <a className="Aunderline" target="_blank" href="https://chootka.com/">Sarah Grant</a>, and  <a className="Aunderline" target="_blank" href="https://www.habritual.studio/">Roxi Shohadaee.</a> 
          </motion.p>
          <motion.p
           initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-sm Bodytext pt-2 IBMregular text-white max-w-4xl z-10 text-left leading-relaxed mb-0"> 
            DWeb for Creators is made possible by the support of <a className="Aunderline" target="_blank" href="https://ffdweb.org/">Filecoin Foundation for the Decentralized Web ↗</a>
          </motion.p>


         <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-sm Bodytext pt-2 IBMregular text-white max-w-4xl z-10 text-left leading-relaxed mb-0">
          
              This website was created by <Link className="Aunderline IBMmedium" href="https://uzoma.studio/" target="_blank">uzoma.studio ↗</Link>
        </motion.p>

         <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="flex gap-8 justify-start items-center z-10 pt-8">
            <div>
               <Image src="/partners/FFDW.png" alt="ffdw" width={160} height={160} className="object-cover" unoptimized/>
               
            </div>
             
             <div>
                <Image src="/partners/TechSoup.png" alt="techsoup" width={160} height={160}   className="object-cover" unoptimized/>
            </div>

          </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block mt-10">
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
