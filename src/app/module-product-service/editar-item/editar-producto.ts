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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productosServicio: ProductosServicioService
  ) {}

  ngOnInit(): void {
    // Inicializar formulario vacío
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      codigo_estandar: ['', Validators.required],
      codigo_producto: ['', Validators.required],
      precio_unitario: ['', Validators.required],
      measurement_unit_id: ['', Validators.required],
      estado: ['Activo', Validators.required]
    });

    // Obtener ID de la ruta
    this.productoId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productoId) {
      this.cargarProducto(this.productoId);
    }

    // Cargar unidades (solo de tipo Producto)
    this.cargarUnidades();
  }

  cargarProducto(id: number) {
    this.productosServicio.getProductById(id).subscribe({
      next: (producto: any) => {
        console.log('Producto cargado:', producto);

        // Asegurar que precio sea número
        const precio = producto.precio_unitario
          ? parseFloat(producto.precio_unitario)
          : 0;

        this.productoForm.patchValue({
          nombre: producto.nombre ?? '',
          descripcion: producto.descripcion ?? '',
          codigo_estandar: producto.codigo_estandar ?? '',
          codigo_producto: producto.codigo_producto ?? '',
          precio_unitario: precio,
          measurement_unit_id: producto.measurement_unit_id ?? '',
          estado: producto.estado ?? 'Activo'
        });

        console.log('Form values after patch:', this.productoForm.value);
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
      }
    });
  }

  cargarUnidades(): void {
    this.productosServicio.getMeasurementUnits().subscribe({
      next: (res) => {
        // Unidades de producto (excluye las de servicio)
        const codigosServicio = ['HUR', 'DAY', 'MON', 'E48', 'CNT'];
        this.measurementUnits = res.filter(
          (u: any) => !codigosServicio.includes(u.codigo_dian)
        );
      },
      error: (err) => console.error('Error cargando unidades:', err),
    });
  }

  onSubmit() {
    if (this.productoForm.invalid) return;

    this.productosServicio.updateProduct(this.productoId, this.productoForm.value).subscribe({
      next: () => {
        alert('Producto actualizado con éxito');
        this.router.navigate(['/productos-servicios']); // redirige a listado
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/productos-servicios']);
  }
}
