import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaResolucion } from './nueva-resolucion';

describe('NuevaResolucion', () => {
  let component: NuevaResolucion;
  let fixture: ComponentFixture<NuevaResolucion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaResolucion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaResolucion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
