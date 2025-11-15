import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Interfaz para estructurar los datos de la resolución
interface ResolutionData {
  id: number | null;
  prefix: string;
  dianResolutionNumber: string;
  documentType: string;
  technicalKey: string;
  resolutionDate: string;
  validityStart: string;
  validityEnd: string;
  rangeStart: number;
  rangeEnd: number;
  isPrincipal: boolean;
  observations?: string;
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
    dianResolutionNumber: '',
    documentType: '',
    technicalKey: '',
    resolutionDate: '',
    validityStart: '',
    validityEnd: '',
    rangeStart: 0,
    rangeEnd: 0,
    isPrincipal: false,
    observations: '',
    resolutionFile: null
  };

  // 🧪 Datos de ejemplo simulados para la carga (reemplazar con un servicio real)
  private mockResolutions: ResolutionData[] = [
    {
      id: 1, prefix: 'FE', dianResolutionNumber: '187600019283', technicalKey: 'A1B2C3D4E5F6G7H8',
      documentType: 'Factura_EL', resolutionDate: '2025-01-01', validityStart: '2025-01-01',
      validityEnd: '2025-12-31', rangeStart: 1001, rangeEnd: 2000, isPrincipal: true,
      observations: 'Resolución de prueba FE.', resolutionFile: null
    },
    {
      id: 2, prefix: 'NC', dianResolutionNumber: '2001000101', technicalKey: 'H9G8F7E6D5C4B3A2',
      documentType: 'Nota_Credito', resolutionDate: '2024-01-01', validityStart: '2024-01-01',
      validityEnd: '2024-12-31', rangeStart: 1, rangeEnd: 100, isPrincipal: false,
      observations: 'Resolución de prueba NC.', resolutionFile: null
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute // 🧭 Se usa para leer el ID de la URL
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
    
    // Simula una llamada asíncrona a un servicio (API)
    setTimeout(() => { 
      const data = this.mockResolutions.find(r => r.id === id);
      if (data) {
        // Asigna los datos cargados al objeto de binding, usando una copia para no modificar el mock
        this.resolutionData = { ...data, id: id };
      } else {
        console.warn(`Resolución con ID ${id} no encontrada. Inicializando formulario vacío.`);
      }
      this.isLoading = false;
    }, 500); 
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
    if (this.isLoading) return; // Evita doble submit
    
    this.isLoading = true;
    console.log('Datos a actualizar:', this.resolutionData);
    
    // Simulación de envío de datos a la API
    setTimeout(() => {
      this.isLoading = false;
      alert(`¡Resolución ${this.resolutionData.id} actualizada exitosamente!`);
      // Redireccionar a la lista principal
      this.router.navigate(['/configuracion/resoluciones']); 
    }, 1500);
  }

  /**
   * Cancela la edición y regresa a la lista.
   */
  cancel() {
    this.router.navigate(['/configuracion/resoluciones']);
  }
}