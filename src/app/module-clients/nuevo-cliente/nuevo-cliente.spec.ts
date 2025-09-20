import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoCliente } from './nuevo-cliente';

describe('NuevoCliente', () => {
  let component: NuevoCliente;
  let fixture: ComponentFixture<NuevoCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
