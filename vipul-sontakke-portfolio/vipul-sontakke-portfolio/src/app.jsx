import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, MotionConfig, useScroll, useTransform, useSpring, useReducedMotion, useMotionValueEvent, useAnimationFrame, useInView } from 'framer-motion';
import { ArrowUpRight, ArrowDown, ArrowRight, Play, X, Menu, Mail, Phone, MapPin, Github, Pause, Search, Plus, Minus, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import archive from './data/projects.json';
import brands from './data/brands.json';
import './styles.css';
import { MotionContext, EASE } from './shared.js';
import { Signal, Capabilities, Pipeline, CredentialsRail, Spotlight, OpenToWork, awards } from './extras.jsx';
// Contact details live here so they are edited in one place.
const GITHUB = 'https://github.com/vipulsontakke';
const GITHUB_LABEL = 'github.com/vipulsontakke';
const EMAIL = 'sontakke.vipul@gmail.com';
const PHONE_TEL = '+917774895018';
const PHONE_LABEL = '(+91) 7774895018';
const LOCATION = 'Pune, Maharashtra, India';
const CLICK_VOLUME = 0.12; // 0 turns the click sound off

const categories = ['All', ...new Set(archive.map(p => p.category))];
const featured = archive.slice(0, 3);
const experiences = [
  { date: '2024 – PRESENT', title: 'Senior Cloud & AI Engineer', place: 'Tata Consultancy Services (TCS)', points: [
    'Led VMware to Azure VDI migration.',
    'Built serverless multi-account health auditor, reducing audit time from hours to minutes.',
    'Earned AWS AI Practitioner, Claude CCAO-F, and IIT Kharagpur AI4ICPS certifications.',
  ] },
  { date: '2022 – 2024', title: 'FinOps & Cloud Automation Lead', place: 'Tata Consultancy Services (TCS)', points: [
    'Achieved ~60% cost reduction through EC2/RDS scheduling automation.',
    'Upgraded Terraform across 15+ repositories and worked on NACL and VPC endpoint optimization via Terraform.',
    'Completed M.B.A. in Business Analytics and awarded TCS Xcelerate (Rank 3/40).',
  ] },
  { date: '2021 – 2022', title: 'AWS System Engineer', place: 'Tata Consultancy Services (TCS)', points: [
    'Managed 30+ production and non-production AWS accounts.',
    'Established IAM governance and processed 50+ monthly compliance requests.',
    'Received On-the-Spot Recognition within 16 months.',
  ] },
  { date: '2015 – 2019', title: 'B.E. Electrical Engineering', place: 'AISSMS College of Engineering, Pune', points: [
    'Graduated with a strong foundation in systems thinking, analytical problem-solving, and Linux environments.',
  ] },
];

function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const enabled = useContext(MotionContext);
  const Component = motion[as];
  return <Component className={className} initial={enabled ? { opacity: 0, y: 32, filter: 'blur(8px)' } : false} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: false, amount: 0.12 }} transition={{ duration: enabled ? 0.75 : 0, delay, ease: EASE }}>{children}</Component>;
}

function MediaImage({ src, alt, className = '', priority = false, ...props }) {
  const [state, setState] = useState('loading');
  const imgRef = useRef(null);
  useEffect(() => {
    const img = imgRef.current;
    // Cached images can finish before React attaches onLoad.
    setState(img?.complete ? (img.naturalWidth ? 'loaded' : 'error') : 'loading');
  }, [src]);
  return <span className={`media-image ${state} ${className}`}>
    {state === 'error' && <span className="image-fallback"><span className="display">VS</span><span>Preview unavailable</span></span>}
    <img ref={imgRef} src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} width="960" height="600" onLoad={() => setState('loaded')} onError={e => {
      if (e.currentTarget.src.includes('maxresdefault.jpg')) e.currentTarget.src = e.currentTarget.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
      else setState('error');
    }} {...props} />
  </span>;
}

function Magnetic({ children, className = '', ...props }) {
  const enabled = useContext(MotionContext);
  const x = useSpring(0, { stiffness: 220, damping: 20 });
  const y = useSpring(0, { stiffness: 220, damping: 20 });
  return <motion.a className={className} style={{ x, y }} onPointerMove={e => {
    if (!enabled || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.12); y.set((e.clientY - r.top - r.height / 2) * 0.2);
  }} onPointerLeave={() => { x.set(0); y.set(0); }} {...props}>{children}</motion.a>;
}

function Aurora() {
  return <div className="aurora" aria-hidden="true"><span/><span/><span/></div>;
}

