import { Deck, Slide } from './types';
export const VISUAL_RATIO = 0.6;
export const TEXT_RATIO = 0.4;
const domains = [
  { id: 'ai', match: /искусственн|нейросет|машинн|\bai\b|artificial|llm|gpt/i, name: 'Искусственный интеллект', x: 0, y: 0 },
  { id: 'education', match: /образован|обучени|педагог|учеб|education|learning|study/i, name: 'Обучение и развитие', x: 1, y: 0 },
  { id: 'nature', match: /климат|эколог|устойчив|climate|sustainab|энергетик|природ/i, name: 'Природные системы', x: 2, y: 0 },
  { id: 'space', match: /космос|вселен|астроном|планет|марс|space|universe|astronom/i, name: 'Космос и исследование', x: 3, y: 0 },
  { id: 'business', match: /бизнес|стартап|предприним|маркетинг|продукт|startup|business|product|стратеги|экономик/i, name: 'Стратегия и решения', x: 0, y: 1 },
  { id: 'biology', match: /фотосинтез|растени|биолог|экосистем|клетк|photosynth|biology|plant/i, name: 'Биология и жизнь', x: 1, y: 1 },
  { id: 'history', match: /истори|революц|цивилизац|импери|history|histor/i, name: 'История и контекст', x: 2, y: 1 },
  { id: 'general', match: /.*/, name: 'Исследование и идеи', x: 3, y: 1 },
];
export function visualDomain(topic: string) { return domains.find(d => d.match.test(topic))!; }
export function concise(text: string, limit: number) {
  if (text.length <= limit) return text;
  const sentence = text.match(/^.*?[.!?](?:\s|$)/)?.[0].trim();
  if (sentence && sentence.length <= limit) return sentence;
  const part = text.slice(0, limit - 1);
  return part.slice(0, part.lastIndexOf(' ') > limit * .55 ? part.lastIndexOf(' ') : part.length).replace(/[,;:\s—-]+$/, '') + '…';
}
export function visualKind(slide: Slide) { return slide.visual?.kind || (slide.type === 'title' ? 'illustration' : 'diagram'); }
export function compactDeck(deck: Deck): Deck {
  return { ...deck, slides: deck.slides.map(s => ({
    ...s,
    notes: s.notes ?? [s.title, s.subtitle, ...s.items.map(i => `${i.title}\n${i.body}`), s.takeaway].join('\n\n'),
    subtitle: concise(s.subtitle, 115),
    items: s.items.map(i => ({ title: concise(i.title, 46), body: concise(i.body, 110) })),
    takeaway: concise(s.takeaway, 115),
  })) };
}
