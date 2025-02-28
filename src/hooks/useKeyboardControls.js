import { useState, useEffect } from 'react';

const useKeyboardControls = (isEnabled = true) => {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    space: false,
  });
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEnabled) return;
      
      // Prevent default actions for game control keys
      if (['w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      
      switch (e.key.toLowerCase()) {
        case 'w':
          setKeys(keys => ({ ...keys, forward: true, boost: true }));
          break;
        case 's':
          setKeys(keys => ({ ...keys, backward: true }));
          break;
        case 'a':
          setKeys(keys => ({ ...keys, left: true }));
          break;
        case 'd':
          setKeys(keys => ({ ...keys, right: true }));
          break;
        case ' ':
          setKeys(keys => ({ ...keys, space: true }));
          break;
        default:
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      if (!isEnabled) return;
      
      switch (e.key.toLowerCase()) {
        case 'w':
          setKeys(keys => ({ ...keys, forward: false, boost: false }));
          break;
        case 's':
          setKeys(keys => ({ ...keys, backward: false }));
          break;
        case 'a':
          setKeys(keys => ({ ...keys, left: false }));
          break;
        case 'd':
          setKeys(keys => ({ ...keys, right: false }));
          break;
        case ' ':
          setKeys(keys => ({ ...keys, space: false }));
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEnabled]);
  
  return keys;
};

export default useKeyboardControls; 