'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TurnoTable from '@/components/ui/TurnoTable';
import TurnoFormModal from '@/components/ui/TurnosFormModal';
import { Button } from '@/components/ui/button';
import { getDocs, collection, doc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { debounce } from 'lodash'; // Debounce para limitar las llamadas
import { db } from '@/lib/firebase';

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

interface Cliente {
  id: string;
  nombre: string;
}

interface Empleado {
  id: string;
  nombre: string;
}

interface Servicio {
  id: string;
  nombre: string;
  precio: number;
}

interface Caja {
  id: string;
  nombre: string;
}

export default function TurnosPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTurno, setNewTurno] = useState<Turno>({
    id: '',
    fecha: '',
    cliente: '',
    empleado: '',
    servicio: '',
    cobrado: false,
    monto: 0,
  });

  // Fetch Data from Firebase once
  const fetchAllData = useCallback(
    debounce(async () => {
      setLoading(true);
      try {
        const snapshots = await Promise.all([
          getDocs(collection(db, 'turnos')),
          getDocs(collection(db, 'clientes')),
          getDocs(collection(db, 'empleados')),
          getDocs(collection(db, 'servicios')),
          getDocs(collection(db, 'cajas')),
        ]);

        // Procesar y almacenar datos en el estado
        setTurnos(snapshots[0].docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Turno[]);
        setClientes(snapshots[1].docs.map((doc) => ({ id: doc.id, nombre: doc.data().nombre })) as Cliente[]);
        setEmpleados(snapshots[2].docs.map((doc) => ({ id: doc.id, nombre: doc.data().nombre })) as Empleado[]);
        setServicios(snapshots[3].docs.map((doc) => ({ id: doc.id, nombre: doc.data().nombre, precio: doc.data().precio })) as Servicio[]);
        setCajas(snapshots[4].docs.map((doc) => ({ id: doc.id, nombre: doc.data().nombre })) as Caja[]);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Memoize turnos for better performance
  const turnosMemo = useMemo(() => turnos, [turnos]);

  const handleEditTurno = useCallback((turno: Turno) => {
    setSelectedTurno(turno);
    setNewTurno(turno);
    setIsEditing(true);
    setModalOpen(true);
  }, []);

  const handleCobrarTurno = useCallback(
    async (turno: Turno) => {
      const { value: cajaId } = await Swal.fire({
        title: 'Seleccionar Caja',
        input: 'select',
        inputOptions: cajas.reduce((options, caja) => {
          options[caja.id] = caja.nombre;
          return options;
        }, {} as Record<string, string>),
        inputPlaceholder: 'Selecciona una caja',
        showCancelButton: true,
        confirmButtonText: 'Cobrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'red',
        inputValidator: (value) => {
          if (!value) {
            return 'Debes seleccionar una caja';
          }
        },
      });

      if (cajaId) {
        setLoading(true);
        try {
          const turnoRef = doc(db, 'turnos', turno.id);
          await updateDoc(turnoRef, {
            cobrado: true,
            cajaId,
          });

          setTurnos((prevTurnos) =>
            prevTurnos.map((t) => (t.id === turno.id ? { ...t, cobrado: true, cajaId } : t))
          );
          Swal.fire('Cobrado!', 'El turno ha sido marcado como cobrado.', 'success');
        } catch (error) {
          console.error('Error al marcar el turno como cobrado:', error);
          Swal.fire('Error!', 'Hubo un problema al marcar el turno como cobrado.', 'error');
        } finally {
          setLoading(false);
        }
      }
    },
    [cajas]
  );

  const handleSaveChanges = useCallback(async () => {
    if (selectedTurno) {
      setLoading(true);
      try {
        const turnoRef = doc(db, 'turnos', selectedTurno.id);
        await updateDoc(turnoRef, {
          ...newTurno,
        });

        setTurnos((prevTurnos) =>
          prevTurnos.map((t) => (t.id === selectedTurno.id ? { ...t, ...newTurno } : t))
        );
        setModalOpen(false);
        setIsEditing(false);
      } catch (error) {
        console.error('Error al actualizar el turno:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [newTurno, selectedTurno]);

  const handleAddTurno = useCallback(async () => {
    if (!newTurno.fecha) {
      Swal.fire('Error', 'Por favor selecciona una fecha y una hora válidas para el turno.', 'error');
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'turnos'),
        where('cliente', '==', newTurno.cliente),
        where('fecha', '==', newTurno.fecha)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        Swal.fire('Error', 'Ya existe un turno para este cliente en el mismo horario.', 'error');
        setLoading(false);
        return;
      }

      const { id, ...turnoData } = newTurno;
      const docRef = await addDoc(collection(db, 'turnos'), {
        ...turnoData,
        fecha: new Date(turnoData.fecha).toISOString(),
      });
      const newTurn = { id: docRef.id, ...turnoData, fecha: new Date(turnoData.fecha).toISOString() };
      setTurnos((prevTurnos) => [...prevTurnos, newTurn]);
      setModalOpen(false);
    } catch (error) {
      console.error('Error al agregar el turno:', error);
      Swal.fire('Error', 'Hubo un problema al agregar el turno. Inténtalo de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  }, [newTurno]);

  const handleDeleteTurno = useCallback((turnoId: string) => {
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
          await deleteDoc(doc(db, 'turnos', turnoId));
          setTurnos((prevTurnos) => prevTurnos.filter((t) => t.id !== turnoId));
          Swal.fire('Eliminado!', 'El turno ha sido eliminado.', 'success');
        } catch (error) {
          console.error('Error al eliminar el turno:', error);
          Swal.fire('Error!', 'Hubo un problema al eliminar el turno.', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  }, []);

  const filteredTurnos = turnos
    .filter((turno) => {
      const turnoFecha = new Date(turno.fecha);
      return date && turnoFecha.toISOString().split('T')[0] === date.toISOString().split('T')[0];
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Turnos</h1>
      <Button className="mt-4 mb-4" onClick={() => setModalOpen(true)}>Agendar Turno</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 ">
        <div className="max-w-xs mx-auto">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={(selectedDate) => setDate(selectedDate ? new Date(selectedDate) : undefined)}
            className="rounded-md border"
          />
        </div>
        <div className="flex-grow">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TurnoTable turnos={filteredTurnos} onEdit={handleEditTurno} onDelete={handleDeleteTurno} onCobrar={handleCobrarTurno} />
          )}
        </div>
      </div>

      {/* Modal Integrado */}
      {modalOpen && (
        <TurnoFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          isEditing={isEditing}
          newTurno={newTurno}
          setNewTurno={setNewTurno}
          clientes={clientes}
          empleados={empleados}
          servicios={servicios}
          onSave={isEditing ? handleSaveChanges : handleAddTurno}
        />
      )}
    </div>
  );
}
