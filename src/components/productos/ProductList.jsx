export default function ProductList({ products }) {
  return (
    <section className="page-card products-card">
      <h2 className="page-title">Productos</h2>
      <p className="page-text products-summary">
        {products.length} producto{products.length === 1 ? "" : "s"} registrados
      </p>

      <div className="products-scroll">
        {products.length === 0 ? (
          <div className="products-empty">No hay productos registrados.</div>
        ) : (
          <div className="products-table-wrap">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Proveedor</th>
                </tr>
              </thead>
              <tbody>
                {products.map((producto) => (
                  <tr key={producto.id_clave}>
                    <td>
                      <span className="products-id-badge">#{producto.id_clave}</span>
                    </td>
                    <td>
                      <span className="products-table-name">
                        {producto.nombre || "Sin nombre"}
                      </span>
                    </td>
                    <td>
                      <span className="products-provider-chip">
                        {producto.proveedor || "Sin proveedor"}
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
  );
}
