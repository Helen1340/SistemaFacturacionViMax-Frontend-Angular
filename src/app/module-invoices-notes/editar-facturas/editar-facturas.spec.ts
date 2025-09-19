import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFacturas } from './editar-facturas';

describe('EditarFacturas', () => {
  let component: EditarFacturas;
  let fixture: ComponentFixture<EditarFacturas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarFacturas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarFacturas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
