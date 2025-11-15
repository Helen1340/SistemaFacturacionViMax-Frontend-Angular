import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosServicioService } from '../service/productos-servicio.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-producto',
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './editar-producto.html',
  styleUrl: './editar-producto.css'
})

export class EditarProducto implements OnInit {
  productoForm!: FormGroup;
  productoId!: number;
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
    this.productoForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      standard_code: [''],
      product_code: ['', Validators.required],
      unit_price: ['', Validators.required],
      measurement_unit_id: ['', Validators.required],
      status: ['Active', Validators.required]
    });

    // Obtener ID de la ruta
    this.productoId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productoId) {
      this.cargarProducto(this.productoId);
    }

    // Cargar unidades (solo de tipo Producto)
    this.cargarUnidades();
    this.cargarImpuestos();
  }

  cargarProducto(id: number) {
    this.productosServicio.getProductById(id).subscribe({
      next: (producto: any) => {
        this.productoForm.patchValue({
          name: producto.name ?? '',
          description: producto.description ?? '',
          standard_code: producto.standard_code ?? '',
          product_code: producto.product_code ?? '',
          unit_price: producto.unit_price ?? 0,
          measurement_unit_id: producto.measurement_unit_id ?? '',
          status: producto.status ?? 'Active'
        });

        // Cargar impuestos asignados
        if (producto.taxes && Array.isArray(producto.taxes)) {
          this.selectedTaxIds = producto.taxes.map((tax: any) => tax.id);
        }
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
      }
    });
  }

  cargarUnidades(): void {
    this.productosServicio.getMeasurementUnits().subscribe({
      next: (res) => {
        // Filtrar por application_type = 'Product'
        this.measurementUnits = res.filter(
          (u: any) => u.application_type === 'Product'
        );
      },
      error: (err) => console.error('Error cargando unidades:', err),
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
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const productData = {
      ...this.productoForm.value,
      unit_price: parseFloat(this.productoForm.value.unit_price)
    };

    // Actualizar producto primero
    this.productosServicio.updateProduct(this.productoId, productData).subscribe({
      next: () => {
        // Luego sincronizar impuestos
        this.productosServicio.syncProductTaxes(this.productoId, this.selectedTaxIds).subscribe({
          next: () => {
            this.isLoading = false;
            alert('✅ Producto actualizado con éxito');
            this.router.navigate(['/productos-servicios']);
          },
          error: (err) => {
            console.error('Error al sincronizar impuestos:', err);
            this.isLoading = false;
            alert('Producto actualizado, pero hubo un error al actualizar los impuestos');
          }
        });
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Error al actualizar el producto';
        alert(`❌ ${errorMessage}`);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/productos-servicios']);
  }
}
