import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useMotionValue, useVelocity, useSpring, useTransform, useAnimationFrame, useInView } from 'framer-motion';
import { ArrowUpRight, ArrowRight, Github, ScanLine, Zap, Boxes, Timer, Cloud, ShieldCheck, Workflow, CircleDollarSign, Server, Sparkles, Plus, Minus } from 'lucide-react';
import archive from './data/projects.json';
import { MotionContext, EASE } from './shared.js';
import './extras.css';

const findProject = title => archive.find(p => p.title === title);
const GITHUB = 'https://github.com/vipulsontakke';
const EMAIL = 'sontakke.vipul@gmail.com';

// Same entrance as the kit's Reveal (y 32, blur 8px, 0.75s), so new sections feel native.
function Rise({ children, className = '', delay = 0, as = 'div', ...props }) {
  const enabled = useContext(MotionContext);
  const Component = motion[as];
  return <Component className={className} initial={enabled ? { opacity: 0, y: 32, filter: 'blur(8px)' } : false} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: false, amount: 0.12 }} transition={{ duration: enabled ? 0.75 : 0, delay, ease: EASE }} {...props}>{children}</Component>;
}

function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const on = () => setMatch(list.matches);
    on();
    list.addEventListener('change', on);
    return () => list.removeEventListener('change', on);
  }, [query]);
  return match;
}

/* ── One engineer, three pillars (pinned; a type composition per chapter, all real text) ── */
// Each row mixes formats: o = outline, g = gradient, s = solid, i = serif italic, m = mono label, p = pill.
const chapters = [
  { num: '01', prefix: 'Multi-account cloud', word: 'OPERATIONS', text: 'EC2, S3, RDS, VPC, CloudWatch, IAM — daily operations across multi-account environments.',
    type: [[['m', '// 30+ AWS ACCOUNTS'], ['o', 'EC2']], [['g', 'VPC'], ['i', '& storage,']], [['p', 'CLOUDWATCH'], ['p', 'IAM'], ['s', 'S3']], [['i', 'every day,'], ['o', 'RDS']], [['m', 'PRODUCTION + NON-PRODUCTION']]] },
  { num: '02', prefix: 'Infrastructure as', word: 'CODE', text: 'Terraform across 15+ repositories. Automated, version-controlled, auditable infrastructure.',
    type: [[['m', '// 15+ REPOSITORIES'], ['i', 'written, not clicked']], [['o', 'TERRA'], ['g', 'FORM']], [['p', 'AUTOMATED'], ['p', 'VERSION-CONTROLLED'], ['p', 'AUDITABLE']], [['s', 'AS CODE'], ['i', 'by default']], [['m', 'PLAN → APPLY']]] },
  { num: '03', prefix: 'Cost control with', word: 'FINOPS', text: 'Cost control in non-production environments through scheduling, rightsizing, and savings plans.',
    type: [[['m', '// NON-PRODUCTION']], [['g', 'FINOPS'], ['i', '& savings,']], [['o', 'RIGHT'], ['p', 'SIZING']], [['i', 'scheduled,'], ['s', '~60%']], [['m', 'SAVINGS PLANS']]] },
];
const chapterOf = v => (v < 0.36 ? 0 : v < 0.7 ? 1 : 2);

