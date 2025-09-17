import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteImpuestos } from './reporte-impuestos';

describe('ReporteImpuestos', () => {
  let component: ReporteImpuestos;
  let fixture: ComponentFixture<ReporteImpuestos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteImpuestos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteImpuestos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
