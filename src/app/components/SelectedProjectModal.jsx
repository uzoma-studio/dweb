"use client";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdOutlineCircle, MdCircle } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";

export default function SelectedProjectModal({ project, onClose }) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  if (!project) return null;

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before navigation
    setTimeout(() => {
      router.replace("/projects", { shallow: true });
      if (onClose) onClose();
    }, 400); // Slightly less than animation duration
  };

  const getYouTubeId = (url) => {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const videoId = project.videoLink ? getYouTubeId(project.videoLink) : null;


  return (
    <AnimatePresence mode="wait">
      {!isClosing && (
        <motion.div
          key={project.slug}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 150,
            duration: 0.5,
          }} className="z-100 py-4 fixed bottom-0 left-0 w-full h-[85vh] bg-white text-white rounded-t-4xl overflow-y-auto backdrop-blur-lg">
            <div className="relative lg:p-8 p-6 text-black">
                <button
                onClick={handleClose}
                className="fixed cursor-pointer top-6 right-8 text-black text-xl group transition-all">
                <MdOutlineCircle className="block group-hover:hidden" />
                <MdCircle className="hidden group-hover:block textgreen" />
                </button>
                <p className="text-sm text-gray-400 ">Student Project</p>
                <h2 className="text-2xl lg:w-xl w-full IBMbold pt-2 ">{project.projectName}</h2>
            </div>

            <div className="lg:flex justify-between text-black lg:px-8 px-6">
                <div className="lg:w-1/2">
                    {project.projectDescription && (
                    <p className="text-base leading-relaxed IBMregular mb-6">{project.projectDescription}</p>
                    )}
                   {videoId && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
                        <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                        title={project.projectName}
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
                        {project.artistName && (
                        <h2 className="text-xl IBMmedium mb-4 pt-1">{project.artistName}</h2>
                        )}
                        {project.artistBio && (
                        <p className="text-sm leading-relaxed IBMregular mb-4">{project.artistBio}</p>
                        )}
                        {project.website && (
                        <Link className="Aunderline text-sm IBMmedium" href={project.website} target="_blank" rel="noopener noreferrer">
                            {project.website}
                        </Link>
                        )}
                        {project.coverImage && (
                        <Image
                            src={`/projectimages/${project.coverImage}`}
                            alt={project.projectName}
                            width={200}  
                            height={200} 
                            className="rounded-lg w-full mt-6  object-cover"
                        />
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}