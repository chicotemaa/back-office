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
}

export default function CajasPage() {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [loading, setLoading] = useState(false);

  // Obtener cajas de Firebase
  useEffect(() => {
    const fetchCajas = async () => {
      setLoading(true);
      try {
        const cajasSnapshot = await getDocs(collection(db, 'cajas'));
        const cajasData = cajasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

  // Agregar nueva caja
  const handleAddCaja = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Agregar Caja',
      html:
      '<div class="flex flex-col gap-4">' +
      '<input id="swal-input1" class="swal2-input border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Nombre de la Caja" />' +
      '<select id="swal-input2" class="swal2-input border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black">' + // Fondo blanco y texto negro
      '<option value="efectivo">Efectivo</option>' +
      '<option value="banco">Banco</option>' +
      '</select>' +
      '</div>',
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      confirmButtonColor:'green',
      cancelButtonColor:'red',
      cancelButtonText: 'Cancelar',
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
          };
          const docRef = await addDoc(collection(db, 'cajas'), newCaja);
          setCajas([...cajas, { id: docRef.id, ...newCaja }]);
          Swal.fire({
            title: 'Éxito',
            text: 'Caja agregada correctamente',
            icon: 'success',
            confirmButtonText: 'ok',
            confirmButtonColor: 'green'
          });
        } catch (error) {
          console.error('Error al agregar la caja:', error);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al actualizar la caja. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'ok',
            confirmButtonColor: 'red'
          });
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
        `<input id="swal-input1" class="swal2-input border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black" placeholder="Nombre" value="${caja.nombre}">` +
        `<select id="swal-input2" class="swal2-input border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-black">
        <option value="efectivo" ${caja.tipo === 'efectivo' ? 'selected' : ''}>Efectivo</option>
        <option value="banco" ${caja.tipo === 'banco' ? 'selected' : ''}>Banco</option>
      </select>` +
    '</div>',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor:'green',
      cancelButtonColor:'red',
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
          await updateDoc(cajaRef, {
            nombre,
            tipo: tipo as 'efectivo' | 'banco',
          });

          const updatedCajas = cajas.map((c) =>
            c.id === caja.id ? { ...c, nombre, tipo: tipo as 'efectivo' | 'banco' } : c
          );
          setCajas(updatedCajas);
          Swal.fire({
            title: 'Éxito',
            text: 'Caja agregada correctamente',
            icon: 'success',
            confirmButtonText: 'ok',
            confirmButtonColor: 'green'
          });
        } catch (error) {
          console.error('Error al actualizar la caja:', error);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al actualizar la caja. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'ok',
            confirmButtonColor: 'red'
          });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Eliminar caja
  const handleDeleteCaja = (cajaId: string) => {
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
          await deleteDoc(doc(db, 'cajas', cajaId));
          setCajas((prevCajas) => prevCajas.filter((c) => c.id !== cajaId));
          Swal.fire({
            title: 'Éxito',
            text: 'Caja eliminada correctamente',
            icon: 'success',
            confirmButtonText: 'ok',
            confirmButtonColor: 'green'
          });
        } catch (error) {
          console.error('Error al eliminar la caja:', error);
          Swal.fire({
            title: 'Éxito',
            text: 'Hubo un problema al eliminar la caja',
            icon: 'error',
            confirmButtonText: 'ok',
            confirmButtonColor: 'red'
          });
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
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cajas.map((caja) => (
              <TableRow key={caja.id}>
                <TableCell>{caja.nombre}</TableCell>
                <TableCell>{caja.tipo.charAt(0).toUpperCase() + caja.tipo.slice(1)}</TableCell>
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
