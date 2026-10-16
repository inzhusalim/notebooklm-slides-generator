import type { Metadata } from 'next';
import './globals.css';
import './atlas.css';
export const metadata: Metadata = { title: 'Slidebook — идеи становятся презентациями', description: 'Создавайте редакционные презентации-атласы с яркими картами, схемами и текстом в пропорции 60/40. Встроенный генератор, Gemini и OpenAI, показ и экспорт в PDF.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }
