import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUsuario } from './edit-usuario';

describe('EditUsuario', () => {
  let component: EditUsuario;
  let fixture: ComponentFixture<EditUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