export function Signal() {
  const ref = useRef(null);
  const enabled = useContext(MotionContext);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useEffect(() => { setActive(chapterOf(scrollYProgress.get())); }, []);
  useMotionValueEvent(scrollYProgress, 'change', v => setActive(chapterOf(v)));
  const ch = chapters[active];
  const swap = { initial: enabled ? { opacity: 0, y: 40, filter: 'blur(10px)' } : false, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, exit: enabled ? { opacity: 0, y: -28, filter: 'blur(10px)' } : { opacity: 0, transition: { duration: 0 } } };
  let n = 0;
  return <section id="signal" className="sig" ref={ref} aria-labelledby="signal-title">
    <div className="sig-sticky">
      <div className="sig-type" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={active} className="sig-type-set" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={enabled ? { opacity: 0, transition: { duration: 0.3 } } : { opacity: 0, transition: { duration: 0 } }}>
            <span className="sig-num">{ch.num}</span>
            {ch.type.map((row, r) => <div key={r} className="sig-row">
              {row.map(([kind, text]) => {
                const i = n++;
                return <motion.span key={text} className={`sig-t t-${kind}`} initial={swap.initial} animate={swap.animate} transition={{ duration: enabled ? 0.6 : 0, delay: enabled ? 0.05 + i * 0.05 : 0, ease: EASE }}>{text}</motion.span>;
              })}
            </div>)}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="sig-copy">
        <span className="eyebrow">ONE ENGINEER / THREE PILLARS</span>
        <h2 id="signal-title" className="x-sr">One engineer, three core pillars</h2>
        <ul className="x-sr">{chapters.map(c => <li key={c.num}>{c.prefix} {c.word === 'FINOPS' ? 'FinOps' : c.word.toLowerCase()}. {c.text}</li>)}</ul>
        <div className="sig-stage" aria-hidden="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={active} className="sig-chapter" {...swap} transition={{ duration: enabled ? 0.55 : 0, ease: EASE }}>
              <p className="sig-prefix">{ch.prefix}</p>
              <p className="sig-word display">{ch.word}<span>.</span></p>
              <p className="sig-text">{ch.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="sig-steps" aria-hidden="true">
          {chapters.map((c, i) => <span key={c.num} className={i === active ? 'is-active' : ''}><b>{c.num}</b>{c.word}</span>)}
          <span className="sig-bar"><motion.i style={{ scaleX: scrollYProgress }}/></span>
        </div>
      </div>
    </div>
  </section>;
}

/* ── Skills (bento cards with a pointer spotlight) ── */
const services = [
  { num: '01', icon: Cloud, title: 'AWS Services', text: 'Day-to-day operations across compute, storage, networking and serverless.', tags: ['EC2', 'S3', 'RDS', 'VPC', 'Lambda', 'CloudFront', 'SES', 'EventBridge', 'CloudWatch', 'AWS Backup', 'AWS Organizations', 'AWS Config'], example: 'AWS Projects', link: 'SEE AWS PROJECTS', big: true },
  { num: '02', icon: Workflow, title: 'Automation & IaC', text: 'Infrastructure and operations kept in code: automated, version-controlled and auditable.', tags: ['Terraform', 'CloudFormation', 'Bash', 'Python', 'AWS Lambda', 'Git', 'CI/CD Pipelines', 'Docker'], example: 'Linux Projects', link: 'SEE LINUX PROJECTS', big: true },
  { num: '03', icon: ShieldCheck, title: 'Security & Governance', text: 'IAM governance and least-privilege access across multi-account environments.', tags: ['IAM', 'GuardDuty', 'Security Hub', 'AWS Config', 'CloudTrail', 'KMS', 'SCP Policies', 'Least Privilege'], anchor: '#experience', link: 'SEE THE JOURNEY' },
  { num: '04', icon: CircleDollarSign, title: 'FinOps & Observability', text: 'Scheduling, rightsizing and savings plans, with the monitoring to back them.', tags: ['Cost Explorer', 'Compute Optimizer', 'Savings Plans', 'CloudWatch', 'Power BI', 'Hyperbilling', 'Rightsizing'], anchor: '#finops', link: 'SEE THE SAVINGS' },
  { num: '05', icon: Server, title: 'Systems & Tools', text: 'Linux and Windows server administration, agile delivery and disaster recovery.', tags: ['Linux / RHEL / Ubuntu', 'Windows Server', 'VS Code', 'Jira', 'Agile', 'Disaster Recovery'], anchor: '#portfolio', link: 'SEE THE PROJECTS' },
  { num: '06', icon: Sparkles, title: 'AI & GenAI', text: 'Generative AI on AWS and agentic coding, backed by three AI certifications.', tags: ['AWS Bedrock', 'Prompt Engineering', 'Claude AI', 'Agentic Coding', 'Amazon SageMaker', 'Amazon Q'], anchor: '#credentials', link: 'SEE THE CREDENTIALS' },
];
const spotlight = e => {
  if (e.pointerType !== 'mouse') return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
};

export function Capabilities({ onProject }) {
  return <section id="services" className="cap section-wrap" aria-labelledby="cap-title">
    <Rise className="section-heading"><div><span className="eyebrow">SKILLS & TECH STACK</span><h2 id="cap-title">BUILT TO <span className="accent">scale.</span></h2></div><a className="text-link" href="#contact">LET’S CONNECT<ArrowRight size={21}/></a></Rise>
    <div className="cap-grid cap-six">{services.map((s, i) => {
      const project = s.example ? findProject(s.example) : null;
      const Icon = s.icon;
      return <Rise key={s.num} className={`cap-card ${s.big ? 'big' : ''}`} delay={i * 0.05} onPointerMove={spotlight}>
        <div className="cap-top"><span className="cap-num display">{s.num}</span><span className="cap-icon"><Icon size={19}/></span></div>
        {s.big && project && <div className="cap-media"><img src={project.image} alt="" loading="lazy" width="960" height="600"/></div>}
        <h3>{s.title}</h3>
        <p>{s.text}</p>
        <div className="cap-tags">{s.tags.map(t => <span key={t}>{t}</span>)}</div>
        {project
          ? <button className="cap-link" onClick={() => onProject(project)}>{s.link}<ArrowUpRight size={16}/></button>
          : <a className="cap-link" href={s.anchor}>{s.link}<ArrowUpRight size={16}/></a>}
      </Rise>;
    })}</div>
  </section>;
}

/* ── The automation side (HTML flow diagram, so screenshots and screen readers can see it) ── */
// A general EC2/RDS scheduling pattern on AWS. Edit the stages to match the exact build.
const STAGES = [
  { step: 'RULE', tool: 'Amazon EventBridge', text: 'Schedule rules fire at the start and the end of the working day.' },
  { step: 'TRIGGER', tool: 'AWS Lambda', text: 'A function picks up the event and works out which resources are in scope.' },
  { step: 'ACT', tool: 'Amazon EC2 & RDS', text: 'Non-production instances and databases stop out of hours and start again before work.' },
  { step: 'OBSERVE', tool: 'Amazon CloudWatch', text: 'Logs and metrics record every run, so a missed start or stop gets noticed.' },
  { step: 'GOVERN', tool: 'Terraform + IAM', text: 'Terraform keeps the rules, functions and roles as code; IAM keeps their permissions least-privilege.' },
];

const FLOW = [
  { label: 'EVENTBRIDGE', note: 'rules' },
  { label: 'LAMBDA', note: 'functions' },
  { label: 'EC2 · RDS', note: 'start / stop' },
  { label: 'CLOUDWATCH', note: 'logs + metrics' },
];
const SOURCES = ['WORK HOURS', 'NON-PROD', 'ACCOUNTS'];

function Wire({ dots = 2 }) {
  return <span className="pipe-wire">{Array.from({ length: dots }, (_, i) => <i key={i} style={{ '--d': `${(i / dots) * -2.4}s`, '--at': `${18 + (i * 60) / dots}%` }}/>)}</span>;
}

export function Pipeline() {
  const enabled = useContext(MotionContext);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (!enabled || hold || !inView) return undefined;
    const id = setInterval(() => setActive(a => (a + 1) % STAGES.length), 3600);
    return () => clearInterval(id);
  }, [enabled, hold, inView]);
  const pick = i => { setActive(i); setHold(true); };
  return <section id="pipeline" className="pipe section-wrap" ref={ref} aria-labelledby="pipe-title">
    <Rise className="section-heading"><div><span className="eyebrow">THE AUTOMATION SIDE</span><h2 id="pipe-title">COST THAT <span className="accent">sleeps.</span></h2></div><p className="pipe-intro">The pattern behind scheduling automation: non-production resources that switch off when nobody needs them. Pick a stage to follow a run.</p></Rise>
    <div className="pipe-grid" onPointerEnter={e => { if (e.pointerType === 'mouse') setHold(true); }} onPointerLeave={() => setHold(false)} onFocusCapture={() => setHold(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setHold(false); }}>
      <Rise className={`pipe-stage ${enabled ? 'is-live' : ''}`}>
        <div className="pipe-diagram" aria-hidden="true">
          <div className={`pipe-orch ${active === 4 ? 'is-active' : ''}`} onClick={() => pick(4)}>
            <span className="pipe-mono">05 / GOVERN</span>
            <strong>TERRAFORM · IAM</strong>
            <span className="pipe-mono">as code + least privilege</span>
          </div>
          <div className="pipe-row">
            <div className="pipe-sources"><span className="pipe-mono">SCOPE</span>{SOURCES.map(x => <span key={x} className="pipe-src">{x}</span>)}</div>
            {FLOW.map((n, i) => <React.Fragment key={n.label}>
              <Wire dots={i === 0 ? 3 : 2}/>
              <div className={`pipe-node ${i === active ? 'is-active' : ''} ${active === 4 ? 'is-ctrl' : ''}`} onClick={() => pick(i)}>
                <span className="pipe-mono">0{i + 1}</span>
                <strong>{STAGES[i].step}</strong>
                <span className="pipe-tool">{n.label}</span>
                <span className="pipe-mono pipe-note">{n.note}</span>
              </div>
            </React.Fragment>)}
          </div>
        </div>
        <span className="pipe-legend" aria-hidden="true"><i className="is-data"/>EVENTS<i className="is-control"/>GOVERNANCE</span>
      </Rise>
      <ol className="pipe-list">{STAGES.map((s, i) => <Rise as="li" key={s.step} className={`pipe-item ${i === active ? 'is-active' : ''}`} delay={i * 0.04}>
        <button aria-expanded={i === active} aria-controls={`stage-${i}`} onClick={() => pick(i)}>
          <span className="pipe-step">0{i + 1}</span><span className="pipe-name"><strong>{s.step}</strong><small>{s.tool}</small></span>{i === active ? <Minus size={16}/> : <Plus size={16}/>}
        </button>
        <AnimatePresence initial={false}>{i === active && <motion.div id={`stage-${i}`} className="pipe-detail" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: enabled ? 0.35 : 0, ease: EASE }}><p>{s.text}</p></motion.div>}</AnimatePresence>
      </Rise>)}</ol>
    </div>
  </section>;
}

