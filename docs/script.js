document.addEventListener("DOMContentLoaded", function () {
    let converter = new showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true
    });

    let container = document.getElementById("exercices-container");

    console.log("🚀 Chargement des exercices...");

    // Charger la liste des fichiers `.md`
    fetch("exercices/index.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("❌ Erreur lors du chargement de index.json !");
            }
            return response.json();
        })
        .then(fichiers => {
            console.log("📂 Fichiers trouvés :", fichiers);

            fichiers.forEach(fichier => {
                fetch(`exercices/${fichier}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`❌ Erreur lors du chargement de ${fichier}`);
                        }
                        return response.text();
                    })
                    .then(content => {
                        let exoDiv = document.createElement("div");
                        exoDiv.classList.add("exercice");

                        let markdownHTML = converter.makeHtml(content.trim());

                        exoDiv.innerHTML = `
                            <h3>${fichier}</h3>
                            <div class="exo-content markdown-body">${markdownHTML}</div>
                        `;
                        container.appendChild(exoDiv);

                        // Met à jour MathJax pour les formules LaTeX
                        MathJax.typeset();
                    })
                    .catch(error => console.error(error));
            });
        })
        .catch(error => console.error("❌ Erreur de chargement de la liste des fichiers :", error));
});
