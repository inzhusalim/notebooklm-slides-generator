'use client';

import { Slide, Theme, TemplateId } from '@/lib/types';
import { SlideVisual } from './slide-visual';
import { concise } from '@/lib/visuals';

type Props = {
  slide: Slide;
  theme: Theme;
  index: number;
  total: number;
  onEdit?: (field: string, value: string) => void;
  miniature?: boolean;
  template?: TemplateId;
  topic?: string;
};

const subtitles = {
  title: 'ОТКРЫТИЕ АТЛАСА',
  insights: 'СЛОИ И НАБЛЮДЕНИЯ',
  analysis: 'КАК УСТРОЕНА СИСТЕМА',
  timeline: 'МАРШРУТ ИЗМЕНЕНИЙ',
  qa: 'ВОПРОСЫ ДЛЯ ИССЛЕДОВАТЕЛЯ',
} as const;

export function SlideCanvas({ slide, theme, index, total, onEdit, miniature = false, template = 'research', topic = slide.title }: Props) {
  const text = (value: string, field: string, max: number) => onEdit && !miniature
    ? <span className="editable" contentEditable="plaintext-only" suppressContentEditableWarning role="textbox" aria-label={`Редактировать: ${field}`} onBlur={event => { const next = (event.currentTarget.textContent || '').trim().slice(0, max); event.currentTarget.textContent = next || value; if (next && next !== value) onEdit(field, next); }}>{value}</span>
    : <span>{value}</span>;
  const long = slide.title.length > 95 ? 'very-long-title' : slide.title.length > 65 ? 'long-title' : '';

  return (
    <article className={`slide atlas-slide atlas-layout-${template} slide-${slide.type} theme-${theme} ${long} ${miniature ? 'miniature' : ''}`} data-layout-ratio="60/40" data-slide-type={slide.type} aria-label={`Слайд ${index + 1}: ${slide.title}`}>
      <SlideVisual slide={slide} topic={topic} template={template} />
      <div className="slide-copy atlas-copy" data-zone="text">
        <div className="slide-topline atlas-topline"><span><i /> FIELD NOTES / {text(slide.eyebrow, 'eyebrow', 50)}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
        <div className="slide-copy-heading atlas-copy-heading">
          <div className="copy-eyebrow atlas-copy-eyebrow"><span>{subtitles[slide.type]}</span><span className="atlas-pin">✳</span></div>
          {slide.type === 'title' ? <h1>{text(slide.title, 'title', 180)}</h1> : <h2>{text(slide.title, 'title', 95)}</h2>}
          <p className="slide-intro atlas-intro">{text(concise(slide.subtitle, 115), 'subtitle', 115)}</p>
        </div>
        {slide.type === 'title' ? (
          <div className="cover-details atlas-cover-details"><span className="atlas-rule" /><p>{text(concise(slide.takeaway, 115), 'takeaway', 115)}</p><div className="slide-tags atlas-tags">{slide.tags.slice(0, 3).map((tag, i) => <span key={i}>{text(tag, `tags.${i}`, 35)}</span>)}</div></div>
        ) : (
          <div className="copy-points atlas-points">{slide.items.map((item, i) => <section key={i}><span className="copy-point-number atlas-point-number">0{i + 1}</span><div><h3>{text(concise(item.title, 46), `items.${i}.title`, 46)}</h3><p>{text(concise(item.body, 110), `items.${i}.body`, 110)}</p></div></section>)}</div>
        )}
        <footer className="slide-footer atlas-footer"><span>{template === 'study' ? 'Заметка на полях / продолжить исследование' : 'Карта темы / ориентиры для чтения'}</span><span>{String(index + 1).padStart(2, '0')} <i>/</i> {String(total).padStart(2, '0')}</span></footer>
      </div>
    </article>
  );
}
