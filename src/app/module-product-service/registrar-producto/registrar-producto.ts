import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Se asume que tienes un servicio para manejar las peticiones HTTP
// import { ProductoServicioService } from 'ruta/a/tu/servicio.service';

@Component({
  selector: 'app-registrar-producto',
  standalone: true, // Usa standalone si tu proyecto está configurado para ello
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './registrar-producto.html',
  styleUrl: './registrar-producto.css'
})
export class RegistrarProductoComponent implements OnInit {

  productoForm!: FormGroup; // ! indica que se inicializará más tarde

  isLoading = false;
  showNotification = false;
  notificationType: 'success' | 'error' = 'success';
  notificationMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
    // private productoServicioService: ProductoServicioService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  // --- Creación y validación del formulario ---
  private createForm(): void {
    this.productoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      unidad: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      estado: ['activo', Validators.required],
      facturable: ['', Validators.required],
      categoria: [''],
      // Los impuestos se manejarán como un FormArray
      impuestos: this.fb.array([]),
      descripcion: ['', Validators.maxLength(500)]
    });
  }

  // Este método es para manejar los checkboxes de impuestos
  // Se recomienda hacerlo de esta manera para un mejor control
  onCheckboxChange(event: any): void {
    const impuestosFormArray: FormArray = this.productoForm.get('impuestos') as FormArray;
    if (event.target.checked) {
      impuestosFormArray.push(this.fb.control(event.target.value));
    } else {
      let i = 0;
      impuestosFormArray.controls.forEach((control) => {
        if (control.value === event.target.value) {
          impuestosFormArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  // --- Lógica del formulario ---
  onSubmit(): void {
    if (this.productoForm.valid) {
      this.isLoading = true;
      const formValue = this.productoForm.value;

      // Aquí va la lógica para enviar los datos a tu servicio
      console.log('Formulario válido, enviando datos:', formValue);
      
      // Ejemplo de cómo llamar a un servicio
      // this.productoServicioService.crearProducto(formValue).subscribe({
      //   next: () => {
      //     this.showNotification = true;
      //     this.notificationType = 'success';
      //     this.notificationMessage = 'Producto registrado exitosamente.';
      //     this.resetForm();
      //     this.isLoading = false;
      //     // Opcional: navegar a otra ruta después del éxito
      //     // setTimeout(() => this.router.navigate(['/productos']), 2000);
      //   },
      //   error: (error) => {
      //     this.showNotification = true;
      //     this.notificationType = 'error';
      //     this.notificationMessage = 'Error al registrar el producto. Intente nuevamente.';
      //     this.isLoading = false;
      //     console.error('Error al registrar producto:', error);
      //   }
      // });

    } else {
      // Si el formulario es inválido, marca todos los campos como "tocados" para mostrar los errores
      this.productoForm.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.productoForm.reset();
    this.productoForm.patchValue({ 
      estado: 'activo',
      impuestos: []
    });
    // Limpiar el FormArray de impuestos después de resetear
    const impuestosFormArray = this.productoForm.get('impuestos') as FormArray;
    while (impuestosFormArray.length !== 0) {
      impuestosFormArray.removeAt(0);
    }
  }

  cancelar(): void {
    // Lógica para volver a la página anterior o a una ruta específica
    this.router.navigate(['/productos-servicios']);
  }
}