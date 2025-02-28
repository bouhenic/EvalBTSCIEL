 /**
 * evaluation_scripts.js - Gestion des évaluations E6
 * Script optimisé regroupant toutes les fonctionnalités nécessaires pour la page d'évaluation
 */

// Déclaration des poids pour chaque type d'évaluation
const EVALUATION_WEIGHTS = {
    'stage': {
        'c01': 40,
        'c03': 20,
        'c08': 20,
        'c10': 20
    },
    'revue1': {
        'c01': 30,
        'c03': 70,
        'c08': 0,
        'c10': 0
    },
    'revue2': {
        'c01': 20,
        'c03': 20,
        'c08': 45,
        'c10': 15
    },
    'revue3': {
        'c01': 20,
        'c03': 15,
        'c08': 40,
        'c10': 25
    },
    'soutenance': {
        'c01': 30,
        'c03': 15,
        'c08': 30,
        'c10': 25
    }
};

// Stockage global des niveaux sélectionnés
let selectedLevels = {
    c01: {},
    c03: {},
    c08: {},
    c10: {}
};

/**
 * Lire les paramètres d'URL
 */
function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    
    return params;
}

/**
 * Initialisation du système d'évaluation
 */
function initEvaluationSystem() {
    console.log("Initialisation du système d'évaluation...");
    
    // S'assurer que le gestionnaire d'évaluations existe et est à jour avec les données localStorage
    if (!window.evaluationManager && typeof EvaluationManager !== 'undefined') {
        window.evaluationManager = new EvaluationManager();
        console.log("Gestionnaire d'évaluations créé");
    } else if (window.evaluationManager) {
        // Forcer le rechargement des évaluations depuis localStorage
        window.evaluationManager.evaluations = window.evaluationManager.loadEvaluations();
        console.log("Données du gestionnaire d'évaluations rechargées depuis localStorage");
    }
    
    // Lire les paramètres d'URL
    const urlParams = getUrlParams();
    
    // Si un type d'évaluation est spécifié dans l'URL, l'utiliser
    if (urlParams.type) {
        const evalTypeSelect = document.getElementById('evaluationType');
        if (evalTypeSelect && EVALUATION_WEIGHTS[urlParams.type]) {
            evalTypeSelect.value = urlParams.type;
            
            // Mettre à jour le champ caché
            const currentTypeField = document.getElementById('currentEvalType');
            if (currentTypeField) {
                currentTypeField.value = urlParams.type;
            }
        }
    }
    
    // Charger les informations de l'étudiant depuis localStorage
    loadStudentInfo();
    
    // Attacher les gestionnaires d'événements
    attachEventHandlers();
    
    // Mettre à jour l'interface en fonction du type d'évaluation
    updateEvaluationInterface();
    
    // Charger une évaluation existante si disponible
    const student = JSON.parse(localStorage.getItem('selectedStudent'));
    if (student) {
        const evalType = document.getElementById('evaluationType').value;
        loadExistingEvaluation(student.id, evalType);
    }
}

/**
 * Charger les informations de l'étudiant depuis localStorage
 */
function loadStudentInfo() {
    const studentJson = localStorage.getItem('selectedStudent');
    
    if (studentJson) {
        const student = JSON.parse(studentJson);
        console.log("Étudiant récupéré du localStorage:", student);
        
        // Mettre à jour les champs de l'étudiant
        if (document.getElementById('nom-display')) {
            document.getElementById('nom-display').textContent = student.lastName;
            document.getElementById('nom').value = student.lastName;
        }
        
        if (document.getElementById('prenom-display')) {
            document.getElementById('prenom-display').textContent = student.firstName;
            document.getElementById('prenom').value = student.firstName;
        }
        
        if (document.getElementById('numero-display')) {
            document.getElementById('numero-display').textContent = student.studentNumber;
            document.getElementById('numero').value = student.studentNumber;
        }
        
        if (document.getElementById('sessionYear')) {
            document.getElementById('sessionYear').textContent = student.session;
        }
        
        // Définir la date actuelle
        const currentDate = new Date().toLocaleDateString('fr-FR');
        if (document.getElementById('date-display')) {
            document.getElementById('date-display').textContent = currentDate;
            document.getElementById('date').value = currentDate;
        }
        
        // Configurer le bouton de sauvegarde
        setupSaveButton(student.id);
    } else {
        console.warn("Aucun étudiant trouvé dans localStorage");
        alert("Aucun étudiant sélectionné. Retour à la liste des étudiants.");
        window.location.href = "index.html";
    }
}

