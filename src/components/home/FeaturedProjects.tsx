import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { HOME_COPY } from "@/lib/copy/home";
import type { Obra } from "@/lib/content/types";

export function FeaturedProjects({ obras }: { obras: Obra[] }) {
  if (obras.length === 0) return null;
  const { titulo, lead, todas } = HOME_COPY.obras;
  return (
    <Reveal className="border-y border-outline-variant bg-surface-container-low py-12 md:py-section">
      <Container className="flex flex-col gap-8 md:gap-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="font-headline text-headline-lg-mobile text-balance text-on-surface lg:text-headline-lg">{titulo}</h2>
            <p className="font-body text-body-lg text-pretty text-on-surface-variant">{lead}</p>
          </div>
          <Link
            href="/obras"
            className="inline-flex shrink-0 items-center gap-1 self-start whitespace-nowrap font-label text-label-lg text-primary underline-offset-4 hover:underline md:self-auto"
          >
            {todas}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {obras.slice(0, 3).map((obra) => (
            <li key={obra.slug} className="flex">
              <ProjectCard obra={obra} />
            </li>
          ))}
        </ul>
      </Container>
    </Reveal>
  );
}
