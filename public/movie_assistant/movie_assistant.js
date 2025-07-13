document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "https://web-production-1c29.up.railway.app";
    const categoryInput = document.getElementById("categoryInput");
    const output = document.getElementById("output");
    const deleteContainer = document.getElementById("deleteContainer");
    const deleteCategoryInput = document.getElementById("deleteCategoryInput");
    const deleteTitleInput = document.getElementById("deleteTitleInput");
    const showDeleteButton = document.getElementById("showDeleteButton");
    const confirmDeleteButton = document.getElementById("confirmDeleteButton");
    const backButton = document.getElementById("backButton");
    const mainControls = document.getElementById("mainControls");

    showDeleteButton.addEventListener("click", () => {
        mainControls.style.display = "none";
        deleteContainer.style.display = "block";
        backButton.style.display = "inline-block";
    });

    backButton.addEventListener("click", () => {
        deleteContainer.style.display = "none";
        backButton.style.display = "none";
        mainControls.style.display = "flex";
        deleteCategoryInput.value = "";
        deleteTitleInput.value = "";
    });

    async function displayMovies(category, movies) {
        output.innerHTML = "";

        const heading = document.createElement("strong");
        heading.textContent = `Movies in '${category}':`;
        heading.style.display = "block";
        output.appendChild(heading);

        const gridContainer = document.createElement("div");
        gridContainer.className = "movie-grid";

        movies.forEach((movie, index) => {
            const movieItem = document.createElement("div");
            movieItem.className = "movie-item";

            const fallbackImage = "images/main/fallback.png";
            const imageSrc = movie.image_url || fallbackImage;

            movieItem.innerHTML = `
                <img src="${imageSrc}" 
                     style="width:100%;border-radius:6px;margin-bottom:6px;" 
                     onerror="this.src='${fallbackImage}'">
                <div class="movie-caption">
                    <span class="number">${index + 1}.</span><span class="title">${movie.title}</span>
                </div>
            `;

            gridContainer.appendChild(movieItem);
        });

        output.appendChild(gridContainer);
    }

    document.getElementById("findDeleteCategory").addEventListener("click", async () => {
        const category = deleteCategoryInput.value.trim().toLowerCase();

        if (!category) {
            output.innerText = "Please enter a category.";
            return;
        }

        const response = await fetch(`${BASE_URL}/get_movies/${category}`);
        const data = await response.json();

        if (data.movies && data.movies.length > 0) {
            displayMovies(category, data.movies);
        } else {
            output.innerHTML = "No movies found in this category.<br><br>Please check for spelling errors.";
        }
    });

    confirmDeleteButton.addEventListener("click", async () => {
        const category = deleteCategoryInput.value.trim().toLowerCase();
        const title = deleteTitleInput.value.trim();

        if (!category) {
            output.innerText = "Please enter a category.";
            return;
        }

        const confirm = window.confirm(`Delete ${title || "all movies"} in '${category}'?`);
        if (!confirm) return;

        const response = await fetch(`${BASE_URL}/delete_movie`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, title }),
        });

        const result = await response.json();
        output.innerText = result.message || "Done.";
    });

    async function setMovies() {
        const category = categoryInput.value.trim().toLowerCase();
        const bulkText = document.getElementById("bulkInput").value.trim();

        if (!category || !bulkText) {
            output.innerText = "Please enter a category and at least one movie.";
            return;
        }

        const entries = bulkText.split(",").map(e => e.trim()).filter(Boolean);
        let allSuccessful = true;

        for (const entry of entries) {
            const lastSpaceIndex = entry.lastIndexOf(" ");
            if (lastSpaceIndex === -1) continue;

            const title = entry.substring(0, lastSpaceIndex).trim();
            const year = entry.substring(lastSpaceIndex + 1).trim();

            if (!title || !year.match(/^\d{4}$/)) {
                output.innerText = `Invalid format for entry: "${entry}". Use "Title Year".`;
                allSuccessful = false;
                break;
            }

            const response = await fetch(`${BASE_URL}/add_movie`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category, title, year }),
            });

            if (!response.ok) {
                const err = await response.json();
                output.innerText = `Error: ${err.message}`;
                allSuccessful = false;
                break;
            }
        }

        if (allSuccessful) {
            output.innerText = "✅ Movies added successfully!";
            categoryInput.value = "";
            document.getElementById("bulkInput").value = "";
        }
    }

    async function getMovies() {
        const category = categoryInput.value.trim().toLowerCase();

        if (!category) {
            output.innerText = "Please enter a category.";
            return;
        }

        const response = await fetch(`${BASE_URL}/get_movies/${category}`);
        const data = await response.json();

        if (data.movies && data.movies.length > 0) {
            displayMovies(category, data.movies);
        } else {
            output.innerHTML = "No movies found in this category.<br><br>Please check for spelling errors.";
        }
    }

    document.getElementById("setMoviesButton").addEventListener("click", setMovies);
    document.getElementById("getMoviesButton").addEventListener("click", getMovies);
});
