'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function StockPage() {
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Shampoo', cantidad: 50, maximo: 100 },
    { id: 2, nombre: 'Tinte', cantidad: 20, maximo: 50 },
  ]);

  // Estado para asegurarse de que el componente esté montado en el cliente
  const [isMounted, setIsMounted] = useState(false);

  // Establecer que el componente está montado
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Stock</h1>
      <div className="mb-4">
        <Input placeholder="Buscar producto..." className="max-w-sm" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((producto) => (
            <TableRow key={producto.id}>
              <TableCell>{producto.nombre}</TableCell>
              <TableCell>{producto.cantidad}</TableCell>
              <TableCell>
                {/* El componente Progress solo se renderiza cuando está montado en el cliente */}
                {isMounted && (
                  <Progress
                    value={(producto.cantidad / producto.maximo) * 100}
                    className="w-[60%]"
                  />
                )}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">Editar</Button>
                <Button variant="outline" size="sm">Reponer</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button className="mt-4">Agregar Producto</Button>
    </div>
  );
}
