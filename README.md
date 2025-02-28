# Évaluation des étudiants - BTS CIEL - Épreuves E5 et E6

## Présentation
Ce dépôt contient deux projets distincts pour la gestion des évaluations des étudiants en BTS CIEL (Cybersécurité, Informatique et Réseaux).

## 1. Grille d'évaluation E6 - BTS CIEL
### Description
Ce projet est une application web permettant la gestion des évaluations des étudiants pour l'épreuve E6. Elle permet d'ajouter des étudiants, d'enregistrer leurs notes et d'exporter/importer les données sous format JSON.

### Fonctionnalités
- Ajout et gestion des étudiants
- Saisie des notes pour les différentes épreuves E6 (Stage, Revues, Soutenance)
- Calcul automatique de la moyenne de l'épreuve E6
- Export et import des données au format JSON
- Interface utilisateur ergonomique et responsive

### Technologies utilisées
- **Frontend** : HTML, CSS, JavaScript
- **Scripts de gestion** : `gestion_evaluations.js`, `evaluation_scripts.js`, `script.js`
- **Styles** : `styles.css`

### Installation et utilisation
1. **Cloner le projet**
   ```bash
   git clone https://github.com/bouhenic/EvalBTSCIEL.git
   cd EvalBTSCIEL/E6
   ```
2. **Ouvrir le fichier `index.html` dans un navigateur**
   - Interface principale pour la gestion des évaluations.
   - Page `page_evaluation_e6.html` pour saisir les notes.

## 2. Grille d'évaluation E5 - BTS CIEL
### Description
Ce projet permet de gérer les évaluations des étudiants en BTS CIEL pour l'épreuve E5. Il fournit une interface pour ajouter des étudiants, enregistrer leurs évaluations et exporter/importer les données sous format JSON.

### Fonctionnalités
- Ajout et gestion des étudiants
- Saisie et visualisation des évaluations
- Calcul automatique des notes finales
- Import/export des données en JSON
- Interface ergonomique avec CSS

### Technologies utilisées
- **Frontend** : HTML, CSS, JavaScript
- **Scripts de gestion** : `script.js`, `studentManager.js`
- **Styles** : `styles.css`, `students.css`
- **Stockage** : LocalStorage pour persister les données

### Installation et utilisation
1. **Cloner le projet**
   ```bash
   git clone https://github.com/bouhenic/EvalBTSCIEL.git
   cd EvalBTSCIEL/E5
   ```
2. **Ouvrir le fichier `index.html` dans un navigateur**
   - Interface principale pour la gestion des étudiants.
   - `evaluation.html` pour effectuer une évaluation.

## Licence
Ces projets sont sous licence MIT. Vous pouvez les utiliser librement sous réserve du respect de la licence.

## Contribution
Les contributions sont les bienvenues !
1. Forker le projet
2. Créer une branche (`feature-nouvelle-fonction`)
3. Commiter vos modifications
4. Faire une pull request

---
*Projets développés pour la gestion des évaluations des épreuves E5 et E6 du BTS CIEL.*

