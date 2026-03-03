(function() {
  function Sakura(x, y, s, r, fn) {
    this.x = x;
    this.y = y;
    this.s = s;
    this.r = r;
    this.fn = fn;
    this._x = 0;
    this._y = 0;
    this._s = 0;
    this._r = 0;
  }

  Sakura.prototype.draw = function(cxt) {
    cxt.save();
    cxt.translate(this.x, this.y);
    cxt.rotate(this.r);
    cxt.fillStyle = 'rgba(255, 192, 203, ' + this.s + ')';
    cxt.beginPath();
    cxt.moveTo(0, 0);
    cxt.arc(0, 0, this.s, 0, Math.PI * 2, true);
    cxt.fill();
    cxt.restore();
  };

  Sakura.prototype.update = function() {
    this._x = (this._x + (this.x - this._x) * 0.1);
    this._y = (this._y + (this.y - this._y) * 0.1);
    this._s = (this._s + (this.s - this._s) * 0.1);
    this._r = (this._r + (this.r - this._r) * 0.1);
  };

  function SakuraList() {
    this.list = [];
  }

  SakuraList.prototype.push = function(sakura) {
    this.list.push(sakura);
  };

  SakuraList.prototype.draw = function(cxt) {
    for (var i = 0, len = this.list.length; i < len; i++) {
      this.list[i].draw(cxt);
    }
  };

  SakuraList.prototype.update = function() {
    for (var i = 0, len = this.list.length; i < len; i++) {
      this.list[i].update();
    }
  };

  SakuraList.prototype.get = function(i) {
    return this.list[i];
  };

  SakuraList.prototype.size = function() {
    return this.list.length;
  };

  function SakuraCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.sakuraList = new SakuraList();
    this.resize();
  }

  SakuraCanvas.prototype.resize = function() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  };

  SakuraCanvas.prototype.addSakura = function() {
    var x = Math.random() * this.width;
    var y = Math.random() * this.height - this.height;
    var s = Math.random() * 5 + 5;
    var r = Math.random() * Math.PI * 2;
    var fn = function(x, y) {
      return (Math.sin(x) + Math.cos(y)) * 2;
    };
    this.sakuraList.push(new Sakura(x, y, s, r, fn));
  };

  SakuraCanvas.prototype.draw = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.sakuraList.draw(this.ctx);
  };

  SakuraCanvas.prototype.update = function() {
    for (var i = 0, len = this.sakuraList.size(); i < len; i++) {
      var sakura = this.sakuraList.get(i);
      sakura.x += sakura.fn(sakura.x, sakura.y);
      sakura.y += 2;
      sakura.r += 0.02;

      if (sakura.y > this.height) {
        sakura.y = -10;
        sakura.x = Math.random() * this.width;
      }
    }
    this.sakuraList.update();
  };

  SakuraCanvas.prototype.start = function() {
    var that = this;
    for (var i = 0; i < 50; i++) {
      this.addSakura();
    }
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);

    function loop() {
      that.draw();
      that.update();
      requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('resize', function() {
      that.resize();
    });
  };

  var sakuraCanvas = new SakuraCanvas();
  sakuraCanvas.start();
})();