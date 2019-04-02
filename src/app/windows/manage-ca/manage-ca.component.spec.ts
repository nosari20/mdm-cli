import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCaComponent } from './manage-ca.component';

describe('ManageCaComponent', () => {
  let component: ManageCaComponent;
  let fixture: ComponentFixture<ManageCaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
