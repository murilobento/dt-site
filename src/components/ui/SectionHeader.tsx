import { Eyebrow } from "./Eyebrow";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  tone?: "light" | "dark";
};

export function SectionHeader({ eyebrow, title, lead, tone = "light" }: SectionHeaderProps) {
  const dark = tone === "dark";
  return (
    <header className="max-w-3xl">
      {eyebrow && (
        <Eyebrow className={dark ? "text-on-primary-container" : "text-on-surface-variant"}>{eyebrow}</Eyebrow>
      )}
      <h2
        className={`mt-2 font-headline text-headline-lg-mobile text-balance lg:text-headline-lg ${dark ? "text-white" : "text-primary"}`}
      >
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 font-body text-body-lg text-pretty ${dark ? "text-on-primary-container" : "text-on-surface-variant"}`}>
          {lead}
        </p>
      )}
    </header>
  );
}