/* ── Credentials on the shelf (horizontal rail, pinned to the scroll on wide screens) ── */
const credential = (slug, kind, short, title, issuer, description) => ({ type: 'credential', category: kind, short, title, role: issuer, description, image: `./Asset/img/credentials/${slug}.svg` });
const certifications = [
  credential('aws-solutions-architect', 'Certification', 'Solutions Architect — Associate', 'AWS Certified Solutions Architect — Associate', 'Amazon Web Services', 'Industry certification issued by Amazon Web Services.'),
  credential('aws-cloudops-engineer', 'Certification', 'CloudOps Engineer — Associate', 'AWS Certified CloudOps Engineer — Associate', 'Amazon Web Services', 'Industry certification issued by Amazon Web Services.'),
  credential('aws-ai-practitioner', 'Certification', 'AI Practitioner', 'AWS Certified AI Practitioner', 'Amazon Web Services', 'Industry certification issued by Amazon Web Services.'),
  credential('aws-cloud-practitioner', 'Certification', 'Cloud Practitioner', 'AWS Certified Cloud Practitioner', 'Amazon Web Services', 'Industry certification issued by Amazon Web Services.'),
  credential('claude-ccao-f', 'Certification', 'Claude Certified Associate', 'Claude Certified Associate — Foundations / CCAO-F', 'Anthropic', 'Certification issued by Anthropic.'),
  credential('ai4icps', 'Certification', 'AI4ICPS Programme', 'AI4ICPS Certificate Programme', 'IIT Kharagpur', 'Certificate programme from IIT Kharagpur.'),
];
export const awards = [
  credential('tcs-xcelerate', 'Award', 'TCS Xcelerate Award', 'TCS Xcelerate Award', 'Tata Consultancy Services', 'Rank 3 of 40 for AWS technical excellence.'),
  credential('on-the-spot', 'Award', 'On-the-Spot Recognition', 'On-the-Spot Recognition', 'Tata Consultancy Services', 'Awarded within 16 months for client delivery.'),
];
const shelf = [...certifications, ...awards];

