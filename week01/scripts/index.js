
// Navigation links
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
    link.addEventListener("click", function () {
        navLinks.forEach(nav => nav.classList.remove("active"));
        this.classList.add("active");
    });
});


// Course filtering
const filterButtons = document.querySelectorAll(".filter-btn");
const courses = document.querySelectorAll(".course section");

filterButtons.forEach(button => {
    button.addEventListener("click", function () {

        // Get the selected category
        const selectedFilter = this.dataset.filter;

        // Loop through all courses
        courses.forEach(course => {

            // Check if course matches the selected category
            if (selectedFilter === "all" || course.dataset.category === selectedFilter) {
                course.style.display = "flex";
            } else {
                course.style.display = "none";
            }

        });

        // Update active button
        filterButtons.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");

    });
});

// Automatically display the current year
const currentYear = new Date().getFullYear();

document.querySelector("#current-year").textContent = currentYear;


// Automatically display the last modification date and time
const lastModified = new Date(document.lastModified);

// Format date and time
const formattedDate =
    String(lastModified.getMonth() + 1).padStart(2, "0") + "/" +
    String(lastModified.getDate()).padStart(2, "0") + "/" +
    lastModified.getFullYear() + " " +
    String(lastModified.getHours()).padStart(2, "0") + ":" +
    String(lastModified.getMinutes()).padStart(2, "0") + ":" +
    String(lastModified.getSeconds()).padStart(2, "0");

document.querySelector("#last-modified").textContent = formattedDate;


// Hamburger menu
const menuToggle = document.querySelector("#menu-toggle");
const directory = document.querySelector("#directory");

menuToggle.addEventListener("click", function () {

    // Show or hide navigation
    directory.classList.toggle("show");

    // Change hamburger into X
    menuToggle.classList.toggle("open");

    // Update accessibility attributes
    const isOpen = menuToggle.classList.contains("open");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
    );

});
