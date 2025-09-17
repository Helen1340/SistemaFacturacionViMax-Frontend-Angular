import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigCorreo } from './config-correo';

describe('ConfigCorreo', () => {
  let component: ConfigCorreo;
  let fixture: ComponentFixture<ConfigCorreo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigCorreo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigCorreo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
