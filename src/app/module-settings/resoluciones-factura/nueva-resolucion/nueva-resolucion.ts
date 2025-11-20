import { Component, OnInit } from '@angular/core';
import { finalize, catchError, throwError } from 'rxjs'; 
import { FormsModule } from '@angular/forms'; // Asegúrate de tener esto si es standalone
import { ResolutionService } from '../services/resolution.Service';
import { CommonModule } from '@angular/common';

// Define la estructura de datos que se enviará. company_id es opcional aquí.
interface ResolutionData {
  prefix: string;
  resolution_number: string;
  document_type: string;
  document_type_code: string;
  resolution_date: string;
  validity_start_date: string;
  validity_end_date: string;
  start_number: number | null;
  end_number: number | null;
  current_status: string;
  environment: string;
  description: string;
  company_id?: number; 
}

@Component({
  selector: 'app-nueva-resolucion',
  standalone: true, // Si usas standalone, agrega los imports necesarios
  imports: [FormsModule, CommonModule], // Asegúrate de incluir FormsModule si es standalone
  templateUrl: './nueva-resolucion.html',
  styleUrls: ['./nueva-resolucion.css'],
})
export class NuevaResolucion implements OnInit {

  // 1. PROPIEDAD DINÁMICA: Aquí almacenaremos el ID de la compañía obtenida del login
  companyId: number | null = null; 

  resolutionData: ResolutionData = {
    prefix: '',
    resolution_number: '',
    document_type: 'Factura', 
    document_type_code: '',
    resolution_date: '',
    validity_start_date: '',
    validity_end_date: '',
    start_number: null,
    end_number: null,
    current_status: 'Activo',
    environment: 'Pruebas',
    description: '',
  };

  availableAmount: number = 0;
  resolutionFile: File | null = null;
  isSaving: boolean = false; 

  constructor(private resolutionService: ResolutionService) {}

  ngOnInit(): void {
    this.calculateAvailable();
  }

  // Lógica de cálculo (Se mantiene igual)
  calculateAvailable(): void {
    const start = this.resolutionData.start_number;
    const end = this.resolutionData.end_number;

    if (start !== null && end !== null && end >= start) {
      this.availableAmount = end - start + 1;
    } else {
      this.availableAmount = 0;
    }
  }

  // Manejo de archivo (Se mantiene igual)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.resolutionFile = input.files[0];
    } else {
      this.resolutionFile = null;
    }
  }

  // ==============================
  // GUARDAR RESOLUCIÓN (LÓGICA ACTUALIZADA)
  // ==============================
  saveResolution(): void {
    if (this.isSaving) return;

    this.isSaving = true;
    
    const hasFile = !!this.resolutionFile;
    let request$;
    if (hasFile) {
      const formData = new FormData();
      Object.keys(this.resolutionData).forEach(key => {
        const value = (this.resolutionData as any)[key];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      formData.append('resolution_pdf_file', this.resolutionFile as File);
      request$ = this.resolutionService.createResolution(formData);
    } else {
      request$ = this.resolutionService.createResolutionJson(this.resolutionData);
    }

    request$.pipe(
      finalize(() => this.isSaving = false),
      catchError(err => {
        // El manejo de errores ahora está centralizado en el servicio,
        // pero aún atrapamos el error final para mostrar un mensaje claro.
        let errorMessage = 'Error al guardar. Revisa la consola para más detalles.';

        // Si el error tiene un mensaje de error explícito (ej. del throwError en el servicio)
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        
        alert(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    ).subscribe({
      next: () => {
        alert('Resolución guardada exitosamente.');
        this.resetForm();
      },
      error: (err: Error) => {
        // El error ya fue manejado y mostrado en el catchError.
        console.error('Error final de suscripción:', err);
      }
    });
  }

  // Utilerías (Se mantiene igual)
  resetForm(): void {
    this.resolutionData = {
      prefix: '',
      resolution_number: '',
      document_type: 'Factura', 
      document_type_code: '',
      resolution_date: '',
      validity_start_date: '',
      validity_end_date: '',
      start_number: null,
      end_number: null,
      current_status: 'Activo',
      environment: 'Pruebas',
      description: '',
    };
    this.availableAmount = 0;
    this.resolutionFile = null;
  }

  cancel(): void {
    console.log("Acción de cancelar ejecutada.");
  }
}