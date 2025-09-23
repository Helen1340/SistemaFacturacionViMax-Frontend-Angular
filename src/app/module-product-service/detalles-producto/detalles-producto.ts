import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  unidadMedidaNombre: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosServicioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productosService.getProductById(id).subscribe({
        next: (res) => {
          console.log('Producto cargado:', res);
          this.producto = res;

          // Buscar nombre de la unidad de medida
          if (res.measurement_unit_id) {
            this.productosService.getMeasurementUnits().subscribe(units => {
              const unidad = units.find(u => u.id === res.measurement_unit_id);
              this.unidadMedidaNombre = unidad ? unidad.nombre : 'No definida';
            });
          }
        },
        error: (err) => {
          console.error('Error al cargar el producto', err);
        }
      });
    }
  }
}
