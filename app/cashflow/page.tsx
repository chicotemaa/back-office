"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dummyData = [
  { date: '2023-01-01', description: 'Venta de servicios', amount: 1000, type: 'ingreso' },
  { date: '2023-01-02', description: 'Compra de suministros', amount: -500, type: 'egreso' },
  { date: '2023-01-03', description: 'Pago de salarios', amount: -1500, type: 'egreso' },
  { date: '2023-01-04', description: 'Venta de productos', amount: 800, type: 'ingreso' },
];

const chartData = [
  { name: 'Ene', ingresos: 4000, egresos: 2400 },
  { name: 'Feb', ingresos: 3000, egresos: 1398 },
  { name: 'Mar', ingresos: 2000, egresos: 9800 },
  { name: 'Abr', ingresos: 2780, egresos: 3908 },
  { name: 'May', ingresos: 1890, egresos: 4800 },
  { name: 'Jun', ingresos: 2390, egresos: 3800 },
];

export default function CashflowPage() {
  const [transactions, setTransactions] = useState(dummyData);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flujo de Caja</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={transaction.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gráfico de Ingresos y Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ingresos" fill="#4ade80" />
                <Bar dataKey="egresos" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button>Agregar Transacción</Button>
      </div>
    </div>
  );
}