export function CredentialsRail({ onProject }) {
  const enabled = useContext(MotionContext);
  const wide = useMedia('(min-width: 801px)');
  const pinned = enabled && wide;
  const ref = useRef(null);
  const viewport = useRef(null);
  const track = useRef(null);
  const overflowRef = useRef(0);
  const [overflow, setOverflow] = useState(0);
  const x = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useEffect(() => {
    if (!pinned) { x.set(0); return undefined; }
    const measure = () => {
      const o = Math.max(0, track.current.offsetWidth - viewport.current.clientWidth);
      overflowRef.current = o;
      setOverflow(o);
      x.set(-scrollYProgress.get() * o);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track.current);
    observer.observe(viewport.current);
    measure();
    return () => observer.disconnect();
  }, [pinned]);
  useMotionValueEvent(scrollYProgress, 'change', v => { if (pinned) x.set(-v * overflowRef.current); });
  return <section id="credentials" ref={ref} className={`agents ${pinned ? 'is-pinned' : 'is-static'}`} style={pinned ? { height: `calc(100vh + ${overflow}px)` } : undefined} aria-labelledby="agents-title">
    <div className="agents-sticky" ref={viewport}>
      <Rise className="section-heading agents-head"><div><span className="eyebrow">CREDENTIALS, CERTIFICATIONS & AWARDS</span><h2 id="agents-title">PROOF THAT <span className="accent">holds up.</span></h2></div><p>Six industry certifications across AWS architecture, operations and AI, and two awards for technical excellence and client delivery at TCS.</p></Rise>
      <div className="agents-window">
        <motion.div className="agents-track" ref={track} style={{ x }} role="list">
          {shelf.map(c => <motion.article className="agent-card" role="listitem" key={c.title} whileHover={enabled ? { y: -6 } : undefined} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
            <button onClick={() => onProject(c)} aria-label={`Open ${c.title}, ${c.role}`}>
              <span className="agent-media"><img src={c.image} alt="" loading="lazy" width="960" height="600" draggable="false"/></span>
              <span className="agent-meta"><span className="agent-tag">{c.category.toUpperCase()}</span><strong>{c.short}</strong><small>{c.category === 'Award' ? c.description : c.role}</small></span>
              <span className="agent-arrow"><ArrowUpRight size={18}/></span>
            </button>
          </motion.article>)}
          <a className="agent-card agent-cta" role="listitem" href={`mailto:${EMAIL}`}>
            <span className="display">LET’S<br/>CONNECT<span className="accent">.</span></span>
            <span className="agent-cta-link">{EMAIL}<ArrowUpRight size={18}/></span>
          </a>
        </motion.div>
      </div>
      <span className="agents-hint" aria-hidden="true">{pinned ? 'KEEP SCROLLING TO MOVE ALONG THE SHELF' : 'SWIPE ALONG THE SHELF'}<ArrowRight size={14}/></span>
    </div>
  </section>;
}

