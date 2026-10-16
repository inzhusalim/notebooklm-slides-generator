import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Slidebook — идеи становятся презентациями', description: 'Создавайте и редактируйте презентации в исследовательском стиле. Четыре структуры, встроенный генератор, Gemini и OpenAI, показ и экспорт в PDF.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }
