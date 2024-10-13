'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 

import { jsPDF } from 'jspdf';



interface Reporte {
  name: string;
  ingresos: number;
  egresos: number;
}

interface ServicioPopular {
  servicio: string;
  cantidad: number;
}

export default function ReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [serviciosPopulares, setServiciosPopulares] = useState<ServicioPopular[]>([]);
  const [loading, setLoading] = useState(true);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reportes de Ingresos y Egresos', 10, 10);
    // Añadir más contenido aquí, como tablas, gráficos, etc.
    doc.save('reportes.pdf');
  };
  

  // Obtener ingresos y egresos de Firebase
  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      try {
        const reportesSnapshot = await getDocs(collection(db, 'reportes')); // Suponiendo que tienes una colección llamada "reportes"
        const reportesData = reportesSnapshot.docs.map((doc) => doc.data()) as Reporte[];
        setReportes(reportesData);
      } catch (error) {
        console.error('Error al obtener reportes:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchServiciosPopulares = async () => {
      try {
        const serviciosSnapshot = await getDocs(collection(db, 'turnos')); // Suponiendo que los turnos contienen servicios
        const serviciosData = serviciosSnapshot.docs.map((doc) => doc.data().servicio); // Obtener todos los servicios de los turnos
        const contadorServicios = serviciosData.reduce((acc: Record<string, number>, servicio: string) => {
          acc[servicio] = (acc[servicio] || 0) + 1;
          return acc;
        }, {});
        const serviciosPopularesData = Object.keys(contadorServicios).map((servicio) => ({
          servicio,
          cantidad: contadorServicios[servicio],
        }));
        setServiciosPopulares(serviciosPopularesData);
      } catch (error) {
        console.error('Error al obtener servicios populares:', error);
      }
    };

    fetchReportes();
    fetchServiciosPopulares();
  }, []);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reportes y Estadísticas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gráfico de ingresos y egresos */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos y Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ingresos" fill="#8884d8" />
                <Bar dataKey="egresos" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de servicios más populares */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios más populares</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviciosPopulares}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="servicio" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
      <Button className="mr-2" onClick={exportToPDF}>Exportar a PDF</Button>
      </div>
    </div>
  );
}
