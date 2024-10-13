'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Firebase setup
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs } from 'firebase/firestore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Interfaces for the data
interface Turno {
  id: string;
  cliente: string;
  empleado:string;
  servicio: string;
  fecha: string;
  hora: string;
}

interface Transaccion {
  name: string;
  ingresos: number;
  egresos: number;
}

interface Producto {
  id: string;
  nombre: string;
  cantidad: number;
  precioventa: number;
}
interface ServicioClienteMasSolicitado {
  cliente: string;
  servicio: string;
  cantidad: number;
}


export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [financialData, setFinancialData] = useState<Transaccion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [serviciosClientesMasSolicitados, setServiciosClientesMasSolicitados] = useState<ServicioClienteMasSolicitado[]>([]);

  const router = useRouter();

  // Autenticación del usuario
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
  useEffect(() => {
    const fetchServiciosClientesMasSolicitados = async () => {
      setLoading(true);
      const turnosSnapshot = await getDocs(collection(db, 'turnos'));
  
      // Crear una estructura para contar cuántas veces cada cliente ha solicitado cada servicio
      const serviciosPorCliente = turnosSnapshot.docs.reduce((acc, doc) => {
        const cliente = doc.data().cliente;
        const servicio = doc.data().servicio;
        
        const key = `${cliente}-${servicio}`;
        if (acc[key]) {
          acc[key]++;
        } else {
          acc[key] = 1;
        }
        return acc;
      }, {} as Record<string, number>);
  
      // Convertir el objeto a un array
      const serviciosClientesData = Object.entries(serviciosPorCliente).map(([key, cantidad]) => {
        const [cliente, servicio] = key.split('-');
        return { cliente, servicio, cantidad };
      }) as ServicioClienteMasSolicitado[];
  
      // Ordenar por cantidad de solicitudes, de mayor a menor
      serviciosClientesData.sort((a, b) => b.cantidad - a.cantidad);
  
      setServiciosClientesMasSolicitados(serviciosClientesData);
      setLoading(false);
    };
  
    fetchServiciosClientesMasSolicitados();
  }, []);
  

  // Obtener turnos del día
  useEffect(() => {
    const fetchTurnos = async () => {
      setLoading(true);
      const turnosSnapshot = await getDocs(collection(db, 'turnos'));
      const today = new Date().toISOString().split('T')[0]; // Fecha de hoy

      const turnosData = turnosSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          cliente: doc.data().cliente,
          empleado: doc.data().empleado,
          servicio: doc.data().servicio,
          fecha: doc.data().fecha.split('T')[0],
          hora: new Date(doc.data().fecha).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }))
        .filter((turno) => turno.fecha === today); // Filtra por turnos del día

      setTurnos(turnosData);
      setLoading(false);
    };

    fetchTurnos();
  }, []);

  // Obtener datos financieros (ingresos y egresos)
  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      const turnosSnapshot = await getDocs(collection(db, 'turnos'));
      const pagosSnapshot = await getDocs(collection(db, 'pagos'));

      const ingresosData = turnosSnapshot.docs
        .filter((doc) => doc.data().cobrado)
        .map((doc) => ({
          monto: doc.data().monto,
          fecha: new Date(doc.data().fecha),
        }));

      const egresosData = pagosSnapshot.docs.map((doc) => ({
        monto: -doc.data().monto,
        fecha: new Date(doc.data().fecha),
      }));

      // Agrupar datos por mes para el gráfico
      const allData = [...ingresosData, ...egresosData].reduce((acc, transaction) => {
        const month = transaction.fecha.toLocaleString('es-AR', { month: 'short' });
        const found = acc.find((item) => item.name === month);

        if (found) {
          if (transaction.monto > 0) {
            found.ingresos += transaction.monto;
          } else {
            found.egresos += Math.abs(transaction.monto);
          }
        } else {
          acc.push({
            name: month,
            ingresos: transaction.monto > 0 ? transaction.monto : 0,
            egresos: transaction.monto < 0 ? Math.abs(transaction.monto) : 0,
          });
        }

        return acc;
      }, [] as Transaccion[]);

      setFinancialData(allData);
      setLoading(false);
    };

    fetchFinancialData();
  }, []);

  // Obtener productos y su stock
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      const productosSnapshot = await getDocs(collection(db, 'productos'));
      const productosData = productosSnapshot.docs.map((doc) => ({
        id: doc.id,
        nombre: doc.data().nombre,
        cantidad: doc.data().cantidad,
        precioventa: doc.data().precioventa,
      })) as Producto[];

      setProductos(productosData);
      setLoading(false);
    };

    fetchProductos();
  }, []);

  if (!user || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Turnos del día */}
        <Card>
          <CardHeader>
            <CardTitle>Turnos del día</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" className="rounded-md border" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turnos.map((turno) => (
                  <TableRow key={turno.id}>
                    <TableCell>{turno.cliente}</TableCell>
                    <TableCell>{turno.empleado}</TableCell>
                    <TableCell>{turno.servicio}</TableCell>
                    <TableCell>{turno.fecha} {turno.hora}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Gráfico de Ingresos y Egresos */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos y egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={financialData}>
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

        {/* Stock de productos */}
        <Card>
          <CardHeader>
            <CardTitle>Stock de productos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio de venta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>{producto.cantidad}</TableCell>
                    <TableCell>{producto.precioventa}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
  <CardHeader>
    <CardTitle>Servicios Más Solicitados por Cliente</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Servicio</TableHead>
          <TableHead>Veces Solicitado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {serviciosClientesMasSolicitados.map((entry, index) => (
          <TableRow key={index}>
            <TableCell>{entry.cliente}</TableCell>
            <TableCell>{entry.servicio}</TableCell>
            <TableCell>{entry.cantidad}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
        </Card>
      </div>
    </div>
  );
}
