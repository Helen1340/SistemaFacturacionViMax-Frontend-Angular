import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolucionesFactura } from './resoluciones-factura';

describe('ResolucionesFactura', () => {
  let component: ResolucionesFactura;
  let fixture: ComponentFixture<ResolucionesFactura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResolucionesFactura]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolucionesFactura);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
