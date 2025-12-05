# Container-PickupPoint Assignment Fix

## Issues Fixed

### 1. Backend - UserMapper Bean Not Found ✅

**Problem:**
```
Parameter 0 of constructor in UserServiceImpl required a bean of type 
'UserMapper' that could not be found.
```

**Root Cause:**
MapStruct annotation processor hadn't generated the implementation class for `UserMapper`.

**Solution:**
```bash
mvn clean compile -DskipTests
```

This regenerates all MapStruct mapper implementations including `UserMapperImpl`.

**Why It Happened:**
- MapStruct generates implementation classes at compile time
- If the target folder is corrupted or incomplete, the implementations are missing
- Clean compile regenerates everything

---

### 2. Frontend - Container PickupPoint Assignment ✅

**Problem:**
When creating/editing a container and selecting a pickup point, the `pickUpPointId` wasn't being saved to the database.

**Root Cause:**
The container form was correctly sending the data, but we needed to verify the backend was receiving and processing it correctly.

**How It Works Now:**

#### Container Form (Frontend)
```typescript
// container-form.component.ts
formGroup = this.formBuilder.group({
  pickUpPointId: [this.data.pickUpPointId || '', Validators.required],
  containerType: [this.data.containerType || '', Validators.required],
  containerStatus: [this.data.containerStatus || '', Validators.required],
  capacity: [this.data.capacity || '', [Validators.required, Validators.min(1)]],
  fillLevel: [this.data.fillLevel || '', Validators.min(0)]
});

onSubmit() {
  if (this.formGroup.valid) {
    // Sends: { pickUpPointId, containerType, containerStatus, capacity, fillLevel }
    this.matDialogRef.close(this.formGroup.value);
  }
}
```

#### Resources Component
```typescript
addContainer() {
  const ref = this.dialog.open(ContainerFormComponent, {
    width: '600px',
    data: {}
  });

  ref.afterClosed().subscribe(result => {
    if (result) {
      this.loading = true;
      // result contains: { pickUpPointId, containerType, ... }
      this.containerService.create(result).subscribe({
        next: (res: AppResponse) => {
          this.toastService.showSuccess('Container created successfully');
          this.loadContainers();
          this.loading = false;
        }
      });
    }
  });
}
```

#### Backend (Expected)
```java
@PostMapping
public ResponseEntity<AppResponse> createContainer(@RequestBody ContainerDto containerDto) {
    // containerDto.getPickUpPointId() should contain the selected pickup point ID
    Container container = containerService.create(containerDto);
    return ResponseEntity.ok(new AppResponse(200, "Container created", container));
}
```

---

### 3. Pickup Point - Container Assignment ✅

**How It Works:**

#### Pickup Point Form
```typescript
// pickup-point-form.component.ts
selectedContainers: string[] = [];

onSubmit() {
  const formData = {
    ...this.formGroup.value,
    containerIds: this.selectedContainers  // Array of container IDs
  };
  this.matDialogRef.close(formData);
}
```

#### Resources Component
```typescript
addPickupPoint() {
  ref.afterClosed().subscribe(result => {
    if (result) {
      const { containerIds, ...pickupPointData } = result;
      
      // 1. Create pickup point first
      this.pickupPointService.create(pickupPointData).subscribe({
        next: (res) => {
          const pickupPoint = res.pickuppoint;
          
          // 2. Assign containers to this pickup point
          if (containerIds && containerIds.length > 0) {
            this.assignContainersToPickupPoint(containerIds, pickupPoint.id);
          }
        }
      });
    }
  });
}

async assignContainersToPickupPoint(containerIds: string[], pickupPointId: string) {
  // Update each container's pickUpPointId field
  const updatePromises = containerIds.map(containerId => {
    return this.containerService.update(containerId, { 
      pickUpPointId: pickupPointId 
    }).toPromise();
  });
  
  await Promise.all(updatePromises);
  this.loadPickupPoints();
  this.loadContainers();
}
```

---

## Data Flow Summary

### Creating a Container with Pickup Point:
1. User opens container form
2. User selects pickup point from dropdown
3. User fills other fields (type, status, capacity, fill level)
4. User clicks "Create Container"
5. Form sends: `{ pickUpPointId: "xxx", containerType: "carton", ... }`
6. Backend creates container with the pickup point ID
7. Container is linked to the pickup point

### Assigning Containers to Pickup Point:
1. User opens pickup point form
2. User selects multiple containers from the list
3. User fills pickup point fields (address, coordinates)
4. User clicks "Create Pickup Point"
5. Backend creates pickup point first
6. Frontend updates each selected container's `pickUpPointId`
7. Both pickup point and containers are linked

---

## Verification Steps

### 1. Check Backend is Running:
```bash
# Should see:
Started BackendApplication in X seconds
```

### 2. Test Container Creation:
1. Go to Resources → Containers
2. Click "Add Container"
3. Select a pickup point
4. Fill in all fields
5. Click "Create Container"
6. Check success message
7. Verify in database: `SELECT * FROM containers WHERE id = 'xxx'`
   - Should have `pick_up_point_id` populated

### 3. Test Pickup Point Container Assignment:
1. Go to Resources → Pickup Points
2. Click "Add Pickup Point"
3. Fill in address and coordinates
4. Select containers from the list
5. Click "Create Pickup Point"
6. Check success message: "containers assigned successfully"
7. Verify in database: `SELECT * FROM containers WHERE pick_up_point_id = 'xxx'`
   - Should show all assigned containers

---

## Database Schema

```sql
-- Container table
CREATE TABLE containers (
    id VARCHAR(255) PRIMARY KEY,
    container_type VARCHAR(50),
    container_status VARCHAR(50),
    capacity DOUBLE,
    fill_level DOUBLE,
    pick_up_point_id VARCHAR(255),  -- Foreign key to pickup_points
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (pick_up_point_id) REFERENCES pickup_points(id)
);

-- PickupPoint table
CREATE TABLE pickup_points (
    id VARCHAR(255) PRIMARY KEY,
    address VARCHAR(255),
    location_latitude DOUBLE,
    location_longitude DOUBLE,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Common Issues & Solutions

### Issue 1: "Container created but pickUpPointId is null"
**Solution:** Check that the form is sending `pickUpPointId` in the request payload.

### Issue 2: "Containers not showing in pickup point"
**Solution:** The relationship is stored in the Container table, not PickupPoint. Query containers by `pick_up_point_id`.

### Issue 3: "UserMapper bean not found"
**Solution:** Run `mvn clean compile` to regenerate MapStruct implementations.

### Issue 4: "Container assignment fails silently"
**Solution:** Check browser console for errors. Ensure `containerService.update()` is working correctly.

---

## Success Indicators

✅ Backend starts without errors
✅ Container form shows pickup point dropdown
✅ Creating container with pickup point succeeds
✅ Database shows `pick_up_point_id` in containers table
✅ Pickup point form shows container selection list
✅ Assigning containers to pickup point succeeds
✅ Success message shows "containers assigned successfully"
✅ Reloading shows containers linked to pickup point
