// Configuration des compétences
// Configuration des compétences
const competences = {
    'c02': { weight: 20, criteriaCount: 4, criteria: [{ weight: 25 }, { weight: 25 }, { weight: 20 }, { weight: 30 }] },
    'c06': { weight: 20, criteriaCount: 6, criteria: [{ weight: 20 }, { weight: 20 }, { weight: 10 }, { weight: 10 }, { weight: 10 }, { weight: 30 }] },
    'c09': { weight: 30, criteriaCount: 6, criteria: [{ weight: 20 }, { weight: 20 }, { weight: 10 }, { weight: 10 }, { weight: 10 }, { weight: 30 }] },
    'c11': { weight: 30, criteriaCount: 5, criteria: [{ weight: 20 }, { weight: 20 }, { weight: 20 }, { weight: 10 }, { weight: 30 }] }
};

// Classe pour gérer l'évaluation
class EvaluationManager {
    constructor() {
        // Charger d'abord la session actuelle
        this.currentSession = this.loadCurrentSession();
        
        // Ensuite charger les étudiants de cette session
        this.students = this.loadStudents();
        this.currentStudent = null;
        this.currentSemester = null;
        
        // Initialiser les composants et gestionnaires d'événements
        this.setupEventListeners();
        this.loadCurrentStudent();
    }
    exportStudentToJSON() {
        if (!this.currentStudent) {
            alert('Veuillez d\'abord sélectionner un étudiant.');
            return;
        }
        
        // Récupérer l'étudiant complet depuis la base de données
        const students = this.loadStudents();
        const studentFull = students.find(s => s.id === this.currentStudent.id);
        
        if (!studentFull) {
            alert('Étudiant non trouvé dans la base de données.');
            return;
        }
        
        // Récupérer la session (année d'examen)
        const sessionYear = studentFull.sessionYear || new Date().getFullYear().toString();
        
        // Créer un objet contenant toutes les informations de l'étudiant
        const studentData = {
            student: {
                name: studentFull.name,
                firstName: studentFull.firstName,
                studentId: studentFull.studentId,
                sessionYear: sessionYear,
                sessionLabel: `${sessionYear}-${parseInt(sessionYear) + 1}`
            },
            evaluations: []
        };
        
        // Ajouter chaque évaluation existante
        if (studentFull.evaluations && studentFull.evaluations.length > 0) {
            // Trier les évaluations par semestre
            const sortedEvaluations = [...studentFull.evaluations].sort((a, b) => a.semester - b.semester);
            
            sortedEvaluations.forEach(evaluation => {
                studentData.evaluations.push({
                    semester: evaluation.semester,
                    date: evaluation.date,
                    competences: evaluation.competences,
                    bonus: evaluation.bonus,
                    finalGrade: evaluation.finalGrade
                });
            });
        }
        studentData.stats = {
            evaluatedCount: studentData.evaluations.length,
            evaluatedSemesters: studentData.evaluations.map(e => e.semester),
            averageGrade: studentData.evaluations.length > 0 
                ? (studentData.evaluations.reduce((sum, e) => sum + e.finalGrade, 0) / studentData.evaluations.length).toFixed(2)
                : null
        };
        
        // Créer et télécharger le fichier JSON
        const blob = new Blob([JSON.stringify(studentData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `evaluations_${studentFull.name}_${studentFull.firstName}_session-${sessionYear}.json`;
        link.click();
    }
    
    loadCurrentSession() {
        return localStorage.getItem('bts-ciel-current-session') || new Date().getFullYear().toString();
    }
    
    loadStudents() {
        const currentSession = this.loadCurrentSession();
        const storedStudents = localStorage.getItem(`bts-ciel-students-${currentSession}`) || localStorage.getItem('bts-ciel-students');
        return storedStudents ? JSON.parse(storedStudents) : [];
    }

    calculateSemesterCursor(compId, semester) {
        // Si c'est le semestre 1, pas de calcul spécial
        if (semester === 1) return parseFloat(document.getElementById(`curseur-${compId}`).textContent);
        
        // Charger les évaluations de l'étudiant
        const students = this.loadStudents();
        const student = students.find(s => s.id === this.currentStudent.id);
        
        if (!student || !student.evaluations) return 0;

        // Pour le semestre 2, on utilise MAX(curseur_actuel, curseur_sem1/2)
        if (semester === 2) {
            const sem1Eval = student.evaluations.find(e => e.semester === 1);
            if (!sem1Eval) return 0;
            
            const sem1Cursor = sem1Eval.competences[compId].curseur;
            const currentCursor = parseFloat(document.getElementById(`curseur-${compId}`).textContent);
            
            const result = Math.max(currentCursor, sem1Cursor / 2);
            return result;
        }
        
        // Pour le semestre 3, on utilise MAX(curseur_actuel, curseur_sem2*2/3)
        if (semester === 3) {
            const sem2Eval = student.evaluations.find(e => e.semester === 2);
            if (!sem2Eval) return 0;
            
            const sem2Cursor = sem2Eval.competences[compId].curseur;
            const currentCursor = parseFloat(document.getElementById(`curseur-${compId}`).textContent);
            
            const result = Math.max(currentCursor, sem2Cursor * 2/3);
            return result;
        }
        
        // Pour le semestre 4, on utilise MAX(curseur_actuel, curseur_sem3*2/3)
        if (semester === 4) {
            const sem3Eval = student.evaluations.find(e => e.semester === 3);
            if (!sem3Eval) return 0;
            
            const sem3Cursor = sem3Eval.competences[compId].curseur;
            const currentCursor = parseFloat(document.getElementById(`curseur-${compId}`).textContent);
            
            const result = Math.max(currentCursor, sem3Cursor);
            return result;
        }
        
        return parseFloat(document.getElementById(`curseur-${compId}`).textContent);
    }

    initializeStudentSelect() {
        const select = document.getElementById('studentSelect');
        if (!select) return;
        
        // Vider d'abord le select
        select.innerHTML = '<option value="">Choisir un étudiant...</option>';
        
        // Ajouter chaque étudiant
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} ${student.firstName} (${student.studentId})`;
            select.appendChild(option);
        });
    }

    changeStudent() {
        const studentId = document.getElementById('studentSelect').value;
        if (!studentId) {
            // Réinitialiser les informations si aucun étudiant n'est sélectionné
            this.currentStudent = null;
            this.updateStudentInfo();
            return;
        }

        this.currentStudent = this.students.find(s => s.id === studentId);
        this.initializeSemesterSelect();
        this.updateStudentInfo();
        this.loadPreviousEvaluation();
    }

    initializeSemesterSelect() {
        const select = document.getElementById('semesterSelect');
        if (!select) return;
        
        select.innerHTML = '';
        
        // Ajouter les 4 semestres possibles
        for (let i = 1; i <= 4; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `Semestre ${i}`;
            select.appendChild(option);
        }
        
        // Sélectionner le semestre actuel
        if (this.currentSemester) {
            select.value = this.currentSemester.toString();
        } else if (this.currentStudent) {
            // Sélectionner le prochain semestre à évaluer
            const evaluatedSemesters = this.currentStudent.evaluations
                ? this.currentStudent.evaluations.map(e => e.semester)
                : [];
            
            for (let i = 1; i <= 4; i++) {
                if (!evaluatedSemesters.includes(i)) {
                    select.value = i.toString();
                    this.currentSemester = i;
                    break;
                }
            }
        }
    }

    changeSemester() {
        this.currentSemester = parseInt(document.getElementById('semesterSelect').value);
        this.loadPreviousEvaluation();
    }

    updateStudentInfo() {
        if (!this.currentStudent) {
            document.getElementById('studentName').textContent = '';
            document.getElementById('studentFirstName').textContent = '';
            document.getElementById('studentId').textContent = '';
            document.getElementById('evaluationDate').textContent = '';
            return;
        }
    
        document.getElementById('studentName').textContent = this.currentStudent.name;
        document.getElementById('studentFirstName').textContent = this.currentStudent.firstName;
        document.getElementById('studentId').textContent = this.currentStudent.studentId;
        document.getElementById('evaluationDate').textContent = new Date().toLocaleDateString();
    }

    // Ajoutez cette méthode à la classe EvaluationManager dans script.js pour gérer les étudiants qui n'existent pas encore dans localStorage
createOrUpdateStudent(studentData) {
    // S'assurer qu'une session actuelle est définie
    if (!this.currentSession) {
        this.currentSession = new Date().getFullYear().toString();
        localStorage.setItem('bts-ciel-current-session', this.currentSession);
    }
    
    // Charger les étudiants actuels pour cette session
    const students = this.loadStudents();
    
    // Vérifier si l'étudiant existe déjà
    const existingIndex = students.findIndex(s => s.id === studentData.id);
    
    if (existingIndex !== -1) {
        // Mettre à jour l'étudiant existant
        students[existingIndex] = {...studentData};
    } else {
        // Ajouter le nouvel étudiant
        students.push({...studentData});
    }
    
    // Sauvegarder les données mises à jour
    localStorage.setItem(`bts-ciel-students-${this.currentSession}`, JSON.stringify(students));
    
    // Mettre à jour la liste des étudiants en mémoire
    this.students = students;
    
    return true;
}

// Puis modifiez la méthode loadCurrentStudent pour utiliser cette nouvelle méthode
loadCurrentStudent() {
    // Regarder d'abord dans le sessionStorage
    const storedStudent = sessionStorage.getItem('currentStudent');
    console.log("Étudiant stocké dans sessionStorage:", storedStudent);
    
    if (storedStudent) {
        const studentData = JSON.parse(storedStudent);
        console.log("Données de l'étudiant:", studentData);
        
        // S'assurer que l'étudiant existe dans les données actuelles
        const studentExists = this.students.some(s => s.id === studentData.id);
        console.log("Étudiants dans la session actuelle:", this.students);
        console.log("L'étudiant existe dans la session actuelle:", studentExists);
        
        // Si l'étudiant n'existe pas dans la session actuelle
        if (!studentExists) {
            const allSessions = this.getAllSessions();
            console.log("Toutes les sessions disponibles:", allSessions);
            let foundStudent = null;
            
            // Chercher l'étudiant dans toutes les sessions
            for (const session of allSessions) {
                const studentsInSession = this.loadStudentsFromSession(session);
                console.log(`Étudiants dans la session ${session}:`, studentsInSession);
                const student = studentsInSession.find(s => s.id === studentData.id);
                if (student) {
                    foundStudent = student;
                    // Mettre à jour la session courante
                    this.currentSession = session;
                    this.students = studentsInSession;
                    console.log(`Étudiant trouvé dans la session ${session}`);
                    break;
                }
            }
            
            // Si l'étudiant n'existe dans aucune session, l'ajouter à la session actuelle
            if (!foundStudent) {
                console.log("L'étudiant n'a pas été trouvé dans aucune session, ajout à la session actuelle");
                // Créer l'étudiant dans la session actuelle
                this.createOrUpdateStudent(studentData);
                this.currentStudent = studentData;
            } else {
                this.currentStudent = foundStudent;
            }
        } else {
            this.currentStudent = studentData;
        }
        
        this.currentSemester = studentData.selectedSemester;
        
        // Mettre à jour la liste déroulante des étudiants
        this.initializeStudentSelect();
        
        const select = document.getElementById('studentSelect');
        if (select) {
            select.value = this.currentStudent.id;
        }
        
        // Initialiser le sélecteur de semestre
        this.initializeSemesterSelect();
        
        // Mettre à jour les informations de l'étudiant
        this.updateStudentInfo();
        
        // Charger l'évaluation précédente
        this.loadPreviousEvaluation();
    } else {
        // Populer quand même la liste des étudiants
        this.initializeStudentSelect();
    }
}
    
    // Ajouter cette méthode pour charger les étudiants d'une session spécifique
    loadStudentsFromSession(session) {
        const storedStudents = localStorage.getItem(`bts-ciel-students-${session}`);
        return storedStudents ? JSON.parse(storedStudents) : [];
    }
    
    // Ajouter cette méthode pour récupérer toutes les sessions disponibles
    getAllSessions() {
        const sessions = [];
        // Parcourir toutes les clés de localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Vérifier si la clé correspond à une session d'étudiant
            if (key && key.startsWith('bts-ciel-students-')) {
                const session = key.replace('bts-ciel-students-', '');
                sessions.push(session);
            }
        }
        
        // Ajouter aussi l'ancienne clé si elle existe
        if (localStorage.getItem('bts-ciel-students')) {
            sessions.push('default');
        }
        
        return sessions;
    }

    loadPreviousEvaluation() {
        // Réinitialiser d'abord le formulaire
        this.resetForm();

        if (this.currentStudent && this.currentStudent.evaluations) {
            const evaluation = this.currentStudent.evaluations.find(
                e => e.semester === this.currentSemester
            );
            if (evaluation) {
                this.fillEvaluation(evaluation);
            }
        }
    }

    fillEvaluation(evaluation) {
        // Remplir les radios pour chaque compétence
        Object.keys(evaluation.competences).forEach(compId => {
            const comp = evaluation.competences[compId];
            if (comp && comp.criteria) {
                comp.criteria.forEach((value, index) => {
                    if (value !== null) {
                        const radio = document.querySelector(`input[name="${compId}-${index + 1}"][value="${value}"]`);
                        if (radio) radio.checked = true;
                    }
                });
            }
        });

        // Remplir les points bonus
        document.getElementById('bonus').value = evaluation.bonus || 0;

        // Recalculer tous les totaux
        this.calculateAllCompetences();
    }

    calculateAllCompetences() {
        // Calculer chaque compétence individuellement
        this.calculateC02Points();
        this.calculateC06Points();
        this.calculateC09Points();
        this.calculateC11Points();
        
        // Calculer la note finale
        this.calculateFinalGrade();
    }

    

    calculateC02Points() {
        let total = 0;
        for (let i = 1; i <= 4; i++) {
            const radio = document.querySelector(`input[name="c02-${i}"]:checked`);
            if (radio) {
                const weight = parseFloat(radio.dataset.weight) / 100;
                const value = parseFloat(radio.value);
                total += weight * value;
            }
        }
        const rawTotal = (total * 3) / 4;
        const roundedTotal = this.roundTo005Above(rawTotal);
        document.getElementById('total-c02').textContent = roundedTotal.toFixed(2);
        document.getElementById('curseur-c02').textContent = rawTotal.toFixed(2);
        
        // Pour les semestres > 1, utiliser le calcul spécial
        if (this.currentSemester > 1) {
            const specialCursor = this.calculateSemesterCursor('c02', this.currentSemester);
            document.getElementById('curseur-c02').textContent = specialCursor.toFixed(2);
        }
        
        return roundedTotal;
    }

    calculateC06Points() {
        let total = 0;
        for (let i = 1; i <= 6; i++) {
            const radio = document.querySelector(`input[name="c06-${i}"]:checked`);
            if (radio) {
                const weight = parseFloat(radio.dataset.weight) / 100;
                const value = parseFloat(radio.value);
                total += weight * value;
            }
        }
        const rawTotal = (total * 3) / 4;
        const roundedTotal = this.roundTo005Above(rawTotal);
        document.getElementById('total-c06').textContent = roundedTotal.toFixed(2);
        document.getElementById('curseur-c06').textContent = rawTotal.toFixed(2);
        
        // Pour les semestres > 1, utiliser le calcul spécial
        if (this.currentSemester > 1) {
            const specialCursor = this.calculateSemesterCursor('c06', this.currentSemester);
            document.getElementById('curseur-c06').textContent = specialCursor.toFixed(2);
        }
        
        return roundedTotal;
    }

    calculateC09Points() {
        let total = 0;
        for (let i = 1; i <= 6; i++) {
            const radio = document.querySelector(`input[name="c09-${i}"]:checked`);
            if (radio) {
                const weight = parseFloat(radio.dataset.weight) / 100;
                const value = parseFloat(radio.value);
                total += weight * value;
            }
        }
        const rawTotal = (total * 3) / 4;
        const roundedTotal = this.roundTo005Above(rawTotal);
        document.getElementById('total-c09').textContent = roundedTotal.toFixed(2);
        document.getElementById('curseur-c09').textContent = rawTotal.toFixed(2);
        
        // Pour les semestres > 1, utiliser le calcul spécial
        if (this.currentSemester > 1) {
            const specialCursor = this.calculateSemesterCursor('c09', this.currentSemester);
            document.getElementById('curseur-c09').textContent = specialCursor.toFixed(2);
        }
        
        return roundedTotal;
    }

    calculateC11Points() {
        let total = 0;
        for (let i = 1; i <= 5; i++) {
            const radio = document.querySelector(`input[name="c11-${i}"]:checked`);
            if (radio) {
                const weight = parseFloat(radio.dataset.weight) / 100;
                const value = parseFloat(radio.value);
                total += weight * value;
            }
        }
        const rawTotal = (total * 3) / 4;
        const roundedTotal = this.roundTo005Above(rawTotal);
        document.getElementById('total-c11').textContent = roundedTotal.toFixed(2);
        document.getElementById('curseur-c11').textContent = rawTotal.toFixed(2);
        
        // Pour les semestres > 1, utiliser le calcul spécial
        if (this.currentSemester > 1) {
            const specialCursor = this.calculateSemesterCursor('c11', this.currentSemester);
            document.getElementById('curseur-c11').textContent = specialCursor.toFixed(2);
        }
        
        return roundedTotal;
    }

    calculateFinalGrade() {
        // Lire les valeurs des totaux directement depuis les éléments HTML
        const c02Points = parseFloat(document.getElementById('total-c02').textContent) || 0;
        const c06Points = parseFloat(document.getElementById('total-c06').textContent) || 0;
        const c09Points = parseFloat(document.getElementById('total-c09').textContent) || 0;
        const c11Points = parseFloat(document.getElementById('total-c11').textContent) || 0;

        // Calcul avec les pondérations (20%, 20%, 30%, 30%)
        const finalGrade = (
            (c02Points * (20/100)) + 
            (c06Points * (20/100)) + 
            (c09Points * (30/100)) + 
            (c11Points * (30/100))
        ) * (20/3); // Conversion en note sur 20

        // Ajout des points bonus
        const bonus = parseFloat(document.getElementById('bonus').value) || 0;
        const totalWithBonus = finalGrade + bonus;

        // Mise à jour de l'affichage
        document.getElementById('final-grade').textContent = Math.min(20, totalWithBonus).toFixed(2);
        return totalWithBonus;
    }

    saveEvaluation() {
        if (!this.currentStudent) {
            alert('Veuillez d\'abord sélectionner un étudiant.');
            return;
        }
        
        // Recalculer tout avant de sauvegarder
        this.calculateAllCompetences();
        
        // Créer l'objet d'évaluation
        const evaluation = {
            studentId: this.currentStudent.id,
            semester: this.currentSemester,
            date: new Date().toISOString(),
            competences: {
                c02: this.getCompetenceData('c02', 4),
                c06: this.getCompetenceData('c06', 6),
                c09: this.getCompetenceData('c09', 6),
                c11: this.getCompetenceData('c11', 5)
            },
            bonus: parseFloat(document.getElementById('bonus').value) || 0,
            finalGrade: parseFloat(document.getElementById('final-grade').textContent)
        };
    
        // S'assurer que la session actuelle est définie
        if (!this.currentSession) {
            this.currentSession = new Date().getFullYear().toString();
            localStorage.setItem('bts-ciel-current-session', this.currentSession);
        }
        
        // Obtenir la liste actuelle des étudiants
        const students = this.loadStudents();
        
        // Trouver l'étudiant à mettre à jour
        const studentIndex = students.findIndex(s => s.id === this.currentStudent.id);
        
        if (studentIndex !== -1) {
            // Vérifier si l'étudiant a déjà des évaluations
            if (!students[studentIndex].evaluations) {
                students[studentIndex].evaluations = [];
            }
            
            // Vérifier si cette évaluation existe déjà
            const evalIndex = students[studentIndex].evaluations.findIndex(
                e => e.semester === this.currentSemester
            );
            
            // Mettre à jour ou ajouter l'évaluation
            if (evalIndex !== -1) {
                students[studentIndex].evaluations[evalIndex] = evaluation;
            } else {
                students[studentIndex].evaluations.push(evaluation);
            }
            
            // Mettre à jour la liste complète dans le localStorage
            const storageKey = `bts-ciel-students-${this.currentSession}`;
            localStorage.setItem(storageKey, JSON.stringify(students));
            
            // Mettre à jour également l'objet students en mémoire
            this.students = students;
            
            // Mettre à jour l'étudiant courant avec ses évaluations mises à jour
            this.currentStudent = students[studentIndex];
            
            // Mettre à jour le sessionStorage pour assurer la cohérence lors du retour à la page index
            sessionStorage.setItem('currentStudent', JSON.stringify(this.currentStudent));
            
            alert('Évaluation sauvegardée avec succès !');
        } else {
            // L'étudiant n'existe pas encore, l'ajouter
            this.currentStudent.evaluations = [evaluation];
            students.push(this.currentStudent);
            
            // Sauvegarder la liste mise à jour
            localStorage.setItem(`bts-ciel-students-${this.currentSession}`, JSON.stringify(students));
            
            // Mettre à jour le sessionStorage
            sessionStorage.setItem('currentStudent', JSON.stringify(this.currentStudent));
            
            alert('Évaluation sauvegardée avec succès !');
        }
        
        // Forcer un flush du localStorage pour Firefox
        const tempValue = localStorage.getItem(`bts-ciel-students-${this.currentSession}`);
        localStorage.setItem(`bts-ciel-temp-key`, "force-flush");
        localStorage.removeItem(`bts-ciel-temp-key`);

        // À la fin de la méthode saveEvaluation() après le message de succès:
        
// Détecter Firefox
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
if (isFirefox) {
    // Pour Firefox, forcer une redirection avec un paramètre de timestamp pour éviter le cache
    const backLink = document.querySelector('.btn-back');
    if (backLink) {
        backLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'index.html?t=' + new Date().getTime();
        });
    }
}
    }

    getCompetenceData(compId, criteriaCount) {
        return {
            total: parseFloat(document.getElementById(`total-${compId}`).textContent),
            curseur: parseFloat(document.getElementById(`curseur-${compId}`).textContent),
            criteria: Array.from({ length: criteriaCount }, (_, i) => {
                const radio = document.querySelector(`input[name="${compId}-${i + 1}"]:checked`);
                return radio ? parseFloat(radio.value) : null;
            })
        };
    }

    exportToJSON() {
        if (!this.currentStudent) {
            alert('Veuillez d\'abord sélectionner un étudiant.');
            return;
        }
        
        // Recalculer tout avant d'exporter
        this.calculateAllCompetences();
        
        const evaluation = {
            student: {
                name: this.currentStudent.name,
                firstName: this.currentStudent.firstName,
                studentId: this.currentStudent.studentId
            },
            semester: this.currentSemester,
            date: new Date().toISOString(),
            competences: {
                c02: this.getCompetenceData('c02', 4),
                c06: this.getCompetenceData('c06', 6),
                c09: this.getCompetenceData('c09', 6),
                c11: this.getCompetenceData('c11', 5)
            },
            bonus: parseFloat(document.getElementById('bonus').value) || 0,
            finalGrade: parseFloat(document.getElementById('final-grade').textContent)
        };

        const blob = new Blob([JSON.stringify(evaluation, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `evaluation_${this.currentStudent.name}_${this.currentStudent.firstName}_S${this.currentSemester}.json`;
        link.click();
    }

    setupEventListeners() {
        // Écouteurs pour les sélecteurs d'étudiant et de semestre
        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            studentSelect.addEventListener('change', () => this.changeStudent());
        }

        const semesterSelect = document.getElementById('semesterSelect');
        if (semesterSelect) {
            semesterSelect.addEventListener('change', () => this.changeSemester());
        }
        
        // Écouteurs pour tous les radios
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => this.calculateAllCompetences());
        });

        // Écouteur pour les points bonus
        const bonusInput = document.getElementById('bonus');
        if (bonusInput) {
            bonusInput.addEventListener('change', () => this.calculateAllCompetences());
        }

        // Écouteurs pour les boutons
        const saveButton = document.querySelector('.btn-save');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveEvaluation());
        }
        
        const resetButton = document.querySelector('.btn-reset');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Êtes-vous sûr de vouloir réinitialiser le formulaire ?')) {
                    this.resetForm();
                }
            });
        }

        // Ajouter un bouton pour retourner à la liste des étudiants
const actions = document.querySelector('.actions');
if (actions && !document.querySelector('.btn-back')) {
    const backButton = document.createElement('button');
    backButton.textContent = 'Retour à la liste';
    backButton.className = 'btn-back';
    backButton.addEventListener('click', () => {
        // Détecter Firefox
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
            // Pour Firefox, utiliser un formulaire pour forcer le rafraîchissement complet
            const form = document.createElement('form');
            form.method = 'get';
            form.action = 'index.html';
            // Ajouter un paramètre timestamp pour éviter le cache
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 't';
            input.value = new Date().getTime();
            form.appendChild(input);
            document.body.appendChild(form);
            form.submit();
        } else {
            // Pour les autres navigateurs, navigation normale
            window.location.href = 'index.html';
        }
    });
    actions.prepend(backButton);
}
    }


    roundTo005Above(number) {
        // Vérifier si le nombre est déjà un multiple de 0.05
        if (Math.round(number * 20) / 20 === number) {
            return number; // Si c'est déjà un multiple de 0.05, le laisser tel quel
        } else {
            return Math.ceil(number * 20) / 20; // Sinon, arrondir au 0.05 supérieur
        }
    }

    resetForm() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        const bonusInput = document.getElementById('bonus');
        if (bonusInput) {
            bonusInput.value = '0';
        }
        
        // Réinitialiser tous les totaux
        document.getElementById('total-c02').textContent = '0.00';
        document.getElementById('curseur-c02').textContent = '0.00';
        document.getElementById('total-c06').textContent = '0.00';
        document.getElementById('curseur-c06').textContent = '0.00';
        document.getElementById('total-c09').textContent = '0.00';
        document.getElementById('curseur-c09').textContent = '0.00';
        document.getElementById('total-c11').textContent = '0.00';
        document.getElementById('curseur-c11').textContent = '0.00';
        document.getElementById('final-grade').textContent = '0.00';
    }

}

// Fonction pour sauvegarder en JSON (utilisée par le bouton dans le HTML)
function saveToJSON() {
    if (window.evaluationManager) {
        window.evaluationManager.exportStudentToJSON();
    }
}

// Fonction pour réinitialiser le formulaire (utilisée par le bouton dans le HTML)
function resetForm() {
    if (window.evaluationManager) {
        window.evaluationManager.resetForm();
    }
}

// Initialiser le gestionnaire d'évaluation
let evaluationManager;

// Au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initialisation de l'application d'évaluation...");
    
    // Créer l'instance du gestionnaire d'évaluation
    window.evaluationManager = new EvaluationManager();
});

// Fonction temporaire de diagnostic - à appeler dans la console du navigateur
function diagnostiqueStorage() {
    console.log("--- DIAGNOSTIC DU STOCKAGE ---");
    
    // Afficher toutes les clés dans localStorage
    console.log("Clés dans localStorage:");
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`${key} = ${localStorage.getItem(key).substring(0, 50)}...`);
    }
    
    // Afficher la session actuelle
    console.log("Session actuelle:", localStorage.getItem('bts-ciel-current-session'));
    
    // Afficher l'étudiant en cours
    console.log("Étudiant courant:", sessionStorage.getItem('currentStudent'));
    
    return "Diagnostic terminé";
}

// Exécuter le diagnostic au chargement (à retirer après débogage)
document.addEventListener('DOMContentLoaded', () => {
    window.setTimeout(diagnostiqueStorage, 1000);
});