import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosServicioService } from '../service/productos-servicio.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-servicio',
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './editar-servicio.html',
  styleUrl: './editar-servicio.css'
})
export class EditarServicio implements OnInit {
  serviceForm!: FormGroup;
  serviceId!: number;
  measurementUnits: any[] = [];
  taxes: any[] = [];
  selectedTaxIds: number[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productosServicio: ProductosServicioService
  ) {}

  ngOnInit(): void {
    // Inicializar formulario vacío
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      service_code: ['', Validators.required],
      unit_price: ['', Validators.required],
      measurement_unit_id: ['', Validators.required],
      status: ['Active', Validators.required]
    });

    // Obtener ID de la ruta
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.serviceId) {
      this.cargarServicio(this.serviceId);
    }

    // Cargar unidades
    this.cargarUnidades();
    this.cargarImpuestos();
  }

  cargarServicio(id: number) {
    this.productosServicio.getServiceById(id).subscribe({
      next: (data: any) => {
        this.serviceForm.patchValue(data);

        // Cargar impuestos asignados
        if (data.taxes && Array.isArray(data.taxes)) {
          this.selectedTaxIds = data.taxes.map((tax: any) => tax.id);
        }
      },
      error: (err) => {
        console.error('Error al cargar servicio:', err);
      }
    });
  }

  cargarUnidades(): void {
    this.productosServicio.getMeasurementUnits().subscribe({
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
    this.productosServicio.getActiveTaxes().subscribe({
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
  
  onSubmit() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const serviceData = {
      ...this.serviceForm.value,
      unit_price: parseFloat(this.serviceForm.value.unit_price)
    };

    // Actualizar servicio primero
    this.productosServicio.updateService(this.serviceId, serviceData).subscribe({
      next: () => {
        // Luego sincronizar impuestos
        this.productosServicio.syncServiceTaxes(this.serviceId, this.selectedTaxIds).subscribe({
          next: () => {
            this.isLoading = false;
            alert('✅ Servicio actualizado con éxito');
            this.router.navigate(['/productos-servicios']);
          },
          error: (err) => {
            console.error('Error al sincronizar impuestos:', err);
            this.isLoading = false;
            alert('Servicio actualizado, pero hubo un error al actualizar los impuestos');
          }
        });
      },
      error: (err) => {
        console.error('Error al actualizar servicio:', err);
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Error al actualizar el servicio';
        alert(`❌ ${errorMessage}`);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/productos-servicios']);
  }
}
