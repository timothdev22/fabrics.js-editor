import { useEffect, forwardRef, useRef } from 'react';

const EditorCanvas = forwardRef(({ canvas }, ref) =>{
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const spacePressed = useRef(false);
  const prevSelectable = useRef([]);
  const prevSelection = useRef(true);

  useEffect(() => {
    if(!canvas) return;
  
    function handleKeyDown(e) {
      if(e.key === 'Delete') {
        for(const obj of canvas.getActiveObjects()) {
          canvas.remove(obj);
          canvas.discardActiveObject();
        }
      }
      if (e.code === 'Space' && !spacePressed.current) {
        spacePressed.current = true;
        // Disable selection for all objects and canvas
        prevSelectable.current = canvas.getObjects().map(obj => obj.selectable);
        prevSelection.current = canvas.selection;
        canvas.selection = false;
        canvas.getObjects().forEach(obj => obj.selectable = false);
        canvas.defaultCursor = 'grab';
      }
    }

    function handleKeyUp(e) {
      if (e.code === 'Space') {
        spacePressed.current = false;
        // Restore selection for all objects and canvas
        canvas.selection = prevSelection.current;
        canvas.getObjects().forEach((obj, i) => obj.selectable = prevSelectable.current[i]);
        canvas.defaultCursor = 'default';
      }
    }

    function onMouseDown(opt) {
      if (!spacePressed.current) return;
      isPanning.current = true;
      lastPos.current = { x: opt.e.clientX, y: opt.e.clientY };
      canvas.setCursor('grabbing');
    }

    function onMouseMove(opt) {
      if (!isPanning.current) return;
      const e = opt.e;
      const delta = {
        x: e.clientX - lastPos.current.x,
        y: e.clientY - lastPos.current.y
      };
      canvas.relativePan(delta);
      lastPos.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseUp() {
      isPanning.current = false;
      canvas.setCursor(spacePressed.current ? 'grab' : 'default');
    }

    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('keyup', handleKeyUp, false);
    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
      document.removeEventListener('keyup', handleKeyUp, false);
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    }
    
  }, [canvas]);

  return(
    <div className="canvasbox">
      <canvas ref={ref}></canvas>
    </div>
  );
});

export default EditorCanvas;
