const techs = [
  'React', 'Next.js', 'NestJS', 'TypeScript', 'PostgreSQL',
  'Node.js', 'Docker', 'Tailwind CSS', 'Prisma', 'Git',
  'REST APIs', 'JWT', 'AWS', 'Vercel', 'GitHub Actions',
  'React', 'Next.js', 'NestJS', 'TypeScript', 'PostgreSQL',
  'Node.js', 'Docker', 'Tailwind CSS', 'Prisma', 'Git',
  'REST APIs', 'JWT', 'AWS', 'Vercel', 'GitHub Actions',
];

export function TecnologiasSection() {
  return (
    <section id="tecnologias" className="py-16 bg-white overflow-hidden border-y border-cream2">
      <div className="text-center mb-10">
        <span className="text-navy/30 text-xs font-semibold uppercase tracking-widest">
          Tecnologías que usamos
        </span>
      </div>
      <div className="relative">
        <div className="flex gap-6 animate-marquee whitespace-nowrap">
          {techs.map((tech, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cream rounded-full border border-cream2 text-navy/60 text-sm font-medium flex-shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange" />
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
