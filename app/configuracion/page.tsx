'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Configuracion {
  nombreNegocio: string;
  email: string;
  telefono: string;
  colorPrimario: string;
  colorSecundario: string;
  logo: string | null;
}

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState<Configuracion>({
    nombreNegocio: 'Mi Estética',
    email: 'contacto@miestetica.com',
    telefono: '123-456-7890',
    colorPrimario: '#000000',
    colorSecundario: '#ffffff',
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('appConfig');
    if (savedConfig) {
      try {
        const parsedConfig: Configuracion = JSON.parse(savedConfig);
        setConfiguracion(parsedConfig);
        if (parsedConfig.logo) {
          setLogoPreview(parsedConfig.logo);
        }
      } catch (error) {
        console.error('Error al parsear la configuración guardada:', error);
      }
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof Configuracion;
    setConfiguracion(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setConfiguracion(prev => ({ ...prev, logo: result }));
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isValidColor = (color: string) => /^#[0-9A-F]{6}$/i.test(color);

  const applyChanges = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('appConfig', JSON.stringify(configuracion));

      if (isValidColor(configuracion.colorPrimario)) {
        document.documentElement.style.setProperty('--primary', configuracion.colorPrimario);
      }

      if (isValidColor(configuracion.colorSecundario)) {
        document.documentElement.style.setProperty('--secondary', configuracion.colorSecundario);
      }

      toast({
        title: 'Configuración actualizada',
        description: 'Los cambios han sido aplicados correctamente.',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error al actualizar la configuración',
        description: 'Hubo un problema al aplicar los cambios. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* ... Tu código de renderizado ... */}
    </div>
  );
}
