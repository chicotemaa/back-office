'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TurnoTable from '@/components/ui/TurnoTable';
import TurnoFormModal from '@/components/ui/TurnosFormModal';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';

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
  const [cajas, setCajas] = useState<Caja[]>([]); // Estado para las cajas
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

  // Obtener turnos, clientes, empleados, servicios y cajas de Firebase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [turnosSnapshot, clientesSnapshot, empleadosSnapshot, serviciosSnapshot, cajasSnapshot] = await Promise.all([
          getDocs(collection(db, 'turnos')),
          getDocs(collection(db, 'clientes')),
          getDocs(collection(db, 'empleados')),
          getDocs(collection(db, 'servicios')),
          getDocs(collection(db, 'cajas')), // Obtener las cajas
        ]);

        // Procesar los datos de turnos, clientes, empleados, servicios y cajas
        const turnosData = turnosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha,
        })) as Turno[];
        setTurnos(turnosData);

        const clientesData = clientesSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        })) as Cliente[];
        setClientes(clientesData);

        const empleadosData = empleadosSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        })) as Empleado[];
        setEmpleados(empleadosData);

        const serviciosData = serviciosSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
          precio: doc.data().precio,
        })) as Servicio[];
        setServicios(serviciosData);

        const cajasData = cajasSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        })) as Caja[];
        setCajas(cajasData);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditTurno = (turno: Turno) => {
    setSelectedTurno(turno);
    setNewTurno(turno);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleCobrarTurno = async (turno: Turno) => {
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
          cajaId, // Asignamos la caja seleccionada
        });

        const updatedTurnos = turnos.map((t) =>
          t.id === turno.id ? { ...t, cobrado: true, cajaId } : t
        );
        setTurnos(updatedTurnos);
        Swal.fire('Cobrado!', 'El turno ha sido marcado como cobrado.', 'success');
      } catch (error) {
        console.error('Error al marcar el turno como cobrado:', error);
        Swal.fire('Error!', 'Hubo un problema al marcar el turno como cobrado.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (selectedTurno) {
      setLoading(true);
      try {
        const turnoRef = doc(db, 'turnos', selectedTurno.id);
        await updateDoc(turnoRef, {
          ...newTurno,
        });

        const updatedTurnos = turnos.map((t) =>
          t.id === selectedTurno.id ? { ...t, ...newTurno } : t
        );
        setTurnos(updatedTurnos);
        setModalOpen(false);
        setIsEditing(false);
      } catch (error) {
        console.error('Error al actualizar el turno:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddTurno = async () => {
    if (!newTurno.fecha) {
      Swal.fire('Error', 'Por favor selecciona una fecha y una hora válidas para el turno.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { id, ...turnoData } = newTurno;
      const docRef = await addDoc(collection(db, 'turnos'), {
        ...turnoData,
        fecha: new Date(turnoData.fecha).toISOString(),
      });
      const newTurn = { id: docRef.id, ...turnoData, fecha: new Date(turnoData.fecha).toISOString() };
      setTurnos([...turnos, newTurn]);
      setModalOpen(false);
    } catch (error) {
      console.error('Error al agregar el turno:', error);
      Swal.fire('Error', 'Hubo un problema al agregar el turno. Inténtalo de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTurno = (turnoId: string) => {
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
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={(selectedDate) => setDate(selectedDate ? new Date(selectedDate) : undefined)}
            className="rounded-md border"
          />
        </div>
        <div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
            <TurnoTable turnos={filteredTurnos} onEdit={handleEditTurno} onDelete={handleDeleteTurno} onCobrar={handleCobrarTurno} />
            </>
           
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