function CursorGlow() {
  const enabled = useContext(MotionContext);
  const x = useSpring(-600, { stiffness: 120, damping: 25 });
  const y = useSpring(-600, { stiffness: 120, damping: 25 });
  useEffect(() => {
    if (!enabled || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const move = e => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [enabled]);
  if (!enabled) return null;
  return <motion.div className="cursor-glow" aria-hidden="true" style={{ x, y }}/>;
}

// A short synthesized click on every mouse click or tap (Web Audio, so there is no audio file to load).
// Browsers only allow sound after a user gesture, so the audio context starts on the first click.
function useClickSound() {
  useEffect(() => {
    let ctx;
    const play = e => {
      if (e.detail === 0) return; // keyboard-triggered "clicks" stay silent
      try {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.exponentialRampToValueAtTime(650, t + 0.05);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(CLICK_VOLUME, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      } catch { /* no audio support: stay silent */ }
    };
    // click = left button and taps, auxclick = middle and right buttons.
    window.addEventListener('click', play, true);
    window.addEventListener('auxclick', play, true);
    return () => { window.removeEventListener('click', play, true); window.removeEventListener('auxclick', play, true); ctx?.close(); };
  }, []);
}

function GithubFloat() {
  return <a className="github-float" href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="Open Vipul’s GitHub profile"><Github size={20}/><span>GITHUB</span></a>;
}

function Ticker() {
  const enabled = useContext(MotionContext);
  const words = ['AWS CLOUD ENGINEERING', 'CLOUD OPERATIONS', 'IAM GOVERNANCE', 'INFRASTRUCTURE AS CODE', 'FINOPS', 'AUTOMATION', 'CLOUD SECURITY', 'MONITORING'];
  return <div className="ticker" aria-label={words.join(', ')}>
    <motion.div className="ticker-track" aria-hidden="true" animate={enabled ? { x: ['0%', '-50%'] } : { x: '0%' }} transition={enabled ? { duration: 28, ease: 'linear', repeat: Infinity } : { duration: 0 }}>
      {[0, 1].map(copy => <span className="ticker-set" key={copy}>{words.map(w => <span key={w}>{w}<i>✦</i></span>)}</span>)}
    </motion.div>
  </div>;
}

function Header({ enabled, onToggle }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main > section[id]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  return <header className="site-header">
    <a className="wordmark" href="#home" aria-label="Vipul Sontakke, home">VS<span>✦</span></a>
    <nav className="desktop-nav" aria-label="Main navigation">{[['portfolio', 'Work'], ['about', 'About'], ['credentials', 'Credentials'], ['experience', 'Journey'], ['contact', 'Contact']].map(([id, label]) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''}>{label}</a>)}</nav>
    <div className="header-actions"><button className="motion-toggle" onClick={onToggle} aria-label={enabled ? 'Pause animation' : 'Turn animation on'} aria-pressed={!enabled}>{enabled ? <Pause size={13} /> : <Play size={13} />}<span>Motion {enabled ? 'on' : 'off'}</span></button><a className="header-contact" href="#contact">Let’s talk <ArrowUpRight size={16} /></a><button className="menu-toggle icon-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button></div>
    <AnimatePresence>{open && <motion.nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>{[['home', 'Home'], ['portfolio', 'Work'], ['about', 'About'], ['credentials', 'Credentials'], ['experience', 'Journey'], ['contact', 'Contact']].map(([id, label], i) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}><span>0{i + 1}</span>{label}<ArrowUpRight size={18} /></a>)}</motion.nav>}</AnimatePresence>
  </header>;
}

function Hero({ onProject }) {
  const ref = useRef(null);
  const enabled = useContext(MotionContext);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 85]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  return <section id="home" className="hero" ref={ref}>
    <div className="hero-top"><span>AWS CLOUD ENGINEER / AWS ADMINISTRATOR<br/><span className="muted">CLOUD OPERATIONS · IAC · FINOPS</span></span><span className="availability"><i />AVAILABLE — PUNE, MAHARASHTRA, INDIA</span></div>
    <motion.div className="hero-title display" aria-hidden="true" style={enabled ? { y: titleY } : {}}>{'PORTFOLIO'.split('').map((ch, i) => <motion.span key={i} className="hero-letter" style={{ '--i': i }} initial={enabled ? { y: '60%', opacity: 0, rotate: 6 } : false} animate={{ y: '0%', opacity: 1, rotate: 0 }} transition={{ duration: 1.1, delay: 0.08 * i, ease: EASE }}>{ch}</motion.span>)}</motion.div>
    <motion.div className="hero-portrait" style={enabled ? { y: portraitY, scale: portraitScale } : {}} initial={enabled ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.2 }}><img src="./Asset/img/vipul-portrait.png" alt="Vipul Ajay Sontakke, seated, in a black blazer and white shirt" width="1024" height="1536" fetchPriority="high" /></motion.div>
    <motion.div className="hero-intro" style={enabled ? { y: copyY } : {}} initial={enabled ? { opacity: 0, x: -35 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.35, ease: EASE }}>
      <p className="handwriting">Hello, I’m</p><h1 className="display" aria-label="Vipul Ajay Sontakke">VIPUL<span>.</span></h1><p className="hero-role">AWS CLOUD ENGINEER & <br />AWS ADMINISTRATOR</p><p className="hero-description">AWS Cloud Engineer with 5+ years of experience managing secure, scalable, and cost-efficient AWS environments. Experienced in supporting 30+ AWS accounts, cloud security, IAM governance, infrastructure monitoring, automation, and AWS cost optimization.</p>
      <Magnetic href="#portfolio" className="primary-link">See my work <ArrowDown size={17}/></Magnetic>
      <span className="hero-location"><MapPin size={12} /> PUNE, MAHARASHTRA, INDIA</span>
    </motion.div>
    <motion.div className="hero-side" initial={enabled ? { opacity: 0, x: 30 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.55, ease: EASE }}>
      <div className="hero-manifesto"><span className="crosshair" aria-hidden="true">✳</span><p>Secure. Observable.<br />Never wasteful.</p></div>
      <div className="hero-stats"><div><span className="display">5<span>+</span></span><p>YEARS<br/>EXPERIENCE</p></div><div><span className="display">30<span>+</span></span><p>AWS ACCOUNTS<br/>MANAGED</p></div><div className="hero-award-stat"><span className="display">6<span></span></span><a href="#credentials" aria-label="6 industry certifications, see the credentials">INDUSTRY CERTIFICATIONS<ArrowUpRight size={12}/></a></div><a href={GITHUB} target="_blank" rel="noopener noreferrer"><Github size={16}/><span>{GITHUB_LABEL.toUpperCase()}</span></a></div>
    </motion.div>
    <div className="hero-bottom"><button className="reel-button" onClick={() => onProject(featured[0])}><span className="play-circle"><Play size={12} fill="currentColor" /></span>OPEN FEATURED PROJECT<span className="muted">{featured[0].title.toUpperCase()}</span></button><span className="hero-scroll">SCROLL TO DISCOVER <ArrowDown size={13}/></span><span className="edition">AWS · CLOUDOPS · FINOPS</span></div>
  </section>;
}

