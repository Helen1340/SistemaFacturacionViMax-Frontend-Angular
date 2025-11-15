import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosServicioService } from '../service/productos-servicio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-regitrar-servicio',
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './regitrar-servicio.html',
  styleUrl: './regitrar-servicio.css'
})
export class RegitrarServicio {
  servicioForm: FormGroup;
  selectedTaxIds: number[] = [];
  taxes: any[] = [];
  measurementUnits: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private servicioService: ProductosServicioService,
    private router: Router
  ) {
    this.servicioForm = this.fb.group({
      service_code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      measurement_unit_id: ['', Validators.required],
      unit_price: [0, [Validators.required, Validators.min(0.01)]],
      status: ['Active', Validators.required],
      description: ['']
    });

    this.cargarUnidades();
    this.cargarImpuestos();
  }

  cargarUnidades(): void {
    this.servicioService.getMeasurementUnits().subscribe({
      next: (res) => {
        // Filtrar por application_type = 'Service'
        this.measurementUnits = res.filter((u: any) =>
          u.application_type === 'Service'
        );
      },
      error: (err) => {
        console.error('Error cargando unidades:', err);
      },
    });
  }

  cargarImpuestos(): void {
    this.servicioService.getActiveTaxes().subscribe({
      next: (taxes) => {
        this.taxes = taxes;
      },
      error: (err) => {
        console.error('Error cargando impuestos:', err);
      }
    });
  }

  toggleTax(taxId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedTaxIds.includes(taxId)) {
        this.selectedTaxIds.push(taxId);
      }
    } else {
      this.selectedTaxIds = this.selectedTaxIds.filter(id => id !== taxId);
    }
  }

  isTaxSelected(taxId: number): boolean {
    return this.selectedTaxIds.includes(taxId);
  }

  guardarServicio() {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const serviceData = {
      ...this.servicioForm.value,
      unit_price: parseFloat(this.servicioForm.value.unit_price)
    };

    // Crear servicio con impuestos
    this.servicioService.createServiceWithTaxes(serviceData, this.selectedTaxIds).subscribe({
      next: () => {
        this.isLoading = false;
        alert('✅ Servicio registrado con éxito');
        this.router.navigate(['/productos-servicios']);
      },
      error: (err) => {
        console.error('Error al registrar servicio:', err);
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Error al registrar el servicio';
        alert(`❌ ${errorMessage}`);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/productos-servicios']);
  }
}
