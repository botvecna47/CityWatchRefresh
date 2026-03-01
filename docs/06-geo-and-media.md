# CityWatch — Geo-Verification, Media & Camera

This document covers GPS handling, distance verification, WebRTC camera integration, and image management — the most technically challenging parts of CityWatch.

---

## 1. GPS / Geolocation

### 1.1 How GPS Is Used

| Purpose | When | Accuracy Needed |
|---|---|---|
| Complaint location | Citizen submits complaint | Within 100m |
| Area assignment | Backend assigns complaint to area | Reasonable |
| Duplicate detection | Backend finds similar nearby complaints | Within 500m |
| Proof verification | Coordinator submits proof | Within 100m of original |
| Intensity clustering | Backend groups nearby complaints | Within 500m |

### 1.2 Frontend: Capturing GPS

```javascript
// Using the Geolocation API
function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy  // in meters
        });
      },
      (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location unavailable'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0  // Don't use cached position
      }
    );
  });
}
```

### 1.3 Edge Cases & Issues

| # | Issue | Risk | Solution |
|---|---|---|---|
| G1 | User denies location permission | Cannot submit | Show clear error. Location is mandatory. Show instructions to enable location |
| G2 | GPS accuracy is poor (desktop, indoor) | Wrong area assignment | Display accuracy to user. If accuracy > 500m → show warning "Move outdoors for better accuracy". Still allow submission but flag it |
| G3 | VPN/proxy gives wrong IP-based location | Not an issue | We use browser Geolocation API (GPS/WiFi based), not IP geolocation |
| G4 | GPS spoofing via developer tools | Fake location | Cannot fully prevent client-side. **Mitigations:** (a) Cross-check: is this GPS inside any defined area? (b) Coordinator voting validates, (c) If proof validation catches inconsistency → citizen gets strike |
| G5 | GPS spoofing via Android mock locations | Fake location | Out of scope for web app. Would need native app with mock location detection |
| G6 | GPS not available (very old browser) | Cannot use feature | Feature detection → show "Your browser does not support geolocation" |
| G7 | User in a valid area but GPS fluctuates across boundary | Area assignment flips | Use the area whose center is closest to the GPS point, not strict bounding box. Or add a 50m buffer zone |
| G8 | HTTPS requirement | GPS API blocked on HTTP | **HTTPS is mandatory.** Both `navigator.geolocation` and `getUserMedia` require secure context. Development: `localhost` works without HTTPS. Production: must have SSL certificate |

### 1.4 Backend: Distance Calculation (Haversine Formula)

```java
public class GeoUtils {
    
    private static final double EARTH_RADIUS_METERS = 6_371_000.0;
    
    /**
     * Calculate distance between two GPS coordinates in meters.
     * Uses the Haversine formula for great-circle distance.
     */
    public static double calculateDistance(
        double lat1, double lon1,
        double lat2, double lon2
    ) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1))
                 * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_METERS * c;
    }
    
    /**
     * Check if a point is within a bounding box.
     */
    public static boolean isWithinBoundingBox(
        double lat, double lon,
        double latMin, double latMax,
        double lonMin, double lonMax
    ) {
        return lat >= latMin && lat <= latMax
            && lon >= lonMin && lon <= lonMax;
    }
    
    /**
     * Find the closest area for a given GPS point.
     */
    public static Area findClosestArea(double lat, double lon, List<Area> areas) {
        return areas.stream()
            .min(Comparator.comparingDouble(area -> 
                calculateDistance(lat, lon, area.getCenterLat(), area.getCenterLng())
            ))
            .orElseThrow(() -> new NotFoundException("No areas configured"));
    }
}
```

### 1.5 Backend: Area Assignment Logic

```
Input: (latitude, longitude) from complaint submission

1. Check strict bounding box match:
   SELECT * FROM areas 
   WHERE latitude BETWEEN boundary_lat_min AND boundary_lat_max
     AND longitude BETWEEN boundary_lng_min AND boundary_lng_max

2. If exactly 1 match → assign to that area

3. If multiple matches (overlapping boundaries):
   → Assign to the area whose center is closest

4. If no matches:
   → Find area with closest center within 5km range
   → If closest center > 5km → reject complaint ("Not in covered area")
```

### 1.6 Backend: Duplicate Detection

```
Input: (latitude, longitude, category) from new complaint

Query:
SELECT * FROM complaints
WHERE category = :category
  AND status NOT IN ('REJECTED', 'CLOSED')
  AND created_at > NOW() - INTERVAL '7 days'
  AND haversine_distance(latitude, longitude, :lat, :lon) < 100

If results > 0:
  → Return 409 with "Similar complaint already exists nearby"
  → Include link to existing complaint

Without PostGIS (pure SQL approximation):
  Use bounding box pre-filter, then calculate exact distance in Java:
  
  WHERE latitude BETWEEN :lat - 0.001 AND :lat + 0.001
    AND longitude BETWEEN :lon - 0.001 AND :lon + 0.001
  
  (0.001 degrees ≈ ~111 meters, good enough for pre-filter)
```

