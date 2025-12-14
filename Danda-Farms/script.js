document.addEventListener("DOMContentLoaded", () => {
    const images = [
        "resources/poster.png",
        "resources/slide2.png",
        "resources/slide3.jpg",
        "resources/slide4.png"
    ];

    let index = 0;
    const poster = document.getElementById("Poster");

    function changeBackground() {
        const nextIndex = (index + 1) % images.length;

        // Set the next image on ::after (fade-in layer)
        poster.style.setProperty("--bg-next", `url(${images[nextIndex]})`);

        // Trigger fade effect
        poster.classList.add("fade");

        // After fade completes, update the main ::before background
        setTimeout(() => {
            poster.style.setProperty("--bg-current", `url(${images[nextIndex]})`);
            poster.classList.remove("fade");
            index = nextIndex;
        }, 1000);
    }

    // Initial images
    poster.style.setProperty("--bg-current", `url(${images[0]})`);
    poster.style.setProperty("--bg-next", `url(${images[1]})`);

    setInterval(changeBackground, 4000);
});
