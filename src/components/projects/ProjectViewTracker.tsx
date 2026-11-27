"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

/** Dispara `project_view` uma vez por carregamento da ficha. */
export function ProjectViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    track("project_view", { obra: slug });
  }, [slug]);
  return null;
}
