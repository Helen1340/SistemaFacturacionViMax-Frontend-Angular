import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosServicioService } from '../service/productos-servicio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-regitrar-servicio',
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './regitrar-servicio.html',
  styleUrl: './regitrar-servicio.css'
})
export class RegitrarServicio {
  servicioForm: FormGroup;
  impuestosSeleccionados: string[] = [];
  measurementUnits: any[] = [];

  constructor(
    private fb: FormBuilder,
    private servicioService: ProductosServicioService,
    private router: Router
  ) {
    this.servicioForm = this.fb.group({
      service_code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      measurement_unit_id: ['', Validators.required],
      unit_price: [0, [Validators.required, Validators.min(0.01)]],
      status: ['Active', Validators.required],
      description: ['']
    });

    this.cargarUnidades();
  }

  cargarUnidades(): void {
    console.log('Cargando unidades de medida para servicios...');
    this.servicioService.getMeasurementUnits().subscribe({
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

  toggleImpuesto(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.impuestosSeleccionados.push(checkbox.value);
    } else {
      this.impuestosSeleccionados = this.impuestosSeleccionados.filter(i => i !== checkbox.value);
    }
  }

  guardarServicio() {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const data = {
      ...this.servicioForm.value,
      impuestos: this.impuestosSeleccionados
    };

    this.servicioService.createService(data).subscribe({
      next: () => {
        alert('Servicio registrado con éxito');
        this.router.navigate(['/productos-servicios']);
      },
      error: (err) => {
        console.error('Error al registrar servicio:', err);
        alert('Hubo un error al registrar el servicio');
      }
    });
  }

  cancelar() {
    this.router.navigate(['/productos-servicios']);
  }
}