/**
 * Attacher tous les gestionnaires d'événements
 */
function attachEventHandlers() {
    // Boutons de niveau
    document.querySelectorAll('.level-box').forEach(box => {
        box.addEventListener('click', handleLevelBoxClick);
    });
    
    // Champ de points bonus
    const bonusInput = document.getElementById('bonus-points');
    if (bonusInput) {
        bonusInput.addEventListener('input', calculateFinalScore);
    }
    
    // Bouton d'impression
    const printBtn = document.getElementById('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
    
    // Changement de type d'évaluation
    const evalTypeSelect = document.getElementById('evaluationType');
    if (evalTypeSelect) {
        evalTypeSelect.addEventListener('change', function() {
            const newType = this.value;
            const student = JSON.parse(localStorage.getItem('selectedStudent'));
            
            if (confirm('Voulez-vous changer le type d\'évaluation? Les modifications non enregistrées seront perdues.')) {
                if (student) {
                    window.location.href = `page_evaluation_e6.html?id=${student.id}&type=${newType}`;
                } else {
                    window.location.reload();
                }
            } else {
                // Rétablir la sélection précédente
                const currentType = document.getElementById('currentEvalType')?.value || 'stage';
                this.value = currentType;
            }
        });
    }
}

function updateEvaluationInterface() {
    // Récupérer le type d'évaluation sélectionné
    const evalType = document.getElementById('evaluationType').value;
    
    // Mettre à jour le champ caché
    const currentTypeField = document.getElementById('currentEvalType');
    if (currentTypeField) {
        currentTypeField.value = evalType;
    }
    
    // Récupérer les poids pour ce type d'évaluation
    const weights = EVALUATION_WEIGHTS[evalType];
    
    // Mettre à jour le titre du document en fonction du type d'évaluation
    let titleText;
    switch (evalType) {
        case 'stage':
            titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - STAGE";
            break;
        case 'revue1':
            titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - R1";
            break;
        case 'revue2':
            titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - R2";
            break;
        case 'revue3':
            titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - R3";
            break;
        case 'soutenance':
            titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - SOUTENANCE";
            break;
    }
    
    // Mettre à jour le titre si un élément est trouvé
    const titleElements = document.querySelectorAll('.form-header-title');
    if (titleElements.length >= 2) {
        titleElements[1].textContent = titleText;
    }
    
    // Mettre à jour les poids affichés pour chaque compétence
    for (const [competence, weight] of Object.entries(weights)) {
        const weightElement = document.getElementById(`${competence}-weight`);
        if (weightElement) {
            weightElement.textContent = `${weight}%`;
        }
        
        // Gérer le cas où le poids est de 0% (non évalué)
        const section = document.getElementById(`${competence}-section`);
        if (section) {
            if (weight === 0) {
                // Si non évalué, ajouter un indicateur visuel
                section.classList.add('not-evaluated');
                
                // Ajouter un message "NON ÉVALUÉ" s'il n'existe pas déjà
                let nonEvalMessage = section.querySelector('.non-eval-message');
                if (!nonEvalMessage) {
                    nonEvalMessage = document.createElement('div');
                    nonEvalMessage.className = 'non-eval-message';
                    nonEvalMessage.textContent = 'NON ÉVALUÉ';
                    section.appendChild(nonEvalMessage);
                }
                
                // Désactiver les cases à cocher
                section.querySelectorAll('.level-box').forEach(box => {
                    box.style.pointerEvents = 'none';
                    box.style.opacity = '0.5';
                });
            } else {
                // Si évalué, rétablir l'affichage normal
                section.classList.remove('not-evaluated');
                
                // Supprimer le message "NON ÉVALUÉ" s'il existe
                const nonEvalMessage = section.querySelector('.non-eval-message');
                if (nonEvalMessage) {
                    nonEvalMessage.remove();
                }
                
                // Réactiver les cases à cocher
                section.querySelectorAll('.level-box').forEach(box => {
                    box.style.pointerEvents = 'auto';
                    box.style.opacity = '1';
                });
            }
        }
    }
    
    // Recalculer les scores
    calculateFinalScore();
}

/**
 * Gestionnaire de clic pour les cases de niveau
 */
function handleLevelBoxClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const competence = this.getAttribute('data-competence');
    const criteria = this.getAttribute('data-criteria');
    const level = this.getAttribute('data-level');
    
    console.log(`Sélection: ${competence} - Critère: ${criteria} - Niveau: ${level}`);
    
    // Désélectionner toutes les cases de ce critère
    document.querySelectorAll(`.level-box[data-competence="${competence}"][data-criteria="${criteria}"]`).forEach(b => {
        b.classList.remove('selected');
    });
    
    // Sélectionner cette case
    this.classList.add('selected');
    
    // Stocker le niveau sélectionné
    if (!selectedLevels[competence]) {
        selectedLevels[competence] = {};
    }
    selectedLevels[competence][criteria] = level;
    
    // Recalculer les scores
    calculateCompetenceScore(competence);
    calculateFinalScore();
    
    return false;
}

