        // Detect Enter key press for search
        var input = document.getElementById("searchInput");
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                document.getElementById("Searchbtn").click();
            }
        });

        // IMDb search function
        async function searchIMDb() {
            const searchQuery = document.getElementById("searchInput").value.trim();
            if (!searchQuery) {
                alert("Please enter a movie or show name.");
                return;
            }

            try {
                const response = await fetch(`https://www.omdbapi.com/?apikey=775f5bf1&s=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();

                if (data.Response === "True" && data.Search && data.Search.length > 0) {
                    document.getElementById("result").innerHTML = "<h3>Select a title:</h3>";
                    data.Search.forEach((result) => {
                        const resultItem = document.createElement("div");
                        resultItem.classList.add("result-item");

                        // Poster image
                        const posterImg = document.createElement("img");
                        posterImg.classList.add("poster");
                        posterImg.src = result.Poster !== "N/A" ? result.Poster : "https://via.placeholder.com/50x75?text=No+Image";
                        posterImg.alt = `${result.Title} poster`;

                        // Title, year, and type text
                        const text = document.createElement("span");
                        text.innerText = `${result.Title} (${result.Year}) - ${result.Type}`;

                        resultItem.appendChild(posterImg);
                        resultItem.appendChild(text);

                        resultItem.onclick = () => loadVideo(result.imdbID, result.Title, result.Type);
                        document.getElementById("result").appendChild(resultItem);
                    });
                } else {
                    document.getElementById("result").innerText = "No results found.";
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                document.getElementById("result").innerText = "Error fetching data.";
            }
        }

        // Load video function
        function loadVideo(imdbID, title, type) {
            let embedUrl;
            if (type === "movie") {
                embedUrl = `https://vidsrc.xyz/embed/movie?imdb=${imdbID}`;
            } else if (type === "series") {
                embedUrl = `https://vidsrc.xyz/embed/tv?imdb=${imdbID}`;
            } else {
                document.getElementById("result").innerText = "Only movies and series are supported.";
                return;
            }

            document.getElementById("video-frame").src = embedUrl;
            document.getElementById("video-frame").style.display = "block";
            document.getElementById("result").innerText = `Displaying ${type === "movie" ? "Movie" : "TV Show"}: ${title}`;

            // Hide header when video is playing
            document.getElementById("header").style.transform = "translateY(-100%)";
        }

        // Toggle cast function
        function toggleCast() {
            const iframe = document.getElementById("video-frame");
            const currentSandbox = iframe.getAttribute("sandbox");

            if (confirm("Warning: By pressing this you will allow the player to open tabs to POTENTIALLY DANGEROUS WEBSITES. Do you want to proceed?")) {
                if (currentSandbox) {
                    iframe.removeAttribute("sandbox");
                } else {
                    iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms");
                }
            }
        }

        // Show header when scrolling up
        let lastScrollY = window.scrollY;
        window.addEventListener("scroll", function() {
            const header = document.getElementById("header");
            if (window.scrollY < lastScrollY) {
                header.style.transform = "translateY(0)";
            } else if (window.scrollY > lastScrollY && document.getElementById("video-frame").style.display === "block") {
                header.style.transform = "translateY(-100%)";
            }
            lastScrollY = window.scrollY;
        });