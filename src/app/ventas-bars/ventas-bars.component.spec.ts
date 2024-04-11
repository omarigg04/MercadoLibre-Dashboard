import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasBarsComponent } from './ventas-bars.component';

describe('VentasBarsComponent', () => {
  let component: VentasBarsComponent;
  let fixture: ComponentFixture<VentasBarsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VentasBarsComponent]
    });
    fixture = TestBed.createComponent(VentasBarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