/**
 * Calculer le score d'une compétence
 */
function calculateCompetenceScore(competence) {
    let totalScore = 0;
    
    // Liste des cases sélectionnées pour cette compétence
    const selectedBoxes = document.querySelectorAll(`.level-box.selected[data-competence="${competence}"]`);
    
    // Si aucune case n'est sélectionnée, retourner 0
    if (selectedBoxes.length === 0) {
        document.getElementById(`${competence}-score`).textContent = '0.00';
        return 0;
    }
    
    // Parcourir tous les critères sélectionnés de cette compétence
    selectedBoxes.forEach(box => {
        const criteria = box.getAttribute('data-criteria');
        const level = parseInt(box.getAttribute('data-level'));
        
        // Trouver le poids de ce critère
        const criteriaRow = box.closest('.criteria-row');
        const weightText = criteriaRow.querySelector('.criteria-weight').textContent;
        const weight = parseInt(weightText) / 100; // Convertir le pourcentage en décimal
        
        // Convertir le niveau en points selon le barème
        let levelValue;
        switch(level) {
            case 4: // Très satisfaisant
                levelValue = 1.0;
                break;
            case 3: // Satisfaisant
                levelValue = 2/3; // 66.67%
                break;
            case 2: // Partiel
                levelValue = 1/3; // 33.33%
                break;
            case 1: // Non réalisé
            default:
                levelValue = 0;
                break;
        }
        
        // Ajouter au score total en tenant compte du poids
        totalScore += weight * levelValue;
    });
    
    // Multiplier par 4 pour obtenir une note sur 4
    const scoreOn4 = totalScore * 4;
    
    // Mettre à jour l'affichage du score
    document.getElementById(`${competence}-score`).textContent = scoreOn4.toFixed(2);
    
    return scoreOn4;
}

/**
 * Calculer le score final
 */
