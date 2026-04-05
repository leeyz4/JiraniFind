import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingItems } from './pending-items';

describe('PendingItems', () => {
  let component: PendingItems;
  let fixture: ComponentFixture<PendingItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingItems],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
