import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerCliente } from './ver-cliente';

describe('VerCliente', () => {
  let component: VerCliente;
  let fixture: ComponentFixture<VerCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