function calculateFinalScore() {
    const evalType = document.getElementById('evaluationType').value;
    const weights = EVALUATION_WEIGHTS[evalType];
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    for (const [competence, weight] of Object.entries(weights)) {
        if (weight > 0) {
            const score = parseFloat(document.getElementById(`${competence}-score`).textContent) || 0;
            const weightDecimal = weight / 100;
            weightedScore += score * weightDecimal;
            totalWeight += weightDecimal;
        }
    }
    
    // Calculer le score final (sur 20)
    let finalScore = 0;
    if (totalWeight > 0) {
        finalScore = weightedScore * 5; // Convertir de /4 à /20
    }
    
    // Ajouter les points bonus
    const bonusPoints = parseFloat(document.getElementById('bonus-points').value) || 0;
    finalScore += bonusPoints;
    
    // Limiter à 20 points
    finalScore = Math.min(finalScore, 20);
    
    // Mettre à jour l'affichage du score final
    document.getElementById('final-score').textContent = finalScore.toFixed(2);
    
    return finalScore;
}

/**
 * Configurer le bouton d'enregistrement
 */
function setupSaveButton(studentId) {
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn) return;
    
    saveBtn.addEventListener('click', function() {
        console.log("Bouton d'enregistrement cliqué");
        
        try {
            const evaluationType = document.getElementById('evaluationType').value;
            
            // Récupérer les scores des compétences
            const c01Score = parseFloat(document.getElementById('c01-score').textContent) || 0;
            const c03Score = parseFloat(document.getElementById('c03-score').textContent) || 0;
            const c08Score = parseFloat(document.getElementById('c08-score').textContent) || 0;
            const c10Score = parseFloat(document.getElementById('c10-score').textContent) || 0;
            
            // Récupérer la note finale
            const finalScore = parseFloat(document.getElementById('final-score').textContent) || 0;
            
            // Récupérer les points bonus
            const bonusPoints = parseFloat(document.getElementById('bonus-points').value) || 0;
            
            // Récupérer le commentaire
            const comment = document.getElementById('comment').value.trim();
            
            // Vérifier si la note est inférieure à 10 et pas de commentaire
            if (finalScore < 10 && comment === '') {
                alert('Un commentaire est obligatoire pour une note inférieure à 10/20.');
                return;
            }
            
            // Créer l'objet d'évaluation
            const evaluationData = {
                c01: c01Score,
                c03: c03Score,
                c08: c08Score,
                c10: c10Score,
                finalScore: finalScore,
                bonusPoints: bonusPoints,
                comment: comment,
                date: new Date().toISOString(),
                c01_levels: selectedLevels.c01 || {},
                c03_levels: selectedLevels.c03 || {},
                c08_levels: selectedLevels.c08 || {},
                c10_levels: selectedLevels.c10 || {}
            };
            
            // Essayer d'abord de trouver une évaluation existante
            let existingEval = null;
            let evaluationManager = window.evaluationManager;
            
            // Récupérer les évaluations depuis le gestionnaire approprié
            if (evaluationManager) {
                const evaluations = evaluationManager.getStudentEvaluations(studentId);
                existingEval = evaluations.find(eval => eval.type === evaluationType);
            } else {
                // Si le gestionnaire n'est pas disponible, charger depuis localStorage
                const savedEvaluations = localStorage.getItem('evaluations');
                if (savedEvaluations) {
                    const allEvals = JSON.parse(savedEvaluations);
                    const studentEvals = allEvals.filter(eval => eval.studentId === studentId);
                    existingEval = studentEvals.find(eval => eval.type === evaluationType);
                    
                    // Créer un gestionnaire temporaire
                    evaluationManager = new EvaluationManager();
                }
            }
            
            if (existingEval) {
                // Mettre à jour une évaluation existante
                evaluationManager.updateEvaluation(existingEval.id, evaluationData);
                console.log("Évaluation existante mise à jour");
                alert('Évaluation mise à jour avec succès!');
            } else {
                // Créer une nouvelle évaluation
                evaluationManager.addEvaluation(studentId, evaluationType, evaluationData);
                console.log("Nouvelle évaluation créée");
                alert('Évaluation enregistrée avec succès!');
            }
            
            // Rediriger vers la page principale
            window.location.href = "index.html";
            
        } catch (e) {
            console.error("Erreur lors de la sauvegarde:", e);
            
            // Sauvegarde alternative dans localStorage
            const pendingEval = {
                studentId: studentId,
                type: document.getElementById('evaluationType').value,
                data: evaluationData
            };
            
            localStorage.setItem('pendingEvaluation', JSON.stringify(pendingEval));
            console.log("Évaluation sauvegardée dans localStorage");
            alert('Évaluation temporairement sauvegardée. Elle sera enregistrée quand vous reviendrez à la liste des étudiants.');
            
            // Rediriger vers la page principale
            window.location.href = "index.html";
        }
    });
}

