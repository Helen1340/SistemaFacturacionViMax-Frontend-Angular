import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResolutionService } from '../services/resolution.Service';

// Interfaz para estructurar los datos de la resolución
interface ResolutionData {
  id: number | null;
  prefix: string;
  resolution_number: string;
  document_type: string;
  resolution_date: string;
  validity_start_date: string;
  validity_end_date: string;
  start_number: number;
  end_number: number;
  current_status: string;
  environment: string;
  description?: string;
  resolutionFile?: File | null;
}

@Component({
  selector: 'app-editar-resolucion',
  // Importaciones necesarias para el binding [(ngModel)] y las directivas @if/@for
  imports: [CommonModule, FormsModule], 
  templateUrl: './editar-resolucion.html',
  styleUrl: './editar-resolucion.css' 
})
export class EditarResolucion implements OnInit {
  
  resolutionId: number | null = null;
  isLoading: boolean = true;
  
  // 📝 Objeto que se enlaza con el formulario (ngModel)
  resolutionData: ResolutionData = {
    id: null,
    prefix: '',
    resolution_number: '',
    document_type: '',
    resolution_date: '',
    validity_start_date: '',
    validity_end_date: '',
    start_number: 0,
    end_number: 0,
    current_status: 'Activo',
    environment: 'Pruebas',
    description: '',
    resolutionFile: null
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private resolutionService: ResolutionService
  ) {}

  ngOnInit() {
    // Suscribirse a los cambios de parámetros para obtener el ID
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      // Intenta convertir el ID a número. Si es null o no es válido, resultará en null.
      this.resolutionId = idParam ? +idParam : null; 
      
      if (this.resolutionId) {
        this.loadResolutionData(this.resolutionId);
      } else {
        this.isLoading = false;
        console.error('ERROR: No se encontró ID de resolución para editar.');
        // Opcional: Redireccionar si falta el ID
        // this.router.navigate(['/configuracion/resoluciones']);
      }
    });
  }
  
  /**
   * Simula la carga de datos de la resolución por ID.
   * @param id El ID de la resolución a cargar.
   */
  loadResolutionData(id: number) {
    this.isLoading = true;
    this.resolutionService.getById(id).subscribe({
      next: (data) => {
        const r = data?.data ?? data;
        if (!r) {
          this.isLoading = false;
          return;
        }
        const toDate = (val: string | null | undefined) => {
          if (!val) return '';
          return String(val).slice(0, 10);
        };
        this.resolutionData = {
          id: r.id ?? id,
          prefix: r.prefix ?? '',
          resolution_number: r.resolution_number ?? '',
          document_type: r.document_type ?? '',
          resolution_date: toDate(r.resolution_date),
          validity_start_date: toDate(r.validity_start_date),
          validity_end_date: toDate(r.validity_end_date),
          start_number: Number(r.start_number ?? 0),
          end_number: Number(r.end_number ?? 0),
          current_status: r.current_status ?? 'Activo',
          environment: r.environment === 'Producción' ? 'Produccion' : (r.environment ?? 'Pruebas'),
          description: r.description ?? '',
          resolutionFile: null
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Maneja el evento de selección de archivo PDF.
   * @param event El evento de cambio de input.
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.resolutionData.resolutionFile = (input.files && input.files.length) ? input.files[0] : null;
  }
  
  /**
   * Función que se ejecuta al enviar el formulario para actualizar la resolución.
   */
  updateResolution() {
    if (this.isLoading) return;
    if (!this.resolutionId) return;
    this.isLoading = true;
    const hasFile = !!this.resolutionData.resolutionFile;
    let req$;
    if (hasFile) {
      const formData = new FormData();
      Object.entries({
        prefix: this.resolutionData.prefix,
        resolution_number: this.resolutionData.resolution_number,
        document_type: this.resolutionData.document_type,
        resolution_date: this.resolutionData.resolution_date,
        validity_start_date: this.resolutionData.validity_start_date,
        validity_end_date: this.resolutionData.validity_end_date,
        start_number: this.resolutionData.start_number,
        end_number: this.resolutionData.end_number,
        current_status: this.resolutionData.current_status,
        environment: this.resolutionData.environment,
        description: this.resolutionData.description ?? ''
      }).forEach(([k, v]) => {
        if (v !== null && v !== undefined) formData.append(k, String(v));
      });
      formData.append('resolution_pdf_file', this.resolutionData.resolutionFile as File);
      req$ = this.resolutionService.updateMultipart(this.resolutionId, formData);
    } else {
      const body = {
        prefix: this.resolutionData.prefix,
        resolution_number: this.resolutionData.resolution_number,
        document_type: this.resolutionData.document_type,
        resolution_date: this.resolutionData.resolution_date,
        validity_start_date: this.resolutionData.validity_start_date,
        validity_end_date: this.resolutionData.validity_end_date,
        start_number: this.resolutionData.start_number,
        end_number: this.resolutionData.end_number,
        current_status: this.resolutionData.current_status,
        environment: this.resolutionData.environment,
        description: this.resolutionData.description ?? ''
      };
      req$ = this.resolutionService.updateJson(this.resolutionId, body);
    }
    req$.subscribe({
      next: () => {
        this.isLoading = false;
        alert('Resolución actualizada exitosamente');
        this.router.navigate(['/resolucion-facturas']);
      },
      error: () => {
        this.isLoading = false;
        alert('Error al actualizar la resolución');
      }
    });
  }

  /**
   * Cancela la edición y regresa a la lista.
   */
  cancel() {
    this.router.navigate(['/resolucion-facturas']);
  }
}