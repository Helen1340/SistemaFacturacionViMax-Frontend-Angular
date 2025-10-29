import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosServicioService } from '../service/productos-servicio.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalles-producto',
  imports: [CommonModule],
  templateUrl: './detalles-producto.html',
  styleUrl: './detalles-producto.css'
})
export class DetallesProducto implements OnInit {
  producto: any = null;
  unidadMedidaNombre: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosServicioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarProducto(id);
    } else {
      this.error = 'ID de producto no válido';
      this.loading = false;
    }
  }

  cargarProducto(id: number) {
    this.productosService.getProductById(id).subscribe({
      next: (res) => {
        this.producto = res;
        this.loading = false;

        // Buscar nombre de la unidad de medida
        if (res.measurement_unit_id) {
          this.productosService.getMeasurementUnits().subscribe({
            next: (units) => {
              const unidad = units.find(u => u.id === res.measurement_unit_id);
              this.unidadMedidaNombre = unidad ? unidad.name : 'No definida';
            },
            error: (err) => {
              console.error('Error al cargar unidades de medida:', err);
              this.unidadMedidaNombre = 'Error al cargar';
            }
          });
        } else {
          this.unidadMedidaNombre = 'No definida';
        }
      },
      error: (err) => {
        console.error('Error al cargar el producto', err);
        this.error = 'Error al cargar el producto';
        this.loading = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/productos-servicios']);
  }
}
