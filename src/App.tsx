import { lazy, Suspense, useEffect, useState } from 'react';
import { Download, Github, Globe2, Mail, MapPin, Menu, Moon, Phone, Sun, X } from 'lucide-react';
import cv from './data/cv.json';
const ArchitectureScene = lazy(() => import('./components/ArchitectureScene'));

type Language = 'es' | 'en';
type Theme = 'light' | 'dark';

// Official CV PDFs, one per language, shipped inside public/cv/.
const pdfUrls = {
  es: '/cv/Leonardo-Colas-Leyva-CV-ES.pdf',
  en: '/cv/Leonardo-Colas-Leyva-CV-EN.pdf',
};

const EMAIL = 'leonardocolasleyva@gmail.com';
const PHONE_DISPLAY = '+53 5 6083226';
const WHATSAPP_URL = 'https://wa.me/5356083226';
const GMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}`;
const GITHUB_URL = 'https://github.com/leonardocolas';

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
      return localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
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

  // The download menu closes on outside click and on Escape.
  useEffect(() => {
    if (!downloadOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!(event.target as HTMLElement | null)?.closest('.download-picker')) setDownloadOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setDownloadOpen(false); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [downloadOpen]);

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
              <div className={`download-picker ${downloadOpen ? 'is-open' : ''}`}>
                <button className="button button-text" type="button" aria-expanded={downloadOpen} aria-haspopup="true" onClick={() => setDownloadOpen((open) => !open)}>
                  <Download size={16} />{content.ctaDownload}
                </button>
                <div className="download-menu" role="menu" hidden={!downloadOpen}>
                  <a role="menuitem" href={pdfUrls.es} download="Leonardo-Colas-Leyva-CV-ES.pdf" onClick={() => setDownloadOpen(false)}>
                    <span className="download-menu-code">ES</span><span>Español</span>
                  </a>
                  <a role="menuitem" href={pdfUrls.en} download="Leonardo-Colas-Leyva-CV-EN.pdf" onClick={() => setDownloadOpen(false)}>
                    <span className="download-menu-code">EN</span><span>English</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="hero-quick-contact">
              <a className="email-plain" href={GMAIL_URL} target="_blank" rel="noreferrer">{EMAIL}</a>
              <span className="quick-separator" aria-hidden="true" />
              <span className="phone-plain"><Phone size={14} aria-hidden="true" />{PHONE_DISPLAY}</span>
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
                  <a className="project-link" href={project.url} target="_blank" rel="noreferrer"><Github size={13} />{content.projectLinkLabel}</a>
                </div>
              </article>
            ))}
            <div className="projects-cta">
              <p>{content.projectsCta}</p>
              <a className="button button-text" href={GITHUB_URL} target="_blank" rel="noreferrer"><Github size={16} />{content.projectsCtaAction}</a>
            </div>
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
          <div className="contact-copy">
            <span className="eyebrow"><span className="eyebrow-dot" />{language === 'es' ? 'CONTACTO' : 'CONTACT'}</span>
            <h2>{content.contactTitle}</h2>
            <p className="contact-email"><a href={GMAIL_URL} target="_blank" rel="noreferrer">{EMAIL}</a></p>
            <div className="contact-actions">
              <a className="button button-primary" href={WHATSAPP_URL} target="_blank" rel="noreferrer"><WhatsAppIcon size={16} />WhatsApp</a>
              <a className="button button-text" href={GMAIL_URL} target="_blank" rel="noreferrer"><Mail size={16} />Gmail</a>
            </div>
          </div>
          <div className="contact-details">
            <ContactDetail label={content.emailLabel} value={EMAIL} href={GMAIL_URL} external />
            <ContactDetail icon={<Phone size={18} />} label={content.phoneLabel} value={PHONE_DISPLAY} href={WHATSAPP_URL} external />
            <ContactDetail icon={<Github size={18} />} label={content.githubLabel} value="github.com/leonardocolas" href={GITHUB_URL} external />
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

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export default App;
