// Make SVG images in .graph elements clickable to open full-size
document.addEventListener('DOMContentLoaded', function() {
  const graphContainers = document.querySelectorAll('.graph');

  graphContainers.forEach(function(container) {
    const img = container.querySelector('img');
    if (img && img.src.endsWith('.svg')) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', function() {
        window.open(img.src, '_blank');
      });
    }
  });
});
