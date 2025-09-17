import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaNota } from './nueva-nota';

describe('NuevaNota', () => {
  let component: NuevaNota;
  let fixture: ComponentFixture<NuevaNota>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaNota]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevaNota);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
