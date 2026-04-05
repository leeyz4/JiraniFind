import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyItems } from './my-items';

describe('MyItems', () => {
  let component: MyItems;
  let fixture: ComponentFixture<MyItems>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyItems],
    }).compileComponents();

    fixture = TestBed.createComponent(MyItems);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
