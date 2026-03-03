(function() {
  const style = document.createElement('style');
  style.textContent = `
    .sakura {
      position: fixed;
      top: -20px;
      z-index: 9999;
      pointer-events: none;
      animation: fall linear forwards;
      font-size: 20px;
      color: #FFB7C5;
    }
    @keyframes fall {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  function createSakura() {
    const sakura = document.createElement('div');
    sakura.className = 'sakura';
    sakura.textContent = '🌸';
    sakura.style.left = Math.random() * 100 + 'vw';
    sakura.style.fontSize = (Math.random() * 15 + 10) + 'px';
    sakura.style.animationDuration = (Math.random() * 5 + 5) + 's';
    document.body.appendChild(sakura);
    
    setTimeout(() => {
      sakura.remove();
    }, 10000);
  }

  function startSakura() {
    createSakura();
    setTimeout(startSakura, Math.random() * 800 + 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSakura);
  } else {
    startSakura();
  }
})();