// src/app/module-product-service/servicio-product-serv/producto-o-servicio.interface.ts

// Esta interfaz debe incluir todos los campos de Producto y Servicio.
export interface producto{
  id: number;
  referencia?: string;
  nombre: string;
  tipo: string;
  cantidad?: number;
  impuesto?: number;
  precio: number;
  estado?: string;
  showMenu?: boolean;
}