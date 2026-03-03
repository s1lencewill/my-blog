(function() {
  function createSakura() {
    const sakura = document.createElement('div');
    sakura.className = 'sakura';
    sakura.style.position = 'fixed';
    sakura.style.top = '-20px';
    sakura.style.left = Math.random() * window.innerWidth + 'px';
    sakura.style.fontSize = (Math.random() * 10 + 10) + 'px';
    sakura.style.color = '#FFB7C5';
    sakura.style.pointerEvents = 'none';
    sakura.style.zIndex = '9999';
    sakura.style.opacity = Math.random() * 0.5 + 0.5;
    sakura.innerHTML = '🌸';
    sakura.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    document.body.appendChild(sakura);
    
    const speed = Math.random() * 2 + 1;
    const drift = Math.random() * 2 - 1;
    let rotation = Math.random() * 360;
    const rotationSpeed = Math.random() * 2 - 1;
    
    function fall() {
      const currentTop = parseFloat(sakura.style.top);
      const currentLeft = parseFloat(sakura.style.left);
      
      sakura.style.top = (currentTop + speed) + 'px';
      sakura.style.left = (currentLeft + drift + Math.sin(currentTop * 0.01)) + 'px';
      rotation += rotationSpeed;
      sakura.style.transform = 'rotate(' + rotation + 'deg)';
      
      if (currentTop > window.innerHeight + 20) {
        sakura.remove();
      } else {
        requestAnimationFrame(fall);
      }
    }
    
    fall();
  }

  function startSakura() {
    createSakura();
    setTimeout(startSakura, Math.random() * 500 + 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSakura);
  } else {
    startSakura();
  }
})();