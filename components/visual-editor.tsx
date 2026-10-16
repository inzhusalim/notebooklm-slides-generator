'use client';
import { useRef, useState } from 'react';
import { BarChart3, ImagePlus, Network, RotateCcw, Sparkles, X } from 'lucide-react';
import { Slide, SlideVisual } from '@/lib/types';
import { concise, visualKind } from '@/lib/visuals';
export function VisualEditor({ slide, onChange, onClose }: { slide: Slide; onChange: (visual: SlideVisual | undefined) => void; onClose: () => void }) {
  const [tab, setTab] = useState(visualKind(slide));
  const [labels,setLabels] = useState(slide.visual?.chart?.labels || slide.items.map(i => concise(i.title,35)));
  const [values,setValues] = useState(slide.visual?.chart?.values.map(String) || ['','','']);
  const [source,setSource] = useState(slide.visual?.chart?.source || '');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const valid = labels.every(l => l.trim().length > 0) && values.every(v => v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 1e12) && values.some(v => Number(v) > 0) && source.trim().length >= 3;
  async function upload(file?: File) {
    if (!file) return;
    setError(''); setLoading(true);
    try {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8*1024*1024) throw new Error('Выберите JPG, PNG или WebP размером до 8 МБ.');
      const url = URL.createObjectURL(file);
      let image: HTMLImageElement;
      try { image = await new Promise((resolve,reject) => { const img=new Image(); img.onload=()=>resolve(img); img.onerror=()=>reject(new Error('Не удалось прочитать изображение.')); img.src=url; }); }
      finally { URL.revokeObjectURL(url); }
      const scale=Math.min(1,1400/Math.max(image.width,image.height));
      const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);
      const context=canvas.getContext('2d');if(!context) throw new Error('Не удалось подготовить изображение.');
      context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL('image/jpeg',.82);
      if(data.length>2000000) throw new Error('Изображение слишком большое после обработки. Выберите файл поменьше.');
      onChange({kind:'photo',image:data,alt:file.name.slice(0,240)});setTab('photo');
    } catch(e) {setError(e instanceof Error ? e.message : 'Не удалось загрузить изображение.');}
    finally {setLoading(false);if(input.current)input.current.value='';}
  }
  return <section className="visual-editor" aria-label="Настройки визуала"><div className="visual-editor-heading"><div><Sparkles size={16}/><strong>Визуал текущего слайда</strong><span>60% слайда</span></div><button className="icon-button" onClick={onClose} aria-label="Закрыть настройки визуала"><X size={16}/></button></div><div className="visual-options"><button className={tab==='illustration'?'active':''} onClick={()=>{onChange({kind:'illustration'});setTab('illustration');}}><Sparkles size={17}/>Иллюстрация</button><button className={tab==='diagram'?'active':''} onClick={()=>{onChange({kind:'diagram'});setTab('diagram');}}><Network size={17}/>Схема</button><button className={tab==='chart'?'active':''} onClick={()=>setTab('chart')}><BarChart3 size={17}/>График</button><button className={tab==='photo'?'active':''} disabled={loading} onClick={()=>input.current?.click()}><ImagePlus size={17}/>{loading?'Загрузка…':'Своё фото'}</button></div><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>void upload(e.target.files?.[0])}/>
    {tab==='chart' && <div className="chart-editor"><p>Добавьте свои данные. На графике будут только введённые вами числа.</p><div className="chart-fields">{labels.map((label,i)=><div key={i}><label><span>Показатель {i+1}</span><input aria-label={`Название показателя ${i+1}`} value={label} maxLength={45} onChange={e=>setLabels(a=>a.map((v,j)=>j===i?e.target.value:v))}/></label><label><span>Значение</span><input aria-label={`Значение показателя ${i+1}`} type="number" min="0" max="1000000000000" value={values[i]} onChange={e=>setValues(a=>a.map((v,j)=>j===i?e.target.value:v))}/></label></div>)}</div><label className="chart-source-field">Источник и единицы измерения<input aria-label="Источник данных и единицы измерения" value={source} maxLength={200} onChange={e=>setSource(e.target.value)}/></label><button className="apply-chart" disabled={!valid} onClick={()=>onChange({kind:'chart',chart:{labels:labels.map(s=>s.trim()),values:values.map(Number),source:source.trim()}})}>Применить график</button></div>}
    <div className="visual-editor-foot"><span>Иллюстрации подбираются по теме. Можно заменить их своим изображением.</span><button onClick={()=>{onChange(undefined);setTab(slide.type==='title'?'illustration':'diagram');}}><RotateCcw size={12}/>Автовыбор</button></div>{error&&<p className="error-message" role="alert">{error}</p>}
  </section>;
}
