'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

interface Caja {
  id: string;
  nombre: string;
  tipo: 'efectivo' | 'banco';
  active: boolean;
}

interface Pago {
  id: string;
  monto: number;
  cajaId: string;
}

interface Turno {
  id: string;
  monto: number;
  cobrado: boolean;
  cajaId?: string;
}

export default function CajasPage() {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(false);

  // Obtener datos de Firebase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cajasSnapshot, pagosSnapshot, turnosSnapshot] = await Promise.all([
          getDocs(collection(db, 'cajas')),
          getDocs(collection(db, 'pagos')),
          getDocs(collection(db, 'turnos')),
        ]);

        const cajasData = cajasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Caja[];

        const pagosData = pagosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pago[];

        const turnosData = turnosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Turno[];

        setCajas(cajasData);
        setPagos(pagosData);
        setTurnos(turnosData);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calcular el total en cada caja
  const calcularTotalCaja = (cajaId: string) => {
    const totalPagos = pagos
      .filter((pago) => pago.cajaId === cajaId)
      .reduce((total, pago) => total + pago.monto, 0);

    const totalTurnos = turnos
      .filter((turno) => turno.cobrado && turno.cajaId === cajaId)
      .reduce((total, turno) => total + turno.monto, 0);

    return  totalTurnos - totalPagos ;
  };

  // Agregar nueva caja
  const handleAddCaja = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Agregar Caja',
      html:
        '<div class="flex flex-col gap-4">' +
        '<input id="swal-input1" class="swal2-input" placeholder="Nombre de la Caja">' +
        '<select id="swal-input2" class="swal2-input bg-white text-black">' +
        '<option value="efectivo">Efectivo</option>' +
        '<option value="banco">Banco</option>' +
        '</select>' +
        '</div>',
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLSelectElement).value,
        ];
      },
    });

    if (formValues) {
      const [nombre, tipo] = formValues;
      if (nombre && tipo) {
        setLoading(true);
        try {
          const newCaja = {
            nombre,
            tipo: tipo as 'efectivo' | 'banco',
            active: true, // Nueva caja activa por defecto
          };
          const docRef = await addDoc(collection(db, 'cajas'), newCaja);
          setCajas([...cajas, { id: docRef.id, ...newCaja }]);
          Swal.fire('Éxito', 'Caja agregada correctamente', 'success');
        } catch (error) {
          console.error('Error al agregar la caja:', error);
          Swal.fire('Error', 'Hubo un problema al agregar la caja. Inténtalo de nuevo.', 'error');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Editar caja
  const handleEditCaja = async (caja: Caja) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Caja',
      html:
        '<div class="flex flex-col gap-4">' +
        `<input id="swal-input1" class="swal2-input" value="${caja.nombre}" placeholder="Nombre de la Caja">` +
        `<select id="swal-input2" class="swal2-input bg-white text-black">
          <option value="efectivo" ${caja.tipo === 'efectivo' ? 'selected' : ''}>Efectivo</option>
          <option value="banco" ${caja.tipo === 'banco' ? 'selected' : ''}>Banco</option>
        </select>` +
        '</div>',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLSelectElement).value,
        ];
      },
    });

    if (formValues) {
      const [nombre, tipo] = formValues;
      if (nombre && tipo) {
        setLoading(true);
        try {
          const cajaRef = doc(db, 'cajas', caja.id);
          await updateDoc(cajaRef, { nombre, tipo });

          const updatedCajas = cajas.map((c) =>
            c.id === caja.id ? { ...c, nombre, tipo: tipo as 'efectivo' | 'banco' } : c
          );
          setCajas(updatedCajas);
          Swal.fire('Éxito', 'Caja actualizada correctamente', 'success');
        } catch (error) {
          console.error('Error al actualizar la caja:', error);
          Swal.fire('Error', 'Hubo un problema al actualizar la caja. Inténtalo de nuevo.', 'error');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Soft delete: marcar la caja como inactiva y restar pagos de turnos
  const handleDeleteCaja = async (cajaId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const cajaRef = doc(db, 'cajas', cajaId);
          // Marcar como inactiva
          await updateDoc(cajaRef, { active: false });

          // Restar pagos de los turnos cobrados
          const turnosConCaja = turnos.filter((turno) => turno.cobrado && turno.cajaId === cajaId);
          turnosConCaja.forEach(async (turno) => {
            const turnoRef = doc(db, 'turnos', turno.id);
            await updateDoc(turnoRef, { cobrado: false, cajaId: null }); // Restar pago
          });

          const updatedCajas = cajas.map((c) => (c.id === cajaId ? { ...c, active: false } : c));
          setCajas(updatedCajas);

          Swal.fire('Eliminado!', 'La caja ha sido eliminada.', 'success');
        } catch (error) {
          console.error('Error al eliminar la caja:', error);
          Swal.fire('Error!', 'Hubo un problema al eliminar la caja.', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lista de Cajas</h1>
      <Button className="mt-4 mb-4" onClick={handleAddCaja}>Agregar Caja</Button>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total en Caja</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cajas
              .filter((caja) => caja.active) // Mostrar solo las cajas activas
              .map((caja) => (
                <TableRow key={caja.id}>
                  <TableCell>{caja.nombre}</TableCell>
                  <TableCell>{caja.tipo.charAt(0).toUpperCase() + caja.tipo.slice(1)}</TableCell>
                  <TableCell>${calcularTotalCaja(caja.id).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditCaja(caja)}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCaja(caja.id)}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
