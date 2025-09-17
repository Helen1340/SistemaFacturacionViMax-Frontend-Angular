import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleFacturas } from './detalle-facturas';

describe('DetalleFacturas', () => {
  let component: DetalleFacturas;
  let fixture: ComponentFixture<DetalleFacturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleFacturas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleFacturas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
