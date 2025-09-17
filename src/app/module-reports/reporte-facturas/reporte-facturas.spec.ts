import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteFacturas } from './reporte-facturas';

describe('ReporteFacturas', () => {
  let component: ReporteFacturas;
  let fixture: ComponentFixture<ReporteFacturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteFacturas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteFacturas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
