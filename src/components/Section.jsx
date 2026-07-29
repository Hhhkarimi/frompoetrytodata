export function Section({ id, eyebrow, title, intro, children, className = '' }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="section-heading reveal">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </div>
      {children}
    </section>
  );
}

export function Card({ children, className = '', accent }) {
  return <div className={`card ${className}`} style={accent ? { '--accent': accent } : undefined}>{children}</div>;
}

export function Insight({ title, children, tone = 'teal', icon }) {
  return (
    <div className={`insight insight--${tone}`}>
      {icon && <span className="insight-icon">{icon}</span>}
      <div><strong>{title}</strong><p>{children}</p></div>
    </div>
  );
}
