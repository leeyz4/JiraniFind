import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseItems } from './browse-items';

describe('BrowseItems', () => {
  let component: BrowseItems;
  let fixture: ComponentFixture<BrowseItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseItems],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
