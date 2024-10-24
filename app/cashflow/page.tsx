'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Transaccion {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  cajaId: string;
}

interface Caja {
  id: string;
  nombre: string;
}

export default function CashflowPage() {
  const [transactions, setTransactions] = useState<Transaccion[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'semana' | 'mes' | 'año' | 'todos'>('todos');
  const [selectedCaja, setSelectedCaja] = useState<string | 'todos'>('todos');

  // Obtener turnos cobrados (ingresos) y pagos (egresos) de Firebase
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // Obtener turnos cobrados
        const turnosSnapshot = await getDocs(collection(db, 'turnos'));
        const turnosData = turnosSnapshot.docs
          .filter((doc) => doc.data().cobrado === true)
          .map((doc) => ({
            id: doc.id,
            fecha: doc.data().fecha,
            descripcion: `Ingreso por turno: ${doc.data().servicio}`,
            monto: doc.data().monto,
            tipo: 'ingreso',
            cajaId: doc.data().cajaId || 'sin-caja',
          })) as Transaccion[];

        // Obtener pagos
        const pagosSnapshot = await getDocs(collection(db, 'pagos'));
        const pagosData = pagosSnapshot.docs.map((doc) => ({
          id: doc.id,
          fecha: doc.data().fecha,
          descripcion: `Pago a: ${doc.data().destinatario}`,
          monto: -doc.data().monto,
          tipo: 'egreso',
          cajaId: doc.data().cajaId || 'sin-caja',
        })) as Transaccion[];

        // Combinar ingresos y egresos
        setTransactions([...turnosData, ...pagosData]);
      } catch (error) {
        console.error('Error al obtener transacciones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Obtener cajas de Firebase
  useEffect(() => {
    const fetchCajas = async () => {
      setLoading(true);
      try {
        const cajasSnapshot = await getDocs(collection(db, 'cajas'));
        const cajasData = cajasSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        })) as Caja[];
        setCajas(cajasData);
      } catch (error) {
        console.error('Error al obtener cajas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCajas();
  }, []);

  const filterTransactions = (transactions: Transaccion[], filter: string) => {
    const now = new Date();
    switch (filter) {
      case 'semana':
        return transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.fecha);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(now.getDate() - 7);
          return transactionDate >= oneWeekAgo;
        });
      case 'mes':
        return transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.fecha);
          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        });
      case 'año':
        return transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.fecha);
          return transactionDate.getFullYear() === now.getFullYear();
        });
      default:
        return transactions;
    }
  };

  const filterByCaja = (transactions: Transaccion[], selectedCaja: string) => {
    if (selectedCaja === 'todos') {
      return transactions;
    }
    return transactions.filter((transaction) => transaction.cajaId === selectedCaja);
  };

  const filteredTransactions = filterByCaja(filterTransactions(transactions, filter), selectedCaja);

  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const sortedChartData = [...filteredTransactions].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  // Calcular el total general (ingresos - egresos)
  const totalGeneral = filteredTransactions.reduce((total, transaction) => total + transaction.monto, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flujo de Caja</h1>
      <div className="flex justify-end mb-4">
        <Button variant={filter === 'semana' ? 'default' : 'outline'} onClick={() => setFilter('semana')}>Semana</Button>
        <Button variant={filter === 'mes' ? 'default' : 'outline'} onClick={() => setFilter('mes')} className="ml-2">Mes</Button>
        <Button variant={filter === 'año' ? 'default' : 'outline'} onClick={() => setFilter('año')} className="ml-2">Año</Button>
        <Button variant={filter === 'todos' ? 'default' : 'outline'} onClick={() => setFilter('todos')} className="ml-2">Todos</Button>

        {/* Filtro por Caja */}
        <select
          className="ml-4 border p-2 rounded-md"
          value={selectedCaja}
          onChange={(e) => setSelectedCaja(e.target.value)}
        >
          <option value="todos">Todas las Cajas</option>
          {cajas.map((caja) => (
            <option key={caja.id} value={caja.id}>{caja.nombre}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
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
                    {sortedTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(transaction.fecha).toLocaleDateString('es-AR')}</TableCell>
                        <TableCell>{transaction.descripcion}</TableCell>
                        <TableCell className={transaction.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                          ${Math.abs(transaction.monto)}
                        </TableCell>
                        <TableCell>{transaction.tipo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Total General */}
                <div className="mt-4 text-right font-bold">
                  <p>Total General: <span className={totalGeneral >= 0 ? 'text-green-600' : 'text-red-600'}>${totalGeneral.toFixed(2)}</span></p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gráfico de Ingresos y Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedChartData.reduce((acc, transaction) => {
                const month = new Date(transaction.fecha).toLocaleString('es-AR', { month: 'short' });
                const found = acc.find((item) => item.name === month);
                if (found) {
                  found[transaction.tipo === 'ingreso' ? 'ingresos' : 'egresos'] += Math.abs(transaction.monto);
                } else {
                  acc.push({
                    name: month,
                    ingresos: transaction.tipo === 'ingreso' ? Math.abs(transaction.monto) : 0,
                    egresos: transaction.tipo === 'egreso' ? Math.abs(transaction.monto) : 0,
                  });
                }
                return acc;
              }, [] as { name: string; ingresos: number; egresos: number }[])} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ingresos" fill="#82ca9d" />
                <Bar dataKey="egresos" fill="#FF4C4C" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
