import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionRetencionDocumental } from './configuracion-retencion-documental';

describe('ConfiguracionRetencionDocumental', () => {
  let component: ConfiguracionRetencionDocumental;
  let fixture: ComponentFixture<ConfiguracionRetencionDocumental>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionRetencionDocumental]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionRetencionDocumental);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
