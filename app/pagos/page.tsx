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
}

interface Pago {
  id: string;
  tipo: 'empleado' | 'producto' | 'servicio';
  destinatario: string;
  fecha: string;
  monto: number;
  cajaId: string; 
}

export default function PagosPage() {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);

  // Obtener la fecha actual sin hora
  const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato 'YYYY-MM-DD'

  // Obtener pagos de Firebase
  useEffect(() => {
    const fetchPagos = async () => {
      setLoading(true);
      try {
        const pagosSnapshot = await getDocs(collection(db, 'pagos'));
        const pagosData = pagosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pago[];
        setPagos(pagosData);
      } catch (error) {
        console.error('Error al obtener pagos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPagos();
  }, []);
  
  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const cajasSnapshot = await getDocs(collection(db, 'cajas'));
        const cajasData = cajasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Caja[];
        setCajas(cajasData);
      } catch (error) {
        console.error('Error al obtener cajas:', error);
      }
    };
    fetchCajas();
  }, []);

  // Agregar nuevo pago
  const handleAddPago = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Agregar Pago',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Tipo (empleado, producto, servicio)">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Destinatario">' +
        `<input id="swal-input3" class="swal2-input" type="number" placeholder="Monto">` +
        `<input id="swal-input5" class="swal2-input" type="date" value="${today}">` +  // Campo de fecha con valor por defecto de hoy
        `<select id="swal-input4" class="swal2-input  bg-white text-black mt-2 border-black">
          ${cajas.map((caja) => `<option value="${caja.id}">${caja.nombre}</option>`).join('')}
        </select>`,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',    
      confirmButtonColor:'green',
      cancelButtonColor:'red',
      customClass: {
        confirmButton: 'text-black bg-white border border-gray-300', // Estilo del botón de confirmación
        cancelButton: 'text-black bg-white border border-gray-300'   // Estilo del botón de cancelación
      },
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value,
          (document.getElementById('swal-input3') as HTMLInputElement).value,
          (document.getElementById('swal-input5') as HTMLInputElement).value,  // Fecha seleccionada
          (document.getElementById('swal-input4') as HTMLSelectElement).value, // Caja seleccionada
        ];
      },
    });
  
    if (formValues) {
      const [tipo, destinatario, monto, fecha, cajaId] = formValues;
      if (tipo && destinatario && monto && cajaId) {
        setLoading(true);
        try {
          const newPago = {
            tipo: tipo as 'empleado' | 'producto' | 'servicio',
            destinatario,
            fecha, // Fecha sin horas
            monto: parseFloat(monto),
            cajaId, // Referencia a la caja seleccionada
          };
          const docRef = await addDoc(collection(db, 'pagos'), newPago);
          setPagos([...pagos, { id: docRef.id, ...newPago }]);
          Swal.fire({
            title: 'Exito',
            text: 'Pago generado correctamente',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: 'green',
            customClass: {
              confirmButton: 'text-black bg-white border border-gray-300' // Estilo del botón de confirmación
            }
          });
        } catch (error) {
          console.error('Error al agregar el pago:', error);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al actualizar el pago. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: 'red',
            customClass: {
              confirmButton: 'text-black bg-white border border-gray-300' // Estilo del botón de confirmación
            }
          });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Editar pago
  const handleEditPago = async (pago: Pago) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Pago',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Tipo" value="${pago.tipo}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Destinatario" value="${pago.destinatario}">` +
        `<input id="swal-input3" class="swal2-input" placeholder="Monto" type="number" value="${pago.monto}">` +
        `<input id="swal-input5" class="swal2-input" type="date" value="${pago.fecha.split('T')[0]}">` + // Campo de fecha para editar sin horas
        `<select id="swal-input4" class="swal2-input bg-white text-black mt-2 border-black">
        ${cajas.map((caja) => `<option value="${caja.id}">${caja.nombre}</option>`).join('')}
        </select>
        `,
      focusConfirm: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: 'green',
      customClass: {
        confirmButton: 'text-black bg-white border border-gray-300', // Estilo del botón de confirmación
        cancelButton: 'text-black bg-white border border-gray-300'   // Estilo del botón de cancelación
      },
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value,
          (document.getElementById('swal-input3') as HTMLInputElement).value,
          (document.getElementById('swal-input5') as HTMLInputElement).value,  // Fecha seleccionada sin horas
          (document.getElementById('swal-input4') as HTMLSelectElement).value, // Caja seleccionada
        ];
      },
    });
  
    if (formValues) {
      const [tipo, destinatario, monto, fecha, cajaId] = formValues;
      if (tipo && destinatario && monto && cajaId) {
        setLoading(true);
        try {
          const pagoRef = doc(db, 'pagos', pago.id);
          await updateDoc(pagoRef, {
            tipo: tipo as 'empleado' | 'producto' | 'servicio',
            destinatario,
            monto: parseFloat(monto),
            fecha, // Actualizamos la fecha sin horas
            cajaId, // Actualizamos la referencia a la caja seleccionada
          });
  
          const updatedPagos = pagos.map((p) =>
            p.id === pago.id ? { ...p, tipo, destinatario, monto: parseFloat(monto), fecha, cajaId } : p
          );
          setPagos(updatedPagos);
          Swal.fire({
            title: 'Éxito',
            text: 'Pago actualizado correctamente',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: 'green',
            customClass: {
              confirmButton: 'text-black bg-white border border-gray-300' // Estilo del botón de confirmación
            }
          });
        } catch (error) {
          console.error('Error al actualizar el pago:', error);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al actualizar el pago. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: 'red',
            customClass: {
              confirmButton: 'text-black bg-white border border-gray-300' // Estilo del botón de confirmación
            }
          });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Eliminar pago
  const handleDeletePago = (pagoId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      customClass: {
        confirmButton: 'text-black bg-white border border-gray-300', // Estilo del botón de confirmación
        cancelButton: 'text-black bg-white border border-gray-300'   // Estilo del botón de cancelación
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await deleteDoc(doc(db, 'pagos', pagoId));
          setPagos((prevPagos) => prevPagos.filter((p) => p.id !== pagoId));
          Swal.fire('Eliminado!', 'El pago ha sido eliminado.', 'success');
        } catch (error) {
          console.error('Error al eliminar el pago:', error);
          Swal.fire('Error!', 'Hubo un problema al eliminar el pago.', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lista de Pagos Realizados</h1>
      <Button className="mt-4 mb-4" onClick={handleAddPago}>Agregar Pago</Button>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Destinatario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Caja</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagos.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell>{pago.tipo.charAt(0).toUpperCase() + pago.tipo.slice(1)}</TableCell>
                <TableCell>{pago.destinatario}</TableCell>
                <TableCell>{pago.fecha.split('T')[0]}</TableCell> {/* Fecha sin horas */}
                <TableCell>${pago.monto.toFixed(2)}</TableCell>
                <TableCell>{cajas.find(caja => caja.id === pago.cajaId)?.nombre || 'N/A'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditPago(pago)}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeletePago(pago.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
