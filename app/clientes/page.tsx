"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ClientesPage() {
  const [clientes, setClientes] = useState([
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '123-456-7890' },
    { id: 2, nombre: 'María García', email: 'maria@example.com', telefono: '098-765-4321' },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>
      <div className="mb-4">
        <Input placeholder="Buscar cliente..." className="max-w-sm" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.nombre}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{cliente.telefono}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">Editar</Button>
                <Button variant="destructive" size="sm">Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button className="mt-4">Agregar Cliente</Button>
    </div>
  );
}