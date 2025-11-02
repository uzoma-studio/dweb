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
          className="z-100 py-4 fixed bottom-0 left-0 w-full h-[85vh] bg-white text-white rounded-t-4xl overflow-y-auto backdrop-blur-lg"
        >
          <div className="relative lg:p-8 p-6 text-black">
            {/* CLOSE BUTTON */}
            <button
              onClick={handleClose}
              className="fixed top-6 right-8 cursor-pointer flex items-center justify-center w-6 h-6 rounded-full bg-red-500 hover:bg-red-700 transition-all"
            >
              <MdClose className="text-white text-xl" />
            </button>

            {/* HEADER WITH NAVIGATION */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm text-gray-400">Student Project</p>
                <h2 className="lg:text-2xl text-xl lg:w-xl w-full IBMbold pt-2 leading-tight lg:pr-0 pr-4">
                  {activeProject.projectName}
                </h2>
              </div>

              <div className="flex items-center gap-2 pt-6">
                  <button
                    onClick={handlePrev}
                    className="cursor-pointer lg:fixed lg:top-18 lg:right-24 flex items-center justify-center lg:w-12 lg:h-12 w-10 h-10 rounded-full border-2 border-black text-black bg-transparent hover:border-transparent hover:bg-[#2ecc71] hover:text-white transition-all duration-300"
                  >
                    <MdArrowBackIos className="ml-[2px]" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="cursor-pointer lg:fixed lg:top-18 lg:right-8 flex items-center justify-center lg:w-12 lg:h-12 w-10 h-10 rounded-full border-2 border-black text-black bg-transparent hover:border-transparent hover:bg-[#2ecc71] hover:text-white transition-all duration-300"
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
                  <p className="text-base leading-relaxed IBMregular mb-6">
                    {activeProject.projectDescription}
                  </p>
                )}
                {videoId && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
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
                  <p className="text-sm text-gray-400 pt-2">Artist</p>
                  {activeProject.artistName && (
                    <h2 className="text-xl IBMmedium mb-4 pt-1">
                      {activeProject.artistName}
                    </h2>
                  )}
                  {activeProject.artistBio && (
                    <p className="text-sm leading-relaxed IBMregular mb-2">
                      {activeProject.artistBio.split(
                        /(https?:\/\/[^\s]+|www\.[^\s]+)/g
                      ).map((part, i) => {
                        const isLink = part.match(
                          /^(https?:\/\/[^\s]+|www\.[^\s]+)/
                        );
                        if (isLink) {
                          const url = part.startsWith("http")
                            ? part
                            : `https://${part}`;
                          return (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="Aunderline IBMmedium break-words hover:text-blue-800 transition-colors duration-150"
                            >
                              {part}
                            </a>
                          );
                        }
                        return part;
                      })}
                    </p>
                  )}

                  {activeProject.website && (
                    <Link
                      className="Aunderline text-sm IBMmedium"
                      href={activeProject.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {activeProject.website}
                    </Link>
                  )}
                  {activeProject.coverImage && (
                    <Image
                      src={`/projectimages/${activeProject.coverImage}`}
                      alt={activeProject.projectName}
                      width={200}
                      height={200}
                      className="rounded-lg w-full mt-6 object-cover"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
