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
import { Progress } from "@/components/ui/progress";

interface Producto {
  id: string;
  nombre: string;
  cantidad: number;
  maximo: number;
  costo:number;
  precioventa:number
}

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProducto, setNewProducto] = useState({
    nombre: '',
    cantidad: 0,
    maximo: 0,
    costo:0,
    precioventa:0
  });

  // Obtener productos de Firebase
  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const productosSnapshot = await getDocs(collection(db, "productos"));
        const productosData = productosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Producto[];
        setProductos(productosData);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProducto((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEditProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setNewProducto(producto);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSaveChanges = async () => {
    if (selectedProducto) {
      setLoading(true);
      try {
        const productoRef = doc(db, "productos", selectedProducto.id);
        await updateDoc(productoRef, newProducto);

        const updatedProductos = productos.map((prod) =>
          prod.id === selectedProducto.id ? { ...prod, ...newProducto } : prod
        );
        setProductos(updatedProductos);
        setModalOpen(false);
        setIsEditing(false);
      } catch (error) {
        console.error("Error al actualizar el producto: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddProducto = async () => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "productos"), newProducto);
      const newProduct = { id: docRef.id, ...newProducto };
      setProductos([...productos, newProduct]);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al agregar el producto: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProducto = (productoId: string) => {
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
          // Eliminar el producto de Firebase
          await deleteDoc(doc(db, "productos", productoId));

          // Actualizar el estado local para remover el producto eliminado
          setProductos((prevProductos) => prevProductos.filter((prod) => prod.id !== productoId));

          Swal.fire("Eliminado!", "El producto ha sido eliminado.", "success");
        } catch (error) {
          console.error("Error al eliminar el producto: ", error);
          Swal.fire("Error!", "Hubo un problema al eliminar el producto.", "error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de Stock</h1>
      <div className="mb-4">
        <Input
          placeholder="Buscar producto..."
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
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Precio de venta</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProductos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {producto.cantidad}
                    
                  </div>
                </TableCell>
                <TableCell>{producto.costo}</TableCell>
                <TableCell>{producto.precioventa}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEditProducto(producto)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteProducto(producto.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Button className="mt-4" onClick={() => setModalOpen(true)}>Agregar Producto</Button>

      {/* Modal Integrado */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Edita los detalles del producto." : "Agrega un nuevo producto al sistema."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <Input
                placeholder="Nombre"
                name="nombre"
                value={newProducto.nombre}
                onChange={handleChange}
                className="mb-2"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <Input
                placeholder="Cantidad"
                name="cantidad"
                type="number"
                value={newProducto.cantidad}
                onChange={handleChange}
                title={`Cantidad actual: ${newProducto.cantidad}`}
                className="mb-2"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Máxima</label>
              <Input
                placeholder="Cantidad Máxima"
                name="maximo"
                type="number"
                value={newProducto.maximo}
                onChange={handleChange}
                title={`Cantidad máxima: ${newProducto.maximo}`}
                className="mb-2"
              />
               <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
              <Input
                placeholder="Costo"
                name="costo"
                type="number"
                value={Number(newProducto.costo)}
                onChange={handleChange}
                title={`Costo: ${newProducto.maximo}`}
                className="mb-2"
              />
               <label className="block text-sm font-medium text-gray-700 mb-1">Precio de venta</label>
              <Input
                placeholder="Precio de venta"
                name="precioventa"
                type="number"
                value={Number(newProducto.precioventa)}
                onChange={handleChange}
                title={`Costo: ${newProducto.precioventa}`}
                className="mb-2"
              />
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleSaveChanges : handleAddProducto}>
                {isEditing ? "Guardar Cambios" : "Agregar Producto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}