// Corré esto con: node src/demo-repository.ts
// Patrón backend típico: una capa de datos genérica, reutilizable para cualquier entidad con "id".

interface ConId {
  id: number;
}

// Repository genérico: funciona para cualquier T que tenga `id`.
// En un backend real esto sería la base para UserRepository, ProductRepository, etc.
class InMemoryRepository<T extends ConId> {
  private items = new Map<number, T>();

  guardar(item: T): T {
    this.items.set(item.id, item);
    return item;
  }

  buscarPorId(id: number): T | undefined {
    return this.items.get(id);
  }

  listar(): T[] {
    return [...this.items.values()];
  }
}

interface Usuario extends ConId {
  nombre: string;
  email: string;
}

const usuarios = new InMemoryRepository<Usuario>();

usuarios.guardar({ id: 1, nombre: "Ada", email: "ada@example.com" });
usuarios.guardar({ id: 2, nombre: "Alan", email: "alan@example.com" });

// `buscarPorId` devuelve `Usuario | undefined`: TS te obliga a manejar el caso "no existe".
const encontrado = usuarios.buscarPorId(1);
if (encontrado) {
  console.log(`Encontrado: ${encontrado.nombre} <${encontrado.email}>`);
}

console.log(
  "Todos:",
  usuarios.listar().map((u) => u.nombre)
);

// La misma clase InMemoryRepository<T> serviría para Producto, Pedido, etc.
// sin reescribir nada: eso es lo que compran los genéricos en backend.
