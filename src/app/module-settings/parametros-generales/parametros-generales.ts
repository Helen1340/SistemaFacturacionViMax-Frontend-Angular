import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from './company.service';

@Component({
  selector: 'app-parametros-generales',
  imports: [CommonModule, ReactiveFormsModule ],
  templateUrl: './parametros-generales.html',
  styleUrl: './parametros-generales.css'
})
export class ParametrosGenerales implements OnInit {
  form!: FormGroup;
  notificacion = false;
  logoPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      logo: [null], // 🔹 archivo logo
      razonSocial: ['', Validators.required],
      nombreComercial: ['', Validators.required],
      nit: ['', Validators.required],
      regimen: ['', Validators.required],
      actividadEconomica: ['', Validators.required],
      iva: [false, Validators.requiredTrue],
      direccion: ['', Validators.required],
      municipio: ['', Validators.required],
      departamento: ['', Validators.required],
      pais: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      representante: this.fb.group({
        nombre: ['', Validators.required],
        tipoDocumento: ['', Validators.required],
        numeroDocumento: ['', Validators.required],
      })
    });
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ logo: file });
      const reader = new FileReader();
      reader.onload = () => (this.logoPreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  guardar() {
    if (this.form.valid) {
      const formData = new FormData();
      Object.entries(this.form.value).forEach(([key, value]) => {
        if (key === 'representante') {
          Object.entries(value as any).forEach(([rk, rv]) =>
            formData.append(`representante[${rk}]`, rv as any)
          );
        } else {
          formData.append(key, value as any);
        }
      });

      this.companyService.saveCompany(formData).subscribe(() => {
        this.notificacion = true;
        setTimeout(() => (this.notificacion = false), 3000);
        this.form.reset();
        this.logoPreview = null;
      });
    }
  }
}
