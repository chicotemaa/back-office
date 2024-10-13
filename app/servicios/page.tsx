
"use client"; 
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
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newServicio, setNewServicio] = useState({
    nombre: '',
    duracion: '',
    precio: 0,
  });

  // Obtener servicios de Firebase
  useEffect(() => {
    const fetchServicios = async () => {
      setLoading(true);
      try {
        const serviciosSnapshot = await getDocs(collection(db, "servicios"));
        const serviciosData = serviciosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Servicio[];
        setServicios(serviciosData);
      } catch (error) {
        console.error("Error al obtener servicios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServicios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewServicio((prev) => ({
      ...prev,
      [name]: name === "precio" ? Number(value) : value, // Convertir precio a número
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
      } catch (error) {
        console.error("Error al actualizar el servicio: ", error);
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
    } catch (error) {
      console.error("Error al agregar el servicio: ", error);
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

          Swal.fire("Eliminado!", "El servicio ha sido eliminado.", "success");
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
      <div className="mb-4">
        <Input
          placeholder="Buscar servicio..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
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
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServicios.map((servicio) => (
              <TableRow key={servicio.id}>
                <TableCell>{servicio.nombre}</TableCell>
                <TableCell>{servicio.duracion}</TableCell>
                <TableCell>{servicio.precio}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditServicio(servicio)}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteServicio(servicio.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Button className="mt-4" onClick={() => setModalOpen(true)}>Agregar Servicio</Button>

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
                type="number" // Cambiado para que acepte números
                value={newServicio.precio}
                onChange={handleChange}
                className="mb-2"
              />
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleSaveChanges : handleAddServicio}>
                {isEditing ? "Guardar Cambios" : "Agregar Servicio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
