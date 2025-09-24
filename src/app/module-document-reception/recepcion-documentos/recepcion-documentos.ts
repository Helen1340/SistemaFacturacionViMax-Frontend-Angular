import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DocumentsService } from './services/documents.service';


// Interfaz actualizada para el tipo de documento recibido
interface ReceivedDocument {
  id: number;
  tipo_documento: string;
  ambiente: string;
  modo_emision: string;
  fecha_validacion: string;
  estado_dian: string;
}

@Component({
  selector: 'app-recepcion-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recepcion-documentos.html',
  styleUrl: './recepcion-documentos.css',
})
export class RecepcionDocumentos implements AfterViewInit {
  // Estado del menú hamburguesa (si se necesita)
  isMenuOpen = false;

  // Estado de la búsqueda y filtro
  searchTerm: string = '';
  filterValue: string = '';
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;
  openDropdownId: number | null = null;
  private allDocuments: ReceivedDocument[] = [];

  // Paginación
  paginatedDocuments: ReceivedDocument[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  startItem: number = 0;
  endItem: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private documentsService: DocumentsService
  ) {}

  ngAfterViewInit(): void {
    this.fetchDocuments();
  }

  // --- Lógica de carga de datos ---
  fetchDocuments(): void {
    this.isLoading = true;
    this.documentsService.getReceivedDocuments().pipe(
      catchError(error => {
        console.error('Error fetching documents', error);
        this.isLoading = false;
        return of([]); // Devuelve un array vacío en caso de error
      })
    ).subscribe(documents => {
      this.allDocuments = documents;
      this.totalItems = this.allDocuments.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updatePagination();
      this.isLoading = false;
    });
  }

  // --- Lógica de búsqueda y filtro ---
  onSearch(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  onFilter(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  applyFilters(): ReceivedDocument[] {
    let filtered = this.allDocuments;

    // Búsqueda por término
    if (this.searchTerm) {
      filtered = filtered.filter(doc =>
        doc.tipo_documento.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.ambiente.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        doc.modo_emision.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrado por estado
    if (this.filterValue) {
      filtered = filtered.filter(doc =>
        doc.estado_dian.toLowerCase() === this.filterValue.toLowerCase()
      );
    }
    
    // Filtrado por rango de fechas
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.fecha_validacion);
        return docDate >= start && docDate <= end;
      });
    }

    return filtered;
  }

  // --- Lógica de paginación ---
  updatePagination(): void {
    const filteredDocuments = this.applyFilters();
    this.totalItems = filteredDocuments.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    this.startItem = this.totalItems > 0 ? startIndex + 1 : 0;
    this.endItem = endIndex;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  trackByFn(index: number, item: any): number {
    return item.id;
  }

  // --- Lógica de acciones ---
  toggleDropdown(event: Event, id: number): void {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  viewDocument(id: number): void {
    // Lógica para ver los detalles del documento
    this.router.navigate([`/recepcion/${id}`]);
    this.openDropdownId = null;
  }

  acceptDocument(id: number): void {
    // Lógica para aceptar el documento.
    console.log(`Aceptando documento con ID: ${id}`);
    this.documentsService.updateDocumentStatus(id, 'Aceptado').subscribe({
      next: () => {
        console.log('Documento aceptado exitosamente');
        // Vuelve a cargar los documentos para reflejar el cambio
        this.fetchDocuments();
      },
      error: (err) => {
        console.error('Error al aceptar el documento', err);
      }
    });
    this.openDropdownId = null;
  }

  rejectDocument(id: number): void {
    // Lógica para rechazar el documento.
    console.log(`Rechazando documento con ID: ${id}`);
    this.documentsService.updateDocumentStatus(id, 'Rechazado').subscribe({
      next: () => {
        console.log('Documento rechazado exitosamente');
        this.fetchDocuments();
      },
      error: (err) => {
        console.error('Error al rechazar el documento', err);
      }
    });
    this.openDropdownId = null;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}