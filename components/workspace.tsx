'use client';
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, startTransition } from 'react';
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, BrainCircuit, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, FileText, FlaskConical, GraduationCap, KeyRound, LayoutGrid, LoaderCircle, Maximize2, Minus, PanelLeftClose, PanelLeftOpen, Play, Plus, RotateCcw, Sparkles, WandSparkles, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateDeck } from '@/lib/generator';
import { Deck, isDeck, slideLabels, templates, TemplateId, Theme } from '@/lib/types';
import { SlideCanvas } from './slide-canvas';
import { KeyGuide } from './key-guide';
const cn = (...values: Parameters<typeof clsx>) => twMerge(clsx(values));
const initialTopic = 'Искусственный интеллект в образовании';
const STORAGE = 'slidebook.workspace.v1';
const templateIcons = { research: FlaskConical, deep: BrainCircuit, executive: FileText, study: GraduationCap };
export default function Workspace() {
  const [topic, setTopic] = useState(initialTopic);
  const [template, setTemplate] = useState<TemplateId>('research');
  const [count, setCount] = useState(8);
  const [deck, setDeck] = useState<Deck>(() => generateDeck(initialTopic));
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState<Theme>('light');
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-3.8-flash');
  const [apiKey, setApiKey] = useState('');
  const [apiOpen, setApiOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [presenting, setPresenting] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [help, setHelp] = useState(false);
  const [keyGuide, setKeyGuide] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState('Сохранено в браузере');
  const [undo, setUndo] = useState<Deck | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const helpClose = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE); if (raw) { const data = JSON.parse(raw); if (isDeck(data.deck)) startTransition(() => { setDeck(data.deck); setTopic(data.deck.topic); setTemplate(data.deck.template); setCount(data.deck.slides.length); if (['light', 'pastel', 'dark'].includes(data.theme)) setTheme(data.theme); }); } } catch { /* Storage can be unavailable in private browsing. */ }
    startTransition(() => setReady(true));
    return () => requestRef.current?.abort();
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => { try { localStorage.setItem(STORAGE, JSON.stringify({ deck, theme })); setSaved('Сохранено в браузере'); } catch { setSaved('Автосохранение недоступно'); } }, 350);
    return () => clearTimeout(timer);
  }, [deck, theme, ready]);
  const navigate = useCallback((offset: number) => setActive(i => Math.max(0, Math.min(deck.slides.length - 1, i + offset))), [deck.slides.length]);
  const exitPresentation = useCallback(() => { setPresenting(false); if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { exitPresentation(); setHelp(false); setKeyGuide(false); return; }
      if (!presenting || (e.target as HTMLElement)?.isContentEditable) return;
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); navigate(1); }
      if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); navigate(-1); }
      if (e.key === 'Home') setActive(0);
      if (e.key === 'End') setActive(deck.slides.length - 1);
    };
    const onFullscreen = () => { if (!document.fullscreenElement) setPresenting(false); };
    window.addEventListener('keydown', onKey); document.addEventListener('fullscreenchange', onFullscreen);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFullscreen); };
  }, [presenting, navigate, exitPresentation, deck.slides.length]);
  useEffect(() => { if (help) helpClose.current?.focus(); }, [help]);
  function edit(field: string, value: string) {
    setUndo(deck);
    setDeck(prev => ({ ...prev, slides: prev.slides.map((s, i) => {
      if (i !== active) return s;
      const [key, n, sub] = field.split('.');
      if (key === 'items') return { ...s, items: s.items.map((item, j) => j === Number(n) ? { ...item, [sub]: value } : item) };
      if (key === 'tags') return { ...s, tags: s.tags.map((tag, j) => j === Number(n) ? value : tag) };
      return { ...s, [field]: value };
    }) }));
  }
  async function generate() {
    if (busy) return;
    setError(''); setNotice('');
    if (topic.trim().length < 3) { setError('Добавьте тему: минимум 3 символа.'); return; }
    setBusy(true);
    try {
      let result: Deck;
      if (apiKey.trim()) {
        const controller = new AbortController(); requestRef.current = controller;
        const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: JSON.stringify({ topic, template, count, apiKey: apiKey.trim(), provider, model }) });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Генерация недоступна.');
        if (!isDeck(payload.deck)) throw new Error('Не удалось прочитать презентацию. Попробуйте ещё раз.');
        result = payload.deck;
      } else { await new Promise(resolve => setTimeout(resolve, 250)); result = generateDeck(topic, template, count); }
      setUndo(deck); setDeck(result); setActive(0); setNotice(`Готово! ${result.slides.length} слайдов · ${result.mode === 'ai' ? 'генерация с ИИ' : 'встроенный генератор'}`);
    } catch (e) { if (!(e instanceof Error && e.name === 'AbortError')) setError(e instanceof Error ? e.message : 'Не удалось создать презентацию.'); }
    finally { setBusy(false); requestRef.current = null; }
  }
  async function present() { setPresenting(true); try { await document.documentElement.requestFullscreen?.(); } catch { /* Overlay works without browser fullscreen. */ } }
  const current = deck.slides[active];
  const selectedTemplate = templates.find(t => t.id === deck.template)!;
  const downloadJson = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'slidebook-presentation.json'; a.click(); URL.revokeObjectURL(url); };
  async function importJson(file?: File) {
    if (!file) return;
    try {
      if (file.size > 150000) throw new Error('Файл слишком большой. Максимум 150 КБ.');
      const result = JSON.parse(await file.text());
      if (!isDeck(result)) throw new Error('Файл не соответствует формату презентации Slidebook.');
      setUndo(deck); setDeck({ ...result, slides: result.slides.map((s, i) => ({ ...s, id: 'slide-' + (i + 1) })) });
      setTopic(result.topic); setTemplate(result.template); setCount(result.slides.length); setActive(0); setNotice('Презентация открыта из JSON.'); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Не удалось открыть файл.'); setSidebar(true); }
    if (importInput.current) importInput.current.value = '';
  }
  return <>
    <div className="app-shell" inert={presenting || help || keyGuide}>
      <header className="app-header"><Link className="brand" href="/" aria-label="Slidebook — главная"><span className="brand-mark"><BookOpen size={23}/></span><span>slidebook<span className="brand-period">.</span></span></Link><div className="header-divider"/><span className="product-label">Пространство для идей</span><div className="header-right"><button className="keys-menu-button" onClick={() => setKeyGuide(true)}><KeyRound size={14}/>Ключи API</button><span className="local-badge"><span/>Работает без ключа</span><button className="icon-button help-button" aria-label="Помощь" onClick={() => setHelp(true)}><CircleHelp size={19}/></button><span className="avatar" title="Локальное рабочее пространство">S</span></div></header>
      <div className={cn('workspace', !sidebar && 'sidebar-hidden')}>
        <aside className="sidebar" aria-label="Настройки и план презентации"><div className="sidebar-title"><div><WandSparkles size={18}/><h2>Создать презентацию</h2></div><button className="icon-button" aria-label="Скрыть панель" onClick={() => setSidebar(false)}><PanelLeftClose size={17}/></button></div><div className="sidebar-scroll"><div className="builder-form">
          <div className="field-heading"><label htmlFor="topic">О чём расскажем?</label><span>01</span></div><div className="topic-input"><textarea id="topic" maxLength={240} rows={3} value={topic} onChange={e => setTopic(e.target.value)} spellCheck={false}/><span>{topic.length}/240</span></div>
          <div className="field-heading template-heading"><span id="template-label">Выберите структуру</span><span>02</span></div><div className="template-grid" role="group" aria-labelledby="template-label">{templates.map(t => { const Icon = templateIcons[t.id]; return <button key={t.id} aria-pressed={template === t.id} className={cn('template-card', t.color, template === t.id && 'selected')} onClick={() => setTemplate(t.id)}><span className="template-card-top"><span className="template-icon"><Icon size={17}/></span><span className="radio-indicator">{template === t.id && <Check size={10}/>}</span></span><strong>{t.name}</strong><small>{t.description}</small></button>; })}</div>
          <div className="slide-count-field"><label htmlFor="slide-count">Количество слайдов</label><div className="stepper"><button aria-label="Меньше слайдов" disabled={count === 5} onClick={() => setCount(n => n - 1)}><Minus size={13}/></button><input id="slide-count" type="number" min={5} max={12} value={count} onChange={e => setCount(Math.max(5, Math.min(12, Number(e.target.value) || 5)))}/><button aria-label="Больше слайдов" disabled={count === 12} onClick={() => setCount(n => n + 1)}><Plus size={13}/></button></div></div>
          <div className="api-section"><button className="api-toggle" aria-label="Подключить свой ИИ" aria-expanded={apiOpen} onClick={() => setApiOpen(v => !v)}><KeyRound size={14}/><span>Подключить свой ИИ</span><span className="optional">опционально</span><ChevronDown size={14} className={cn(apiOpen && 'rotated')}/></button>{apiOpen && <div className="api-fields"><label htmlFor="provider">Провайдер</label><select id="provider" value={provider} onChange={e => { setProvider(e.target.value); setModel(e.target.value === 'gemini' ? 'gemini-3.8-flash' : 'gpt-5.4'); }}><option value="gemini">Google Gemini</option><option value="openai">OpenAI</option></select><label htmlFor="model">Модель</label><input id="model" value={model} maxLength={80} onChange={e => setModel(e.target.value)}/><label htmlFor="api-key">API-ключ</label><input id="api-key" type="password" autoComplete="off" value={apiKey} maxLength={500} onChange={e => setApiKey(e.target.value)} aria-describedby="key-info"/><p id="key-info">Ключ используется только для этого запроса и не сохраняется. Запросы оплачиваются у провайдера.</p>{apiKey && <button className="text-button" onClick={() => setApiKey('')}>Удалить ключ</button>}</div>}</div>
          <button className="generate-button" onClick={generate} disabled={busy}><span>{busy ? <LoaderCircle className="spin" size={17}/> : <Sparkles size={17}/>}</span>{busy ? 'Собираем идеи…' : 'Создать презентацию'}<ArrowRight size={16}/></button><p className="generator-hint"><span/>{apiKey ? 'ИИ-генерация с вашим ключом' : 'Встроенная генерация · без регистрации'}</p>{error && <div className="error-message" role="alert">{error}{apiKey && <button onClick={() => { setApiKey(''); setError(''); setNotice('Ключ удалён. Можно создать презентацию встроенным генератором.'); }}>Переключиться на встроенный режим</button>}</div>}
        </div><div className="outline"><div className="outline-heading"><h3><LayoutGrid size={14}/>План презентации</h3><span>{deck.slides.length}</span></div><div className="outline-list">{deck.slides.map((s, i) => <button key={s.id} className={cn('outline-item', active === i && 'active')} aria-label={`Перейти к слайду ${i + 1}: ${s.title}`} aria-current={active === i ? 'step' : undefined} onClick={() => setActive(i)}><span className="outline-number">{String(i + 1).padStart(2, '0')}</span><span className={`outline-mini mini-${s.type}`}><i/><i/><i/></span><span className="outline-copy"><strong>{s.title}</strong><small>{slideLabels[s.type]}</small></span>{active === i && <span className="active-dot"/>}</button>)}</div></div></div><div className="sidebar-footer"><span className="mini-brand">✳</span>Меньше шума. Больше смысла.</div></aside>
        <main className="main-workspace"><div className="editor-toolbar"><div className="document-title">{!sidebar && <button className="icon-button" aria-label="Показать панель" onClick={() => setSidebar(true)}><PanelLeftOpen size={19}/></button>}<span className="document-icon"><FileText size={18}/></span><div><h1>{deck.topic}</h1><span><CheckCheck size={12}/>{saved}</span></div></div><div className="toolbar-actions"><button className="toolbar-button export-button" onClick={() => window.print()}><ArrowDownToLine size={15}/><span>Экспорт PDF</span></button><button className="present-button" onClick={present}><Play size={14} fill="currentColor"/><span>Показать</span></button></div></div>
          <div className="canvas-scroll"><div className="canvas-area"><div className="canvas-topbar"><div className="deck-breadcrumb"><span className="eyebrow-dot"/>{selectedTemplate.name}<ChevronRight size={12}/><span>{slideLabels[current.type]}</span></div><div className="view-settings"><button className="icon-button undo-button" aria-label="Отменить последнее изменение" disabled={!undo} onClick={() => { if (undo) { setDeck(undo); setActive(i => Math.min(i, undo.slides.length - 1)); setUndo(null); } }}><RotateCcw size={15}/></button><span className="settings-divider"/><span className="theme-label">Стиль</span><div className="theme-switcher" role="group" aria-label="Тема оформления">{(['light', 'pastel', 'dark'] as Theme[]).map(t => <button key={t} aria-label={t === 'light' ? 'Light' : t === 'pastel' ? 'Soft Pastel' : 'Dark Contrast'} aria-pressed={theme === t} title={t === 'light' ? 'Light' : t === 'pastel' ? 'Soft Pastel' : 'Dark Contrast'} className={cn('theme-swatch', `swatch-${t}`, theme === t && 'selected')} onClick={() => setTheme(t)}>{theme === t && <Check size={10}/>}</button>)}</div></div></div>
            <div className="canvas-frame"><SlideCanvas key={current.id + deck.createdAt} slide={current} theme={theme} index={active} total={deck.slides.length} onEdit={edit}/></div><div className="canvas-underbar"><span><span className="edit-pencil">✎</span>Нажмите на текст, чтобы отредактировать</span><span>16:9 <span className="underbar-dot">·</span> {deck.mode === 'ai' ? 'Сгенерировано ИИ' : 'Исследовательский обзор'}</span></div>
            <div className="slide-navigation"><button className="nav-button" aria-label="Предыдущий слайд" onClick={() => navigate(-1)} disabled={active === 0}><ChevronLeft size={18}/></button><span><strong>{String(active + 1).padStart(2, '0')}</strong><i>/</i>{String(deck.slides.length).padStart(2, '0')}</span><button className="nav-button" aria-label="Следующий слайд" onClick={() => navigate(1)} disabled={active === deck.slides.length - 1}><ChevronRight size={18}/></button></div>
            <div className="filmstrip" aria-label="Миниатюры слайдов">{deck.slides.map((s, i) => <button key={s.id} className={cn('filmstrip-item', active === i && 'active')} aria-label={`Открыть слайд ${i + 1}`} aria-pressed={active === i} onClick={() => setActive(i)}><span className="filmstrip-slide"><SlideCanvas slide={s} theme={theme} index={i} total={deck.slides.length} miniature/></span><span className="filmstrip-caption">{String(i + 1).padStart(2, '0')}<span>{slideLabels[s.type]}</span></span></button>)}</div>
            <input ref={importInput} type="file" accept=".json,application/json" hidden onChange={e => void importJson(e.target.files?.[0])}/><div className="workspace-note"><span><Sparkles size={14}/>Сложные идеи. Простые слайды.</span><div className="json-actions"><button onClick={() => importInput.current?.click()}>Открыть JSON <Plus size={12}/></button><button onClick={downloadJson}>Сохранить JSON <ArrowDownToLine size={12}/></button></div></div><div className="status-message" role="status" aria-live="polite">{notice}</div></div></div><footer className="workspace-footer"><span>Создано для любопытных умов.</span><span>Вдохновлено NotebookLM <i>·</i> Независимый проект</span></footer></main>
      </div>
    </div>
    {presenting && <div className="presentation-overlay" role="dialog" aria-modal="true" aria-label="Режим презентации"><button className="presentation-close" autoFocus aria-label="Завершить показ" onClick={exitPresentation}><X size={20}/><span>Esc</span></button><div className="presentation-canvas"><SlideCanvas slide={current} theme={theme} index={active} total={deck.slides.length}/></div><div className="presentation-controls"><button aria-label="Предыдущий слайд в показе" onClick={() => navigate(-1)} disabled={active === 0}><ArrowLeft size={20}/></button><span>{active + 1} / {deck.slides.length}</span><button aria-label="Следующий слайд в показе" onClick={() => navigate(1)} disabled={active === deck.slides.length - 1}><ArrowRight size={20}/></button><Maximize2 size={15}/></div></div>}
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); helpClose.current?.focus(); } }}><button ref={helpClose} className="icon-button modal-close" aria-label="Закрыть помощь" onClick={() => setHelp(false)}><X size={20}/></button><div className="help-icon"><BookOpen size={26}/></div><h2 id="help-title">Дайте идеям форму.</h2><p>Введите тему, выберите структуру и создайте 5–12 слайдов. Встроенный генератор использует тематические знания и исследовательские рамки без обращения к сети.</p><ul><li>Нажмите на текст на слайде, чтобы изменить его. Изменения сохраняются в этом браузере.</li><li>В режиме показа используйте стрелки, пробел и Esc.</li><li>«Экспорт PDF» открывает печать: выберите «Сохранить как PDF». Каждый слайд — отдельная страница 16:9.</li><li>Для генерации с ИИ подключите ключ Gemini или OpenAI. Ключ не сохраняется, но передаётся серверу для запроса к провайдеру.</li></ul><p className="help-footnote">Slidebook — независимый проект, вдохновлённый эстетикой NotebookLM. Проверяйте факты перед публикацией презентации.</p></section></div>}
    {keyGuide && <KeyGuide onClose={() => setKeyGuide(false)} onSelect={p => { setProvider(p); setModel(p === 'gemini' ? 'gemini-3.8-flash' : 'gpt-5.4'); setApiOpen(true); setSidebar(true); setKeyGuide(false); setTimeout(() => document.getElementById('api-key')?.focus(), 100); }}/>}
    <div className="print-deck" aria-hidden="true">{deck.slides.map((s, i) => <div className="print-page" key={s.id}><SlideCanvas slide={s} theme={theme} index={i} total={deck.slides.length}/></div>)}</div>
  </>;
}