/**
 * Charger une évaluation existante
 */
function loadExistingEvaluation(studentId, evaluationType) {
    console.log(`Chargement d'évaluation pour l'étudiant ${studentId} de type ${evaluationType}`);
    
    // Récupérer les évaluations de différentes sources possibles
    let evaluations = [];
    
    // Toujours vérifier le localStorage d'abord pour avoir les données les plus récentes
    const savedEvaluations = localStorage.getItem('evaluations');
    if (savedEvaluations) {
        const allEvaluations = JSON.parse(savedEvaluations);
        evaluations = allEvaluations.filter(eval => eval.studentId === studentId);
    }
    
    // Si aucune évaluation n'est trouvée dans le localStorage, essayer avec le gestionnaire
    if (evaluations.length === 0 && window.evaluationManager) {
        evaluations = window.evaluationManager.getStudentEvaluations(studentId);
    }
    
    // Filtrer pour récupérer l'évaluation du type demandé
    const existingEval = evaluations.find(eval => eval.type === evaluationType);
    
    if (existingEval && existingEval.data) {
        console.log("Évaluation existante trouvée:", existingEval);
        
        // Remplir le commentaire s'il existe
        if (existingEval.data.comment) {
            document.getElementById('comment').value = existingEval.data.comment;
        }
        
        // Remplir les points bonus s'ils existent
        if (existingEval.data.bonusPoints !== undefined) {
            document.getElementById('bonus-points').value = existingEval.data.bonusPoints;
        }
        
        // Restaurer les sélections de niveau
        restoreSelectedLevels(existingEval.data);
        
        return true;
    }
    
    console.log("Aucune évaluation existante trouvée");
    return false;
}

/**
 * Restaurer les niveaux sélectionnés à partir des données d'évaluation
 */
function restoreSelectedLevels(evalData) {
    // Liste des compétences
    const competences = ['c01', 'c03', 'c08', 'c10'];
    
    // Pour chaque compétence
    competences.forEach(comp => {
        // Si nous avons les détails des niveaux précédemment sélectionnés
        if (evalData[`${comp}_levels`]) {
            const levels = evalData[`${comp}_levels`];
            
            for (const criteria in levels) {
                const level = levels[criteria];
                const box = document.querySelector(`.level-box[data-competence="${comp}"][data-criteria="${criteria}"][data-level="${level}"]`);
                
                if (box) {
                    // Désélectionner d'abord toutes les cases de ce critère
                    document.querySelectorAll(`.level-box[data-competence="${comp}"][data-criteria="${criteria}"]`).forEach(b => {
                        b.classList.remove('selected');
                    });
                    
                    // Sélectionner cette case
                    box.classList.add('selected');
                    
                    // Mettre à jour l'objet selectedLevels
                    if (!selectedLevels[comp]) {
                        selectedLevels[comp] = {};
                    }
                    selectedLevels[comp][criteria] = level;
                }
            }
            
            // Recalculer le score pour cette compétence
            calculateCompetenceScore(comp);
        }
    });
    
    // Recalculer le score final
    calculateFinalScore();
}

