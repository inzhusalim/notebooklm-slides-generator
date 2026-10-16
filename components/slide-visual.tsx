'use client';

import { BrainCircuit, Building2, Check, Compass, GraduationCap, Landmark, Leaf, Lightbulb, Microscope, Orbit, Search, Sparkles, Target } from 'lucide-react';
import { useId, type CSSProperties } from 'react';
import { Slide, TemplateId } from '@/lib/types';
import { concise, visualDomain, visualKind } from '@/lib/visuals';

const palettes: Record<string, { blue: string; coral: string; lime: string; mint: string; paper: string }> = {
  ai: { blue: '#687de4', coral: '#ed795b', lime: '#d9e64b', mint: '#83c7ad', paper: '#d9e8da' },
  education: { blue: '#647ee0', coral: '#f09a72', lime: '#e2e64d', mint: '#7fc5aa', paper: '#d5e8d8' },
  nature: { blue: '#587f74', coral: '#ee875d', lime: '#d4df4f', mint: '#79bc91', paper: '#dce8c8' },
  space: { blue: '#707fe2', coral: '#f39872', lime: '#dce64d', mint: '#7bc3bd', paper: '#d9e2ec' },
  business: { blue: '#607bda', coral: '#ed835f', lime: '#dce354', mint: '#75bda7', paper: '#e5e3cb' },
  biology: { blue: '#687ddd', coral: '#e98660', lime: '#d6e74e', mint: '#79c5a2', paper: '#dce9cd' },
  history: { blue: '#6579d8', coral: '#df775b', lime: '#d7df58', mint: '#77b4a5', paper: '#e7dfcb' },
  general: { blue: '#657be0', coral: '#eb805f', lime: '#dbe54e', mint: '#7dc4ad', paper: '#dfe6d6' },
};

const nodesByType = {
  title: [{ x: 102, y: 304 }, { x: 300, y: 166 }, { x: 500, y: 304 }],
  insights: [{ x: 100, y: 364 }, { x: 300, y: 132 }, { x: 500, y: 364 }],
  analysis: [{ x: 155, y: 148 }, { x: 445, y: 148 }, { x: 300, y: 395 }],
  timeline: [{ x: 38, y: 370 }, { x: 250, y: 200 }, { x: 510, y: 164 }],
  qa: [],
} as const;
const routeByType = {
  title: 'M35 386C89 344 111 269 178 233s109-57 151-45 91 82 165 98 78-34 106-93',
  insights: 'M300 132C188 139 104 228 100 364M300 132C388 139 491 228 500 364',
  analysis: 'M155 148C213 50 377 44 445 148S393 373 300 395 83 246 155 148Z',
  timeline: 'M38 370C105 440 157 139 250 200S406 409 475 282s70-170 106-118',
  qa: '',
} as const;
const domainIcons = { ai: BrainCircuit, education: GraduationCap, nature: Leaf, space: Orbit, business: Building2, biology: Microscope, history: Landmark, general: Compass };
const pointIcons = [Lightbulb, Search, Target];
const routeIcons = [Compass, Sparkles, Check];
const visualNames = { title: 'ОБЛОЖКА', insights: 'КЛЮЧЕВЫЕ ИДЕИ', analysis: 'СИСТЕМА', timeline: 'МАРШРУТ', qa: 'ВОПРОСЫ' } as const;
const visualNumbers = { title: '01', insights: '02', analysis: '03', timeline: '04', qa: '05' } as const;

