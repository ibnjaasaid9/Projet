document.addEventListener("DOMContentLoaded", function () {
    let converter = new showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true
    });

    let votes = {};

    fetch("/api/exercices")
        .then(response => response.json())
        .then(exercices => {
            let container = document.getElementById("exercices-container");
            container.innerHTML = "";

            exercices.forEach(exo => {
                let exoDiv = document.createElement("div");
                exoDiv.classList.add("exercice");

                // Convertir le Markdown en HTML
                let markdownHTML = converter.makeHtml(exo.texte.trim());

                exoDiv.innerHTML = `
                    <h3>${exo.nom}</h3>
                    <div class="exo-content markdown-body">${markdownHTML}</div>
                    <div class="votes">
                        ${[1, 2, 3, 4, 5].map(num => 
                            `<button class="vote-btn" data-id="${exo.nom}" data-vote="${num}">${num}</button>`).join('')}
                    </div>
                    <p class="vote-result">Moyenne des votes : <span id="vote-${exo.nom}">-</span></p>
                `;
                container.appendChild(exoDiv);
            });

            // Mise à jour MathJax pour afficher les formules correctement
            MathJax.typeset();

            fetch("/api/votes")
                .then(response => response.json())
                .then(data => {
                    data.forEach(voteEntry => {
                        let voteElement = document.getElementById(`vote-${voteEntry.exoId}`);
                        if (voteElement) {
                            voteElement.textContent = voteEntry.moyenne.toFixed(2);
                        }
                    });
                });

            document.querySelectorAll(".vote-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    let exoId = this.getAttribute("data-id");
                    let vote = parseInt(this.getAttribute("data-vote"));

                    document.querySelectorAll(`button[data-id="${exoId}"]`).forEach(b => b.classList.remove("active"));
                    this.classList.add("active");

                    votes[exoId] = vote;
                });
            });

            document.getElementById("envoyer-votes").addEventListener("click", function() {
                Object.entries(votes).forEach(([exoId, vote]) => {
                    fetch("/api/vote", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ exoId, vote })
                    }).then(() => location.reload());
                });
            });
        });
});