function ProjectCard({ project, index, onOpen }) {
  const enabled = useContext(MotionContext);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-12, 12]);
  const video = ['youtube', 'drive'].includes(project.type);
  const typeLabel = { render: 'BEFORE / AFTER', website: 'WEBSITE', repo: 'GITHUB REPO' }[project.type] || (video ? 'FILM / VIDEO' : 'STILL / IMAGE');
  const rx = useSpring(0, { stiffness: 200, damping: 18 });
  const ry = useSpring(0, { stiffness: 200, damping: 18 });
  const tilt = e => {
    if (!enabled || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8); ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
  };
  const untilt = () => { rx.set(0); ry.set(0); };
  return <motion.article ref={ref} className="project-card" layout initial={enabled ? { opacity: 0, y: 32 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.08 }} transition={{ duration: enabled ? 0.6 : 0, delay: (index % 3) * 0.06, ease: EASE }} exit={{ opacity: 0, scale: 0.96 }}>
    <motion.button className="project-open" style={enabled ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : {}} onPointerMove={tilt} onPointerLeave={untilt} onClick={() => onOpen(project)} aria-label={`View ${project.title}`}><motion.div className="project-picture" style={enabled ? { y } : {}}><MediaImage src={project.image} alt={project.title}/></motion.div><span className="project-type">{typeLabel}</span><span className="project-hover">{video ? <Play fill="currentColor" size={18}/> : <ArrowUpRight size={22}/>}</span><span className="project-frame" aria-hidden="true" /></motion.button>
    <button className="project-caption" onClick={() => onOpen(project)}><span className="project-number display">{String(index + 1).padStart(2, '0')}</span><span><h3>{project.title}</h3><span className="project-category">{[project.category, project.role, project.year].filter(Boolean).join(' / ')}</span></span><ArrowUpRight size={20}/></button>
    {project.tags?.length > 0 && <div className="project-tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>}
  </motion.article>;
}

