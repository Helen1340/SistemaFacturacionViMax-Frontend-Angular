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
  }

  cargarServicio(id: number) {
    this.productosServicio.getServiceById(id).subscribe({
      next: (data: any) => {
        this.serviceForm.patchValue(data);
      },
      error: (err) => {
        console.error('Error al cargar servicio:', err);
      }
    });
  }

  cargarUnidades(): void {
    console.log('Cargando unidades de medida para editar servicio...');
    this.productosServicio.getMeasurementUnits().subscribe({
      next: (res) => {
        console.log('Unidades recibidas:', res);
        const codigosServicio = ['HUR', 'DAY', 'MON', 'E48', 'CNT']; 
        this.measurementUnits = res.filter((u: any) =>
          codigosServicio.includes(u.dian_code)
        );
        console.log('Unidades filtradas para servicios:', this.measurementUnits);
      },
      error: (err) => {
        console.error('Error cargando unidades:', err);
      },
    });
  }
  
  onSubmit() {
    if (this.serviceForm.invalid) return;

    this.productosServicio.updateService(this.serviceId, this.serviceForm.value).subscribe({
      next: () => {
        alert('Servicio actualizado con éxito');
        this.router.navigate(['/productos-servicios']); // redirige a listado
      },
      error: (err) => {
        console.error('Error al actualizar servicio:', err);
      }
    });
  }

  cancelar() {
    this.router.navigate(['/productos-servicios']);
  }
}
