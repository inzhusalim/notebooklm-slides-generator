'use client';
import { Slide, Theme, TemplateId } from '@/lib/types';
import { SlideVisual } from './slide-visual';
import { concise } from '@/lib/visuals';
type Props = { slide: Slide; theme: Theme; index: number; total: number; onEdit?: (field: string, value: string) => void; miniature?: boolean; template?: TemplateId; topic?: string };
export function SlideCanvas({ slide, theme, index, total, onEdit, miniature = false, template = 'research', topic = slide.title }: Props) {
  const text = (value: string, field: string, max: number) => onEdit && !miniature ? <span className="editable" contentEditable="plaintext-only" suppressContentEditableWarning role="textbox" aria-label={`Редактировать: ${field}`} onBlur={e => { const next = (e.currentTarget.textContent || '').trim().slice(0, max); e.currentTarget.textContent = next || value; if (next && next !== value) onEdit(field, next); }}>{value}</span> : <span>{value}</span>;
  const long = slide.title.length > 95 ? 'very-long-title' : slide.title.length > 65 ? 'long-title' : '';
  return <article className={`slide visual-slide slide-${slide.type} layout-${template} theme-${theme} ${long} ${miniature ? 'miniature' : ''}`} data-layout-ratio="60/40" aria-label={`Слайд ${index + 1}: ${slide.title}`}>
    <SlideVisual slide={slide} topic={topic} template={template}/>
    <div className="slide-copy" data-zone="text">
      <div className="slide-topline"><span>SLIDEBOOK / {text(slide.eyebrow,'eyebrow',50)}</span><span>{String(index+1).padStart(2,'0')}</span></div>
      <div className="slide-copy-heading"><div className="copy-eyebrow">{slide.type === 'title' ? 'ОТ ИДЕИ К ОБРАЗУ' : {insights:'СОЕДИНЯЕМ ГЛАВНОЕ',analysis:'ВИДЕТЬ И ПОНИМАТЬ',timeline:'МАРШРУТ ИДЕИ',qa:'УВИДЕТЬ. ЗАПОМНИТЬ.'}[slide.type]}</div>{slide.type === 'title' ? <h1>{text(slide.title,'title',180)}</h1> : <h2>{text(slide.title,'title',95)}</h2>}<p className="slide-intro">{text(concise(slide.subtitle,115),'subtitle',115)}</p></div>
      {slide.type === 'title' ? <div className="cover-details"><div className="cover-rule"/><p>{text(concise(slide.takeaway,115),'takeaway',115)}</p><div className="slide-tags">{slide.tags.slice(0,3).map((t,i) => <span key={i}>{text(t,`tags.${i}`,35)}</span>)}</div></div> : <div className="copy-points">{slide.items.map((item,i) => <section key={i}><span className="copy-point-number">0{i+1}</span><div><h3>{text(concise(item.title,46),`items.${i}.title`,46)}</h3><p>{text(concise(item.body,110),`items.${i}.body`,110)}</p></div></section>)}</div>}
      <footer className="slide-footer"><span>{template === 'study' ? 'Увидеть — значит понять.' : 'Идеи, которые видно.'}</span><span>{String(index+1).padStart(2,'0')} <i>/</i> {String(total).padStart(2,'0')}</span></footer>
    </div>
  </article>;
}
