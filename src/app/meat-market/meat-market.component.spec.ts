import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeatMarketComponent } from './meat-market.component';

describe('MeatMarketComponent', () => {
  let component: MeatMarketComponent;
  let fixture: ComponentFixture<MeatMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeatMarketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeatMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