function BrandStrip() {
  const enabled = useContext(MotionContext);
  const ref = useRef(null);
  const loopWidth = useRef(0);
  const inView = useInView(ref);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    if (!ref.current || showAll) return;
    const update = () => { loopWidth.current = ref.current?.querySelector('.brand-set')?.getBoundingClientRect().width || 0; };
    const observer = new ResizeObserver(update);
    observer.observe(ref.current); update();
    return () => observer.disconnect();
  }, [showAll]);
  useAnimationFrame((time, delta) => {
    if (!enabled || paused || interacting || !inView || showAll || !ref.current || !loopWidth.current) return;
    const el = ref.current;
    el.scrollLeft += Math.min(delta, 40) * 0.038;
    if (el.scrollLeft >= loopWidth.current) el.scrollLeft -= loopWidth.current;
  });
  const move = direction => { setPaused(true); ref.current?.scrollBy({ left: direction * ref.current.clientWidth * .7, behavior: enabled ? 'smooth' : 'instant' }); };
  return <Reveal className="brand-section"><div className="brand-heading"><p>BUILT WITH<br/><strong>THE TOOLS BEHIND THE WORK.</strong></p><div><button className="brand-all" onClick={() => setShowAll(v => !v)} aria-expanded={showAll} aria-controls="brand-collection">{showAll ? 'SHOW AS RAIL' : `SEE ALL (${brands.length})`}{showAll ? <Minus size={14}/> : <Plus size={14}/>}</button>{!showAll && <><button className="icon-button brand-pause" aria-label={paused ? 'Play logo animation' : 'Pause logo animation'} aria-pressed={paused} onClick={() => setPaused(v => !v)}>{paused ? <Play size={13}/> : <Pause size={13}/>}</button><button className="icon-button" onClick={() => move(-1)} aria-label="Previous logos"><ChevronLeft size={17}/></button><button className="icon-button" onClick={() => move(1)} aria-label="Next logos"><ChevronRight size={17}/></button></>}</div></div><div id="brand-collection" className={showAll ? 'brand-full-grid' : 'brand-viewport'} ref={ref} onPointerEnter={e => { if(e.pointerType==='mouse') setInteracting(true); }} onPointerLeave={() => setInteracting(false)} onPointerDown={() => setPaused(true)} onFocusCapture={() => setInteracting(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false); }} tabIndex={showAll ? undefined : 0} role={showAll ? 'list' : 'region'} aria-label="Tools and technologies, scroll sideways to see them all">
      {showAll ? brands.map(b => <div className="brand-logo" key={b.file} role="listitem"><img src={`./Asset/svg/brand/${b.file}`} alt={b.name} title={b.name} width="200" height="56" loading="lazy"/></div>) : <div className="brand-rail">{[0,1].map(copy => <div className="brand-set" key={copy} aria-hidden={copy === 1 ? true : undefined}>{brands.map(b => <div className="brand-logo" key={b.file}><img src={`./Asset/svg/brand/${b.file}`} alt={copy ? '' : b.name} title={b.name} width="200" height="56" loading="lazy" draggable="false"/></div>)}</div>)}</div>}
    </div></Reveal>;
}

