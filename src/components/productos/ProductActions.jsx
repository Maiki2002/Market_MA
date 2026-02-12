export default function ProductActions({
  onOpenCreate,
  onOpenDelete,
  onDownload,
  disabled,
}) {
  return (
    <aside className="products-actions">
      <button
        type="button"
        onClick={onOpenCreate}
        className="products-btn products-btn--primary"
      >
        Nuevo producto
      </button>
      <button
        type="button"
        onClick={onOpenDelete}
        className="products-btn products-btn--danger"
        disabled={disabled}
      >
        Borrar producto
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="products-btn products-btn--secondary bg-green-600"
      >
        Descargar Reporte
      </button>
    </aside>
  );
}
