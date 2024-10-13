import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

interface Turno {
  id: string;
  fecha: string;
  cliente: string;
  empleado: string;
  servicio: string;
  cobrado: boolean;
  monto: number;
  cajaId?: string; // Agregamos el campo para la caja
}

interface TurnoTableProps {
  turnos: Turno[];
  onEdit: (turno: Turno) => void;
  onDelete: (turnoId: string) => void;
  onCobrar: (turno: Turno) => void;
}

const TurnoTable: React.FC<TurnoTableProps> = ({ turnos, onEdit, onDelete, onCobrar }) => {
  const handleCobrar = (turno: Turno) => {
    Swal.fire({
      title: 'Cobrar Turno',
      html: `
        <p><strong>Cliente:</strong> ${turno.cliente}</p>
        <p><strong>Empleado:</strong> ${turno.empleado}</p>
        <p><strong>Fecha y Hora:</strong> ${new Date(turno.fecha).toLocaleString('es-AR')}</p>
        <p><strong>Servicio:</strong> ${turno.servicio}</p>
        <p><strong>Precio:</strong> $${turno.monto}</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Marcar como Cobrado',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'green',
      cancelButtonColor: 'red'
    }).then((result) => {
      if (result.isConfirmed) {
        onCobrar(turno);
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Empleado</TableHead>
          <TableHead>Servicio</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Acciones</TableHead>
          <TableHead>Cobrar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {turnos.map((turno) => (
          <TableRow key={turno.id}>
            <TableCell>{turno.cliente}</TableCell>
            <TableCell>{turno.empleado}</TableCell>
            <TableCell>{turno.servicio}</TableCell>
            {/* Convertir `hora` a un string legible antes de mostrar */}
            <TableCell>
              {turno.fecha ? new Date(turno.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'Sin Hora'}
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm" className="mr-2" onClick={() => onEdit(turno)}>Editar</Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(turno.id)}>Cancelar</Button>
            </TableCell>
            <TableCell>
              {turno.cobrado ? `Cobrado ($${turno.monto})` : (
                <Button variant="secondary" size="sm" onClick={() => handleCobrar(turno)}>Cobrar</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TurnoTable;