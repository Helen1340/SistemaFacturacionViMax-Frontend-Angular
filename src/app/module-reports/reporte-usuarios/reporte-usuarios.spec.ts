import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteUsuarios } from './reporte-usuarios';

describe('ReporteUsuarios', () => {
  let component: ReporteUsuarios;
  let fixture: ComponentFixture<ReporteUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
