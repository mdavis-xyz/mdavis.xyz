document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('fallback-gif').style.display = 'none';

    // Get SVG elements
    const svgs = document.querySelectorAll('.diagram');
    let currentIndex = 0;

    // Show first SVG initially
    svgs[currentIndex].classList.add('active');

    // Start animation loop
    setInterval(() => {
        svgs[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % svgs.length;
        svgs[currentIndex].classList.add('active');
    }, 1000);
})