export function SlideVisual({ slide, topic, template }: { slide: Slide; topic: string; template: TemplateId }) {
  const domain = visualDomain(topic);
  const kind = visualKind(slide);
  const chartId = useId().replaceAll(':', '');
  const palette = palettes[domain.id] ?? palettes.general;
  const DomainIcon = domainIcons[domain.id as keyof typeof domainIcons] ?? Compass;
  const paletteStyle = {
    '--atlas-blue': palette.blue,
    '--atlas-coral': palette.coral,
    '--atlas-lime': palette.lime,
    '--atlas-mint': palette.mint,
    '--atlas-field': palette.paper,
  } as CSSProperties;
  const labels = slide.items.map((item) => concise(item.title, 28));

  if (kind === 'photo' && slide.visual?.image) {
    return (
      <section className="slide-visual atlas-visual atlas-photo" data-zone="visual" data-kind="photo" style={paletteStyle}>
        <div className="atlas-photo-image" role="img" aria-label={slide.visual.alt || slide.title} style={{ backgroundImage: `url("${slide.visual.image}")` }} />
        <span className="atlas-visual-index">PHOTO / {domain.name}</span>
        <span className="atlas-photo-caption">Иллюстрация к теме исследования</span>
      </section>
    );
  }

  if (kind === 'chart' && slide.visual?.chart) {
    const chart = slide.visual.chart;
    const max = Math.max(...chart.values);
    const ticks = [0, 0.25, 0.5, 0.75, 1];
    return (
      <section className="slide-visual atlas-visual atlas-chart" data-zone="visual" data-kind="chart" style={paletteStyle}>
        <span className="atlas-visual-index">ДАННЫЕ / СРАВНЕНИЕ</span>
        <svg className="atlas-data-chart" viewBox="0 0 600 500" role="img" aria-label={chart.labels.map((label, i) => `${label}: ${chart.values[i]}`).join('; ')}>
          <defs><pattern id={`atlas-grid-${chartId}`} width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#53685a" strokeOpacity=".12" strokeWidth="1" /></pattern></defs>
          <rect x="0" y="0" width="600" height="500" fill={`url(#atlas-grid-${chartId})`} />
          {ticks.map((tick) => <g key={tick}><line x1="90" x2="560" y1={390 - tick * 290} y2={390 - tick * 290} stroke="#445e50" opacity=".23" strokeDasharray="3 5" /><text x="75" y={395 - tick * 290} textAnchor="end" fontSize="13" fill="#445e50" opacity=".72">{new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 }).format(max * tick)}</text></g>)}
          {chart.values.map((value, i) => <g key={i}><rect x={127 + i * 150} y={390 - value / max * 290} width="78" height={value / max * 290} rx="13" fill={[palette.blue, palette.coral, palette.mint][i]} /><circle cx={166 + i * 150} cy={390 - value / max * 290} r="5" fill={palette.lime} /><text x={166 + i * 150} y={375 - value / max * 290} textAnchor="middle" fill="#263b30" fontSize="17" fontWeight="700">{new Intl.NumberFormat('ru-RU').format(value)}</text><text x={166 + i * 150} y="423" textAnchor="middle" fill="#344b3f" fontSize="12">{concise(chart.labels[i], 18)}</text></g>)}
        </svg>
        <span className="atlas-chart-source">ИСТОЧНИК · {chart.source}</span>
        <span className="atlas-chart-note">цифры<br />из источника</span>
      </section>
    );
  }

  return (
    <section className={`slide-visual atlas-visual atlas-art atlas-art-${slide.type} atlas-style-${template} domain-${domain.id}`} data-zone="visual" data-kind={kind} style={paletteStyle}>
      <svg className="atlas-contours" viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-20 152C72 99 130 101 194 159s121 67 192 16 137-69 236-37M-25 193c97-55 149-52 219 7s122 63 190 15 136-64 235-35M-26 235c97-52 147-48 215 8s122 62 190 16 137-61 239-32M-15 352c94 45 163 42 230-13s131-64 192-19 110 69 212 30" />
        <path d="M47 22c19 45 20 80-8 118m151 195c28-39 61-55 104-50m156-225c-5 40 9 65 47 84m32 203c11-38 32-54 70-57" />
      </svg>
      <div className="atlas-visual-index"><span>{visualNames[slide.type]} / {visualNumbers[slide.type]}</span><span>{domain.name}</span></div>
      <svg className={`atlas-route atlas-route-${slide.type}`} viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true">
        {routeByType[slide.type] && <><path className="atlas-route-shadow" d={routeByType[slide.type]} /><path className="atlas-route-line" d={routeByType[slide.type]} />{nodesByType[slide.type].map((node, index) => <g key={index} transform={`translate(${node.x} ${node.y})`}><circle className={`atlas-map-node node-${index}`} r={index === 1 ? 24 : 19} /><path d="M-8 0h16M0-8v16" stroke="#263b30" strokeWidth="2" strokeLinecap="round" /></g>)}</>}
      </svg>

      {slide.type === 'analysis' && <div className="atlas-map-hub"><DomainIcon /><span>ЦЕНТР ИДЕИ</span></div>}
      {slide.type === 'insights' && <div className="atlas-map-hub atlas-insight-hub"><DomainIcon /><span>ТЕМА</span></div>}
      {slide.type === 'qa' ? (
        <div className="atlas-question-stack">{labels.map((label, index) => { const Icon = pointIcons[index]; return <article className={`atlas-question-card card-${index}`} key={label}><span className="atlas-card-index">ВОПРОС / 0{index + 1}</span><Icon /><strong>{label}</strong><span className="atlas-card-mark">?</span></article>; })}</div>
      ) : (
        <div className={`atlas-labels atlas-labels-${slide.type}`}>{labels.map((label, index) => { const Icon = slide.type === 'timeline' ? routeIcons[index] : pointIcons[index]; return <article className={`atlas-label-chip chip-${index}`} key={label}><span className="atlas-label-index">0{index + 1}</span><Icon aria-hidden="true" /><strong>{label}</strong></article>; })}</div>
      )}

      <span className="atlas-margin-note note-top">НАБЛЮДАТЬ ↗</span>
      <span className="atlas-margin-note note-bottom">СВЯЗИ / {template === 'executive' ? 'МАРШРУТ' : 'КОНТЕКСТ'}</span>
      <span className="atlas-visual-source">КАРТОГРАФИЯ ИДЕЙ · ЛИСТ 0{slide.type === 'title' ? 1 : slide.type === 'insights' ? 2 : slide.type === 'analysis' ? 3 : slide.type === 'timeline' ? 4 : 5}</span>
    </section>
  );
}
