'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, Calendar, Package, BarChart2, Settings, FileText, PenTool, Sun, Moon, LogOut, Users, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { auth, db } from '@/lib/firebase'; // Importamos 'db' para acceder a Firebase
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore'; // Para obtener los datos de 'configuraciones'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useMemo } from 'react';


interface AppConfig {
  nombreNegocio: string;
  logo?: string;
  colorPrimario?: string;
  colorSecundario?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const memoizedNombreNegocio = useMemo(() => {
    return <span className="text-xl font-bold text-foreground">{config?.nombreNegocio || 'App Estetica'}</span>;
  }, [config?.nombreNegocio]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
      });

      const fetchConfig = async () => {
        try {
          const configSnapshot = await getDocs(collection(db, 'configuraciones'));
          const configData = configSnapshot.docs.map((doc) => doc.data())[0]; // Obtenemos la primera configuración
          setConfig(configData as AppConfig);
        } catch (error) {
          console.error("Error al obtener la configuración:", error);
        }
      };

      fetchConfig();

      return () => unsubscribe();
    }
  }, [mounted]);

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart2 }, 
    { name: 'Clientes', href: '/clientes', icon: User },          
    { name: 'Empleados', href: '/empleados', icon: Users },       
    { name: 'Servicios', href: '/servicios', icon: PenTool },     
    { name: 'Blog', href: '/blog', icon: PenTool },               
    { name: 'Turnos', href: '/turnos', icon: Calendar },          
    { name: 'Pagos', href: '/pagos', icon: DollarSign },          
    { name: 'Stock', href: '/stock', icon: Package },             
    { name: 'Cashflow', href: '/cashflow', icon: DollarSign },    
    { name: 'Cajas', href: '/cajas', icon: FileText },            
    { name: 'Configuración', href: '/configuracion', icon: Settings }  
  ];
  

  if (!mounted || pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
      router.push('/login');
    } catch (error) {
      toast({
        title: "Error al cerrar sesión",
        description: "Hubo un problema al cerrar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  

  return (
    <nav className="bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center mt-4 mb-4">
            <div className="flex-shrink-0">
            {config && config.logo ? (
                <Image src={config.logo} alt="Logo" width={40} height={40} />
              ) : (
                memoizedNombreNegocio // Usamos el valor memoizado aquí
              )}
            </div>
            <div className="hidden lg:flex flex-wrap items-center ml-10 space-x-4 w-full ">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 mt-1`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="text-foreground hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || undefined} />
                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || 'Usuario'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="-mr-2 flex lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
              >
                <item.icon className="inline-block mr-2 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left text-foreground hover:bg-accent hover:text-accent-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            >
              <LogOut className="inline-block mr-2 h-5 w-5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
