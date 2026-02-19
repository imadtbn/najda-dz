
        const menuToggle = document.getElementById("menuToggle");
        const navLinks = document.getElementById("navLinks");
        const navOverlay = document.getElementById("navOverlay");
        const closeMenu = document.getElementById("closeMenu");

        menuToggle.addEventListener("click", () => {
            navLinks.classList.add("active");
            navOverlay.classList.add("active");
        });

        closeMenu.addEventListener("click", closeNav);
        navOverlay.addEventListener("click", closeNav);

        function closeNav() {
            navLinks.classList.remove("active");
            navOverlay.classList.remove("active");
            document.body.style.overflow = "auto";
        }

        menuToggle.addEventListener("click", () => {
            navLinks.classList.add("active");
            navOverlay.classList.add("active");
            document.body.style.overflow = "hidden";
        });
