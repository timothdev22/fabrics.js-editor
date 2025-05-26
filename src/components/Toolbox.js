import { useEffect } from 'react';
import { Image, IText } from 'fabric';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Toolbox = ({ canvas, baseSize, setBaseSize, currentSizeKey, CANVAS_SIZES }) => {
  useEffect(() => {
    if(!canvas) return;
    canvas.setDimensions(baseSize);
  }, [canvas, baseSize]);

  function fileHandler(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {               
      const image = await Image.fromURL(e.target.result);
      const scale = Math.min(baseSize.width / image.width, baseSize.height / image.height, 1) * 0.5;
      image.scale(scale);
      canvas.add(image);
      canvas.centerObject(image);
      canvas.setActiveObject(image); 
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function addText() {
    const text = new IText('Edit this text');
    canvas.add(text);
    canvas.centerObject(text);
    canvas.setActiveObject(text); 
  }

  function downloadImage() {
    const link = document.createElement('a');
    link.download = 'photo_editor_image.png';
    link.href = canvas.toDataURL();
    link.click();
  }

  function clearAll() {
    if(window.confirm('Are you sure you want to clear all?')) {
      canvas.remove(...canvas.getObjects());
    }
  }

  function handleCanvasSizeChange(e) {
    const selectedSize = CANVAS_SIZES[e.target.value];
    if (selectedSize) {
      setBaseSize({
        width: selectedSize.width,
        height: selectedSize.height
      });
    }
  }

  return (
    <div className="toolbox">
      <button title="Add image">
        <FontAwesomeIcon icon="image" />
        <input
          type="file"
          accept=".png, .jpg, .jpeg"
          onChange={fileHandler}/>
      </button>
      <button title="Add text" onClick={addText}>
        <FontAwesomeIcon icon="font" />
      </button>
      <select 
        title="Canvas size" 
        onChange={handleCanvasSizeChange}
        value={currentSizeKey}
      >
        <option value="" disabled>Select canvas size…</option>
        {Object.entries(CANVAS_SIZES).map(([key, size]) => (
          <option key={key} value={key}>
            {size.name} ({size.width}×{size.height})
          </option>
        ))}
      </select>
      <button title="Clear all" onClick={clearAll}>
        <FontAwesomeIcon icon="trash" />
      </button>
      <button title="Download" onClick={downloadImage}>
        <FontAwesomeIcon icon="download" />
      </button>
    </div>
  );
};

export default Toolbox;
