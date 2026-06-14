export default function SectionHeading({ eyebrow, title, text, light = false }) {
  return (
    <div className="max-w-2xl">
      <p className={`eyebrow ${light ? 'text-sun' : 'text-lake dark:text-teal-300'}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-extrabold leading-tight sm:text-4xl ${light ? 'text-white' : 'text-ink dark:text-white'}`}>{title}</h2>
      {text && <p className={`mt-4 text-base leading-7 ${light ? 'text-white/65' : 'text-slate-600 dark:text-slate-300'}`}>{text}</p>}
    </div>
  )
}
