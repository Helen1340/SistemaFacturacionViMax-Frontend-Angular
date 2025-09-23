import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientService } from '../services/client.service';

export interface Cliente {
  id: number;
  nombreRazon: string;
  documento: string; // Combined tipo_documento + numero_documento
  direccion: string;
  pais: string;
  email: string;
  telefono?: string;
  descripcion?: string;
  estado?: 'Activo' | 'Inactivo';
}

// Interface for API response
interface ClienteApiResponse {
  id: number;
  nombre: string;
  tipo_documento: string;
  numero_documento: string;
  direccion?: string;
  pais: string;
  correo_electronico: string;
  estado?: 'Activo' | 'Inactivo';
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit, OnDestroy {
  
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  terminoBusqueda: string = '';
  filtroSeleccionado: string = '';
  private subscription: Subscription = new Subscription();
  cargando: boolean = false;
  openMenuIndex: number | null = null;
  dropdownTop: number = 0;
  dropdownLeft: number = 0;

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalClientes: number = 0;
  totalPages: number = 0;

  constructor(private clientService: ClientService, private router: Router) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cargarClientes(): void {
    this.cargando = true;
    this.subscription.add(
      this.clientService.getClientesConFiltro().subscribe({
        next: (usuarios: any[]) => {
          // Filtrar solo usuarios con rol ID 4 (cliente)
          const clientesConRol4 = usuarios.filter(usuario => {
            return usuario.rol_id === 4 || usuario.rol === 4 || usuario.role_id === 4;
          });
          
          // Transform the API response to match our interface
          this.clientes = clientesConRol4.map(cliente => ({
            id: cliente.id,
            nombreRazon: cliente.nombre,
            documento: `${cliente.tipo_documento} - ${cliente.numero_documento}`,
            direccion: cliente.direccion || '-',
            pais: cliente.pais,
            email: cliente.correo_electronico,
            telefono: cliente.telefono || '',
            descripcion: cliente.descripcion || '',
            estado: cliente.estado || 'Activo'
          }));
          this.clientesFiltrados = [...this.clientes];
          this.totalClientes = this.clientes.length;
          this.calculatePagination();
          this.cargando = false;
        },
        error: (error) => {
          this.cargando = false;
        }
      })
    );
  }

  buscarClientes(): void {
    if (!this.terminoBusqueda.trim()) {
      this.clientesFiltrados = [...this.clientes];
    } else {
      const termino = this.terminoBusqueda.toLowerCase();
      this.clientesFiltrados = this.clientes.filter(cliente => {
        switch (this.filtroSeleccionado) {
          case 'numero':
            return cliente.documento.toLowerCase().includes(termino);
          case 'nombre':
            return cliente.nombreRazon.toLowerCase().includes(termino);
          default:
            return cliente.nombreRazon.toLowerCase().includes(termino) ||
                   cliente.documento.toLowerCase().includes(termino) ||
                   cliente.email.toLowerCase().includes(termino);
        }
      });
    }
    
    this.totalClientes = this.clientesFiltrados.length;
    this.currentPage = 1;
    this.calculatePagination();
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroSeleccionado = '';
    this.clientesFiltrados = [...this.clientes];
    this.totalClientes = this.clientes.length;
    this.currentPage = 1;
    this.calculatePagination();
  }

  toggleMenu(index: number, event: Event): void {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const menuWidth = 192; // w-48 = 12rem = 192px
    const margin = 6;
    const left = rect.right - menuWidth;
    const top = rect.bottom + margin;
    this.dropdownLeft = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    this.dropdownTop = Math.max(8, Math.min(top, window.innerHeight - 8));
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  // Obtener acciones disponibles para un cliente
  getAvailableActions(estado: string): string[] {

    return ['Ver Detalles', 'Editar', 'Eliminar'];

   
  }

  // Ejecutar acción
  executeAction(action: string, cliente: Cliente): void {
    this.openMenuIndex = null; // Cerrar dropdown
    
    switch (action) {

      case 'Ver Detalles':

        this.verCliente(cliente);
        break;
      case 'Editar':
        this.editarCliente(cliente);
        break;
      case 'Eliminar':
        this.eliminarCliente(cliente);
        break;
    }
  }
  
  verCliente(cliente: Cliente): void {
    console.log('ver cliente:', cliente);
    this.router.navigate(['/ver-cliente', cliente.id]);
  }


  verCliente(cliente: Cliente): void {
    this.router.navigate(['/ver-cliente', cliente.id]);
  }

  editarCliente(cliente: Cliente): void {
    this.router.navigate(['/editar-cliente', cliente.id]);
  }

  eliminarCliente(cliente: Cliente): void {
    if (confirm(`¿Está seguro de que desea eliminar el cliente ${cliente.nombreRazon}?`)) {
      this.subscription.add(
        this.clientService.deleteCliente(cliente.id).subscribe({
          next: () => {
            this.cargarClientes(); // Recargar la lista
          },
          error: (error) => {
            // Error al eliminar cliente
          }
        })
      );
    }
  }

  nuevoCliente(): void {
    this.router.navigate(['/nuevo-cliente']);
  }

  verHistorial(): void {
    // Aquí implementarías la navegación al historial
  }

  trackByClienteId(index: number, cliente: Cliente): number {
    return cliente.id;
  }

  // Paginación
  get paginatedClientes(): Cliente[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.clientesFiltrados.slice(startIndex, endIndex);
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.totalClientes / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get startItem(): number {
    if (this.totalClientes === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalClientes);
  }
}
