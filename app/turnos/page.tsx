"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TurnosPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [turnos, setTurnos] = useState([
    { id: 1, cliente: 'Juan Pérez', servicio: 'Corte de cabello', hora: '10:00 AM' },
    { id: 2, cliente: 'María García', servicio: 'Tinte', hora: '2:00 PM' },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Turnos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turnos.map((turno) => (
                <TableRow key={turno.id}>
                  <TableCell>{turno.cliente}</TableCell>
                  <TableCell>{turno.servicio}</TableCell>
                  <TableCell>{turno.hora}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2">Editar</Button>
                    <Button variant="destructive" size="sm">Cancelar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Button className="mt-4">Agendar Turno</Button>
    </div>
  );
}