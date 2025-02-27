// Classe pour représenter un étudiant
class Student {
    constructor(lastName, firstName, studentNumber, session) {
        this.id = Date.now().toString(); // ID unique basé sur le timestamp
        this.lastName = lastName;
        this.firstName = firstName;
        this.studentNumber = studentNumber;
        this.session = session;
    }
}

// Classe pour gérer les données des étudiants
class StudentManager {
    constructor() {
        this.students = this.loadStudents();
        // Initialiser le gestionnaire d'évaluations
        this.evaluationManager = new EvaluationManager();
        
        // Vérifier s'il y a une évaluation en attente
        const pendingEvalJson = localStorage.getItem('pendingEvaluation');
        if (pendingEvalJson) {
            try {
                const pendingEval = JSON.parse(pendingEvalJson);
                this.evaluationManager.addEvaluation(
                    pendingEval.studentId,
                    pendingEval.type,
                    pendingEval.data
                );
                localStorage.removeItem('pendingEvaluation');
                console.log("Évaluation en attente traitée avec succès");
            } catch (error) {
                console.error("Erreur dans le traitement de l'évaluation en attente:", error);
            }
        }
        
        this.renderStudentsTable();
    }

    // Charger les étudiants depuis le localStorage
    loadStudents() {
        const savedStudents = localStorage.getItem('students');
        return savedStudents ? JSON.parse(savedStudents) : [];
    }

    // Sauvegarder les étudiants dans le localStorage
    saveStudents() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    // Ajouter un étudiant
    addStudent(lastName, firstName, studentNumber, session) {
        const newStudent = new Student(lastName, firstName, studentNumber, session);
        this.students.push(newStudent);
        this.saveStudents();
        this.renderStudentsTable();
        return newStudent;
    }

    // Supprimer un étudiant
    deleteStudent(studentId) {
        this.students = this.students.filter(student => student.id !== studentId);
        this.saveStudents();
        this.renderStudentsTable();
    }

    // Obtenir un étudiant par son ID
    getStudentById(studentId) {
        return this.students.find(student => student.id === studentId);
    }

