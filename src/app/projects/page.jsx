"use client";

import { motion } from "motion/react";
import GlobeSection from "../../app/components/GlobeSection";
import Header from "../components/Header";
import ArcScrollProjects from "../components/ArcScrollProjects";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import projectsData from "../../data/dweb-project-data.json";
import SelectedProjectModal from "../components/SelectedProjectModal";

export default function Projects() {
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
    <div className="min-h-screen text-white relative">
      <Header />

      {/* Large screen: side by side */}
      <div className="hidden lg:flex h-screen">
        <motion.div
          className="w-1/2 h-screen fixed left-0 z-50"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <GlobeSection openProject={openProject} projects={formattedProjects}  />
        </motion.div>

          <motion.div
          className="w-1/2 absolute left30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ArcScrollProjects openProject={openProject} selectedProject={selectedProject} />
        </motion.div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden h-screen flex flex-col overflow-hidden">
        <motion.div
          className="w-full h-screen"
          layoutId="globe-container"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <GlobeSection openProject={openProject} projects={formattedProjects}  />
        </motion.div>

        <motion.div
          className="w-full absolute bottom-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ArcScrollProjects openProject={openProject} selectedProject={selectedProject} />
        </motion.div>
      </div>

      {selectedProject && (
        <SelectedProjectModal project={selectedProject} onClose={closeProject} />
      )}

      <motion.footer
        className="fixed bottom-0 left-0 w-full flex"
        transition={{ duration: 0.5 }}
      >
        <div className="w-1/2 flex items-center justify-start lg:px-10 px-6 py-4">
          <h1 className="text-xl font-bold text-white IBMbold leading-none">
            DWeb for Creators 2025
          </h1>
        </div>
      </motion.footer>
    </div>
  );
}
