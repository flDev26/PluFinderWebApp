import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliComponent } from './deli.component';

describe('DeliComponent', () => {
  let component: DeliComponent;
  let fixture: ComponentFixture<DeliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
