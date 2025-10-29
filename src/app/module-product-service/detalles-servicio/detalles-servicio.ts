import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosServicioService } from '../service/productos-servicio.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalles-servicio',
  imports: [ CommonModule ],
  templateUrl: './detalles-servicio.html',
  styleUrl: './detalles-servicio.css'
})
export class DetallesServicio implements OnInit {
  servicio: any = null;
  unidadMedidaNombre: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosServicio: ProductosServicioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarServicio(id);
    } else {
      this.error = 'ID de servicio no válido';
      this.loading = false;
    }
  }

  cargarServicio(id: number) {
    this.productosServicio.getServiceById(id).subscribe({
      next: (data: any) => {
        this.servicio = data;
        this.loading = false;

        // cargar unidades de medida para mostrar el nombre
        if (data.measurement_unit_id) {
          this.productosServicio.getMeasurementUnits().subscribe({
            next: (units) => {
              const unidad = units.find(u => u.id === data.measurement_unit_id);
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
        console.error('Error al cargar servicio:', err);
        this.error = 'Error al cargar el servicio';
        this.loading = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/productos-servicios']);
  }
}
