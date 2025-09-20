import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionRespaldoAutomatico } from './configuracion-respaldo-automatico';

describe('ConfiguracionRespaldoAutomatico', () => {
  let component: ConfiguracionRespaldoAutomatico;
  let fixture: ComponentFixture<ConfiguracionRespaldoAutomatico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionRespaldoAutomatico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionRespaldoAutomatico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
