import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <h1 className="text-4xl font-bold text-white mb-8">Bienvenido a Estética/Barbería Web App</h1>
      <div className="space-x-4">
        <Button asChild className="bg-white text-blue-600 hover:bg-blue-100 border border-blue-600">
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
        <Button asChild variant="outline" className="bg-transparent text-white hover:bg-white/10 border border-white">
          <Link href="/register">Registrarse</Link>
        </Button>
      </div>
    </div>
  );
}