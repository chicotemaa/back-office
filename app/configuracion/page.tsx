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
