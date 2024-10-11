"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Ene', ingresos: 4000, egresos: 2400 },
  { name: 'Feb', ingresos: 3000, egresos: 1398 },
  { name: 'Mar', ingresos: 2000, egresos: 9800 },
  { name: 'Abr', ingresos: 2780, egresos: 3908 },
  { name: 'May', ingresos: 1890, egresos: 4800 },
  { name: 'Jun', ingresos: 2390, egresos: 3800 },
];

export default function ReportesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reportes y Estadísticas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos y Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
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
        <Card>
          <CardHeader>
            <CardTitle>Servicios más populares</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Aquí puedes agregar otro gráfico o tabla con los servicios más populares */}
            <p>Implementar gráfico de servicios populares</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Button className="mr-2">Exportar a PDF</Button>
        <Button>Exportar a CSV</Button>
      </div>
    </div>
  );
}