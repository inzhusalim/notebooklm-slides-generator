'use client';
import { BookOpen, BrainCircuit, Check, Compass, Leaf, Lightbulb, Search, Sparkles, Target } from 'lucide-react';
import { useId } from 'react';
import { Slide, TemplateId } from '@/lib/types';
import { atlas, concise, visualDomain, visualKind } from '@/lib/visuals';
const nodeIcons = [Lightbulb, Search, Target];
export function SlideVisual({ slide, topic, template }: { slide: Slide; topic: string; template: TemplateId }) {
  const domain = visualDomain(topic);
  const kind = visualKind(slide);
  const markerId = useId().replaceAll(':', '');

  const labels = slide.items.map(i => concise(i.title, 32));
  if (kind === 'photo' && slide.visual?.image) return <section className="slide-visual photo-visual" data-zone="visual" data-kind="photo"><div className="uploaded-photo" role="img" aria-label={slide.visual.alt || slide.title} style={{ backgroundImage: `url("${slide.visual.image}")` }}/><div className="visual-corner-label">SLIDEBOOK / PHOTO</div></section>;
  if (kind === 'chart' && slide.visual?.chart) {
    const c = slide.visual.chart; const max = Math.max(...c.values);
    const ticks = [0, .25, .5, .75, 1];
    return <section className="slide-visual quantitative-visual" data-zone="visual" data-kind="chart"><div className="chart-label">ДАННЫЕ / СРАВНЕНИЕ</div><svg className="data-chart" viewBox="0 0 600 500" role="img" aria-label={c.labels.map((x,i) => `${x}: ${c.values[i]}`).join('; ')}>{ticks.map(t => <g key={t}><line x1="90" x2="560" y1={390-t*290} y2={390-t*290} stroke="currentColor" opacity=".12"/><text x="75" y={395-t*290} textAnchor="end" fontSize="13" fill="currentColor" opacity=".55">{new Intl.NumberFormat('ru-RU',{notation:'compact',maximumFractionDigits:1}).format(max*t)}</text></g>)}{c.values.map((value,i) => <g key={i}><rect x={127+i*150} y={390-value/max*290} width="78" height={value/max*290} rx="8" fill={['#83a7db','#8cab7c','#ce9f86'][i]}/><text x={166+i*150} y={375-value/max*290} textAnchor="middle" fill="currentColor" fontSize="19">{new Intl.NumberFormat('ru-RU').format(value)}</text><text x={166+i*150} y="423" textAnchor="middle" fill="currentColor" fontSize="12">{concise(c.labels[i],20)}</text></g>)}</svg><div className="chart-source">Источник: {c.source}</div></section>;
  }
  return <section className={`slide-visual visual-${slide.type} domain-${domain.id} ${kind === 'illustration' ? 'art-only' : 'with-diagram'}`} data-zone="visual" data-kind={kind}>
    <svg className="editorial-art" role="img" aria-label={`Тематическая иллюстрация: ${domain.name}`} viewBox={`${domain.x*512} ${domain.y*512} 512 512`} preserveAspectRatio="xMidYMid slice"><image href={atlas} width="2048" height="1024"/></svg>
    <div className="visual-wash"/><div className="visual-corner-label"><span>SLIDEBOOK</span><span>VISUAL SERIES / 0{domain.x + domain.y*4 + 1}</span></div>
    {kind === 'diagram' && slide.type === 'insights' && <div className="concept-map"><svg viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true"><path d="M300 120 C145 130 110 270 105 365 M300 120 C330 230 300 260 300 365 M300 120 C455 130 500 270 495 365" fill="none" stroke="white" strokeWidth="3" strokeDasharray="5 9"/></svg><div className="map-hub"><BrainCircuit/><span>Главная идея</span></div>{labels.map((label,i) => { const Icon=nodeIcons[i]; return <div className={`map-node node-${i}`} key={i}><span className="node-illustration"><Icon/></span><strong>{label}</strong></div>; })}</div>}
    {kind === 'diagram' && slide.type === 'analysis' && <div className="system-map"><div className="system-ring ring-a"/><div className="system-ring ring-b"/><div className="system-core"><Compass/><span>Как это<br/>работает</span></div>{labels.map((label,i) => { const Icon=nodeIcons[i];return <div className={`system-node system-${i}`} key={i}><span><Icon/></span><strong>{label}</strong></div>; })}<svg viewBox="0 0 600 500" aria-hidden="true"><defs><marker id={markerId} markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="none" stroke="#f8fbef"/></marker></defs><path d="M160 145 Q300 20 450 145 M475 220 Q500 370 325 410 M230 395 Q70 350 120 235" fill="none" stroke="#f8fbef" strokeWidth="3" markerEnd={`url(#${markerId})`}/></svg></div>}
    {kind === 'diagram' && slide.type === 'timeline' && <div className="visual-route"><svg viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true"><path d="M85 355 C160 430 220 120 300 210 S450 420 520 150" fill="none" stroke="#f6f8ee" strokeWidth="5" strokeDasharray="8 10"/></svg>{labels.map((label,i) => <div className={`route-stop stop-${i}`} key={i}><div className="route-circle">{[<Leaf key="leaf"/>,<Compass key="compass"/>,<Check key="check"/>][i]}</div><span className="route-count">0{i+1}</span><strong>{label}</strong></div>)}</div>}
    {kind === 'diagram' && slide.type === 'qa' && <div className="study-stack">{labels.map((label,i) => <div className={`study-flashcard flashcard-${i}`} key={i}><span className="flash-number">0{i+1}</span><span className="flash-symbol">{i === 0 ? <BookOpen/> : i === 1 ? <BrainCircuit/> : <Sparkles/>}</span><strong>{label}</strong><span className="flash-corner">?</span></div>)}</div>}
    <div className="visual-bottom-label"><span>{domain.name}</span><span>{template === 'executive' ? 'THE BIG PICTURE' : 'EXPLORE · CONNECT · UNDERSTAND'}</span></div>
  </section>;
}
