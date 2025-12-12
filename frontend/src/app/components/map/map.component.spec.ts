import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MapComponent } from './map.component';
import { PickUpPointService } from '../../services/pickup-point.service';
import { RouteService } from '../../services/route.service';
import { ToastService } from '../../services/toast.service';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MapComponent,
        HttpClientTestingModule
      ],
      providers: [
        PickUpPointService,
        RouteService,
        ToastService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no optimized route', () => {
    expect(component.hasOptimizedRoute()).toBeFalsy();
  });

  it('should not be a duplicate route initially', () => {
    expect(component.isDuplicateRoute).toBeFalsy();
  });

  it('should not be in loading state initially', () => {
    expect(component.duplicateCheckLoading).toBeFalsy();
  });

  it('should have Math property for template', () => {
    expect(component.Math).toBe(Math);
  });
});
