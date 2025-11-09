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
      description: [''],

      // impuestos (opcional)
      impuestoIva: [false],
      impuestoInc: [false],
      impuestoIca: [false],
    });

    this.cargarUnidades();
  }

  cargarUnidades(): void {
    console.log('Cargando unidades de medida para productos...');
    this.productoService.getMeasurementUnits().subscribe({
      next: (res) => {
        console.log('Unidades recibidas:', res);
        // Filtrar SOLO las unidades válidas para productos
        const codigosProducto = ['UND', 'KGM', 'GRM', 'LTR', 'BX', 'MLT']; 
        this.measurementUnits = res.filter((u: any) =>
          codigosProducto.includes(u.dian_code)
        );
        console.log('Unidades filtradas para productos:', this.measurementUnits);
      },
      error: (err) => {
        console.error('Error cargando unidades:', err);
      },
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) return;
    this.isLoading = true;

    this.productoService.createProduct(this.productoForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/productos-servicios']);
        alert('✅ Producto guardado exitosamente');
      },
      error: (err) => {
        console.error('Error guardando producto', err);
        this.isLoading = false;
        alert('❌ Error guardando producto');
      },
    });
  }

  cancelar() {
    this.router.navigate(['/productos-servicios']);
  }
}