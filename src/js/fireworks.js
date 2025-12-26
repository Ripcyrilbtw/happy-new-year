class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.gravity = 0.15;
    this.friction = 0.98;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.01;
    this.size = Math.random() * 3 + 2;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;

    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;

    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  isDead() {
    return this.alpha <= 0;
  }
}

class Firework {
  constructor(x, y, targetY, color) {
    this.x = x;
    this.y = y;
    this.targetY = targetY;
    this.color = color;

    this.vy = -Math.random() * 8 - 10;
    this.gravity = 0.25;
    this.exploded = false;
    this.particles = [];
    this.trail = [];
    this.trailLength = 10;
  }

  update() {
    if (!this.exploded) {
      this.trail.push({ x: this.x, y: this.y, alpha: 1 });

      if (this.trail.length > this.trailLength) {
        this.trail.shift();
      }

      this.vy += this.gravity;
      this.y += this.vy;

      if (this.vy >= 0 && this.y >= this.targetY) {
        this.explode();
      }
    } else {
      this.particles = this.particles.filter(particle => {
        particle.update();
        return !particle.isDead();
      });
    }
  }

  explode() {
    this.exploded = true;

    const particleCount = Math.random() * 50 + 80;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(this.x, this.y, this.color));
    }
  }

  draw(ctx) {
    if (!this.exploded) {
      this.trail.forEach((point, index) => {
        const alpha = (index / this.trail.length) * 0.8;
        ctx.save();
        ctx.globalAlpha = alpha;

        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, 3
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;

      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, 4
      );
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.3, this.color);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    } else {
      this.particles.forEach(particle => particle.draw(ctx));
    }
  }

  isDone() {
    return this.exploded && this.particles.length === 0;
  }
}

export class FireworksAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.fireworks = [];
    this.animationFrameId = null;
    this.isActive = false;

    this.colors = [
      '#ff0844',
      '#ffb700',
      '#00e5ff',
      '#6c5ce7',
      '#00ff88',
      '#ff6b6b',
      '#4ecdc4',
      '#ffe66d',
      '#a8e6cf',
      '#ffd93d'
    ];

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createFirework() {
    const x = Math.random() * this.canvas.width;
    const targetY = Math.random() * (this.canvas.height * 0.4) + this.canvas.height * 0.1;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    this.fireworks.push(new Firework(x, this.canvas.height, targetY, color));
  }

  update() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (Math.random() < 0.08 && this.fireworks.length < 8) {
      this.createFirework();
    }

    this.fireworks = this.fireworks.filter(firework => {
      firework.update();
      firework.draw(this.ctx);
      return !firework.isDone();
    });

    if (this.isActive) {
      this.animationFrameId = requestAnimationFrame(() => this.update());
    }
  }

  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.canvas.classList.add('active');
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.createFirework(), i * 300);
    }

    this.update();
  }

  stop() {
    this.isActive = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    setTimeout(() => {
      this.canvas.classList.remove('active');
      this.fireworks = [];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }, 3000);
  }

  cleanup() {
    this.stop();
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}
