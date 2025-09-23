import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../services/client.service';
import { Cliente } from '../clientes/clientes';

@Component({
  selector: 'app-ver-cliente',
  imports: [CommonModule],
  templateUrl: './ver-cliente.html',
  styleUrl: './ver-cliente.css'
})
export class VerCliente implements OnInit {
  clienteData: Cliente | null = null;
  clienteId!: number;
  isLoadingCliente = false;
  showNotification = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage = '';

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clienteId = +params['id'];
      if (this.clienteId) {
        this.loadCliente();
      } else {
        this.showNotification = true;
        this.notificationType = 'error';
        this.notificationMessage = 'ID de cliente no válido';
        this.router.navigate(['/clientes']);
      }
    });
  }

  private loadCliente(): void {
    this.isLoadingCliente = true;
    
    // Usar el mismo método que funciona para la lista de clientes
    this.clientService.getClientesConFiltro().subscribe({
      next: (usuarios: any[]) => {
        // Filtrar el cliente específico por ID
        const clienteEncontrado = usuarios.find(usuario => usuario.id === this.clienteId);
        
        if (clienteEncontrado) {
          // Transformar los datos de la API al formato esperado usando los campos reales de la BD
          this.clienteData = {
            id: clienteEncontrado.id,
            nombreRazon: clienteEncontrado.nombre || '',
            documento: `${clienteEncontrado.tipo_documento || ''} - ${clienteEncontrado.numero_documento || ''}`,
            direccion: clienteEncontrado.direccion || '-',
            pais: clienteEncontrado.pais || '',
            email: clienteEncontrado.correo_electronico || '',
            telefono: clienteEncontrado.telefono || '',
            descripcion: clienteEncontrado.descripcion || '',
            estado: clienteEncontrado.estado || 'Activo'
          };
        } else {
          this.showNotification = true;
          this.notificationType = 'error';
          this.notificationMessage = 'Cliente no encontrado';
        }
        
        this.isLoadingCliente = false;
      },
      error: (error) => {
        this.showNotification = true;
        this.notificationType = 'error';
        this.notificationMessage = 'Error al cargar los datos del cliente';
        this.isLoadingCliente = false;
      }
    });
  }

  getDocumentTypeClass(tipo: string): string {
    const classes: { [key: string]: string } = {
      'CC': 'bg-blue-100 text-blue-800',
      'CE': 'bg-purple-100 text-purple-800',
      'NIT': 'bg-orange-100 text-orange-800'
    };
    return classes[tipo] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: string): string {
    return status === 'Activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  onVolver(): void {
    this.router.navigate(['/clientes']);
  }

  onEditarCliente(): void {
    if (this.clienteData?.id) {
      this.router.navigate(['/editar-cliente', this.clienteData.id]);
    }
  }
}
