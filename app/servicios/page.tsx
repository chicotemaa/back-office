'use client'
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Swal from "sweetalert2";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Servicio {
  id: string;
  nombre: string;
  duracion: string;
  precio: number;
  descripcion: string;
  empleados: string[]; // IDs de empleados que pueden brindar el servicio
  activo: boolean;
}

interface Empleado {
  id: string;
  nombre: string;
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]); // Lista de empleados
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newServicio, setNewServicio] = useState({
    nombre: "",
    duracion: "",
    precio: 0,
    descripcion: "",
    empleados: [] as string[], // Empleados que pueden brindar el servicio
    activo: true, // Estado por defecto activo
    id:""
  });

  // Obtener servicios y empleados de Firebase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener servicios
        const serviciosSnapshot = await getDocs(collection(db, "servicios"));
        const serviciosData = serviciosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Servicio[];
        setServicios(serviciosData);

        // Obtener empleados
        const empleadosSnapshot = await getDocs(collection(db, "empleados"));
        const empleadosData = empleadosSnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        })) as Empleado[];
        setEmpleados(empleadosData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewServicio((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "precio" ? Number(value) : value, // Convertir precio a número
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEmpleadoChange = (empleadoId: string) => {
    const selected = newServicio.empleados.includes(empleadoId);
    if (selected) {
      setNewServicio((prev) => ({
        ...prev,
        empleados: prev.empleados.filter((id) => id !== empleadoId),
      }));
    } else {
      setNewServicio((prev) => ({
        ...prev,
        empleados: [...prev.empleados, empleadoId],
      }));
    }
  };

  const handleEditServicio = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setNewServicio(servicio);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (selectedServicio) {
      setLoading(true);
      try {
        const servicioRef = doc(db, "servicios", selectedServicio.id);
        await updateDoc(servicioRef, newServicio);

        const updatedServicios = servicios.map((srv) =>
          srv.id === selectedServicio.id ? { ...srv, ...newServicio } : srv
        );
        setServicios(updatedServicios);
        setModalOpen(false);
        setIsEditing(false);

        // Confirmación de éxito con SweetAlert
        Swal.fire({
          title: 'Éxito',
          text: 'El servicio ha sido actualizado.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3085d6',
        });
      } catch (error) {
        console.error("Error al actualizar el servicio: ", error);

        // Mensaje de error con SweetAlert
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar el servicio.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddServicio = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "servicios"), newServicio);
      const newService = { id: docRef.id, ...newServicio };
      setServicios([...servicios, newService]);
      setModalOpen(false);

      // Confirmación de éxito con SweetAlert
      Swal.fire({
        title: 'Éxito',
        text: 'El servicio ha sido agregado.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      console.error("Error al agregar el servicio: ", error);

      // Mensaje de error con SweetAlert
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al agregar el servicio.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteServicio = (servicioId: string) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          // Eliminar el servicio de Firebase
          await deleteDoc(doc(db, "servicios", servicioId));

          // Actualizar el estado local para remover el servicio eliminado
          setServicios((prevServicios) => prevServicios.filter((srv) => srv.id !== servicioId));

          Swal.fire({
            title: 'Eliminado!',
            text: 'El servicio ha sido elimiado.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
          });
        } catch (error) {
          console.error("Error al eliminar el servicio: ", error);
          Swal.fire("Error!", "Hubo un problema al eliminar el servicio.", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const filteredServicios = servicios.filter((servicio) =>
    servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Servicios</h1>

      <div className="mb-4 flex justify-between items-center">
        <Input
          placeholder="Buscar servicio..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <Button color="primary" className="bg-blue-600 text-white" onClick={() => setModalOpen(true)}>
          Agregar Servicio
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Empleados</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServicios.map((servicio) => (
              <TableRow key={servicio.id}>
                <TableCell>{servicio.nombre}</TableCell>
                <TableCell>{servicio.duracion}</TableCell>
                <TableCell>{servicio.precio}</TableCell>
                <TableCell>{servicio.descripcion || "N/A"}</TableCell>
                <TableCell>
                  {Array.isArray(servicio.empleados) && servicio.empleados.length > 0
                    ? servicio.empleados
                        .map((empleadoId) => empleados.find((emp) => emp.id === empleadoId)?.nombre)
                        .filter(Boolean)
                        .join(", ")
                    : "No asignado"}
                </TableCell>
                <TableCell>{servicio.activo ? "Sí" : "No"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2 bg-yellow-500 text-white"
                    onClick={() => handleEditServicio(servicio)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 text-white"
                    onClick={() => handleDeleteServicio(servicio.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Modal Integrado */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Servicio" : "Agregar Servicio"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Edita los detalles del servicio." : "Agrega un nuevo servicio al sistema."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nombre"
                name="nombre"
                value={newServicio.nombre}
                onChange={handleChange}
                className="mb-2"
              />
              <Input
                placeholder="Duración"
                name="duracion"
                value={newServicio.duracion}
                onChange={handleChange}
                className="mb-2"
              />
              <Input
                placeholder="Precio"
                name="precio"
                type="number"
                value={newServicio.precio}
                onChange={handleChange}
                className="mb-2"
              />
              <Input
                placeholder="Descripción"
                name="descripcion"
                value={newServicio.descripcion}
                onChange={handleChange}
                className="mb-2"
              />
              <div>
                <label>Empleados que brindan el servicio:</label>
                {empleados.length > 0 ? (
                  empleados.map((empleado) => (
                    <div key={empleado.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newServicio.empleados.includes(empleado.id)}
                        onChange={() => handleEmpleadoChange(empleado.id)}
                      />
                      <label>{empleado.nombre}</label>
                    </div>
                  ))
                ) : (
                  <p>No hay empleados disponibles</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="activo"
                  checked={newServicio.activo}
                  onChange={handleChange}
                />
                <label>Activo</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleSaveChanges : handleAddServicio} className="bg-green-600 text-white">
                {isEditing ? "Guardar Cambios" : "Agregar Servicio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
