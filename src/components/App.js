import { useRef, useEffect, useState } from 'react';
import { Canvas } from 'fabric';
import Toolbox from './Toolbox';
import EditorCanvas from './EditorCanvas';
import './App.css';

const DEFAULT_ZOOMS = {
  'presentation': 1.0,
  'instagram-post': 0.9,
  'reel-linkedin': 0.6,
  'a4': 0.3
};

const CANVAS_SIZES = {
  'presentation': { name: 'Presentation 16:9', width: 1920, height: 1080 },
  'instagram-post': { name: 'Instagram Post 4:5', width: 1080, height: 1350 },
  'reel-linkedin': { name: 'Instagram/TikTok Reel/Linkedin post 9:16', width: 1080, height: 1920 },
  'a4': { name: 'A4(Print/poster) 21X29.7cm', width: 2480, height: 3508 }
};

function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOMS['presentation']);
  const [baseSize, setBaseSizeState] = useState(CANVAS_SIZES['presentation']);
  const [currentSizeKey, setCurrentSizeKey] = useState('presentation');

  // Create the canvas only once on mount
  useEffect(() => {
    const canvas = new Canvas(canvasRef.current, { backgroundColor: 'white' });
    canvas.setDimensions({ width: baseSize.width, height: baseSize.height });
    setCanvas(canvas);
    return () => canvas.dispose();
    // eslint-disable-next-line
  }, []);

  // Update zoom and canvas size when zoom or baseSize changes
  useEffect(() => {
    if (!canvas) return;
    const width = Number(baseSize.width);
    const height = Number(baseSize.height);
    const z = Number(zoom);
    if (
      !width || !height || !z || isNaN(width) || isNaN(height) || isNaN(z) || width <= 0 || height <= 0 || z <= 0
    ) {
      console.warn('Invalid canvas size or zoom:', { width, height, zoom });
      return;
    }
    canvas.setZoom(z);
    canvas.setWidth(width * z);
    canvas.setHeight(height * z);
    canvas.requestRenderAll();
  }, [zoom, canvas, baseSize.width, baseSize.height]);

  // When the canvas size changes, set the default zoom for that size
  const handleSetBaseSize = (sizeObj, sizeKey) => {
    setBaseSizeState(sizeObj);
    setCurrentSizeKey(sizeKey);
    if (DEFAULT_ZOOMS[sizeKey] !== undefined) {
      setZoom(DEFAULT_ZOOMS[sizeKey]);
    }
  };

  const handleZoomChange = (e) => {
    setZoom(Number(e.target.value));
  };

  return (
    <div className="editor">
      <Toolbox
        canvas={canvas}
        baseSize={baseSize}
        setBaseSize={(sizeObj) => {
          // Find the key for the selected size
          const foundKey = Object.entries(CANVAS_SIZES).find(([, val]) => val.width === sizeObj.width && val.height === sizeObj.height)?.[0];
          handleSetBaseSize(sizeObj, foundKey || 'presentation');
        }}
        currentSizeKey={currentSizeKey}
        CANVAS_SIZES={CANVAS_SIZES}
      />
      <EditorCanvas ref={canvasRef} canvas={canvas} />
      <div className="zoom-slider-container">
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.01}
          value={zoom}
          onChange={handleZoomChange}
          className="zoom-slider"
        />
        <span className="zoom-label">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}

export default App;
