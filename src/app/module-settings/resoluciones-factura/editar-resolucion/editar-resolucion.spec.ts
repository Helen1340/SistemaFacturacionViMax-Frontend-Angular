import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarResolucion } from './editar-resolucion';

describe('EditarResolucion', () => {
  let component: EditarResolucion;
  let fixture: ComponentFixture<EditarResolucion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarResolucion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarResolucion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
