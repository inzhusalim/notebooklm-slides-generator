export const templates = [
  { id: 'research', name: 'Research Overview', description: 'Контекст, открытия и перспективы', icon: 'research', color: 'blue' },
  { id: 'deep', name: 'Deep Dive', description: 'Механизмы, детали и взаимосвязи', icon: 'deep', color: 'purple' },
  { id: 'executive', name: 'Executive Summary', description: 'Главное для принятия решений', icon: 'executive', color: 'green' },
  { id: 'study', name: 'Study Guide', description: 'Понятия, вопросы и самопроверка', icon: 'study', color: 'peach' },
] as const;
export type TemplateId = typeof templates[number]['id'];
export type SlideType = 'title' | 'insights' | 'analysis' | 'timeline' | 'qa';
export type Theme = 'light' | 'pastel' | 'dark';
export type SlideItem = { title: string; body: string };
export type Slide = { id: string; type: SlideType; eyebrow: string; title: string; subtitle: string; items: SlideItem[]; takeaway: string; tags: string[] };
export type Deck = { topic: string; template: TemplateId; slides: Slide[]; mode: 'local' | 'ai'; createdAt: string };
export const slideLabels: Record<SlideType, string> = { title: 'Титульный слайд', insights: 'Ключевые идеи', analysis: 'Глубокий разбор', timeline: 'Структура и этапы', qa: 'Вопросы и ответы' };

export function isDeck(value: unknown): value is Deck {
  if (!value || typeof value !== 'object') return false;
  const d = value as Deck;
  return typeof d.topic === 'string' && d.topic.length <= 240 && templates.some(t => t.id === d.template) &&
    (d.mode === 'local' || d.mode === 'ai') && typeof d.createdAt === 'string' && Array.isArray(d.slides) && d.slides.length >= 5 && d.slides.length <= 12 &&
    d.slides.every(s => s && typeof s.id === 'string' && ['title', 'insights', 'analysis', 'timeline', 'qa'].includes(s.type) &&
      ['eyebrow', 'title', 'subtitle', 'takeaway'].every(k => typeof s[k as keyof Slide] === 'string' && (s[k as keyof Slide] as string).length <= 1000) &&
      Array.isArray(s.tags) && s.tags.length <= 4 && s.tags.every(t => typeof t === 'string' && t.length <= 80) &&
      Array.isArray(s.items) && s.items.length === 3 && s.items.every(i => typeof i.title === 'string' && i.title.length <= 180 && typeof i.body === 'string' && i.body.length <= 650));
}
