import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialTecnico } from './historial-tecnico';

describe('HistorialTecnico', () => {
  let component: HistorialTecnico;
  let fixture: ComponentFixture<HistorialTecnico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialTecnico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialTecnico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


