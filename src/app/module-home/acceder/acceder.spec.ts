import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Acceder } from './acceder';

describe('Acceder', () => {
  let component: Acceder;
  let fixture: ComponentFixture<Acceder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Acceder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Acceder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
