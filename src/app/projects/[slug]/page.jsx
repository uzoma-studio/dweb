"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SelectedProjectModal from "../../components/SelectedProjectModal";
import projectsData from "@/data/dweb-project-data.json";

export default function ProjectPage({ params }) {
  // ✅ unwrap the params Promise
  const { slug } = use(params);
  const router = useRouter();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const foundProject = projectsData.find(
      (p) =>
        p.projectName
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-") === slug
    );
    setProject(foundProject);
  }, [slug]);

  if (!project) {
    return <div className="p-10 text-white">Project not found.</div>;
  }

  const handleClose = () => {
    router.replace("/projects", { shallow: true });
  };

  return (
    <SelectedProjectModal
      project={project}
      onClose={handleClose}
    />
  );
}
