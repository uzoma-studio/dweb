"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import GlobeSection from "../../app/components/GlobeSection";
import Header from "../components/Header";
import ArcScrollProjects from "../components/ArcScrollProjects";
import { useRouter, useSearchParams } from "next/navigation";
import projectsData from "../../data/dweb-project-data.json";
import SelectedProjectModal from "../components/SelectedProjectModal";

// 🧩 Inner component (contains useSearchParams)
function ProjectsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug");
  const [selectedProject, setSelectedProject] = useState(null);

  const formattedProjects = useMemo(
    () =>
      projectsData.map((p) => ({
        ...p,
        slug: p.projectName
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+$/, ""),
      })),
    []
  );

  const openProject = (project) => {
    setSelectedProject(project);
    router.push(`/projects?slug=${project.slug}`, { shallow: true });
  };

  useEffect(() => {
    if (slugParam) {
      const found = formattedProjects.find((p) => p.slug === slugParam);
      if (found) setSelectedProject(found);
    } else {
      setSelectedProject(null);
    }
  }, [slugParam, formattedProjects]);

  const closeProject = () => router.replace("/projects", { shallow: true });

  return (
    <div className="fixed inset-0 text-white ">
      <Header />

      {/* Large screen */}
    <div className="hidden lg:flex  medium-hide h-screen relative">
        <motion.div
          className="w-1/2 h-screen fixed left-0 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            opacity: { duration: 0.8 }
          }}
        >
          <GlobeSection openProject={openProject} projects={formattedProjects} />
        </motion.div>

        <motion.div
          className="w-1/2 absolute left30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ArcScrollProjects
            openProject={openProject}
            selectedProject={selectedProject}
          />
        </motion.div>
      </div>

      {/* Mobile layout */}
      <>
        <div className="lg:hidden h-screen medium-fix flex flex-col relative overflow-hidden">
      
          <motion.div
            className="w-full h-full flex justify-center items-center"
            layoutId="globe-container"
          initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              opacity: { duration: 0.8, delay: 0.2 },
            }}
            >
            <GlobeSection openProject={openProject} projects={formattedProjects} />
          </motion.div>


          <div className="fixed bottom-0 w-full bottom-0">
            <motion.div
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}>
              <ArcScrollProjects
                openProject={openProject}
                selectedProject={selectedProject}
              />
            </motion.div>
              <motion.footer
                className="lg:hidden bottom-0 left-0 w-full flex"
                transition={{ duration: 0.5 }}>
                <div className="w-1/2 flex items-center justify-start md:px-10 px-6 py-4">
                  <h1 className="md:text-xl text-base text-white IBMbold leading-none">
                    DWeb for Creators
                  </h1>
                </div>
              </motion.footer>
          </div>

        </div>
        </>

      {selectedProject && (
        <SelectedProjectModal project={selectedProject} onClose={closeProject}   projects={formattedProjects}/>
      )}

      <motion.footer
        className="hidden fixed bottom-0 left-0 w-full lg:flex"
        transition={{ duration: 0.5 }}>
        <div className="w-1/2 flex items-center justify-start md:px-10 px-6 py-4">
          <h1 className="md:text-xl text-base text-white IBMbold leading-none">
            DWeb for Creators
          </h1>
        </div>
      </motion.footer>
    </div>
  );
}

//  Suspense wrapper to fix the build error
export default function Projects() {
  return (
    <Suspense fallback={<div className="text-white">Loading projects...</div>}>
      <ProjectsInner />
    </Suspense>
  );
}
