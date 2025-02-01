document.addEventListener("DOMContentLoaded", function () {
    let converter = new showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true
    });

    let container = document.getElementById("exercices-container");

    // Charger la liste des fichiers `.md` depuis `docs/exercices/index.json`
    fetch("exercices/index.json")
        .then(response => response.json())
        .then(fichiers => {
            fichiers.forEach(fichier => {
                fetch(`exercices/${fichier}`)
                    .then(response => response.text())
                    .then(content => {
                        let exoDiv = document.createElement("div");
                        exoDiv.classList.add("exercice");

                        let markdownHTML = converter.makeHtml(content.trim());

                        exoDiv.innerHTML = `
                            <h3>${fichier}</h3>
                            <div class="exo-content markdown-body">${markdownHTML}</div>
                        `;
                        container.appendChild(exoDiv);

                        // Met à jour MathJax pour afficher les formules LaTeX
                        MathJax.typeset();
                    })
                    .catch(error => console.error("❌ Erreur de chargement du fichier :", fichier, error));
            });
        })
        .catch(error => console.error("❌ Erreur de chargement de la liste des fichiers :", error));
});
