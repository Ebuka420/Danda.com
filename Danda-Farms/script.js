document.addEventListener("DOMContentLoaded", () => {
    const images = [
        "resources/poster.png",
        "resources/slide2.png",
        "resources/slide3.jpg",
        "resources/slide4.png"
    ];

    let index = 0;
    const poster = document.getElementById("Poster");
    if (poster) {

    function changeBackground() {
        const nextIndex = (index + 1) % images.length;

        // Set the next image on ::after (fade-in layer)
        poster.style.setProperty("--bg-next", `url(${images[nextIndex]})`);

        // Trigger fade effect
        poster.classList.add("is-transitioning");

        // After fade completes, update the main ::before background
        setTimeout(() => {
            poster.style.setProperty("--bg-current", `url(${images[nextIndex]})`);
            poster.classList.remove("is-transitioning");
            index = nextIndex;
        }, 1000);
    }

    // Initial images
    poster.style.setProperty("--bg-current", `url(${images[0]})`);
    poster.style.setProperty("--bg-next", `url(${images[1]})`);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setInterval(changeBackground, 7000);
    }
    }

    // The site has no form backend; turn contact forms into honest email drafts.
    document.querySelectorAll('form[action="#"]').forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const fields = new FormData(form);
            const name = fields.get("name") || "Website enquiry";
            const email = fields.get("email") || "Not provided";
            const message = fields.get("message") || "";
            const subject = `Website enquiry from ${name}`;
            const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
            window.location.href = `mailto:globaldanda@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            let status = form.querySelector("[data-form-status]");
            if (!status) {
                status = document.createElement("p");
                status.dataset.formStatus = "";
                status.setAttribute("role", "status");
                form.append(status);
            }
            status.textContent = "Your email app should open with this message. If it does not, email globaldanda@gmail.com directly.";
        });
    });

    // Remove the legacy social controls because the project has no verified profile URLs.
    document.querySelectorAll(".social-icons").forEach(icons => {
        icons.previousElementSibling?.remove();
        icons.remove();
    });
});