    // Afficher le tableau des étudiants
    renderStudentsTable() {
        const tableBody = document.getElementById('studentsTableBody');
        const emptyMessage = document.getElementById('emptyTableMessage');
        
        if (!tableBody) return; // Si on n'est pas sur la page principale
        
        // Vider le tableau
        tableBody.innerHTML = '';
        
        // Afficher ou masquer le message de tableau vide
        if (this.students.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            
            // Remplir le tableau avec les étudiants
            this.students.forEach(student => {
                const row = document.createElement('tr');
                
                // Récupérer le résumé des évaluations de l'étudiant
                const evalSummary = this.evaluationManager.getStudentEvaluationSummary(student.id);
                
                // Ajouter les cellules pour chaque colonne
                row.innerHTML = `
                    <td>${student.lastName}</td>
                    <td>${student.firstName}</td>
                    <td>${evalSummary.E61 !== null ? evalSummary.E61 : '-'}</td>
                    <td>${evalSummary.E62R1 !== null ? evalSummary.E62R1 : '-'}</td>
                    <td>${evalSummary.E62R2 !== null ? evalSummary.E62R2 : '-'}</td>
                    <td>${evalSummary.E62R3 !== null ? evalSummary.E62R3 : '-'}</td>
                    <td>${evalSummary.E62Final !== null ? evalSummary.E62Final : '-'}</td>
                    <td>${evalSummary.moyenne !== null ? evalSummary.moyenne : '-'}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm btn-primary evaluate-btn" data-id="${student.id}">
                            ${this.hasEvaluations(student.id) ? 'Consulter' : 'Évaluer'}
                        </button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${student.id}">Supprimer</button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Ajouter les écouteurs d'événements pour les boutons
            this.addTableButtonListeners();
        }
    }
    
    // Vérifier si un étudiant a déjà des évaluations
    hasEvaluations(studentId) {
        const evaluations = this.evaluationManager.getStudentEvaluations(studentId);
        return evaluations.length > 0;
    }
    
    // Ajouter les écouteurs d'événements pour les boutons du tableau
    addTableButtonListeners() {
        const self = this; // Garder une référence à this pour l'utiliser dans les écouteurs
        
        // Boutons d'évaluation
        document.querySelectorAll('.evaluate-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const studentId = this.getAttribute('data-id');
                // Récupérer les informations de l'étudiant
                const student = self.getStudentById(studentId);
                
                // Sauvegarder l'étudiant sélectionné dans localStorage
                if (student) {
                    localStorage.setItem('selectedStudent', JSON.stringify(student));
                }
                
                // Rediriger vers la page d'évaluation avec l'ID de l'étudiant
                window.location.href = "page_evaluation_e6.html?id=" + studentId;
            });
        });
        
        // Boutons de suppression
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                const studentId = this.getAttribute('data-id');
                const student = self.getStudentById(studentId);
                if (confirm("Êtes-vous sûr de vouloir supprimer l'étudiant " + student.firstName + " " + student.lastName + " ?")) {
                    self.deleteStudent(studentId);
                }
            });
        });
    }
}

// Initialiser le gestionnaire d'étudiants quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    window.studentManager = new StudentManager();

    // Écouteur d'événement pour le formulaire d'ajout d'étudiant
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les valeurs du formulaire
            const lastName = document.getElementById('lastName').value.trim();
            const firstName = document.getElementById('firstName').value.trim();
            const studentNumber = document.getElementById('studentNumber').value.trim();
            const session = document.getElementById('session').value;
            
            // Valider les entrées
            if (!lastName || !firstName || !studentNumber || !session) {
                alert('Veuillez remplir tous les champs du formulaire.');
                return;
            }
            
            // Ajouter l'étudiant
            window.studentManager.addStudent(lastName, firstName, studentNumber, session);
            
            // Réinitialiser le formulaire
            this.reset();
        });
    }
    // Ajouter des écouteurs d'événements pour les boutons d'export/import
const exportBtn = document.getElementById('export-btn');
if (exportBtn) {
    exportBtn.addEventListener('click', exportToJson);
}

// Bouton d'import
const importInput = document.getElementById('import-json');
if (importInput) {
    importInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                importFromJson(e.target.result);
            };
            reader.readAsText(file);
        }
    });
}
});

// Fonction pour exporter les données en JSON
function exportToJson() {
    // Vérifier si le gestionnaire d'étudiants est disponible
    if (!window.studentManager) {
        alert("Erreur: Gestionnaire d'étudiants non disponible.");
        return;
    }
    
    // Préparer les données à exporter
    const data = {
        students: window.studentManager.students,
        evaluations: window.studentManager.evaluationManager.evaluations,
        exportDate: new Date().toISOString(),
        version: "1.0"
    };
    
    // Convertir en JSON
    const jsonData = JSON.stringify(data, null, 2);
    
    // Créer un blob pour le téléchargement
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = `evaluations_${new Date().toISOString().split('T')[0]}.json`;
    
    // Simuler un clic pour déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

// Fonction pour importer des données JSON
function importFromJson(jsonData) {
    try {
        // Analyser les données JSON
        const data = JSON.parse(jsonData);
        
        // Vérifier le format des données
        if (!data.students || !data.evaluations) {
            alert("Format de fichier invalide. Impossible de trouver les données des étudiants ou des évaluations.");
            return false;
        }
        
        // Sauvegarder les étudiants
        localStorage.setItem('students', JSON.stringify(data.students));
        
        // Sauvegarder les évaluations
        localStorage.setItem('evaluations', JSON.stringify(data.evaluations));
        
        // Forcer la réinitialisation du gestionnaire d'évaluations pour qu'il recharge les données
        if (window.evaluationManager) {
            window.evaluationManager.evaluations = window.evaluationManager.loadEvaluations();
        }
        
        // Recharger la page pour appliquer les changements
        alert("Importation réussie! La page va être rechargée.");
        window.location.reload();
        
        return true;
    } catch (error) {
        alert(`Erreur lors de l'importation: ${error.message}`);
        return false;
    }
}