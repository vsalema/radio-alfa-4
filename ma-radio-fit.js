
/*! Fit-to-iframe scaler (no DOM restructuring) */
(function(){
  // 1) Choose the most stable root without editing HTML manually
  var target = document.querySelector('.radio-body, .radio-slider, .radio-screen') || document.body;
  // Add body class (purely layout container) — does not touch inner nodes
  document.body.classList.add('overlay-fit');
  // Tag the target to isolate the transform
  target.classList.add('overlay-fit-target');

  // 2) Measure the "natural" size once the layout is settled
  function naturalSize(){
    // Temporarily remove transform to measure intrinsic size
    var prev = target.style.transform;
    target.style.transform = 'none';
    // Use bounding box for robustness (includes borders/shadows)
    var rect = target.getBoundingClientRect();
    // Fall back to scroll sizes if rect seems degenerate
    var natW = rect.width  || target.scrollWidth  || document.documentElement.scrollWidth;
    var natH = rect.height || target.scrollHeight || document.documentElement.scrollHeight;
    // Restore transform
    target.style.transform = prev;
    return { w: natW, h: natH };
  }

  var nat = naturalSize();

  // 3) Compute scale to fit current viewport of the iframe
  function applyScale(){
    // Viewport = inner size of the iframe
    var vw = window.innerWidth  || document.documentElement.clientWidth;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    // Protect against zero sizes
    vw = Math.max(1, vw); vh = Math.max(1, vh);
    // Uniform scaling
    var sx = vw / nat.w;
    var sy = vh / nat.h;
    var s  = Math.min(sx, sy);

    // Clamp to avoid over-blur at huge scales (optional)
    s = Math.max(0.25, Math.min(2.0, s));

    // Set as a CSS variable (so we never fight with inline styles)
    document.documentElement.style.setProperty('--page-transform', 'scale(' + s + ')');
  }

  // Initial paint
  applyScale();

  // 4) Recompute on resize & orientation changes
  var ro;
  try{
    ro = new ResizeObserver(function(){ applyScale(); });
    ro.observe(document.documentElement);
  }catch(e){
    // Fallback: listen to resize
    window.addEventListener('resize', applyScale, { passive:true });
  }

  // In case webfonts or late images shift metrics after load
  window.addEventListener('load', function(){
    nat = naturalSize();
    applyScale();
  });

  // Optional: expose a manual recalculation (debug)
  window.__fitOverlayRecalc = function(){
    nat = naturalSize();
    applyScale();
  };
})();
