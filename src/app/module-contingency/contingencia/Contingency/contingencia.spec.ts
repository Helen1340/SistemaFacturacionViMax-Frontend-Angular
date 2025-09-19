import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contingencia } from './contingencia';

describe('Contingencia', () => {
  let component: Contingencia;
  let fixture: ComponentFixture<Contingencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contingencia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Contingencia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
