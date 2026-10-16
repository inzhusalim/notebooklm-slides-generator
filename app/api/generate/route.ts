import { generateDeck } from '@/lib/generator';
import { generateWithLLM } from '@/lib/llm';
import { TemplateId, templates } from '@/lib/types';
const reply = (body: object, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== new URL(request.url).host) return reply({ error: 'Запрос должен быть отправлен с этого сайта.' }, 403);
    const raw = await request.text();
    if (raw.length > 10000) return reply({ error: 'Слишком большой запрос.' }, 413);
    let body;
    try { body = JSON.parse(raw); } catch { return reply({ error: 'Ожидается JSON.' }, 400); }
    if (!body || typeof body !== 'object') return reply({ error: 'Некорректный запрос.' }, 400);
    const { topic, template, count, apiKey = '', provider, model } = body;
    if (typeof topic !== 'string' || topic.trim().length < 3 || topic.length > 240 || !templates.some(t => t.id === template) || !Number.isInteger(count) || count < 5 || count > 12) return reply({ error: 'Укажите тему от 3 до 240 символов, шаблон и 5–12 слайдов.' }, 400);
    if (typeof apiKey !== 'string' || apiKey.length > 500 || /[\r\n]/.test(apiKey)) return reply({ error: 'Некорректный API-ключ.' }, 400);
    if (!apiKey.trim()) return reply({ deck: generateDeck(topic, template as TemplateId, count) });
    if (!['gemini', 'openai'].includes(provider) || typeof model !== 'string' || !/^[a-zA-Z0-9._-]{2,80}$/.test(model)) return reply({ error: 'Проверьте провайдера и имя модели.' }, 400);
    const deck = await generateWithLLM({ topic: topic.trim(), template, count, apiKey: apiKey.trim(), provider, model });
    return reply({ deck });
  } catch (error) { return reply({ error: error instanceof Error ? error.message : 'Не удалось сгенерировать презентацию.' }, 502); }
}
