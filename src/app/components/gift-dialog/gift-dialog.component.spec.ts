import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftDialogComponent } from './gift-dialog.component';

describe('GiftDialogComponent', () => {
  let component: GiftDialogComponent;
  let fixture: ComponentFixture<GiftDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
