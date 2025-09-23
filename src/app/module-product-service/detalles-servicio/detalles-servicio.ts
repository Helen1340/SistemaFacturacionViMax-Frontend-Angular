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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosServicio: ProductosServicioService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarServicio(id);
    }
  }

  cargarServicio(id: number) {
    this.productosServicio.getServiceById(id).subscribe({
      next: (data: any) => {
        this.servicio = data;

        // cargar unidades de medida para mostrar el nombre
        this.productosServicio.getMeasurementUnits().subscribe(units => {
          const unidad = units.find(u => u.id === this.servicio.measurement_unit_id);
          this.unidadMedidaNombre = unidad ? unidad.nombre : 'N/A';
        });
      },
      error: (err) => {
        console.error('Error al cargar servicio:', err);
      }
    });
  }

  volver() {
    this.router.navigate(['/productos-servicios']);
  }
}
