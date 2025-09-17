import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerUsuario } from './ver-usuario';

describe('VerUsuario', () => {
  let component: VerUsuario;
  let fixture: ComponentFixture<VerUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
