# SlopeTool - Slope Measurement Tool

A mobile-friendly web app that measures slopes using camera and grid overlay.

## Project Structure

```
SlopeTool/
├── index.html          # Main page (page selection)
├── Grad.html           # Slope measurement page
├── Slope.html          # 3D slope model page  
├── common.css          # Common stylesheet
├── package.json        # Project configuration
├── vite.config.js      # Vite build configuration
├── public/             # Static files
│   ├── Target.mind
│   ├── Target.png
│   └── vite.svg
└── src/                # Source code
    ├── Grad.js         # Slope measurement main app (modularized)
    ├── camera.js       # Camera access and control
    ├── drawing.js      # Drawing points, lines, triangles
    ├── capture.js      # Screen capture functionality
    ├── grid.js         # Grid management
    ├── events.js       # User input handling
    ├── main.js         # Main page script
    └── Slope.js        # 3D slope model
├── archive/            # Backup files
    ├── Grad-old.js     # Pre-modularization version
    └── Grad-new.js     # Mid-development modularization version
```

## Key Features

### Slope Measurement (Grad.html)
- **Mobile Optimized**: Automatic rear camera selection, touch interface
- **Grid Overlay**: Adjustable grid for precise measurement
- **Point Selection**: Red dots that align precisely to grid intersections
- **Line Drawing**: Blue connecting lines between two points
- **Triangle Creation**: Right triangle visualization of horizontal/vertical distances
- **Dimension Display**: Distance measurement in grid units
- **Screen Capture**: Integrated capture of camera screen + overlay elements

### 3D Slope Model (Slope.html)
- **3D Visualization**: Interactive slope implemented with Three.js
- **Real-time Calculation**: Instant updates based on input values

## Module Structure

### camera.js
- `startCamera()`: Mobile rear camera access and setup
- Multi-stage fallback strategy ensures maximum compatibility

### drawing.js
- Drawing and managing points, line segments, triangles
- State management: `state.points`, `state.triangleCreated`
- DOM element creation and precise position calculation

### capture.js
- `captureScreenshot()`: Integrated capture of video + web elements
- `fallbackCapture()`: Canvas API direct rendering alternative

### grid.js
- Grid size management and updates
- `increaseGridSize()`, `decreaseGridSize()`

### events.js
- Touch/click event handling
- Control area detection and blocking
- Grid point snap logic

## Usage

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **기울기 측정**:
   - 휴대폰에서 Grad.html 접속
   - 카메라 권한 허용
   - 격자점 두 개 선택
   - 거리 측정 또는 삼각형 그리기
   - 캡처 버튼으로 결과 저장

## 기술 스택

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **3D Graphics**: Three.js
- **Build Tool**: Vite
- **Mobile Support**: MediaDevices API, Touch Events
- **Capture**: html2canvas + Canvas API

## 브라우저 호환성

- Chrome/Safari (모바일): 완전 지원
- Firefox (모바일): 부분 지원
- 데스크톱: 모든 주요 브라우저

## 개발 노트

- 모듈화된 구조로 유지보수성 향상
- 모바일 우선 설계
- 터치 및 클릭 이벤트 통합 처리
- 카메라 접근 실패 시 여러 단계 fallback
- 정확한 격자점 정렬 및 스냅 기능

## 아카이브 파일들

`archive/` 폴더에는 리팩토링 과정의 백업 파일들이 저장되어 있습니다:

- **Grad-old.js**: 모듈화 이전의 원본 모놀리식 코드 (850라인)
- **Grad-new.js**: 모듈화 개발 과정에서의 중간 버전

현재 활성화된 `src/Grad.js`는 모듈화가 완료된 버전입니다.
