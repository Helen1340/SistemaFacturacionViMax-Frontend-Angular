import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionDocumentos } from './recepcion-documentos';

describe('RecepcionDocumentos', () => {
  let component: RecepcionDocumentos;
  let fixture: ComponentFixture<RecepcionDocumentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionDocumentos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionDocumentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
