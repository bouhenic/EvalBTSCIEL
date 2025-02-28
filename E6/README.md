# Grille d'évaluation E6 BTS CIEL

## Description

Ce projet est une application web permettant la gestion des évaluations des étudiants pour l'épreuve E6 du BTS CIEL (Cybersécurité, Informatique et Réseaux). Elle permet d'ajouter des étudiants, d'enregistrer leurs notes et d'exporter/importer les données sous format JSON. Il fonctionne sur Safari et Chrome. Pour les plus courageux, il reste à l'adapter pour Firefox. En effet, il y a quelques différences de fonctionnement au niveau du localstorage.

## Fonctionnalités

- Ajout et gestion des étudiants
- Saisie des notes pour les différentes épreuves E6 (Stage, Revues, Soutenance)
- Calcul automatique de la moyenne de l'épreuve E6
- Export et import des données au format JSON
- Interface utilisateur ergonomique et responsive

## Technologies utilisées

- **Frontend** : HTML, CSS, JavaScript
- **Scripts de gestion** : `gestion_evaluations.js`, `evaluation_scripts.js`, `script.js`
- **Styles** : `styles.css`

## Installation et utilisation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/bouhenic/EvalBTSCIEL.git
   cd EvalBTSCIEL/E6
   ```
2. **Ouvrir le fichier ********`index.html`******** dans un navigateur**
   - L'interface principale permet d'ajouter des étudiants et de gérer leurs évaluations.
   - La page `page_evaluation_e6.html` permet de saisir les notes de l'épreuve E6.

## Structure du projet

```
/📂
├──📄 index.html                # Page principale
├──📄 page_evaluation_e6.html    # Page d'évaluation individuelle
├──🎨styles.css                 # Feuille de styles CSS
├──📜script.js                  # Script général pour les interactions
├──📜gestion_evaluations.js      # Gestion des évaluations
├──📜evaluation_scripts.js       # Scripts liés aux notes et calculs
├──📂data/                      # (optionnel) Stockage des données JSON
```

## Fonctionnement

### Ajouter un étudiant

1. Remplir le formulaire avec le nom, prénom et numéro d'étudiant.
2. Sélectionner la session et cliquer sur "Ajouter l'étudiant".

### Noter un étudiant

1. Accéder à `page_evaluation_e6.html`
2. Saisir les notes pour chaque critère et catégorie
3. Le calcul de la moyenne se fait automatiquement
4. Sauvegarder l'évaluation

### Exporter et importer les données

- **Export** : Cliquer sur "Exporter JSON" pour télécharger les données.
- **Import** : Choisir un fichier JSON pour réimporter des étudiants et évaluations précédentes.

## Contribution

Les contributions sont les bienvenues !

1. Forker le projet
2. Créer une branche (`feature-nouvelle-fonction`)
3. Commiter vos modifications
4. Faire une pull request

## Licence

Ce projet est sous licence MIT. Vous pouvez l'utiliser librement sous réserve du respect de la licence.

---

*Projet développé pour la gestion des évaluations de l'épreuve E6 du BTS CIEL.*