function Portfolio({ onProject }) {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [limit, setLimit] = useState(9);
  const results = archive.filter(p => (category === 'All' || p.category === category) && `${p.title} ${p.category} ${p.role} ${(p.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const projects = expanded || category !== 'All' || query ? results.slice(0, limit) : featured;
  return <section id="portfolio" className="portfolio section-wrap">
    <Reveal className="section-heading"><div><span className="eyebrow">01 / SELECTED WORK</span><h2>WORK THAT SCALES<span className="accent">.</span></h2></div><a className="text-link" href={GITHUB} target="_blank" rel="noopener noreferrer">ALL REPOSITORIES<ArrowRight size={21}/></a></Reveal>
    <Reveal className="portfolio-toolbar">
      <div className="filters" role="group" aria-label="Work categories">
        {categories.map(c => <button key={c} className={category === c ? 'selected' : ''} aria-pressed={category === c} onClick={() => { setCategory(c); setExpanded(true); setLimit(9); }}>{c}{c === category && <motion.span className="filter-line" layoutId="filter-line"/>}</button>)}
      </div>
      <label className="search-box"><Search size={15}/><span>Search</span><input aria-label="Search work" type="search" placeholder="Title, category or tag…" value={query} onChange={e => { setQuery(e.target.value); setExpanded(true); setLimit(9); }}/></label>
    </Reveal>
    <motion.div className="project-grid" layout><AnimatePresence mode="popLayout">{projects.map((p, i) => <ProjectCard key={p.category + p.title + p.media} project={p} index={i} onOpen={onProject}/>)}</AnimatePresence></motion.div>
    {projects.length === 0 && <div className="empty-state"><p>No work matches{query ? ` “${query}”` : ' this filter'}.</p><button className="text-link" onClick={() => { setQuery(''); setCategory('All'); }}>Reset search <X size={15}/></button></div>}
    {expanded && results.length > limit && <div className="load-more"><button className="outline-button" onClick={() => setLimit(v => v + 9)}>Show more work <Plus size={16}/></button><span>More on GitHub</span></div>}
    <BrandStrip/>
  </section>;
}

const processSteps = [
  ['01', 'SECURE', 'IAM governance and least privilege first, so access is right before anything scales.'],
  ['02', 'CODIFY', 'Infrastructure written in Terraform: automated, version-controlled and auditable.'],
  ['03', 'AUTOMATE', 'Repeatable operations handed to Lambda, EventBridge and scripts instead of manual runs.'],
  ['04', 'OBSERVE', 'Monitoring with CloudWatch, so the state of every environment stays visible.'],
  ['05', 'OPTIMISE', 'Scheduling, rightsizing and savings plans, because cloud should never be wasteful.'],
];
function Breakdown() {
  const frames = { before: './Asset/img/work/finops-before.svg', after: './Asset/img/work/finops-after.svg' };
  const ref = useRef(null);
  const enabled = useContext(MotionContext);
  const [manual, setManual] = useState(false);
  const [cut, setCut] = useState(65);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  useMotionValueEvent(scrollYProgress, 'change', v => { if (!manual && enabled) setCut(Math.round(90 - v * 80)); });
  const titleX = useTransform(scrollYProgress, [0, 1], [30, -30]);
  return <section id="finops" className="breakdown section-wrap" ref={ref} aria-labelledby="breakdown-title"><Reveal className="breakdown-copy"><span className="eyebrow">A LOOK UNDER THE BILL</span><motion.h2 id="breakdown-title" className="display" style={enabled ? { x: titleX } : {}}>ALWAYS ON.<br/><span className="accent">ON SCHEDULE.</span></motion.h2><p>Same environments. Fewer running hours.<br/>Drag to see the idea behind the ~60% cost reduction: EC2/RDS scheduling automation that switches non-production off when nobody needs it.</p><span className="breakdown-credit">TCS / 2022 – 2024<br/>EC2 · RDS · SCHEDULING AUTOMATION</span></Reveal><Reveal className="comparison"><div className="comparison-stage" style={{'--cut': `${enabled || manual ? cut : 50}%`}}><MediaImage src={frames.before} alt="Before: a week of non-production hours with every hour running"/><div className="comparison-final"><MediaImage src={frames.after} alt="After: the same week with resources running only during weekday working hours"/></div><span className="comparison-label raw-label">BEFORE</span><span className="comparison-label final-label">AFTER</span><div className="comparison-divider"><span><ChevronLeft size={14}/><ChevronRight size={14}/></span></div><input aria-label="Compare always-on and scheduled non-production environments" aria-valuetext={`${cut}% always on, ${100-cut}% scheduled`} type="range" min="0" max="100" value={cut} onChange={e => { setManual(true); setCut(Number(e.target.value)); }}/></div><div className="comparison-caption"><span>ILLUSTRATIVE WEEK, NOT BILLING DATA</span><span>DRAG / SCROLL</span></div></Reveal></section>;
}
function About() {
  const enabled = useContext(MotionContext);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 75%'] });
  return <section id="about" className="about section-wrap" ref={ref}>
    <Reveal className="about-lead"><div><span className="eyebrow">02 / ABOUT</span><h2 className="display">CLOUD INFRASTRUCTURE,<br/>BUILT TO <span className="accent">LAST.</span></h2></div><p>I’m an AWS Cloud Engineer with hands-on experience across compute, storage, networking, security, and cost management. I’ve spent 5+ years at TCS solving real enterprise challenges, automating operations, and building resilient, cost-efficient systems at scale. My approach combines technical rigour with a FinOps mindset. I believe cloud should be secure, observable, and never wasteful.</p></Reveal>
    <div className="studio-grid">
      <Reveal className="education-panel"><h3 className="panel-heading">CORE PILLARS</h3><p className="eyebrow accent">WHAT I DO</p><div className="education-row"><strong>Cloud Operations</strong><span>01</span><p>EC2, S3, RDS, VPC, CloudWatch, IAM — daily operations across multi-account environments.</p></div><div className="education-row"><strong>Infrastructure as Code</strong><span>02</span><p>Terraform across 15+ repositories. Automated, version-controlled, auditable infrastructure.</p></div><div className="education-row"><strong>FinOps & Cost Control</strong><span>03</span><p>Cost control in non-production environments through scheduling, rightsizing, and savings plans.</p></div><p className="eyebrow accent skills-heading">TOOLKIT</p><div className="skill-tags">{['AWS', 'Terraform', 'IAM', 'CloudWatch', 'Lambda', 'Python', 'Bash', 'Linux', 'Docker', 'Git', 'CI/CD', 'FinOps'].map(s => <span key={s}>{s}</span>)}</div><div className="software-row">{[['aws', 'AWS'], ['terraform', 'Terraform'], ['python', 'Python'], ['linux', 'Linux'], ['docker', 'Docker'], ['claude', 'Claude']].map(([file, name]) => <img key={file} src={`./Asset/svg/${file}.svg`} alt={name} title={name} loading="lazy" width="28" height="28"/>)}</div></Reveal>
      <div className="process-panel"><Reveal><h3 className="panel-heading">HOW I RUN A CLOUD</h3></Reveal><div className="process-list"><div className="process-track"><motion.div style={{ scaleY: enabled ? scrollYProgress : 1 }}/></div>{processSteps.map(([num, title, text], i) => <Reveal key={num} className="process-row" delay={i * 0.035}><span className="process-num display">{num}</span><span className="process-node"/><div><h4>{title}</h4><p>{text}</p></div></Reveal>)}</div></div>
      <Reveal className="quote-panel"><span className="quote-mark display">“</span><blockquote>Cloud should be<br/>secure, observable,<br/><em>and never<br/>wasteful.</em></blockquote><span className="handwriting">Vipul</span><div className="quote-bottom">LET’S BUILD<br/>SOMETHING RESILIENT.<span className="quote-symbol" aria-hidden="true">✳</span></div></Reveal>
    </div>
  </section>;
}

function Journey({ onProject }) {
  const [open, setOpen] = useState(0);
  return <section id="experience" className="journey section-wrap">
    <Reveal className="section-heading"><div><span className="eyebrow">03 / THE JOURNEY</span><h2>ALWAYS BUILDING. ALWAYS AUTOMATING<span className="accent">.</span></h2></div><a className="text-link" href="#credentials">SEE THE CREDENTIALS<ArrowUpRight size={16}/></a></Reveal>
    <div className="journey-grid"><div className="experience-list">{experiences.map((job, i) => <Reveal className={`experience-row ${open === i ? 'is-open' : ''}`} key={job.title}><button aria-expanded={open === i} aria-controls={`job-${i}`} onClick={() => setOpen(open === i ? null : i)}><span className="experience-date">{job.date}</span><span><h3>{job.title}</h3><span className="experience-place">{job.place}</span></span>{open === i ? <Minus size={18}/> : <Plus size={18}/>}</button><AnimatePresence initial={false}>{open === i && <motion.div id={`job-${i}`} role="list" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>{job.points.map(point => <p className="experience-point" role="listitem" key={point}>{point}</p>)}</motion.div>}</AnimatePresence></Reveal>)}</div>
    <Reveal className="awards-panel"><p className="eyebrow">AWARDS & RECOGNITION</p><h3 className="display">LITTLE WINS.<br/><span className="accent">BIG MEANING.</span></h3><div className="award-list">{awards.map((award, i) => <button key={award.title} onClick={() => onProject(award)}><span>{String(i + 1).padStart(2, '0')}</span><span>{award.title}<small>{award.description}</small></span><ArrowUpRight size={19}/></button>)}<button onClick={() => document.getElementById('credentials')?.scrollIntoView()}><span>{String(awards.length + 1).padStart(2, '0')}</span><span>6 industry certifications<small>AWS, Anthropic and IIT Kharagpur</small></span><ArrowUpRight size={19}/></button></div></Reveal></div>
  </section>;
}

function Contact({ onProject }) {
  const [sent, setSent] = useState(false);
  const send = e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = `${data.get('type')} — ${data.get('name')}`;
    const body = `Hi Vipul, I’m ${data.get('name')}.\n\nRole: ${data.get('type')}\n${data.get('message')}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  return <section id="contact" className="contact section-wrap">
    <div className="contact-grid"><Reveal className="contact-intro"><span className="eyebrow">04 / GET IN TOUCH</span><h2 className="display">LET’S<br/>CONNECT<span className="accent">.</span></h2><p>Open to AWS Cloud Engineer,<br/>CloudOps, and Infrastructure roles.</p><Magnetic href={`mailto:${EMAIL}`} className="contact-cta"><span className="round-arrow"><ArrowUpRight size={21}/></span>START A CONVERSATION</Magnetic></Reveal>
    <Reveal className="contact-links" delay={0.1}><a href={`mailto:${EMAIL}`}><Mail/><span><small>EMAIL</small>{EMAIL}</span><ArrowUpRight size={16}/></a><a href={`tel:${PHONE_TEL}`}><Phone/><span><small>PHONE</small>{PHONE_LABEL}</span><ArrowUpRight size={16}/></a><a href={GITHUB} target="_blank" rel="noopener noreferrer"><Github/><span><small>GITHUB</small>{GITHUB_LABEL}</span><ArrowUpRight size={16}/></a><div><MapPin/><span><small>LOCATION</small>{LOCATION}</span></div></Reveal>
    <Reveal className="contact-reel" delay={0.2}><button onClick={() => onProject(featured[0])} aria-label={`Open the featured project, ${featured[0].title}`}><div className="reel-screen"><span className="reel-screen-top">VS ✦<span>FEATURED / PROJECT</span></span><MediaImage src={featured[0].image} alt={`${featured[0].title} preview`}/><span className="reel-screen-title display">BUILT TO<br/><span>LAST.</span></span><span className="play-circle"><ArrowUpRight size={20}/></span></div><span className="reel-caption">TAP IN. SEE THE PROJECT.</span></button></Reveal></div>
    <Reveal><details className="project-brief"><summary>Tell me about the role <Plus size={19}/></summary><form onSubmit={send}><label>Your name<input name="name" required placeholder="Name or company" autoComplete="name" maxLength="100"/></label><label>Role<select name="type"><option>AWS Cloud Engineer</option><option>CloudOps</option><option>Infrastructure</option><option>FinOps / Cloud automation</option><option>Something else</option></select></label><label className="brief-message">About the role<textarea name="message" required rows="3" placeholder="Tell me about the team, the role and your timeline…" maxLength="1500"/></label><button className="solid-button" type="submit">Continue to email <ArrowUpRight size={18}/></button><p className="form-note" role="status">{sent ? 'Your message is ready in your email app. Press Send there to start the conversation.' : 'Your message opens as a draft in your email app.'}</p></form></details></Reveal>
  </section>;
}

function ProjectDialog({ project, onClose }) {
  const ref = useRef(null);
  const [renderMode, setRenderMode] = useState('final');
  const [shot, setShot] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [retried, setRetried] = useState(0);
  const enabled = useContext(MotionContext);
  const activeShot = project.type === 'render' ? project.renders[shot] : null;
  const embedType = activeShot?.video ? 'youtube' : activeShot?.drive ? 'drive' : project.type;
  const embedMedia = activeShot?.video || activeShot?.drive?.match(/\/d\/([^/]+)/)?.[1] || project.media;
  const isVideo = ['youtube', 'drive'].includes(embedType);
  const availableModes = [['layout', 'Layout'], ['solid', 'Before'], ['material', 'Material'], ['lighting', 'Lighting'], ['final', 'After']].filter(([mode]) => activeShot?.[mode] && !(mode === 'solid' && activeShot.hideSolidMode));
  const effectiveMode = activeShot?.[renderMode] ? renderMode : availableModes[0]?.[0];
  const rendered = activeShot?.[effectiveMode] || activeShot?.image || project.image;
  const sourceUrl = embedType === 'youtube' ? `https://www.youtube.com/watch?v=${embedMedia}` : embedType === 'drive' ? `https://drive.google.com/file/d/${embedMedia}/view` : project.type === 'render' ? rendered : project.type === 'credential' ? null : project.media || project.image;
  const changeShot = next => { setMediaLoaded(false); setMediaFailed(false); setShot(next); };
  useEffect(() => {
    const previous = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const listener = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = [...ref.current.querySelectorAll('button, a[href], input, select, textarea, iframe')].filter(n => !n.disabled && n.getClientRects().length);
        const first = nodes[0]; const last = nodes.at(-1);
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', listener);
    return () => { document.body.style.overflow = old; window.removeEventListener('keydown', listener); previous?.focus(); };
  }, [onClose]);
  useEffect(() => {
    if (!isVideo) return;
    const timer = setTimeout(() => { if (!mediaLoaded) setMediaFailed(true); }, 14000);
    return () => clearTimeout(timer);
  }, [mediaLoaded, retried, isVideo, embedMedia]);
  return <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <motion.div ref={ref} className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex="-1" initial={enabled ? { y: 45, scale: 0.94, opacity: 0 } : false} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={enabled ? { type: 'spring', stiffness: 260, damping: 26 } : { duration: 0 }}>
      <div className="dialog-heading"><span className="eyebrow">{project.category} {project.year && ` / ${project.year}`}</span><button onClick={onClose} className="icon-button" aria-label="Close"><X/></button></div>
      <div className={`dialog-media ${!isVideo ? 'still' : ''}`}>
        {isVideo ? <>{!mediaLoaded && <div className="media-loading" role="status">{mediaFailed ? <><p>The preview could not load. Open the original to watch it.</p><button className="outline-button" onClick={() => { setMediaFailed(false); setMediaLoaded(false); setRetried(v => v + 1); }}>Try again</button></> : <><span className={enabled ? 'loading-ring' : 'loading-ring paused'}/><p>Loading film…</p></>}</div>}<iframe key={`${embedMedia}-${retried}`} src={embedType === 'youtube' ? `https://www.youtube-nocookie.com/embed/${embedMedia}?autoplay=1&rel=0` : `https://drive.google.com/file/d/${embedMedia}/preview`} title={project.title} width="1280" height="720" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen onLoad={() => { setMediaLoaded(true); setMediaFailed(false); }} onError={() => setMediaFailed(true)}/></> : <MediaImage src={rendered} alt={project.title} priority/>}
      </div>
      {project.type === 'render' && (availableModes.length > 0 || project.renders.length > 1) && <div className="render-controls"><div role="group" aria-label="Frame">{availableModes.map(([mode, label]) => <button key={mode} className={effectiveMode === mode ? 'selected' : ''} onClick={() => setRenderMode(mode)} aria-pressed={effectiveMode === mode}>{label}</button>)}</div>{project.renders.length > 1 && <div className="shot-controls"><button className="icon-button" aria-label="Previous shot" onClick={() => changeShot((shot - 1 + project.renders.length) % project.renders.length)}><ChevronLeft/></button><span>SHOT {shot + 1} / {project.renders.length}</span><button className="icon-button" aria-label="Next shot" onClick={() => changeShot((shot + 1) % project.renders.length)}><ChevronRight/></button></div>}</div>}
      <div className="dialog-description"><div><h2 id="dialog-title">{project.title}</h2>{project.role && <span className="accent">{project.role}</span>}<p>{project.description}</p>{project.tags?.length > 0 && <div className="project-tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>}</div>{sourceUrl && <a className="outline-button" href={sourceUrl} target="_blank" rel="noopener noreferrer">{project.type === 'repo' ? 'View on GitHub' : project.type === 'website' ? 'Visit website' : 'Open original'}<ExternalLink size={15}/></a>}</div>
      {isVideo && <p className="embed-note">If the owner restricts the video, use “Open original”.</p>}
    </motion.div>
  </motion.div>;
}

function App() {
  const reduced = useReducedMotion();
  const [motionOn, setMotionOn] = useState(() => { try { return localStorage.getItem('vs-motion') !== 'off'; } catch { return true; } });
  const enabled = motionOn && !reduced;
  const [project, setProject] = useState(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 28, restDelta: 0.001 });
  useEffect(() => { document.documentElement.dataset.motion = enabled ? 'on' : 'off'; }, [enabled]);
  const toggle = () => { setMotionOn(!motionOn); try { localStorage.setItem('vs-motion', motionOn ? 'off' : 'on'); } catch {} };
  const close = React.useCallback(() => setProject(null), []);
  useClickSound();
  return <MotionContext.Provider value={enabled}>
    <MotionConfig reducedMotion={enabled ? 'user' : 'always'} transition={{ ease: EASE }}>
      <Aurora/>
      <CursorGlow/>
      <a className="skip-link" href="#portfolio">Skip to work</a>
      <motion.div className="reading-progress" style={{ scaleX: enabled ? progress : scrollYProgress }}/>
      <Header enabled={enabled} onToggle={toggle}/>
      <GithubFloat/>
      <main>
        <Hero onProject={setProject}/>
        <Ticker/>
        <Portfolio onProject={setProject}/>
        <Signal/>
        <Capabilities onProject={setProject}/>
        <Breakdown/>
        <About/>
        <Pipeline/>
        <CredentialsRail onProject={setProject}/>
        <Spotlight/>
        <Journey onProject={setProject}/>
        <OpenToWork/>
        <Contact onProject={setProject}/>
      </main>
      <footer className="footer">
        <a className="wordmark" href="#home" aria-label="Vipul Sontakke, back to top">VS<span>✦</span></a>
        <span>© 2026 VIPUL AJAY SONTAKKE. SECURE. OBSERVABLE. NEVER WASTEFUL.</span>
        <div>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" aria-label="GitHub, vipulsontakke"><Github size={17}/></a>
          <a href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`}><Mail size={17}/></a>
          <a href="#home" aria-label="Back to top"><ArrowUpRight size={18}/></a>
        </div>
      </footer>
      <AnimatePresence>{project && <ProjectDialog key={project.title} project={project} onClose={close}/>}</AnimatePresence>
    </MotionConfig>
  </MotionContext.Provider>;
}

createRoot(document.getElementById('root')).render(<App/>);
