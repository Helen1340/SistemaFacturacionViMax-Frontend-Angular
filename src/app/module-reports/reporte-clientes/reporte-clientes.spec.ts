import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteClientes } from './reporte-clientes';

describe('ReporteClientes', () => {
  let component: ReporteClientes;
  let fixture: ComponentFixture<ReporteClientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteClientes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteClientes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