### 1.7 Optional PostGIS Setup

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column to complaints
ALTER TABLE complaints 
  ADD COLUMN location GEOMETRY(Point, 4326);

-- Create spatial index
CREATE INDEX idx_complaints_geo ON complaints USING GIST(location);

-- Update location on insert (trigger or application code)
UPDATE complaints SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE id = :id;

-- Find complaints within radius
SELECT * FROM complaints
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
  100  -- meters
);
```

> [!TIP]
> PostGIS is optional for the mini project. The pure Java Haversine approach with SQL bounding-box pre-filter works fine for the expected data volume (hundreds, not millions of complaints).

---

## 2. WebRTC Camera Integration

### 2.1 How Camera Is Used

| Usage | Who | When |
|---|---|---|
| Complaint photo | Citizen | During complaint submission |
| Completion proof | Coordinator | When submitting proof of resolution |

### 2.2 Frontend: Camera Capture Component

```javascript
// CameraCapture.jsx - Conceptual implementation

function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(null);
  
  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',  // Prefer rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      handleCameraError(err);
    }
  }
  
  function capturePhoto() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    // Compress to JPEG
    canvas.toBlob(
      (blob) => {
        setCaptured(URL.createObjectURL(blob));
        onCapture(blob);
        stopCamera();
      },
      'image/jpeg',
      0.8  // 80% quality
    );
  }
  
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }
  
  function handleCameraError(err) {
    if (err.name === 'NotAllowedError') {
      setError('Camera permission denied. Please allow camera access.');
    } else if (err.name === 'NotFoundError') {
      setError('No camera found on this device.');
    } else if (err.name === 'NotReadableError') {
      setError('Camera is in use by another application.');
    } else if (err.name === 'OverconstrainedError') {
      setError('Camera does not meet requirements.');
    } else {
      setError('Could not access camera: ' + err.message);
    }
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);
  
  // ... render video preview, capture button, error message
}
```

### 2.3 WebRTC Edge Cases & Issues

| # | Issue | Risk | Solution |
|---|---|---|---|
| W1 | Camera permission denied | Cannot capture photo | Clear error message with instructions to enable. Link to browser settings page |
| W2 | No camera on device (desktop without webcam) | Cannot use feature | Show "No camera detected. Please use a device with a camera" |
| W3 | Camera busy (Zoom/Teams using it) | `NotReadableError` | Show "Camera is in use by another application. Please close it and retry" |
| W4 | HTTP context (not localhost, not HTTPS) | `getUserMedia` blocked | Show "HTTPS required for camera access". Development: localhost works |
| W5 | Safari iOS requires user gesture | Camera doesn't start | Trigger `getUserMedia` on button click, not on page load |
| W6 | Multiple cameras (front + rear) | Wrong camera selected | Default to `facingMode: 'environment'` (rear). Add camera switch button |
| W7 | Very old browser | `getUserMedia` not available | Feature detection. Show "Browser not supported" |
| W8 | User screenshots instead of live capture | Partial bypasss | Canvas capture = no file metadata. But user could record screen. Practical workaround: this is sufficient for a college project |
| W9 | Camera stream not stopped on navigation | Resource leak | Stop all tracks in `useEffect` cleanup. Add `beforeunload` listener |
| W10 | Low light / blurry photo | Useless evidence | Show preview before confirm. Allow retake. (Quality assessment is stretch goal) |
| W11 | Photo orientation incorrect (EXIF rotation) | Rotated display | Read EXIF data and rotate canvas accordingly before saving. Or strip EXIF and let canvas handle it |

### 2.4 Browser Compatibility

| Browser | getUserMedia | Geolocation | Notes |
|---|---|---|---|
| Chrome 53+ | ✅ | ✅ | Best support |
| Firefox 44+ | ✅ | ✅ | Good support |
| Safari 11+ | ✅ | ✅ | Requires user gesture on iOS |
| Edge 12+ | ✅ | ✅ | Chromium-based (79+) best |
| Opera 40+ | ✅ | ✅ | Chromium-based |
| IE | ❌ | ❌ | Not supported, don't attempt |

---

## 3. Image Handling

### 3.1 Image Upload Flow

```
Frontend                          Backend                          Storage
  │                                │                                │
  ├── Capture photo (WebRTC)       │                                │
  ├── Compress (canvas → JPEG)     │                                │
  ├── POST multipart/form-data ───►│                                │
  │                                ├── Validate: JPEG/PNG, ≤5MB     │
  │                                ├── Generate unique filename     │
  │                                ├── Save to storage ────────────►│
  │                                ├── Store URL in database        │
  │◄── 201 { imageUrl } ──────────┤                                │
```

### 3.2 Image Storage Strategy

**Mini Project (Simple):**
- Store images in local filesystem: `backend/uploads/complaints/` and `backend/uploads/proofs/`
- Serve via Spring Boot static resource handler
- URL pattern: `/uploads/complaints/{filename}`

**Production (Stretch):**
- Use cloud storage (AWS S3, GCS, or Cloudinary)
- Serve via CDN
- Signed URLs for access control

### 3.3 Image File Naming

```
{entity_type}_{entity_id}_{timestamp}_{random}.jpg

