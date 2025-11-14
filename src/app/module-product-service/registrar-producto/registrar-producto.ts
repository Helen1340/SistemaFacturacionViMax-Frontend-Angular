import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductosServicioService } from '../service/productos-servicio.service';

interface MeasurementUnit {
  id: number;
  nombre: string;
  codigo_dian: string;
  estado: string;
}

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registrar-producto.html',
  styleUrl: './registrar-producto.css'
})
export class RegistrarProducto implements OnInit {
  productoForm!: FormGroup;
  isLoading = false;
  measurementUnits: any[] = [];
  taxes: any[] = [];
  selectedTaxIds: number[] = [];
  

  constructor(
    private fb: FormBuilder,
    private productoService: ProductosServicioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      standard_code: [''],
      product_code: ['', Validators.required],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      measurement_unit_id: ['', Validators.required],
      unit_price: ['', [Validators.required, Validators.min(0.01)]],
      status: ['Active', Validators.required],
      description: ['']
    });

    this.cargarUnidades();
    this.cargarImpuestos();
  }

  cargarUnidades(): void {
    this.productoService.getMeasurementUnits().subscribe({
      next: (res) => {
        // Filtrar por application_type = 'Product'
        this.measurementUnits = res.filter((u: any) =>
          u.application_type === 'Product'
        );
      },
      error: (err) => {
        console.error('Error cargando unidades:', err);
      },
    });
  }

  cargarImpuestos(): void {
    this.productoService.getActiveTaxes().subscribe({
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

  onSubmit(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;

    const productData = {
      ...this.productoForm.value,
      unit_price: parseFloat(this.productoForm.value.unit_price)
    };

    // Crear producto con impuestos
    this.productoService.createProductWithTaxes(productData, this.selectedTaxIds).subscribe({
      next: () => {
        this.isLoading = false;
        alert('✅ Producto guardado exitosamente');
        this.router.navigate(['/productos-servicios']);
      },
      error: (err) => {
        console.error('Error guardando producto', err);
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Error al guardar el producto';
        alert(`❌ ${errorMessage}`);
      },
    });
  }

  cancelar() {
    this.router.navigate(['/productos-servicios']);
  }
}