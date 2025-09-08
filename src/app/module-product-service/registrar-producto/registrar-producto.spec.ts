import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarProducto } from './registrar-producto';

describe('RegistrarProducto', () => {
  let component: RegistrarProducto;
  let fixture: ComponentFixture<RegistrarProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarProducto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarProducto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
