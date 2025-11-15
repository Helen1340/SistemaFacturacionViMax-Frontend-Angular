import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, Role } from '../services/user.service';
import { CommonModule } from '@angular/common';

export interface User {
  id: number;
  company_id: number;
  role_id: number;
  first_name: string;
  document_type: 'NIT' | 'CC' | 'CE';
  document_number: string;
  address: string;
  country: string;
  description?: string;
  password?: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  last_access?: string;
  remember_token?: string | null;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: Role[] = [];
  searchTerm: string = '';
  filterValue: string = '';
  openDropdownId: number | null = null;
  dropdownTop: number = 0;
  dropdownLeft: number = 0;
  isLoading: boolean = false;
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalUsers: number = 0;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadRoles();
    document.addEventListener('click', () => this.openDropdownId = null);
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        // Filtrar usuarios que NO sean clientes usando los roles cargados
        this.users = (users || []).filter(user => {
          const userRole = this.roles.find(role => role.id === user.role_id);
          return userRole && !userRole.role_name.toLowerCase().includes('client');
        });
        this.filteredUsers = [...this.users];
        this.totalUsers = this.users.length;
        this.calculatePagination();
        this.isLoading = false;
      },
      error: () => {
        this.users = [];
        this.filteredUsers = [];
        this.totalUsers = 0;
        this.isLoading = false;
        alert('Error al cargar los usuarios. Verifica que la API esté funcionando.');
      }
    });
  }

  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        // Filtrar roles de cliente/clientes para el módulo de usuarios
        this.roles = (roles || []).filter(role => 
          !role.role_name.toLowerCase().includes('cliente')
        );
        // Cargar usuarios después de que los roles estén listos
        this.loadUsers();
      },
      error: () => {
        console.log('Fallo la carga de roles');
        // Cargar usuarios después de que los roles estén listos
        this.loadUsers();
      }
    });
  }

  viewUser(user: User) {
    this.openDropdownId = null;
    this.router.navigate(['/ver-usuario', user.id]);
  }

  editUser(user: User) {
    this.openDropdownId = null;
    this.router.navigate(['/editar-usuario', user.id]);
  }

  UpdateUserStatus(user: User) {
    if (!confirm(`¿Estás seguro de que deseas ${user.status === 'Active' ? 'desactivar' : 'activar'} este usuario?`)) {
      return;
    }
    
    this.openDropdownId = null;
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
    this.userService.toggleUserStatus(user.id, newStatus).subscribe({
      next: () => {
        alert(`Usuario ${newStatus === 'Inactive' ? 'desactivado' : 'activado'} correctamente`);
        this.loadUsers();
      },
      error: () => {
        alert('Error al cambiar el estado del usuario');
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  onFilter() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = this.users;

    // Búsqueda por texto
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.document_number.toLowerCase().includes(term)
      );
    }

    // Filtro por estado o rol
    if (this.filterValue) {
      if (this.filterValue === 'active') {
        filtered = filtered.filter(user => user.status === 'Active');
      } else if (this.filterValue === 'Inactive') {
        filtered = filtered.filter(user => user.status === 'Inactive');
      } else if (this.filterValue.startsWith('rol_')) {
        const roleId = parseInt(this.filterValue.split('_')[1]);
        filtered = filtered.filter(user => user.role_id === roleId);
      }
    }

    this.filteredUsers = filtered;
    this.totalUsers = filtered.length;
    this.currentPage = 1;
    this.calculatePagination();
  }

  getDocumentTypeClass(tipo: string): string {
    const classes: { [key: string]: string } = {
      'CC': 'bg-blue-100 text-blue-800',
      'CE': 'bg-purple-100 text-purple-800',
      'NIT': 'bg-orange-100 text-orange-800'
    };
    return classes[tipo] || 'bg-gray-100 text-gray-800';
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

  toggleDropdown(event: Event, userId: number) {
    event.stopPropagation();
    
    if (this.openDropdownId === userId) {
      this.openDropdownId = null;
      return;
    }
    
    // Calcular posición del dropdown
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const menuWidth = 160; // w-40 = 10rem = 160px
    const menuHeight = 120; // Altura aproximada del dropdown
    
    // Posición horizontal: alineado a la derecha del botón
    this.dropdownLeft = rect.right - menuWidth;
    
    // Posición vertical: debajo del botón, pero ajustada si se sale de pantalla
    let top = rect.bottom + 4;
    
    // Si se sale por abajo, mostrarlo arriba
    if (top + menuHeight > window.innerHeight) {
      top = rect.top - menuHeight - 4;
    }
    
    // Asegurar que no se salga por arriba
    if (top < 8) {
      top = 8;
    }
    
    // Asegurar que no se salga por los lados
    if (this.dropdownLeft < 8) {
      this.dropdownLeft = 8;
    } else if (this.dropdownLeft + menuWidth > window.innerWidth - 8) {
      this.dropdownLeft = window.innerWidth - menuWidth - 8;
    }
    
    this.dropdownTop = top;
    this.openDropdownId = userId;
  }



  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }
  
  calculatePagination() {
    this.totalPages = Math.ceil(this.totalUsers / this.itemsPerPage);
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
    if (this.totalUsers === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalUsers);
  }

  navigateToNewUser() {
    this.router.navigate(['/nuevo-usuario']);
  }
  
  trackByFn(index: number, user: User): number {
    return user.id;
  }
}