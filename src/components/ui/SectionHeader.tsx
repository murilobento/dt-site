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
        <Eyebrow className={dark ? "text-text-on-inverse-secondary" : "text-text-secondary"}>
          {eyebrow}
        </Eyebrow>
      )}
      <h2
        className={`mt-2 text-2xl md:text-3xl ${dark ? "text-text-on-inverse" : "text-text-primary"}`}
      >
        {title}
      </h2>
      {lead && (
        <p className={`mt-4 text-lg ${dark ? "text-text-on-inverse-secondary" : "text-text-secondary"}`}>
          {lead}
        </p>
      )}
    </header>
  );
}
