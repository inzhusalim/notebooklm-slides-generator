export const templates = [
  { id: 'research', name: 'Visual Story', description: 'Иллюстрация на весь рост + история', icon: 'research', color: 'blue' },
  { id: 'deep', name: 'Visual Explainer', description: 'Наглядная схема + короткое объяснение', icon: 'deep', color: 'purple' },
  { id: 'executive', name: 'Visual Brief', description: 'Панорамный визуал + три тезиса', icon: 'executive', color: 'green' },
  { id: 'study', name: 'Visual Cards', description: 'Образ, связи и карточки для запоминания', icon: 'study', color: 'peach' },
] as const;
export type TemplateId = typeof templates[number]['id'];
export type SlideType = 'title' | 'insights' | 'analysis' | 'timeline' | 'qa';
export type Theme = 'light' | 'pastel' | 'dark';
export type SlideItem = { title: string; body: string };
export type SlideVisual = { kind: 'illustration' | 'diagram' | 'chart' | 'photo'; image?: string; alt?: string; chart?: { labels: string[]; values: number[]; source: string } };
export type Slide = { id: string; type: SlideType; eyebrow: string; title: string; subtitle: string; items: SlideItem[]; takeaway: string; tags: string[]; visual?: SlideVisual; notes?: string };
export type Deck = { topic: string; template: TemplateId; slides: Slide[]; mode: 'local' | 'ai'; createdAt: string };
export const slideLabels: Record<SlideType, string> = { title: 'Визуальная обложка', insights: 'Карта ключевых идей', analysis: 'Объясняющая схема', timeline: 'Маршрут и этапы', qa: 'Учебные карточки' };

export function isVisual(value: unknown): value is SlideVisual {
  if (!value || typeof value !== 'object') return false;
  const v = value as SlideVisual;
  if (!['illustration', 'diagram', 'chart', 'photo'].includes(v.kind)) return false;
  if (v.alt !== undefined && (typeof v.alt !== 'string' || v.alt.length > 240)) return false;
  if (v.image !== undefined && (typeof v.image !== 'string' || v.image.length > 2000000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v.image))) return false;
  if (v.kind === 'photo' && !v.image) return false;
  if (v.kind === 'chart') {
    const c = v.chart;
    if (!c || !Array.isArray(c.labels) || !Array.isArray(c.values) || c.labels.length !== 3 || c.values.length !== 3 || !c.labels.every(x => typeof x === 'string' && x.length > 0 && x.length <= 45) || !c.values.every(x => Number.isFinite(x) && x >= 0 && x <= 1e12) || !c.values.some(x => x > 0) || typeof c.source !== 'string' || c.source.trim().length < 3 || c.source.length > 200) return false;
  }
  return true;
}
export function isDeck(value: unknown): value is Deck {
  if (!value || typeof value !== 'object') return false;
  const d = value as Deck;
  return typeof d.topic === 'string' && d.topic.length <= 240 && templates.some(t => t.id === d.template) &&
    (d.mode === 'local' || d.mode === 'ai') && typeof d.createdAt === 'string' && Array.isArray(d.slides) && d.slides.length >= 5 && d.slides.length <= 12 &&
    d.slides.every(s => s && typeof s.id === 'string' && ['title', 'insights', 'analysis', 'timeline', 'qa'].includes(s.type) &&
      ['eyebrow', 'title', 'subtitle', 'takeaway'].every(k => typeof s[k as keyof Slide] === 'string' && (s[k as keyof Slide] as string).length <= 1000) &&
      Array.isArray(s.tags) && s.tags.length <= 4 && s.tags.every(t => typeof t === 'string' && t.length <= 80) &&
      Array.isArray(s.items) && s.items.length === 3 && s.items.every(i => i && typeof i.title === 'string' && i.title.length <= 180 && typeof i.body === 'string' && i.body.length <= 650) &&
      (s.notes === undefined || (typeof s.notes === 'string' && s.notes.length <= 12000)) && (s.visual === undefined || isVisual(s.visual)));
}
