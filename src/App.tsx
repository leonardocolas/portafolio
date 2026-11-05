import { lazy, Suspense, useEffect, useState } from 'react';
import { Download, Github, Globe2, MapPin, Menu, Moon, Phone, Sun, X } from 'lucide-react';
import cv from './data/cv.json';
const ArchitectureScene = lazy(() => import('./components/ArchitectureScene'));

type Language = 'es' | 'en';
type Theme = 'light' | 'dark';

// The final URLs point to the durable portfolio-file storage addresses.
const pdfUrls = {
  es: '/manus-storage/Leonardo-Colas-Leyva-CV-ES_c91f6576.pdf',
  en: '/manus-storage/Leonardo-Colas-Leyva-CV-EN_28f99a74.pdf',
};

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('portfolio-language');
      return saved === 'en' ? 'en' : 'es';
    } catch {
      return 'es';
    }
  });
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem('portfolio-theme') === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const content = cv[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${content.name} — ${content.title}`;
    try { localStorage.setItem('portfolio-language', language); } catch { /* storage can be unavailable */ }
  }, [language, content.name, content.title]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111a16' : '#f5f5ef');
    try { localStorage.setItem('portfolio-theme', theme); } catch { /* storage can be unavailable */ }
  }, [theme]);

  const switchLanguage = () => setLanguage((current) => current === 'es' ? 'en' : 'es');
  const switchTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');
  const closeMenu = () => setMenuOpen(false);
  const themeLabel = theme === 'dark' ? content.enableLightMode : content.enableDarkMode;

  return (
    <>
      <a className="skip-link" href="#main">{language === 'es' ? 'Saltar al contenido' : 'Skip to content'}</a>
      <header className="site-header">
        <a href="#inicio" className="wordmark" aria-label="Leonardo Colás Leyva — inicio" onClick={closeMenu}>
          <span className="wordmark-mark" aria-hidden="true"><span>L</span><span>C</span><i /></span>
          <span className="wordmark-name">LEONARDO COLÁS<span>LEYVA</span></span>
        </a>
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? (language === 'es' ? 'Cerrar navegación' : 'Close navigation') : content.mobileMenu} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label={language === 'es' ? 'Navegación principal' : 'Main navigation'}>
          <a href="#sobre-mi" onClick={closeMenu}>{content.nav.about}</a>
          <a href="#experiencia" onClick={closeMenu}>{content.nav.experience}</a>
          <a href="#proyectos" onClick={closeMenu}>{content.nav.projects}</a>
          <a href="#competencias" onClick={closeMenu}>{content.nav.skills}</a>
          <a href="#formacion" onClick={closeMenu}>{content.nav.education}</a>
          <div className="nav-controls">
            <button className="language-toggle" type="button" onClick={switchLanguage} aria-label={content.languageSwitch}>
              <Globe2 size={15} strokeWidth={1.8} /><span>{language === 'es' ? 'EN' : 'ES'}</span>
            </button>
            <button className="theme-toggle" type="button" onClick={switchTheme} aria-label={themeLabel} title={themeLabel} aria-pressed={theme === 'dark'}>
              {theme === 'dark' ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
            </button>
          </div>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="inicio" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" />{content.eyebrow}</div>
            <h1 id="hero-title">{content.name.split(' ')[0]}<br /><span className="hero-surname">{content.name.split(' ').slice(1).join(' ')}</span></h1>
            <p className="hero-role">{content.title}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#contacto">{content.ctaContact}</a>
              <a className="button button-text" href={pdfUrls[language]} download>
                <Download size={16} />{content.ctaDownload}
              </a>
            </div>
            <div className="hero-quick-contact">
              <span className="email-plain">leonardocolasleyva@gmail.com</span>
              <span className="quick-separator" aria-hidden="true" />
              <span className="phone-plain"><Phone size={14} aria-hidden="true" />+53 5 6083226</span>
            </div>
          </div>
          <div className="hero-visual">
            <Suspense fallback={<div className="architecture-stage architecture-pending" aria-hidden="true"><span /></div>}>
              <ArchitectureScene labels={content.architectureLabels} language={language} />
            </Suspense>
          </div>
        </section>

        <section className="split-section profile-section" id="sobre-mi">
          <SectionAside index="01" title={content.profileTitle} />
          <div className="section-content profile-content">
            <p className="profile-lede">{content.profile}</p>
            <div className="profile-bottomline"><span className="small-rule" />{content.location}</div>
          </div>
        </section>

        <section className="split-section experience-section" id="experiencia">
          <SectionAside index="02" title={content.experienceTitle} intro={content.experienceIntro} />
          <div className="section-content experience-list">
            {content.experience.map((job, index) => (
              <article className="experience-item" key={job.company}>
                <div className="experience-date">0{index + 1}<span>{job.period}</span></div>
                <div className="experience-main">
                  <div className="experience-heading">
                    <div><h3>{job.role}</h3><p>{job.company}</p></div>
                    <span className="experience-location"><MapPin size={13} />{job.location}</span>
                  </div>
                  <ul>{job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                  {index === 0 && <div className="tag-row"><span>Angular</span><span>Spring Boot</span><span>Bootstrap</span><span>Java</span></div>}
                  {index === 1 && <div className="tag-row"><span>React</span><span>TypeScript</span><span>Django REST</span><span>PostgreSQL</span><span>MongoDB</span><span>SQL Server</span><span>Docker</span><span>Celery</span><span>RabbitMQ</span></div>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="projects-section" id="proyectos">
          <SectionAside index="03" title={content.projectsTitle} />
          <div className="project-list">
            {content.projects.map((project, index) => (
              <article className="project-row" key={project.name}>
                <span className="project-number">0{index + 1}</span>
                <div className="project-main">
                  <div className="project-heading"><h3>{project.name}</h3><span className="project-type">{project.type}</span></div>
                  <p>{project.description}</p>
                  <div className="tag-row">{project.stack.map((tech) => <span key={tech}>{tech}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="split-section skills-section" id="competencias">
          <SectionAside index="04" title={content.skillsTitle} intro={content.skillsIntro} />
          <div className="section-content skill-content">
            <div className="skill-group-wrap">
              <h3 className="group-heading"><span className="small-rule" />{content.professionalSkillsTitle}</h3>
              <div className="skill-groups">
                {content.skillGroups.slice(0, 4).map((group) => <SkillGroup group={group} key={group.title} />)}
              </div>
            </div>
            <div className="skill-group-wrap">
              <h3 className="group-heading"><span className="small-rule" />{content.additionalSkillsTitle}</h3>
              <div className="skill-groups">
                {content.skillGroups.slice(4).map((group) => <SkillGroup group={group} key={group.title} />)}
              </div>
            </div>
            <div className="engineering-skills">
              <h3 className="group-heading"><span className="small-rule" />{content.softwareSkillsTitle}</h3>
              <div className="engineering-grid">
                {content.softwareSkills.map((skill) => <article className="engineering-item" key={skill.title}><h4>{skill.title}</h4><p>{skill.description}</p></article>)}
              </div>
            </div>
          </div>
        </section>

        <section className="split-section education-section" id="formacion">
          <SectionAside index="05" title={content.educationTitle} />
          <div className="section-content education-content">
            <div className="education-card">
              <div className="education-symbol" aria-hidden="true">∑</div>
              <div><p className="education-degree">{content.degree}</p><p className="education-university">{content.university}</p><p className="education-location">{content.location}</p></div>
              <span className="gold-seal">✳ <span>{content.goldTitle}</span></span>
            </div>
            <div className="awards-block"><h3>{content.awardsLabel}</h3><ul>{content.awards.map((award) => <li key={award}>{award}</li>)}</ul></div>
            <div className="languages-block"><h3>{content.languagesTitle}</h3><div className="language-list">{content.languages.map((item) => <div className="language-item" key={item.name}><span>{item.name}</span><span>{item.level}</span></div>)}</div></div>
          </div>
        </section>

        <section className="download-section" id="descargas" aria-labelledby="download-title">
          <div><span className="eyebrow"><span className="eyebrow-dot" />{content.pdfLabel}</span><h2 id="download-title">{content.ctaDownload}</h2></div>
          <div className="download-links">
            <a className="download-link" href={pdfUrls.es} download="Leonardo-Colas-Leyva-CV-ES.pdf"><span><span className="download-code">ES</span><span><strong>{content.pdfSpanish}</strong><small>PDF · Español</small></span></span><Download size={17} /></a>
            <a className="download-link" href={pdfUrls.en} download="Leonardo-Colas-Leyva-CV-EN.pdf"><span><span className="download-code">EN</span><span><strong>{content.pdfEnglish}</strong><small>PDF · English</small></span></span><Download size={17} /></a>
          </div>
        </section>

        <section className="contact-section" id="contacto">
          <div className="contact-copy"><span className="eyebrow"><span className="eyebrow-dot" />{language === 'es' ? 'CONTACTO' : 'CONTACT'}</span><h2>{content.contactTitle}</h2><p className="contact-email">leonardocolasleyva@gmail.com</p></div>
          <div className="contact-details">
            <ContactDetail label={content.emailLabel} value="leonardocolasleyva@gmail.com" />
            <ContactDetail icon={<Phone size={18} />} label={content.phoneLabel} value="+53 5 6083226" />
            <ContactDetail icon={<Github size={18} />} label={content.githubLabel} value="github.com/leonardocolas" href="https://github.com/leonardocolas" external />
            <ContactDetail icon={<MapPin size={18} />} label={content.locationLabel} value={content.location} />
          </div>
        </section>
      </main>

      <footer className="site-footer"><a href="#inicio" className="footer-wordmark">LC<span>.</span></a><span>© {new Date().getFullYear()} Leonardo Colás Leyva</span><span>{content.footerNote}</span><a href="#inicio" className="back-top" aria-label={content.backToTop}>{content.backToTop}</a></footer>
    </>
  );
}

function SectionAside({ index, title, intro }: { index: string; title: string; intro?: string }) {
  return <div className="section-aside"><span className="section-index">{index} <span /></span><h2>{title}</h2>{intro && <p>{intro}</p>}</div>;
}

function SkillGroup({ group }: { group: { title: string; items: string[] } }) {
  return <article className="skill-group"><h4>{group.title}</h4><div className="tag-row">{group.items.map((item) => <span key={item}>{item}</span>)}</div></article>;
}

function ContactDetail({ icon, label, value, href, external }: { icon?: React.ReactNode; label: string; value: string; href?: string; external?: boolean }) {
  return <div className="contact-detail">{icon && <span className="contact-icon">{icon}</span>}<span className="contact-detail-text"><small>{label}</small>{href ? <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{value}</a> : <span>{value}</span>}</span></div>;
}

export default App;
