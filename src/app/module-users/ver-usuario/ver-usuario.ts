import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, Role } from '../services/user.service';
import { User } from '../usuarios/usuarios';

@Component({
  selector: 'app-ver-usuario',
  imports: [CommonModule],
  templateUrl: './ver-usuario.html',
  styleUrl: './ver-usuario.css'
})
export class VerUsuario implements OnInit {
  usuarioData: User | null = null;
  roles: Role[] = [];
  usuarioId!: number;
  isLoadingUser = false;
  showNotification = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.route.params.subscribe(params => {
      this.usuarioId = +params['id'];
      if (this.usuarioId) {
        this.loadUser();
      } else {
        this.showNotification = true;
        this.notificationType = 'error';
        this.notificationMessage = 'ID de usuario no válido';
        this.router.navigate(['/usuarios']);
      }
    });
  }

  private loadUser(): void {
    this.isLoadingUser = true;
    this.userService.getUserById(this.usuarioId).subscribe({
      next: (user) => {
        this.usuarioData = user;
        this.isLoadingUser = false;
      },
      error: () => {
        this.showNotification = true;
        this.notificationType = 'error';
        this.notificationMessage = 'Error al cargar los datos del usuario';
        this.isLoadingUser = false;
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

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        // Filtrar roles de cliente/clientes para el módulo de usuarios
        this.roles = (roles || []).filter(role => 
          !role.role_name.toLowerCase().includes('cliente')
        );
      },
      error: () => {
        console.log('Fallo la carga de roles, ');
      }
    });
  }

  getRoleName(roleId: number): string {
    if (!roleId) {
      return 'Sin rol';
    }
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.role_name : 'Cargando...';
  }

  getRoleClass(role: string): string {
    const classes: { [key: string]: string } = {
      'administrador': 'bg-green-100 text-green-800',
      'facturador': 'bg-blue-100 text-blue-800',
      'editor': 'bg-purple-100 text-purple-800',
      'visualizador': 'bg-yellow-100 text-yellow-800',
      'usuario': 'bg-gray-100 text-gray-800',
      'sin rol': 'bg-red-100 text-red-800',
      'cargando...': 'bg-gray-200 text-gray-600'
    };
    return classes[role.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  getStatusClass(status: string): string {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  onVolver(): void {
    this.router.navigate(['/usuarios']);
  }

  onEditarUsuario(): void {
    if (this.usuarioData?.id) {
      this.router.navigate(['/editar-usuario', this.usuarioData.id]);
    }
  }
}