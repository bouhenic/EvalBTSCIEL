// Classe pour représenter une évaluation E6
// Classe pour représenter une évaluation E6
class E6Evaluation {
    constructor(studentId, type, data) {
        this.id = Date.now().toString(); // ID unique basé sur le timestamp
        this.studentId = studentId;
        this.type = type; // 'stage', 'revue1', 'revue2', 'revue3', 'soutenance'
        this.date = new Date().toISOString();
        this.data = data; // Données de l'évaluation
    }
}

// Classe pour gérer les évaluations
class EvaluationManager {
    constructor() {
        this.evaluations = this.loadEvaluations();
    }

    // Charger les évaluations depuis le localStorage
    loadEvaluations() {
        const savedEvaluations = localStorage.getItem('evaluations');
        return savedEvaluations ? JSON.parse(savedEvaluations) : [];
    }

    // Sauvegarder les évaluations dans le localStorage
    saveEvaluations() {
        localStorage.setItem('evaluations', JSON.stringify(this.evaluations));
    }

    // Ajouter une évaluation
    addEvaluation(studentId, type, data) {
        const newEvaluation = new E6Evaluation(studentId, type, data);
        this.evaluations.push(newEvaluation);
        this.saveEvaluations();
        return newEvaluation;
    }

    // Obtenir toutes les évaluations d'un étudiant
    getStudentEvaluations(studentId) {
        return this.evaluations.filter(evaluation => evaluation.studentId === studentId);
    }

    // Obtenir une évaluation spécifique
    getEvaluation(evaluationId) {
        return this.evaluations.find(evaluation => evaluation.id === evaluationId);
    }

    // Mettre à jour une évaluation
    updateEvaluation(evaluationId, newData) {
        const index = this.evaluations.findIndex(evaluation => evaluation.id === evaluationId);
        if (index !== -1) {
            this.evaluations[index].data = { ...this.evaluations[index].data, ...newData };
            this.evaluations[index].date = new Date().toISOString(); // Mise à jour de la date
            this.saveEvaluations();
            return true;
        }
        return false;
    }

    // Supprimer une évaluation
    deleteEvaluation(evaluationId) {
        this.evaluations = this.evaluations.filter(evaluation => evaluation.id !== evaluationId);
        this.saveEvaluations();
    }

    // Calculer la moyenne des évaluations d'un étudiant
    calculateStudentAverage(studentId) {
        const studentEvals = this.getStudentEvaluations(studentId);
        
        // Vérifier s'il y a des évaluations
        if (studentEvals.length === 0) return null;
        
        // Extraire les scores
        const scores = {
            stageScore: null,
            finalScore: null
        };
        
        // Chercher l'évaluation de stage (E6.1)
        const stageEval = studentEvals.find(evaluation => evaluation.type === 'stage');
        if (stageEval) {
            scores.stageScore = parseFloat(stageEval.data.finalScore);
        }
        
        // Chercher l'évaluation finale du projet (dernier E6.2)
        const finalEvals = studentEvals.filter(evaluation => ['revue3', 'soutenance'].includes(evaluation.type));
        if (finalEvals.length > 0) {
            // Trier par date décroissante pour prendre la plus récente
            finalEvals.sort((a, b) => new Date(b.date) - new Date(a.date));
            scores.finalScore = parseFloat(finalEvals[0].data.finalScore);
        }
        
        // Calculer la moyenne si les deux scores sont disponibles
        if (scores.stageScore !== null && scores.finalScore !== null) {
            return ((scores.stageScore + scores.finalScore) / 2).toFixed(2);
        }
        
        return null;
    }

    // Obtenir un résumé des évaluations pour un étudiant
    getStudentEvaluationSummary(studentId) {
        const studentEvals = this.getStudentEvaluations(studentId);
        const summary = {
            E61: null,
            E62R1: null,
            E62R2: null,
            E62R3: null,
            E62Final: null,
            moyenne: null
        };
        
        // Remplir le résumé avec les notes disponibles
        studentEvals.forEach(evaluation => {
            const score = parseFloat(evaluation.data.finalScore);
            switch(evaluation.type) {
                case 'stage':
                    summary.E61 = score;
                    break;
                case 'revue1':
                    summary.E62R1 = score;
                    break;
                case 'revue2':
                    summary.E62R2 = score;
                    break;
                case 'revue3':
                    summary.E62R3 = score;
                    break;
                case 'soutenance':
                    summary.E62Final = score;
                    break;
            }
        });
        
        // Calculer la moyenne si possible
        if (summary.E61 !== null && summary.E62Final !== null) {
            summary.moyenne = ((summary.E61 + summary.E62Final) / 2).toFixed(2);
        }
        
        return summary;
    }
    
    // Obtenir toutes les évaluations groupées par étudiant
    getAllEvaluationsGroupedByStudent() {
        const result = {};
        
        this.evaluations.forEach(evaluation => {
            if (!result[evaluation.studentId]) {
                result[evaluation.studentId] = [];
            }
            result[evaluation.studentId].push(evaluation);
        });
        
        // Trier les évaluations de chaque étudiant par date
        for (const studentId in result) {
            result[studentId].sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        return result;
    }
    
    // Exporter toutes les évaluations au format JSON
    exportAllEvaluations() {
        return JSON.stringify(this.evaluations, null, 2);
    }
    
    // Importer des évaluations depuis un fichier JSON
    importEvaluations(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (Array.isArray(data)) {
                // Vérifier que chaque élément a la structure correcte
                const validData = data.filter(item => 
                    item.id && item.studentId && item.type && 
                    item.date && item.data && item.data.finalScore
                );
                
                if (validData.length > 0) {
                    // Ajouter uniquement les nouvelles évaluations (éviter les doublons)
                    const existingIds = this.evaluations.map(evaluation => evaluation.id);
                    const newEvals = validData.filter(evaluation => !existingIds.includes(evaluation.id));
                    
                    this.evaluations = [...this.evaluations, ...newEvals];
                    this.saveEvaluations();
                    return {
                        success: true,
                        added: newEvals.length,
                        total: validData.length
                    };
                }
            }
            return { success: false, error: "Format de données invalide" };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    
    // Supprimer toutes les évaluations d'un étudiant
    deleteAllStudentEvaluations(studentId) {
        const initialCount = this.evaluations.length;
        this.evaluations = this.evaluations.filter(evaluation => evaluation.studentId !== studentId);
        
        if (initialCount !== this.evaluations.length) {
            this.saveEvaluations();
            return true;
        }
        return false;
    }
}

// Exporter la classe pour l'utiliser dans d'autres fichiers
// Dans un environnement de navigateur classique, elle sera disponible globalement
window.EvaluationManager = EvaluationManager;