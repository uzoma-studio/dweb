"use client";

import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { MdClose, MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";

export default function SelectedProjectModal({ project, onClose, projects = [] }) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const [activeProject, setActiveProject] = useState(project);

  // Update active project whenever slug changes
  useEffect(() => {
    setActiveProject(project);
  }, [project]);

  if (!activeProject) return null;

  const currentIndex = useMemo(
    () => projects.findIndex((p) => p.slug === activeProject.slug),
    [projects, activeProject.slug]
  );

  // Close modal
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      router.replace("/projects", { shallow: true });
      if (onClose) onClose();
    }, 400);
  };

  // Loop navigation
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    const prev = projects[prevIndex];
    router.push(`/projects?slug=${prev.slug}`, { shallow: true });
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % projects.length;
    const next = projects[nextIndex];
    router.push(`/projects?slug=${next.slug}`, { shallow: true });
  };

  // YouTube ID extractor
  const getYouTubeId = (url) => {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = activeProject.videoLink ? getYouTubeId(activeProject.videoLink) : null;

  // Irrelevant comment to allow deploy pass

  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          key="modal"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 150,
            duration: 0.5,
          }}
          className="z-100 py-4 fixed bottom-0 left-0 w-full h-[82vh] bg-white text-white rounded-t-4xl overflow-y-auto backdrop-blur-lg"
        >
          <div className="relative lg:p-8 p-6 lg:pt-8 pt-2 text-black">
              <div className="lg:hidden  flex items-center gap-2 ">
                  <button
                    onClick={handlePrev}
                    className="cursor-pointer lg:fixed lg:top-18 lg:right-24 flex items-center justify-center w-12 h-12 rounded-full border-2 border-black text-black bg-transparent hover:border-transparent hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <MdArrowBackIos className="ml-[2px]" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="cursor-pointer lg:fixed lg:top-18 lg:right-8 flex items-center justify-center w-12 h-12 rounded-full border-2 border-black text-black bg-transparent hover:border-transparent hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <MdArrowForwardIos className="mr-[2px]" />
                  </button>
                </div>
            {/* CLOSE BUTTON */}
            <button
              onClick={handleClose}
              className="fixed top-6 right-8 cursor-pointer flex items-center justify-center w-6 h-6 rounded-full bg-black transition-all"
            >
              <MdClose className="text-white text-xl" />
            </button>

            {/* HEADER WITH NAVIGATION */}
            <div className="flex items-center justify-between lg:pt-2 pt-6">
              <div>
                <p className="text-sm lg:text-gray-400 text-gray-500">Student Project</p>
                <h2 className="lg:text-2xl text-xl lg:w-xl w-full IBMbold pt-2 leading-tight lg:pr-0 pr-4">
                  {activeProject.projectName}
                </h2>
                  {activeProject.artistName && (
                    <h2 className="lg:hidden text-base leading IBMregular pt-1">
                      {activeProject.artistName}
                    </h2>
                  )}
              </div>

              <div className="lg:flex hidden items-center gap-2 pt-6">
                  <button
                    onClick={handlePrev}
                    className="cursor-pointer lg:fixed lg:top-18 lg:right-24 flex items-center justify-center lg:w-12 lg:h-12 w-10 h-10 rounded-full border-2 border-black text-black bg-transparent hover:border-transparent hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <MdArrowBackIos className="ml-[2px]" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="cursor-pointer lg:fixed lg:top-18 lg:right-8 flex items-center justify-center lg:w-12 lg:h-12 w-10 h-10 rounded-full border-2 border-black text-black bg-transparent hover:border-transparent hover:bg-black hover:text-white transition-all duration-300"
                  >
                    <MdArrowForwardIos className="mr-[2px]" />
                  </button>
                </div>


            </div>
          </div>

          {/* PROJECT CONTENT (ANIMATES BETWEEN PROJECTS) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject.slug}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="lg:flex justify-between text-black lg:px-8 px-6"
            >
              <div className="lg:w-1/2">
                {activeProject.projectDescription && (
                  <p className="text-base leading-relaxed IBMregular mb-2">
                    {activeProject.projectDescription}
                  </p>
                )}
                  {activeProject.website && (
                    <Link
                      href={
                        activeProject.website.startsWith('http')
                          ? activeProject.website
                          : `https://${activeProject.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="Aunderline text-sm IBMbold"
                    >
                      Project site ↗
                    </Link>
                  )}
                  {activeProject.coverImage && (
                    <Image
                      src={`/projectimages/${activeProject.coverImage}`}
                      alt={activeProject.projectName}
                      width={200}
                      height={200}
                      className="rounded-lg w-full mt-6 mb-2  object-cover"
                    />
                  )}
                {videoId && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden my-6">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                      title={activeProject.projectName}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                )}
              </div>

         <div className="lg:w-1/2 lg:pl-20">
                <div className="border border-white rounded-4xl p-6 lg:p-8 bg-offW">
                  <p className="text-sm text-gray-400 pt-2 pb-2">
                    {activeProject.artists && activeProject.artists.length > 1 ? "Artists" : "Artist"}
                  </p>
                  
                  {activeProject.artists && activeProject.artists.map((artist, index) => (
                    <div key={index} className={index > 0 ? "mt-6 pt-6 border-t border-gray-200" : ""}>
                      {artist.name && artist.link && (
                        <a
                          href={artist.link.startsWith('http') ? artist.link : `https://${artist.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl IBMmedium mb-2 py-2  hover:text-blue-800 transition-colors duration-150"
                        >
                          {artist.name}
                        </a>
                      )}

                      {/* fallback if name exists but no link */}
                      {artist.name && !artist.link && (
                        <h2 className="text-xl IBMmedium mb-2 pt-1">
                          {artist.name}
                        </h2>
                      )}

                      {artist.bio && (
                        <p className="text-sm leading-relaxed IBMregular mb-2">
                          {artist.bio}
                        </p>
                      )}
                      {artist.link && (
                        <a
                          href={artist.link.startsWith('http') ? artist.link : `https://${artist.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="Aunderline text-sm IBMmedium hover:text-blue-800 transition-colors duration-150"
                        >
                          Artist site ↗
                        </a>
                      )}
                    </div>
                  ))}

                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
