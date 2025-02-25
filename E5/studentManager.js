class StudentManager {
    constructor() {
        this.students = this.loadStudents();
        this.currentSession = this.loadCurrentSession();
        this.initSessionSelector();
        this.setupEventListeners();
        this.updateStudentList();
    }

    loadStudents() {
        const storedStudents = localStorage.getItem(`bts-ciel-students-${this.getCurrentSession()}`) || localStorage.getItem('bts-ciel-students');
        return storedStudents ? JSON.parse(storedStudents) : [];
    }

    saveStudents() {
        localStorage.setItem(`bts-ciel-students-${this.getCurrentSession()}`, JSON.stringify(this.students));
    }

    loadCurrentSession() {
        const savedSession = localStorage.getItem('bts-ciel-current-session');
        if (savedSession) {
            return savedSession;
        }
        
        // Par défaut, utiliser l'année en cours
        const currentYear = new Date().getFullYear();
        this.saveCurrentSession(currentYear.toString());
        return currentYear.toString();
    }

    saveCurrentSession(session) {
        localStorage.setItem('bts-ciel-current-session', session);
        this.currentSession = session;
    }

    getCurrentSession() {
        return this.currentSession || new Date().getFullYear().toString();
    }

    initSessionSelector() {
        const sessionSelect = document.getElementById('sessionYear');
        if (!sessionSelect) return;
        
        // Vider le sélecteur
        sessionSelect.innerHTML = '';
        
        // Obtenir l'année courante
        const currentYear = new Date().getFullYear();
        
        // Ajouter les options pour les 5 dernières années et les 2 prochaines
        for (let year = currentYear - 5; year <= currentYear + 2; year++) {
            const option = document.createElement('option');
            option.value = year.toString();
            option.textContent = `${year}-${year + 1}`;
            sessionSelect.appendChild(option);
        }
        
        // Sélectionner la session courante
        sessionSelect.value = this.getCurrentSession();
    }

    changeSession(newSession) {
        if (newSession !== this.getCurrentSession()) {
            this.saveCurrentSession(newSession);
            this.students = this.loadStudents();
            this.updateStudentList();
        }
    }

    setupEventListeners() {
        const form = document.getElementById('addStudentForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleAddStudent(e));
        }
        
        // Écouteur pour le changement de session
        const sessionSelect = document.getElementById('sessionYear');
        if (sessionSelect) {
            sessionSelect.addEventListener('change', (e) => this.changeSession(e.target.value));
        }
        
        // Écouteur pour l'importation de fichier
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.handleFileImport(e));
        }
    }

    handleAddStudent(e) {
        e.preventDefault();
        
        const newStudent = {
            id: Date.now().toString(),
            name: document.getElementById('studentName').value,
            firstName: document.getElementById('studentFirstName').value,
            studentId: document.getElementById('studentId').value,
            evaluations: [], // Pour stocker les évaluations par semestre
            sessionYear: this.getCurrentSession() // Ajouter l'année de session
        };
    
        this.students.push(newStudent);
        // IMPORTANT: Assurez-vous d'utiliser la clé de session pour sauvegarder
        localStorage.setItem(`bts-ciel-students-${this.getCurrentSession()}`, JSON.stringify(this.students));
        this.updateStudentList();
        e.target.reset();
    }

    getEvaluatedSemesters(student) {
        return student.evaluations
            ? student.evaluations.map(e => e.semester).sort((a, b) => a - b)
            : [];
    }

    getLastSemesterGrade(student) {
        if (!student.evaluations || student.evaluations.length === 0) {
            return "N/A";
        }
        
        // Trouver le semestre le plus récent
        const latestSemester = Math.max(...student.evaluations.map(e => e.semester));
        const latestEvaluation = student.evaluations.find(e => e.semester === latestSemester);
        
        if (latestEvaluation && latestEvaluation.finalGrade !== undefined) {
            return latestEvaluation.finalGrade.toFixed(2) + "/20";
        }
        
        return "N/A";
    }

    getNextSemesterToEvaluate(student) {
        const evaluatedSemesters = this.getEvaluatedSemesters(student);
        for (let i = 1; i <= 4; i++) {
            if (!evaluatedSemesters.includes(i)) {
                return i;
            }
        }
        // Si tous les semestres sont évalués, retourner le dernier semestre
        return 4;
    }

    deleteStudent(studentId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
            this.students = this.students.filter(s => s.id !== studentId);
            this.saveStudents();
            this.updateStudentList();
        }
    }

    // Méthode pour accéder directement à un semestre spécifique
    viewSemester(studentId, semester) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            sessionStorage.setItem('currentStudent', JSON.stringify({
                ...student,
                selectedSemester: semester
            }));
            window.location.href = 'evaluation.html';
        }
    }

    // Méthode pour gérer l'évaluation ou la consultation
    evaluateStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            const evaluatedSemesters = this.getEvaluatedSemesters(student);
            const allSemestersCompleted = evaluatedSemesters.length === 4;
            
            if (allSemestersCompleted) {
                // Si tous les semestres sont complétés, afficher un menu de sélection
                this.showSemesterSelectionMenu(student);
            } else {
                // Sinon, diriger vers le prochain semestre à évaluer
                const nextSemester = this.getNextSemesterToEvaluate(student);
                sessionStorage.setItem('currentStudent', JSON.stringify({
                    ...student,
                    selectedSemester: nextSemester
                }));
                window.location.href = 'evaluation.html';
            }
        }
    }

    // Méthode pour afficher un menu de sélection de semestre
    showSemesterSelectionMenu(student) {
        // Créer un élément de fond pour le modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.zIndex = '1000';
        
        // Créer le contenu du modal
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '5px';
        modalContent.style.width = '400px';
        modalContent.style.maxWidth = '90%';
        
        // Titre du modal
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = `Sélectionner un semestre pour ${student.firstName} ${student.name}`;
        modalContent.appendChild(modalTitle);
        
        // Liste des semestres
        const semesterList = document.createElement('div');
        semesterList.style.display = 'flex';
        semesterList.style.flexDirection = 'column';
        semesterList.style.gap = '10px';
        semesterList.style.margin = '15px 0';
        
        // Ajouter un bouton pour chaque semestre
        for (let i = 1; i <= 4; i++) {
            const semesterButton = document.createElement('button');
            semesterButton.textContent = `Semestre ${i}`;
            semesterButton.className = 'btn-primary';
            semesterButton.style.padding = '10px';
            semesterButton.style.cursor = 'pointer';
            
            // Vérifier si le semestre a été évalué
            const evaluated = student.evaluations && student.evaluations.some(e => e.semester === i);
            if (evaluated) {
                const evalGrade = student.evaluations.find(e => e.semester === i).finalGrade.toFixed(2);
                semesterButton.textContent += ` (Note: ${evalGrade}/20)`;
            } else {
                semesterButton.textContent += ' (Non évalué)';
            }
            
            // Ajouter l'événement pour accéder au semestre
            semesterButton.addEventListener('click', () => {
                this.viewSemester(student.id, i);
                document.body.removeChild(modalOverlay);
            });
            
            semesterList.appendChild(semesterButton);
        }
        
        modalContent.appendChild(semesterList);
        
        // Bouton pour fermer le modal
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Annuler';
        closeButton.className = 'btn-reset';
        closeButton.style.padding = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modalOverlay);
        });
        
        modalContent.appendChild(closeButton);
        modalOverlay.appendChild(modalContent);
        
        // Ajouter le modal au body
        document.body.appendChild(modalOverlay);
    }

    // Méthode pour gérer l'importation de fichier JSON
    handleFileImport(event) {
        if (!localStorage.getItem('bts-ciel-current-session')) {
            localStorage.setItem('bts-ciel-current-session', new Date().getFullYear().toString());
        }
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Vérifier si c'est un fichier d'exportation complète ou juste un étudiant
                if (data.students && Array.isArray(data.students)) {
                    this.importAllStudents(data);
                } else if (data.student && data.evaluations) {
                    this.importSingleStudent(data);
                } else {
                    throw new Error("Format de fichier non reconnu");
                }
            } catch (error) {
                alert(`Erreur lors de l'importation: ${error.message}`);
                console.error(error);
            }
            
            // Réinitialiser l'input file pour permettre la sélection du même fichier
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }

    // Méthode pour importer toutes les données étudiants
    importAllStudents(data) {
        if (!data.students || !Array.isArray(data.students)) {
            alert("Format de fichier invalide");
            return;
        }
        
        if (!confirm(`Êtes-vous sûr de vouloir importer ${data.students.length} étudiants ? Cela remplacera les données actuelles pour la session ${this.getCurrentSession()}.`)) {
            return;
        }
        
        // Mettre à jour les étudiants avec la session courante
        this.students = data.students.map(student => ({
            ...student,
            sessionYear: this.getCurrentSession()
        }));
        
        this.saveStudents();
        this.updateStudentList();
        
        alert(`${data.students.length} étudiants importés avec succès.`);
    }

    // Méthode pour importer un seul étudiant
    importSingleStudent(data) {
        if (!data.student || !data.evaluations) {
            alert("Format de fichier d'étudiant invalide");
            return;
        }
        
        // Vérifier si l'étudiant existe déjà
        const existingStudent = this.students.find(
            s => s.studentId === data.student.studentId
        );
        
        if (existingStudent) {
            if (!confirm(`L'étudiant ${data.student.firstName} ${data.student.name} existe déjà. Voulez-vous écraser ses données ?`)) {
                return;
            }
            
            // Mettre à jour l'étudiant existant
            existingStudent.evaluations = data.evaluations;
            existingStudent.sessionYear = this.getCurrentSession();
        } else {
            // Créer un nouvel étudiant
            this.students.push({
                id: Date.now().toString(),
                name: data.student.name,
                firstName: data.student.firstName,
                studentId: data.student.studentId,
                evaluations: data.evaluations,
                sessionYear: this.getCurrentSession()
            });
        }
        
        this.saveStudents();
        this.updateStudentList();
        
        alert(`Étudiant ${data.student.firstName} ${data.student.name} importé avec succès.`);
    }

    updateStudentList() {
        // Recharger d'abord les étudiants depuis le localStorage
        this.students = this.loadStudents();
        
        const tbody = document.getElementById('studentsList');
        if (!tbody) return;
        
        tbody.innerHTML = '';
    
        this.students.forEach(student => {
            const evaluatedSemesters = this.getEvaluatedSemesters(student);
            const lastGrade = this.getLastSemesterGrade(student);
            const allSemestersCompleted = evaluatedSemesters.length === 4;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.name}</td>
                <td>${student.firstName}</td>
                <td>${student.studentId}</td>
                <td>${evaluatedSemesters.length > 0 ? evaluatedSemesters.join(', ') : 'Aucun'}</td>
                <td>${lastGrade}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="studentManager.evaluateStudent('${student.id}')" class="${allSemestersCompleted ? 'btn-view' : 'btn-evaluate'}">
                            ${allSemestersCompleted ? 'Consulter' : 'Évaluer'}
                        </button>
                        <button onclick="studentManager.deleteStudent('${student.id}')" class="btn-delete">
                            Supprimer
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Fonction pour exporter toutes les données des étudiants
function exportAllStudents() {
    // Récupérer toutes les données des étudiants pour la session courante
    const studentManager = window.studentManager;
    if (!studentManager) {
        alert('Erreur: Gestionnaire d\'étudiants non disponible.');
        return;
    }

    const students = studentManager.students;
    const sessionYear = studentManager.getCurrentSession();
    
    if (students.length === 0) {
        alert('Aucune donnée à exporter pour cette session.');
        return;
    }
    
    // Créer un objet contenant toutes les données
    const exportData = {
        exportDate: new Date().toISOString(),
        sessionYear: sessionYear,
        sessionLabel: `${sessionYear}-${parseInt(sessionYear) + 1}`,
        totalStudents: students.length,
        students: students.map(student => {
            // Calculer des statistiques pour chaque étudiant
            const evaluatedSemesters = student.evaluations ? student.evaluations.length : 0;
            const latestEvaluation = student.evaluations && student.evaluations.length > 0 
                ? student.evaluations.sort((a, b) => b.semester - a.semester)[0] 
                : null;
            
            return {
                id: student.id,
                name: student.name,
                firstName: student.firstName,
                studentId: student.studentId,
                sessionYear: student.sessionYear || sessionYear,
                stats: {
                    evaluatedSemesters,
                    latestSemester: latestEvaluation ? latestEvaluation.semester : null,
                    latestGrade: latestEvaluation ? latestEvaluation.finalGrade : null,
                    evaluationDates: student.evaluations ? student.evaluations.map(e => e.date) : []
                },
                evaluations: student.evaluations || []
            };
        })
    };
    
    // Créer et télécharger le fichier JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // Générer un nom de fichier avec la date et la session
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    link.download = `bts-ciel-evaluations_session-${sessionYear}_${dateStr}.json`;
    
    link.click();
}

// Initialiser le gestionnaire d'étudiants comme variable globale
window.studentManager = new StudentManager();