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

function parsePrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return price;
}

export default function Precios() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [productId, setProductId] = useState("");
  const [departmentKey, setDepartmentKey] = useState("");
  const [price, setPrice] = useState("");
  const [verifiedRelation, setVerifiedRelation] = useState(null);
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getRows = useCallback(async () => {
    setIsLoading(true);

    const { data, error } = await supabase
      .from(ASSIGNMENTS_TABLE)
      .select("id_clave, claveDepto, precio")
      .order("claveDepto", { ascending: true })
      .order("id_clave", { ascending: true });

    setIsLoading(false);

    if (error) {
      if (error.code === "42P01") {
        setLoadMessage(
          `No existe la tabla '${ASSIGNMENTS_TABLE}'. Debes crearla en Supabase.`
        );
      } else if (error.code === "42703") {
        setLoadMessage(
          `Falta la columna 'precio' en '${ASSIGNMENTS_TABLE}'. Agregala para usar este modulo.`
        );
      } else {
        setLoadMessage("No se pudo cargar el listado de precios.");
      }
      setRows([]);
      return;
    }

    setLoadMessage("");
    setRows(data ?? []);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      getRows();
    });
  }, [getRows]);

  function resetVerification() {
    setVerifiedRelation(null);
    setFormErrorMessage("");
    setSuccessMessage("");
  }

  async function verifyRelation() {
    const parsedProductId = parseProductKey(productId);
    const parsedDepartmentKey = parseDepartmentKey(departmentKey);

    setVerifiedRelation(null);
    setSuccessMessage("");
    setFormErrorMessage("");

    if (parsedProductId === null) {
      setFormErrorMessage(
        "Clave de producto invalida. Debe ser un numero entero positivo."
      );
      return;
    }

    if (parsedDepartmentKey === null) {
      setFormErrorMessage("Clave de departamento invalida.");
      return;
    }

    setIsSaving(true);

    const { data: product, error: productError } = await supabase
      .from("productos")
      .select("id_clave")
      .eq("id_clave", parsedProductId)
      .maybeSingle();

    if (productError) {
      setIsSaving(false);
      setFormErrorMessage("No se pudo validar la clave del producto.");
      return;
    }

    if (!product) {
      setIsSaving(false);
      setFormErrorMessage("No existe un producto con ese ID.");
      return;
    }

    const { data: department, error: departmentError } = await supabase
      .from("departamentos")
      .select("claveDepto")
      .eq("claveDepto", parsedDepartmentKey)
      .maybeSingle();

    if (departmentError) {
      setIsSaving(false);
      setFormErrorMessage("No se pudo validar la clave del departamento.");
      return;
    }

    if (!department) {
      setIsSaving(false);
      setFormErrorMessage("No existe un departamento con esa clave.");
      return;
    }

    const { data: relation, error: relationError } = await supabase
      .from(ASSIGNMENTS_TABLE)
      .select("id_clave, claveDepto, precio")
      .eq("id_clave", parsedProductId)
      .eq("claveDepto", parsedDepartmentKey)
      .maybeSingle();

    setIsSaving(false);

    if (relationError) {
      if (relationError.code === "42P01") {
        setFormErrorMessage(
          `No existe la tabla '${ASSIGNMENTS_TABLE}'. Debes crearla en Supabase.`
        );
      } else if (relationError.code === "42703") {
        setFormErrorMessage(
          `Falta la columna 'precio' en '${ASSIGNMENTS_TABLE}'. Agregala para asignar precio.`
        );
      } else {
        setFormErrorMessage("No se pudo validar la asignacion.");
      }
      return;
    }

    if (!relation) {
      setFormErrorMessage(
        "No existe la asignacion entre ese producto y departamento."
      );
      return;
    }

    setVerifiedRelation(relation);
    setPrice(String(relation.precio ?? ""));
    setSuccessMessage("Relacion verificada. Ya puedes asignar el precio.");
  }

  async function savePrice() {
    if (!verifiedRelation) {
      setFormErrorMessage(
        "Primero verifica la relacion de producto y departamento."
      );
      return;
    }

    const parsedPrice = parsePrice(price);
    if (parsedPrice === null) {
      setFormErrorMessage("Precio invalido. Debe ser un numero mayor o igual a 0.");
      return;
    }

    setIsSaving(true);
    setFormErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from(ASSIGNMENTS_TABLE)
      .update({ precio: parsedPrice })
      .eq("id_clave", verifiedRelation.id_clave)
      .eq("claveDepto", verifiedRelation.claveDepto);

    setIsSaving(false);

    if (error) {
      if (error.code === "42703") {
        setFormErrorMessage(
          `Falta la columna 'precio' en '${ASSIGNMENTS_TABLE}'. Agregala para asignar precio.`
        );
        return;
      }

      setFormErrorMessage("No se pudo guardar el precio.");
      return;
    }

    setSuccessMessage("Precio guardado correctamente.");
    await getRows();
  }

  return (
    <div className="products-layout">
      <section className="page-card products-card">
        <h2 className="page-title">Precios</h2>
        <p className="page-text products-summary">
          {rows.length} asignacion{rows.length === 1 ? "" : "es"} con precio
        </p>

        <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-3">
          <label className="mb-3 block">
            <span className="mb-1 block text-sm text-slate-700">
              Clave del departamento
            </span>
            <input
              type="text"
              value={departmentKey}
              onChange={(event) => {
                setDepartmentKey(event.target.value);
                resetVerification();
              }}
              className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Ejemplo: depto_ventas"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm text-slate-700">
              Clave del producto
            </span>
            <input
              type="text"
              value={productId}
              onChange={(event) => {
                setProductId(event.target.value);
                resetVerification();
              }}
              className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Ejemplo: 5"
            />
          </label>

          <button
            type="button"
            onClick={verifyRelation}
            className="mb-3 rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? "Verificando..." : "Verificar relacion"}
          </button>

          <label className="mb-2 block">
            <span className="mb-1 block text-sm text-slate-700">Precio</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Ejemplo: 49.90"
            />
          </label>

          {formErrorMessage && (
            <p className="mt-2 text-sm text-red-600">{formErrorMessage}</p>
          )}
          {successMessage && (
            <p className="mt-2 text-sm text-emerald-700">{successMessage}</p>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={savePrice}
              className="products-btn products-btn--primary"
              disabled={isSaving || !verifiedRelation}
            >
              {isSaving ? "Guardando..." : "Asignar precio"}
            </button>
          </div>
        </div>

        <div className="products-scroll">
          {isLoading ? (
            <div className="products-empty">Cargando precios...</div>
          ) : loadMessage ? (
            <div className="products-empty text-red-700">{loadMessage}</div>
          ) : rows.length === 0 ? (
            <div className="products-empty">No hay asignaciones para mostrar.</div>
          ) : (
            <div className="products-table-wrap">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID producto</th>
                    <th>Clave departamento</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.id_clave}-${row.claveDepto}`}>
                      <td>
                        <span className="products-id-badge">#{row.id_clave}</span>
                      </td>
                      <td>
                        <span className="products-provider-chip">{row.claveDepto}</span>
                      </td>
                      <td>
                        <span className="products-table-name">
                          {row.precio === null || row.precio === undefined
                            ? "-"
                            : String(row.precio)}
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
    </div>
  );
}
