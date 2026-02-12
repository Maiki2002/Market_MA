import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ProductActions from "../components/productos/ProductActions";
import ProductList from "../components/productos/ProductList";
import CreateProductModal from "../components/productos/CreateProductModal";
import DeleteProductModal from "../components/productos/DeleteProductModal";
import { downloadRowsAsTxt } from "../utils/downloadTxt";

export default function Productos() {
  const [dataProductos, setDataProductos] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [nombre, setNombre] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [idToDelete, setIdToDelete] = useState("");
  const [isCheckingDelete, setIsCheckingDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  useEffect(() => {
    getDataProductos();
  }, []);

  async function getDataProductos() {
    const { data } = await supabase
      .from("productos")
      .select()
      .order("id_clave", { ascending: true });

    setDataProductos(data ?? []);
  }

  function openCreateModal() {
    setCreateErrorMessage("");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setNombre("");
    setProveedor("");
    setCreateErrorMessage("");
  }

  function openDeleteModal() {
    setDeleteErrorMessage("");
    setProductToDelete(null);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setIdToDelete("");
    setProductToDelete(null);
    setDeleteErrorMessage("");
  }

  function handleDeleteIdChange(value) {
    setIdToDelete(value);
    setProductToDelete(null);
    setDeleteErrorMessage("");
  }

  async function insertDataProductos() {
    if (!nombre.trim() || !proveedor.trim()) {
      setCreateErrorMessage("Completa los dos campos.");
      return;
    }

    setIsSaving(true);
    setCreateErrorMessage("");

    const { data: maxIdRow, error: maxIdError } = await supabase
      .from("productos")
      .select("id_clave")
      .order("id_clave", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxIdError) {
      setIsSaving(false);
      setCreateErrorMessage("No se pudo obtener el ID maximo.");
      return;
    }

    const currentMaxId = Number(maxIdRow?.id_clave ?? 0);
    if (!Number.isInteger(currentMaxId) || currentMaxId < 0) {
      setIsSaving(false);
      setCreateErrorMessage("El ID maximo actual no es valido.");
      return;
    }

    const nextId = currentMaxId + 1;

    const { error } = await supabase
      .from("productos")
      .insert({
        id_clave: nextId,
        nombre: nombre.trim(),
        proveedor: proveedor.trim(),
      });

    setIsSaving(false);

    if (error) {
      setCreateErrorMessage("No se pudo guardar el producto.");
      return;
    }

    await getDataProductos();
    closeCreateModal();
  }

  async function deleteDataProductos() {
    if (!productToDelete) {
      setDeleteErrorMessage("Primero verifica el ID del producto.");
      return;
    }

    const idClave = Number(productToDelete.id_clave);

    if (!Number.isInteger(idClave) || idClave <= 0) {
      setDeleteErrorMessage("ID invalido. Debe ser un numero entero positivo.");
      return;
    }

    setIsSaving(true);
    setDeleteErrorMessage("");

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id_clave", idClave);

    setIsSaving(false);

    if (error) {
      setDeleteErrorMessage("No se pudo borrar el producto.");
      return;
    }

    await getDataProductos();
    closeDeleteModal();
  }

  async function verifyProductToDelete() {
    const idClave = Number(idToDelete);

    if (!Number.isInteger(idClave) || idClave <= 0) {
      setDeleteErrorMessage("ID invalido. Debe ser un numero entero positivo.");
      setProductToDelete(null);
      return;
    }

    setIsCheckingDelete(true);
    setDeleteErrorMessage("");
    setProductToDelete(null);

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id_clave", idClave)
      .maybeSingle();

    setIsCheckingDelete(false);

    if (error) {
      setDeleteErrorMessage("No se pudo validar el producto.");
      return;
    }

    if (!data) {
      setDeleteErrorMessage("No existe un producto con ese ID.");
      return;
    }

    setProductToDelete(data);
  }

  function downloadProductos() {
    downloadRowsAsTxt("productos.txt", dataProductos);
  }

  return (
    <div className="products-layout">
      <ProductList products={dataProductos} />

      <ProductActions
        onOpenCreate={openCreateModal}
        onOpenDelete={openDeleteModal}
        onDownload={downloadProductos}
        disabled={isSaving}
      />

      <CreateProductModal
        isOpen={isCreateModalOpen}
        nombre={nombre}
        proveedor={proveedor}
        errorMessage={createErrorMessage}
        isSaving={isSaving}
        onChangeNombre={setNombre}
        onChangeProveedor={setProveedor}
        onClose={closeCreateModal}
        onSave={insertDataProductos}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        idToDelete={idToDelete}
        productToDelete={productToDelete}
        errorMessage={deleteErrorMessage}
        isCheckingDelete={isCheckingDelete}
        isSaving={isSaving}
        onChangeId={handleDeleteIdChange}
        onVerify={verifyProductToDelete}
        onClose={closeDeleteModal}
        onDelete={deleteDataProductos}
      />
    </div>
  );
}
