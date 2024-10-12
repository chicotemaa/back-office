"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const dummyData = {
  appointments: [
    { id: 1, client: 'Juan Pérez', service: 'Corte de cabello', time: '10:00 AM' },
    { id: 2, client: 'María García', service: 'Tinte', time: '11:30 AM' },
    { id: 3, client: 'Carlos López', service: 'Afeitado', time: '2:00 PM' },
  ],
  financialData: [
    { name: 'Ene', ingresos: 4000, egresos: 2400 },
    { name: 'Feb', ingresos: 3000, egresos: 1398 },
    { name: 'Mar', ingresos: 2000, egresos: 9800 },
    { name: 'Abr', ingresos: 2780, egresos: 3908 },
    { name: 'May', ingresos: 1890, egresos: 4800 },
    { name: 'Jun', ingresos: 2390, egresos: 3800 },
  ],
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Turnos del día</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" className="rounded-md border" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Clientes activos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyData.appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.client}</TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stock de productos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Implementar indicador visual de stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ingresos y egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={dummyData.financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#8884d8" />
              <Bar dataKey="egresos" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}