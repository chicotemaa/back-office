"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([
    { id: 1, nombre: 'Ana López', puesto: 'Estilista', email: 'ana@example.com', telefono: '123-456-7890' },
    { id: 2, nombre: 'Carlos Gómez', puesto: 'Barbero', email: 'carlos@example.com', telefono: '098-765-4321' },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Empleados</h1>
      <div className="mb-4">
        <Input placeholder="Buscar empleado..." className="max-w-sm" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Puesto</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empleados.map((empleado) => (
            <TableRow key={empleado.id}>
              <TableCell>{empleado.nombre}</TableCell>
              <TableCell>{empleado.puesto}</TableCell>
              <TableCell>{empleado.email}</TableCell>
              <TableCell>{empleado.telefono}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">Editar</Button>
                <Button variant="destructive" size="sm">Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button className="mt-4">Agregar Empleado</Button>
    </div>
  );
}