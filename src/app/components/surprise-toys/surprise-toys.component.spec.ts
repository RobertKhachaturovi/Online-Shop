import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurpriseToysComponent } from './surprise-toys.component';

describe('SurpriseToysComponent', () => {
  let component: SurpriseToysComponent;
  let fixture: ComponentFixture<SurpriseToysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurpriseToysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurpriseToysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