/* ── Spotlight build (a CSS-animated concept phone) ── */
const features = [
  [Zap, 'Serverless', 'Runs on demand, with no servers to patch or keep running.'],
  [Boxes, 'Multi-account', 'Built for an estate that spans many AWS accounts.'],
  [Timer, 'Hours to minutes', 'Audit time reduced from hours to minutes.'],
];
const rings = [['SECURITY', 0.72, '#ff7a59'], ['BACKUP', 0.56, '#ffb38a'], ['COST', 0.38, '#b9a3ff']];

export function Spotlight() {
  const enabled = useContext(MotionContext);
  const phone = useRef(null);
  const live = useInView(phone, { amount: 0.35 });
  return <section id="spotlight" className="mac section-wrap" aria-labelledby="mac-title">
    <div className="mac-grid">
      <Rise className="mac-copy">
        <span className="eyebrow">SPOTLIGHT BUILD / TCS, 2024 – PRESENT</span>
        <h2 id="mac-title" className="display">HEALTH<br/>AUDITOR<span className="mac-dot">.</span></h2>
        <p className="mac-lead">A serverless multi-account health auditor that reduced audit time from hours to minutes.</p>
        <ul className="mac-features">{features.map(([Icon, title, text]) => <li key={title}><span className="mac-icon"><Icon size={18}/></span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ul>
      </Rise>
      <Rise className="mac-visual" delay={0.1}>
        <div ref={phone} className={`mac-phone ${live && enabled ? 'is-live' : ''}`} aria-hidden="true">
          <div className="mac-bar"><span>HEALTH AUDIT</span><span className="mac-chip"><ScanLine size={11}/>SCAN</span></div>
          <div className="mac-plate mac-accounts">
            {Array.from({ length: 12 }, (_, i) => <span key={i} className="mac-acct"><i/><i/></span>)}
            <span className="mac-box b1"><em>IAM</em></span><span className="mac-box b2"><em>BACKUP</em></span><span className="mac-box b3"><em>COST</em></span>
            <span className="mac-scan"/>
          </div>
          <div className="mac-rings">{rings.map(([label, value, color], i) => <div key={label} className="mac-ring">
            <svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" className="track"/><circle cx="22" cy="22" r="18" className="fill" style={{ '--v': value, '--c': color, '--d': `${i * 0.2}s` }}/></svg>
            <span>{label}</span>
          </div>)}</div>
          <div className="mac-tabs"><span className="is-on">SCAN</span><span>REPORT</span><span>ACCOUNTS</span></div>
        </div>
        <span className="mac-caption">CONCEPT ILLUSTRATION, NOT A SCREENSHOT</span>
      </Rise>
    </div>
  </section>;
}

/* ── Open to work (scroll-velocity marquee) ── */
const wrap = (min, max, v) => { const r = max - min; return ((((v - min) % r) + r) % r) + min; };

function MarqueeRow({ text, base, className }) {
  const enabled = useContext(MotionContext);
  const ref = useRef(null);
  const inView = useInView(ref);
  const x = useMotionValue(0);
  const direction = useRef(1);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1200], [0, 4], { clamp: false });
  const xPercent = useTransform(x, v => `${v}%`);
  useAnimationFrame((_, delta) => {
    if (!enabled || !inView) return;
    const f = factor.get();
    if (f < 0) direction.current = -1; else if (f > 0) direction.current = 1;
    let move = direction.current * base * (Math.min(delta, 50) / 1000);
    move += direction.current * move * f;
    x.set(wrap(-50, 0, x.get() + move));
  });
  return <div className={`bip-row ${className}`} ref={ref} aria-hidden="true">
    <motion.div className="bip-track" style={{ x: xPercent }}>{[0, 1].map(k => <span key={k}>{text}</span>)}</motion.div>
  </div>;
}

