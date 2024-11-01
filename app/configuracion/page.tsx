'use client';

import { useState, useEffect } from 'react';
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
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'; // Firebase imports
import { db } from '@/lib/firebase'; // Your Firebase setup

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState({
    nombreNegocio: 'Mi Estética',
    email: 'contacto@miestetica.com',
    telefono: '123-456-7890',
    colorPrimario: '#000000',
    colorSecundario: '#ffffff',
    logo: null as string | ArrayBuffer | null,
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar la configuración desde Firebase
  const fetchConfiguracion = async () => {
    setIsLoading(true);
    try {
      const configDoc = await getDoc(doc(collection(db, 'configuraciones'), 'negocio'));
      if (configDoc.exists()) {
        const data:any = configDoc.data();
        setConfiguracion(data);
        if (data.logo) {
          setLogoPreview(data.logo);
        }
      }
    } catch (error) {
      console.error('Error al cargar la configuración:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfiguracion(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfiguracion(prev => ({ ...prev, logo: reader.result }));
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para guardar la configuración en Firebase
  const applyChanges = async () => {
    setIsLoading(true);
    try {
      // Guardar la configuración en Firebase
      await setDoc(doc(db, 'configuraciones', 'negocio'), configuracion);
      
      // Aplicar cambios de tema
      document.documentElement.style.setProperty('--primary', configuracion.colorPrimario);
      document.documentElement.style.setProperty('--secondary', configuracion.colorSecundario);

      toast({
        title: "Configuración actualizada",
        description: "Los cambios han sido aplicados correctamente.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error al actualizar la configuración",
        description: "Hubo un problema al aplicar los cambios. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="apariencia">Apariencia y Tema</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>Configura los detalles básicos de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombreNegocio">Nombre del Negocio</Label>
                <Input
                  id="nombreNegocio"
                  name="nombreNegocio"
                  value={configuracion.nombreNegocio}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de contacto</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={configuracion.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={configuracion.telefono}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="apariencia">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia y Tema</CardTitle>
              <CardDescription>Personaliza la apariencia de tu aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="colorPrimario">Color Primario</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="colorPrimario"
                    name="colorPrimario"
                    type="color"
                    value={configuracion.colorPrimario}
                    onChange={handleChange}
                    className="w-12 h-12 p-1 rounded"
                  />
                  <span>{configuracion.colorPrimario}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorSecundario">Color Secundario</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="colorSecundario"
                    name="colorSecundario"
                    type="color"
                    value={configuracion.colorSecundario}
                    onChange={handleChange}
                    className="w-12 h-12 p-1 rounded"
                  />
                  <span>{configuracion.colorSecundario}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {logoPreview && (
                  <div className="mt-2">
                    <Image src={logoPreview} alt="Logo preview" width={100} height={100} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                  >
                    Claro
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                  >
                    Oscuro
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                  >
                    Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Button 
        className="mt-4" 
        onClick={applyChanges} 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Aplicando cambios...
          </>
        ) : (
          'Aplicar todos los cambios'
        )}
      </Button>
    </div>
  );
}