// Fonction pour corriger le problème de chargement des évaluations
function fixEvaluationLoading() {
    // Récupérer les paramètres d'URL
    const urlParams = getUrlParams();
    const studentId = urlParams.id;
    
    if (studentId) {
        console.log("ID étudiant trouvé dans l'URL:", studentId);
        
        // Récupérer le type d'évaluation
        const evaluationType = document.getElementById('evaluationType').value;
        
        // Récupérer les évaluations directement depuis localStorage
        const savedEvaluations = localStorage.getItem('evaluations');
        if (savedEvaluations) {
            const allEvals = JSON.parse(savedEvaluations);
            const studentEvals = allEvals.filter(eval => eval.studentId === studentId);
            
            console.log("Toutes les évaluations de l'étudiant:", studentEvals);
            
            // Vérifier si l'étudiant a une évaluation du type demandé
            const targetEval = studentEvals.find(eval => eval.type === evaluationType);
            
            if (targetEval) {
                console.log("Évaluation trouvée pour le type", evaluationType);
                
                // Charger l'évaluation
                if (targetEval.data) {
                    // Remplir le commentaire
                    if (targetEval.data.comment) {
                        document.getElementById('comment').value = targetEval.data.comment;
                    }
                    
                    // Remplir les points bonus
                    if (targetEval.data.bonusPoints !== undefined) {
                        document.getElementById('bonus-points').value = targetEval.data.bonusPoints;
                    }
                    
                    // Appliquer les sélections de niveau
                    restoreSelectedLevels(targetEval.data);
                    
                    // Mettre à jour les scores
                    calculateFinalScore();
                }
            } else if (studentEvals.length > 0) {
                // Si l'étudiant a des évaluations mais pas du type demandé,
                // suggérer un lien vers un type d'évaluation existant
                const firstEvalType = studentEvals[0].type;
                console.log("Aucune évaluation pour", evaluationType, "mais trouvé pour", firstEvalType);
                
                // Mettre en évidence le lien vers le type d'évaluation existant
                const link = document.getElementById(`link-${firstEvalType}`);
                if (link) {
                    link.style.backgroundColor = '#e74c3c';
                    link.style.fontWeight = 'bold';
                    link.style.animation = 'pulse 1.5s infinite';
                    
                    // Ajouter une animation de pulsation
                    const style = document.createElement('style');
                    style.textContent = `
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.05); }
                            100% { transform: scale(1); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }
    }
}

// Appeler la fonction après un court délai
setTimeout(fixEvaluationLoading, 500);
function adaptInterfaceChanges() {
    // Vérifier si nous avons retiré le sélecteur et l'avons remplacé par un champ caché
    const evalTypeField = document.getElementById('evaluationType');
    
    // Cette fonction s'assure que toutes les références au sélecteur dans le code
    // fonctionnent maintenant avec le champ caché
    if (evalTypeField && evalTypeField.tagName === 'INPUT') {
        console.log("Adaptation pour l'interface simplifiée (sans liste déroulante)");
        
        // Mettre à jour l'interface selon le type d'évaluation
        const urlParams = getUrlParams();
        if (urlParams.type && EVALUATION_WEIGHTS[urlParams.type]) {
            evalTypeField.value = urlParams.type;
        }
        
        // S'assurer que les fonctions qui utilisent evaluationType.value fonctionnent toujours
        const oldUpdateInterface = window.updateEvaluationInterface;
        window.updateEvaluationInterface = function() {
            // Utiliser la valeur du champ caché
            const evalType = evalTypeField.value;
            
            // Mettre à jour le reste de l'interface comme avant
            const weights = EVALUATION_WEIGHTS[evalType];
            
            // Mettre à jour le titre du document en fonction du type d'évaluation
            let titleText;
            switch (evalType) {
                case 'stage':
                    titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - STAGE";
                    break;
                case 'revue1':
                    titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - R1";
                    break;
                case 'revue2':
                    titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - R2";
                    break;
                case 'revue3':
                    titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - R3";
                    break;
                case 'soutenance':
                    titleText = "Épreuve E6 : Valorisation de la donnée et cybersécurité - SOUTENANCE";
                    break;
            }
            
            // Mettre à jour le titre si un élément est trouvé
            const titleElements = document.querySelectorAll('.form-header-title');
            if (titleElements.length >= 2) {
                titleElements[1].textContent = titleText;
            }
            
            // Mettre à jour les poids affichés pour chaque compétence
            for (const [competence, weight] of Object.entries(weights)) {
                const weightElement = document.getElementById(`${competence}-weight`);
                if (weightElement) {
                    weightElement.textContent = `${weight}%`;
                }
                
                // Gérer le cas où le poids est de 0% (non évalué)
                const section = document.getElementById(`${competence}-section`);
                if (section) {
                    if (weight === 0) {
                        // Si non évalué, ajouter un indicateur visuel
                        section.classList.add('not-evaluated');
                        
                        // Ajouter un message "NON ÉVALUÉ" s'il n'existe pas déjà
                        let nonEvalMessage = section.querySelector('.non-eval-message');
                        if (!nonEvalMessage) {
                            nonEvalMessage = document.createElement('div');
                            nonEvalMessage.className = 'non-eval-message';
                            nonEvalMessage.textContent = 'NON ÉVALUÉ';
                            section.appendChild(nonEvalMessage);
                        }
                        
                        // Désactiver les cases à cocher
                        section.querySelectorAll('.level-box').forEach(box => {
                            box.style.pointerEvents = 'none';
                            box.style.opacity = '0.5';
                        });
                    } else {
                        // Si évalué, rétablir l'affichage normal
                        section.classList.remove('not-evaluated');
                        
                        // Supprimer le message "NON ÉVALUÉ" s'il existe
                        const nonEvalMessage = section.querySelector('.non-eval-message');
                        if (nonEvalMessage) {
                            nonEvalMessage.remove();
                        }
                        
                        // Réactiver les cases à cocher
                        section.querySelectorAll('.level-box').forEach(box => {
                            box.style.pointerEvents = 'auto';
                            box.style.opacity = '1';
                        });
                    }
                }
            }
            
            // Recalculer les scores
            calculateFinalScore();
        };
        
        // De même pour les autres fonctions qui utilisent evaluationType.value
        const oldCalculateFinalScore = window.calculateFinalScore;
        window.calculateFinalScore = function() {
            const evalType = evalTypeField.value;
            const weights = EVALUATION_WEIGHTS[evalType];
            
            let weightedScore = 0;
            let totalWeight = 0;
            
            for (const [competence, weight] of Object.entries(weights)) {
                if (weight > 0) {
                    const score = parseFloat(document.getElementById(`${competence}-score`).textContent) || 0;
                    const weightDecimal = weight / 100;
                    weightedScore += score * weightDecimal;
                    totalWeight += weightDecimal;
                }
            }
            
            // Calculer le score final (sur 20)
            let finalScore = 0;
            if (totalWeight > 0) {
                finalScore = weightedScore * 5; // Convertir de /4 à /20
            }
            
            // Ajouter les points bonus
            const bonusPoints = parseFloat(document.getElementById('bonus-points').value) || 0;
            finalScore += bonusPoints;
            
            // Limiter à 20 points
            finalScore = Math.min(finalScore, 20);
            
            // Mettre à jour l'affichage du score final
            document.getElementById('final-score').textContent = finalScore.toFixed(2);
            
            return finalScore;
        };
        
        // S'assurer que setupSaveButton utilise aussi la nouvelle valeur
        const oldSetupSaveButton = window.setupSaveButton;
        window.setupSaveButton = function(studentId) {
            const saveBtn = document.getElementById('save-btn');
            if (!saveBtn) return;
            
            saveBtn.addEventListener('click', function() {
                console.log("Bouton d'enregistrement cliqué");
                
                try {
                    const evaluationType = evalTypeField.value;
                    
                    // ... reste du code inchangé ...
                } catch (e) {
                    console.error("Erreur lors de la sauvegarde:", e);
                }
            });
        };
    }
}

// Appeler cette fonction après l'initialisation
setTimeout(adaptInterfaceChanges, 300);

// Initialiser le système d'évaluation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initEvaluationSystem);