Examples:
  complaint_42_20260223_a3b7c9.jpg
  proof_42_20260225_f1e2d3.jpg
```

### 3.4 Image Validation

| Check | Rule | Layer |
|---|---|---|
| File type | JPEG or PNG only | Frontend + Backend |
| File size | Max 5MB | Frontend + Backend |
| Dimensions | Min 320x240 | Backend |
| Magic bytes | Match JPEG/PNG header | Backend (prevent .exe renamed to .jpg) |
| Virus/malware | Basic check (optional) | Backend |

### 3.5 Image Edge Cases

| # | Issue | Risk | Solution |
|---|---|---|---|
| IM1 | User renames .exe to .jpg | Malware upload | Check magic bytes (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`) |
| IM2 | Image with embedded script (SVG XSS) | XSS attack | Only accept JPEG/PNG. Never render SVG. Set `Content-Type` correctly on serving |
| IM3 | Very large image (20MB before compression) | Memory issues | Client-side compression mandatory. Backend rejects > 5MB |
| IM4 | Storage disk fills up | System crash | Monitor disk usage. Alert at 80%. Image cleanup for rejected complaints (older than 30 days) |
| IM5 | Image URL guessable | Unauthorized access | Use random suffixes in filenames. Serve through authenticated endpoint (not public directory). Or use signed URLs |
| IM6 | Image deleted from storage but referenced in DB | Broken image display | Show placeholder "Image unavailable" in frontend |
| IM7 | EXIF data contains personal info (camera model, exact GPS) | Privacy | Strip EXIF data on server before storing. Only keep the GPS coordinates captured programmatically |

### 3.6 Client-Side Compression

```javascript
function compressImage(blob, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(blob);
  });
}
```

---

## 4. Google Maps Integration

### 4.1 API Key Requirements

- Google Maps JavaScript API enabled
- Geocoding API (optional, for address display)
- Key restricted to your domain(s) in Google Cloud Console

### 4.2 Map Features Needed

| Feature | Usage | Component |
|---|---|---|
| Basic map display | Complaint location view | `<MapView>` |
| Markers | Individual complaints | `<ComplaintMarker>` |
| Marker clustering | Performance optimization | `@googlemaps/markerclusterer` |
| Info windows | Quick complaint info on click | Built-in |
| Heatmap | Intensity visualization | `google.maps.visualization` |
| Draggable marker | Citizen adjusts complaint location | Submit form |

### 4.3 Map Edge Cases

| # | Issue | Risk | Solution |
|---|---|---|---|
| M1 | Google Maps API key invalid/expired | Map won't load | Show fallback: plain text coordinates + link to Google Maps URL |
| M2 | API usage exceeds free tier | Charges | Set usage limits in Google Cloud Console. Free tier: 28,000 loads/month (sufficient for mini project) |
| M3 | Hundreds of markers on one map view | Performance lag | Use marker clustering library. Only load visible bounds |
| M4 | Map API blocked in user's country | Map won't work | Show fallback coordinates + OpenStreetMap link |
| M5 | Map marker doesn't reflect actual complaint location | Confusion | Always use the GPS coordinates from the database, not any cached/approximate location |

---

## 5. Proof Verification: Full Flow

```
Coordinator opens proof page → Camera starts + GPS captured
  │
  ├── Camera captures photo → compressed → preview shown
  │
  ├── GPS captured with accuracy indicator
  │
  ├── Submit button sends: (image blob, latitude, longitude)
  │
  └── Backend receives:
        │
        ├── 1. Validate complaint status is IN_PROGRESS
        ├── 2. Validate coordinator is assigned to this complaint
        ├── 3. Validate image (type, size)
        ├── 4. Strip EXIF from image
        ├── 5. Calculate distance:
        │      d = haversine(proof.lat, proof.lon, complaint.lat, complaint.lon)
        ├── 6. If d > 100m → REJECT with "Too far from complaint location (Xm away)"
        ├── 7. If d ≤ 100m → Save proof, set is_location_valid=true
        ├── 8. Update complaint status → COMPLETED
        ├── 9. Notify citizen
        ├── 10. Create audit log
        └── 11. Return success
```

### Critical Failure Points

| Point | Failure | User Impact | Handling |
|---|---|---|---|
| Camera | Permission denied | Cannot submit proof | Error message + instructions |
| GPS | Low accuracy | Distance check may fail | Show accuracy warning. Accept if accuracy < distance |
| Upload | Network failure | Proof lost | Retry mechanism. Don't clear captured image on failure |
| Distance | Fluctuating GPS gives wrong distance | Valid proof rejected | Allow coordinator to retry. If consistently fails, admin can manually accept |
| Backend | Server error during save | Data inconsistency | `@Transactional`: proof + status change atomic |
