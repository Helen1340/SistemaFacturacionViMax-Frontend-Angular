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
export class RegistrarProductoComponent implements OnInit {
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
      codigo_estandar: ['', Validators.required],
      codigo_producto: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      measurement_unit_id: ['', Validators.required],
      precio_unitario: ['', [Validators.required, Validators.min(0.01)]],
      estado: ['Activo', Validators.required],
      descripcion: [''],

      // impuestos (opcional)
      impuestoIva: [false],
      impuestoInc: [false],
      impuestoIca: [false],
    });

    this.cargarUnidades();
  }

  cargarUnidades(): void {
    this.productoService.getMeasurementUnits().subscribe({
      next: (res) => {
        // Filtrar SOLO las unidades válidas para servicios
        const codigosProducto = ['UND', 'KGM', 'GRM', 'LTR', 'BX', 'MLT']; 
        this.measurementUnits = res.filter((u: any) =>
          codigosProducto.includes(u.codigo_dian)
        );
      },
      error: (err) => console.error('Error cargando unidades:', err),
    });
  }

  onSubmit(): void {
    if (this.productoForm.invalid) return;
    this.isLoading = true;

    this.productoService.createProducto(this.productoForm.value).subscribe({
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

  
}