export function OpenToWork() {
  return <section id="build" className="bip" aria-labelledby="bip-title">
    <MarqueeRow className="is-fill" base={-2} text="OPEN TO WORK ✦ AWS CLOUD ENGINEER ✦ CLOUDOPS ✦ INFRASTRUCTURE ✦ OPEN TO WORK ✦ AWS CLOUD ENGINEER ✦ CLOUDOPS ✦ INFRASTRUCTURE ✦ "/>
    <MarqueeRow className="is-outline" base={2.4} text="EC2 ✦ IAM ✦ TERRAFORM ✦ LAMBDA ✦ CLOUDWATCH ✦ FINOPS ✦ EC2 ✦ IAM ✦ TERRAFORM ✦ LAMBDA ✦ CLOUDWATCH ✦ FINOPS ✦ "/>
    <Rise className="bip-foot">
      <h2 id="bip-title" className="x-sr">Open to AWS Cloud Engineer, CloudOps and Infrastructure roles</h2>
      <p>Open to AWS Cloud Engineer, CloudOps, and Infrastructure roles. The AWS, Linux and Python projects behind the work are on GitHub.</p>
      <a className="solid-button bip-cta" href={GITHUB} target="_blank" rel="noopener noreferrer"><Github size={18}/>GITHUB / VIPULSONTAKKE<ArrowUpRight size={18}/></a>
    </Rise>
  </section>;
}
