import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ASSIGNMENTS_TABLE = "productos_departamentos";

function parseProductKey(value) {
  const idClave = Number(value);
  if (!Number.isInteger(idClave) || idClave <= 0) {
    return null;
  }

  return idClave;
}

function parseDepartmentKey(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
}

export default function AsignarProductos() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [altaProductId, setAltaProductId] = useState("");
  const [altaDepartmentKey, setAltaDepartmentKey] = useState("");
  const [createErrorMessage, setCreateErrorMessage] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bajaProductId, setBajaProductId] = useState("");
  const [bajaDepartmentKey, setBajaDepartmentKey] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  const getAsignaciones = useCallback(async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from(ASSIGNMENTS_TABLE)
      .select("id_clave, claveDepto")
      .order("claveDepto", { ascending: true })
      .order("id_clave", { ascending: true });

    setIsLoading(false);

    if (error) {
      if (error.code === "42P01") {
        setLoadErrorMessage(
          `No existe la tabla '${ASSIGNMENTS_TABLE}'. Debes crearla para asignar productos.`
        );
      } else {
        setLoadErrorMessage("No se pudo cargar el listado de asignaciones.");
      }
      setAsignaciones([]);
      return;
    }

    setLoadErrorMessage("");
    setAsignaciones(data ?? []);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      getAsignaciones();
    });
  }, [getAsignaciones]);

  async function verifyProductExists(idClave) {
    const { data, error } = await supabase
      .from("productos")
      .select("id_clave")
      .eq("id_clave", idClave)
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        message: "No se pudo validar la clave del producto.",
      };
    }

    if (!data) {
      return {
        ok: false,
        message: "No existe un producto con ese ID.",
      };
    }

    return { ok: true };
  }

  async function verifyDepartmentExists(claveDepto) {
    const { data, error } = await supabase
      .from("departamentos")
      .select("claveDepto")
      .eq("claveDepto", claveDepto)
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        message: "No se pudo validar la clave del departamento.",
      };
    }

    if (!data) {
      return {
        ok: false,
        message: "No existe un departamento con esa clave.",
      };
    }

    return { ok: true };
  }

  function openCreateModal() {
    setCreateErrorMessage("");
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setAltaProductId("");
    setAltaDepartmentKey("");
    setCreateErrorMessage("");
  }

  function openDeleteModal() {
    setDeleteErrorMessage("");
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    setBajaProductId("");
    setBajaDepartmentKey("");
    setDeleteErrorMessage("");
  }

  async function createAsignacion() {
    const parsedProductId = parseProductKey(altaProductId);
    const parsedDepartmentKey = parseDepartmentKey(altaDepartmentKey);

    if (parsedProductId === null) {
      setCreateErrorMessage(
        "Clave de producto invalida. Debe ser un numero entero positivo."
      );
      return;
    }

    if (parsedDepartmentKey === null) {
      setCreateErrorMessage("Clave de departamento invalida.");
      return;
    }

    setIsSaving(true);
    setCreateErrorMessage("");

    const productValidation = await verifyProductExists(parsedProductId);
    if (!productValidation.ok) {
      setIsSaving(false);
      setCreateErrorMessage(productValidation.message);
      return;
    }

    const departmentValidation = await verifyDepartmentExists(parsedDepartmentKey);
    if (!departmentValidation.ok) {
      setIsSaving(false);
      setCreateErrorMessage(departmentValidation.message);
      return;
    }

    const { error } = await supabase.from(ASSIGNMENTS_TABLE).insert({
      id_clave: parsedProductId,
      claveDepto: parsedDepartmentKey,
    });

    setIsSaving(false);

    if (error) {
      if (error.code === "23505") {
        setCreateErrorMessage("Esa asignacion ya existe.");
        return;
      }

      if (error.code === "42P01") {
        setCreateErrorMessage(
          `No existe la tabla '${ASSIGNMENTS_TABLE}'. Debes crearla en Supabase.`
        );
        return;
      }

      setCreateErrorMessage("No se pudo guardar la asignacion.");
      return;
    }

    await getAsignaciones();
    closeCreateModal();
  }

  async function deleteAsignacion() {
    const parsedProductId = parseProductKey(bajaProductId);
    const parsedDepartmentKey = parseDepartmentKey(bajaDepartmentKey);

    if (parsedProductId === null) {
      setDeleteErrorMessage(
        "Clave de producto invalida. Debe ser un numero entero positivo."
      );
      return;
    }

    if (parsedDepartmentKey === null) {
      setDeleteErrorMessage("Clave de departamento invalida.");
      return;
    }

    setIsSaving(true);
    setDeleteErrorMessage("");

    const { data: asignacion, error: relationCheckError } = await supabase
      .from(ASSIGNMENTS_TABLE)
      .select("id_clave, claveDepto")
      .eq("id_clave", parsedProductId)
      .eq("claveDepto", parsedDepartmentKey)
      .maybeSingle();

    if (relationCheckError) {
      setIsSaving(false);

      if (relationCheckError.code === "42P01") {
        setDeleteErrorMessage(
          `No existe la tabla '${ASSIGNMENTS_TABLE}'. Debes crearla en Supabase.`
        );
        return;
      }

      setDeleteErrorMessage("No se pudo validar la asignacion.");
      return;
    }

    if (!asignacion) {
      setIsSaving(false);
      setDeleteErrorMessage("No existe una asignacion con esas claves.");
      return;
    }

    const { error } = await supabase
      .from(ASSIGNMENTS_TABLE)
      .delete()
      .eq("id_clave", parsedProductId)
      .eq("claveDepto", parsedDepartmentKey);

    setIsSaving(false);

    if (error) {
      setDeleteErrorMessage("No se pudo borrar la asignacion.");
      return;
    }

    await getAsignaciones();
    closeDeleteModal();
  }

  return (
    <div className="products-layout">
      <section className="page-card products-card">
        <h2 className="page-title">Asignar Productos</h2>
        <p className="page-text products-summary">
          {asignaciones.length} asignacion
          {asignaciones.length === 1 ? "" : "es"} registrada
          {asignaciones.length === 1 ? "" : "s"}
        </p>

        <div className="products-scroll">
          {isLoading ? (
            <div className="products-empty">Cargando asignaciones...</div>
          ) : loadErrorMessage ? (
            <div className="products-empty text-red-700">{loadErrorMessage}</div>
          ) : asignaciones.length === 0 ? (
            <div className="products-empty">No hay asignaciones registradas.</div>
          ) : (
            <div className="products-table-wrap">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID producto</th>
                    <th>Clave departamento</th>
                  </tr>
                </thead>
                <tbody>
                  {asignaciones.map((asignacion) => (
                    <tr key={`${asignacion.id_clave}-${asignacion.claveDepto}`}>
                      <td>
                        <span className="products-id-badge">#{asignacion.id_clave}</span>
                      </td>
                      <td>
                        <span className="products-provider-chip">
                          {asignacion.claveDepto}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <aside className="products-actions">
        <button
          type="button"
          onClick={openCreateModal}
          className="products-btn products-btn--primary"
          disabled={isSaving}
        >
          Alta producto
        </button>
        <button
          type="button"
          onClick={openDeleteModal}
          className="products-btn products-btn--danger"
          disabled={isSaving}
        >
          Baja producto
        </button>
      </aside>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Alta de producto
            </h3>

            <label className="mb-3 block">
              <span className="mb-1 block text-sm text-slate-700">
                Clave del producto
              </span>
              <input
                type="text"
                value={altaProductId}
                onChange={(event) => setAltaProductId(event.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Ejemplo: 5"
              />
            </label>

            <label className="mb-2 block">
              <span className="mb-1 block text-sm text-slate-700">
                Clave del departamento
              </span>
              <input
                type="text"
                value={altaDepartmentKey}
                onChange={(event) => setAltaDepartmentKey(event.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                placeholder="Ejemplo: depto_ventas"
              />
            </label>

            {createErrorMessage && (
              <p className="mt-2 text-sm text-red-600">{createErrorMessage}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={createAsignacion}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Baja de producto
            </h3>

            <label className="mb-3 block">
              <span className="mb-1 block text-sm text-slate-700">
                Clave del producto
              </span>
              <input
                type="text"
                value={bajaProductId}
                onChange={(event) => setBajaProductId(event.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
                placeholder="Ejemplo: 5"
              />
            </label>

            <label className="mb-2 block">
              <span className="mb-1 block text-sm text-slate-700">
                Clave del departamento
              </span>
              <input
                type="text"
                value={bajaDepartmentKey}
                onChange={(event) => setBajaDepartmentKey(event.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
                placeholder="Ejemplo: depto_ventas"
              />
            </label>

            {deleteErrorMessage && (
              <p className="mt-2 text-sm text-red-600">{deleteErrorMessage}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={deleteAsignacion}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Borrando..." : "Borrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
