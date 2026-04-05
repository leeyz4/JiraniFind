import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportItem } from './report-item';

describe('ReportItem', () => {
  let component: ReportItem;
  let fixture: ComponentFixture<ReportItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
