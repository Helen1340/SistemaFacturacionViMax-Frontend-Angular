import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasNotas } from './facturas-notas';

describe('FacturasNotas', () => {
  let component: FacturasNotas;
  let fixture: ComponentFixture<FacturasNotas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturasNotas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturasNotas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
