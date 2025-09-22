import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinatariosEventos } from './destinatarios-eventos';

describe('DestinatariosEventos', () => {
  let component: DestinatariosEventos;
  let fixture: ComponentFixture<DestinatariosEventos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinatariosEventos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinatariosEventos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
