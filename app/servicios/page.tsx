"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ServiciosPage() {
  const [servicios, setServicios] = useState([
    { id: 1, nombre: 'Corte de cabello', duracion: '30 min', precio: '$20' },
    { id: 2, nombre: 'Tinte', duracion: '2 horas', precio: '$50' },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Servicios</h1>
      <div className="mb-4">
        <Input placeholder="Buscar servicio..." className="max-w-sm" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servicios.map((servicio) => (
            <TableRow key={servicio.id}>
              <TableCell>{servicio.nombre}</TableCell>
              <TableCell>{servicio.duracion}</TableCell>
              <TableCell>{servicio.precio}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">Editar</Button>
                <Button variant="destructive" size="sm">Eliminar</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button className="mt-4">Agregar Servicio</Button>
    </div>
  );
}