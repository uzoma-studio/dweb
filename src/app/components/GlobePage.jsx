"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import GlobeSection from './GlobeSection'; 
import SelectedProjectModal from '../components/SelectedProjectModal';
import projectData from "@/data/dweb-project-data.json";

export default function GlobePage() {
  const [selectedProject, setSelectedProject] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("slug");

  // Format projects with slugs
  const formattedProjects = (projectData.projects || projectData).map((p) => ({
    ...p,
    slug: p.projectName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+$/, ""),
  }));

  // Handle hotspot click - receives hotspotData from GlobeSection
  const handleHotspotClick = (hotspotData) => {
    const project = formattedProjects[hotspotData.id];
    if (project) {
      setSelectedProject(project);
      router.push(`?slug=${project.slug}`, { shallow: true });
    }
  };

  // Sync modal state with URL slug
  useEffect(() => {
    if (slugParam) {
      const found = formattedProjects.find((p) => p.slug === slugParam);
      if (found) setSelectedProject(found);
    } else {
      setSelectedProject(null);
    }
  }, [slugParam]);

  return (
    <div className="relative">
      <GlobeSection onHotspotClick={handleHotspotClick} />
      
      {/* Modal */}
      {selectedProject && (
        <SelectedProjectModal
          project={selectedProject}
          onClose={() => router.replace("/projects", { shallow: true })}
        />
      )}
    </div>
  );
}