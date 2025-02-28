# Gestion des Évaluations - BTS CIEL

Ce projet permet de gérer les évaluations des étudiants en BTS CIEL (Cybersécurité, Informatique et Électronique). Il fournit une interface pour ajouter des étudiants, enregistrer leurs évaluations et exporter/importer les données sous format JSON.

## 📌 Fonctionnalités

- 📋 **Ajout et gestion des étudiants**
- ✅ **Saisie et visualisation des évaluations**
- 📊 **Calcul automatique des notes finales**
- 📂 **Import/export des données en JSON**
- 🎨 **Interface ergonomique avec CSS**

## 🛠️ Installation et utilisation

1. **Cloner le dépôt**
   ```sh
   git clone https://github.com/votre-utilisateur/nom-du-repo.git
   cd nom-du-repo
   ```

2. **Ouvrir le projet**
   - Ouvrir `index.html` dans un navigateur pour gérer les étudiants.
   - Ouvrir `evaluation.html` pour effectuer une évaluation.

## 📂 Structure du projet

```
📂 projet
├── 📄 index.html          # Page principale pour la gestion des étudiants
├── 📄 evaluation.html     # Page d’évaluation des étudiants
├── 🎨 styles.css         # Styles généraux
├── 🎨 students.css       # Styles spécifiques à la gestion des étudiants
├── 📜 script.js          # Scripts pour l’évaluation
├── 📜 studentManager.js  # Gestion des étudiants et stockage des données
```

## 🚀 Fonctionnement

- La liste des étudiants est stockée en local (LocalStorage).
- Les évaluations sont enregistrées dynamiquement.
- Possibilité d'exporter/importer les données en JSON.

## 🖥️ Technologies utilisées

- **HTML / CSS** : Structure et design
- **JavaScript** : Gestion des données et interactions
- **LocalStorage** : Persistance des données sur le navigateur

## 📜 Licence

Ce projet est sous licence MIT.

---

📧 Pour toute question ou amélioration, n’hésitez pas à contribuer ou ouvrir une issue sur GitHub !

