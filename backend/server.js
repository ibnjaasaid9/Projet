const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("../public")); // 📌 Sert les fichiers frontend

// 📂 Chemin des fichiers d'exercices Markdown
const EXERCICES_DIR = "C:/Users/PC/Desktop/Nouveau dossier/Projet/ALG";

// 📊 Connexion à SQLite
let db = new sqlite3.Database("./database.db", (err) => {
    if (err) console.error(err);
    console.log("📊 Base de données connectée !");
});

// 📌 Création de la table des votes
db.run(`CREATE TABLE IF NOT EXISTS votes (
    exoId TEXT PRIMARY KEY,
    votes TEXT
)`);

// 📝 API pour récupérer les exercices Markdown
app.get("/api/exercices", (req, res) => {
    fs.readdir(EXERCICES_DIR, (err, files) => {
        if (err) {
            console.error("Erreur de lecture du dossier :", err);
            return res.status(500).json({ error: "Erreur de lecture du dossier des exercices." });
        }

        let exercices = files
            .filter(f => f.endsWith(".md"))
            .map(f => {
                let content = fs.readFileSync(path.join(EXERCICES_DIR, f), "utf-8");
                return { nom: f, texte: content };
            });

        res.json(exercices);
    });
});

// 🔥 API pour enregistrer un vote
app.post("/api/vote", (req, res) => {
    let { exoId, vote } = req.body;

    db.get("SELECT votes FROM votes WHERE exoId = ?", [exoId], (err, row) => {
        if (err) return res.status(500).json({ error: "Erreur avec la base de données." });

        let votes = row ? JSON.parse(row.votes) : [];
        votes.push(vote);

        db.run("INSERT INTO votes (exoId, votes) VALUES (?, ?) ON CONFLICT(exoId) DO UPDATE SET votes = ?",
            [exoId, JSON.stringify(votes), JSON.stringify(votes)], (err) => {
                if (err) return res.status(500).json({ error: "Erreur d'enregistrement du vote." });
                res.json({ message: "✅ Vote enregistré !" });
            });
    });
});

// 📊 API pour récupérer les votes de chaque exercice
app.get("/api/votes", (req, res) => {
    db.all("SELECT * FROM votes", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Erreur avec la base de données." });

        let votesData = rows.map(row => ({
            exoId: row.exoId,
            votes: JSON.parse(row.votes),
            moyenne: JSON.parse(row.votes).reduce((a, b) => a + b, 0) / JSON.parse(row.votes).length
        }));

        res.json(votesData);
    });
});

// 🚀 Lancement du serveur
app.listen(3000, () => console.log("🟢 Serveur en ligne : http://localhost:3000"));
