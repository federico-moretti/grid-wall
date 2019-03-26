Object.defineProperties(window.HTMLElement.prototype, {
  offsetLeft: {
    get: function() {
      return parseFloat(window.getComputedStyle(this).marginLeft) || 0;
    },
  },
  offsetTop: {
    get: function() {
      return parseFloat(window.getComputedStyle(this).marginTop) || 0;
    },
  },
  offsetHeight: {
    get: function() {
      return parseFloat(window.getComputedStyle(this).height) || 0;
    },
  },
  clientHeight: {
    get: function() {
      return parseFloat(window.getComputedStyle(this).height) || 0;
    },
  },
  offsetWidth: {
    get: function() {
      return parseFloat(window.getComputedStyle(this).width) || 0;
    },
  },
  clientWidth: {
    get: function() {
      return parseFloat(window.getComputedStyle(this).width) || 0;
    },
  },
});

const resizeEvent = document.createEvent('Event');
resizeEvent.initEvent('resize', true, true);

Object.defineProperties(window, {
  resizeTo: function(width, height) {
    this.innerWidth = width || this.innerWidth;
    this.innerHeight = height || this.innerHeight;
    this.dispatchEvent(resizeEvent);
  },
});
