// Script de diagnostic pour debugger le calcul des notes
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter un bouton de diagnostic
    const actions = document.querySelector('.actions');
    if (actions) {
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Diagnostiquer les calculs';
        debugButton.className = 'btn-debug';
        debugButton.style.backgroundColor = '#ff9800';
        debugButton.style.color = 'white';
        
        debugButton.addEventListener('click', function() {
            debugCalculations();
        });
        
        actions.appendChild(debugButton);
    }
    
    // Ajouter un conteneur pour afficher les détails du diagnostic
    const container = document.querySelector('.container');
    if (container) {
        const debugContainer = document.createElement('div');
        debugContainer.id = 'debug-container';
        debugContainer.style.margin = '20px 0';
        debugContainer.style.padding = '15px';
        debugContainer.style.backgroundColor = '#f5f5f5';
        debugContainer.style.border = '1px solid #ddd';
        debugContainer.style.borderRadius = '5px';
        debugContainer.style.display = 'none';
        
        const debugTitle = document.createElement('h3');
        debugTitle.textContent = 'Diagnostic des calculs';
        debugContainer.appendChild(debugTitle);
        
        const debugContent = document.createElement('div');
        debugContent.id = 'debug-content';
        debugContainer.appendChild(debugContent);
        
        container.appendChild(debugContainer);
    }
});

// Fonction pour diagnostiquer les calculs
function debugCalculations() {
    const debugContainer = document.getElementById('debug-container');
    const debugContent = document.getElementById('debug-content');
    
    if (!debugContainer || !debugContent) return;
    
    // Afficher le conteneur de debug
    debugContainer.style.display = 'block';
    
    // Vider le contenu précédent
    debugContent.innerHTML = '';
    
    // Collecter les valeurs pour C02
    const c02Values = collectRadioValues('c02', 4);
    const c06Values = collectRadioValues('c06', 6);
    const c09Values = collectRadioValues('c09', 6);
    const c11Values = collectRadioValues('c11', 5);
    
    // Calculer manuellement les totaux pour chaque compétence
    const c02Total = calculateCompetenceTotal('c02', c02Values);
    const c06Total = calculateCompetenceTotal('c06', c06Values);
    const c09Total = calculateCompetenceTotal('c09', c09Values);
    const c11Total = calculateCompetenceTotal('c11', c11Values);
    
    // Calculer la note finale
    const finalGrade = calculateFinalGradeManually(c02Total, c06Total, c09Total, c11Total);
    
    // Afficher les résultats
    debugContent.innerHTML += `
        <h4>Données collectées</h4>
        <p>C02: ${JSON.stringify(c02Values)}</p>
        <p>C06: ${JSON.stringify(c06Values)}</p>
        <p>C09: ${JSON.stringify(c09Values)}</p>
        <p>C11: ${JSON.stringify(c11Values)}</p>
        
        <h4>Totaux calculés manuellement</h4>
        <p>C02 Total: ${c02Total.toFixed(2)} (Curseur: ${(c02Total * 3/4).toFixed(2)})</p>
        <p>C06 Total: ${c06Total.toFixed(2)} (Curseur: ${(c06Total * 3/4).toFixed(2)})</p>
        <p>C09 Total: ${c09Total.toFixed(2)} (Curseur: ${(c09Total * 3/4).toFixed(2)})</p>
        <p>C11 Total: ${c11Total.toFixed(2)} (Curseur: ${(c11Total * 3/4).toFixed(2)})</p>
        
        <h4>Note finale calculée manuellement</h4>
        <p>Note finale (sans bonus): ${finalGrade.toFixed(2)}</p>
        
        <h4>Valeurs affichées actuellement</h4>
        <p>C02 Total affiché: ${document.getElementById('total-c02').textContent}</p>
        <p>C06 Total affiché: ${document.getElementById('total-c06').textContent}</p>
        <p>C09 Total affiché: ${document.getElementById('total-c09').textContent}</p>
        <p>C11 Total affiché: ${document.getElementById('total-c11').textContent}</p>
        <p>Note finale affichée: ${document.getElementById('final-grade').textContent}</p>
    `;
    
    // Vérification des écouteurs d'événements
    debugContent.innerHTML += `
        <h4>Vérification des écouteurs d'événements</h4>
        <p>Cette section liste les radios trouvés dans le document et indique s'ils ont des écouteurs attachés.</p>
    `;
    
    const radios = document.querySelectorAll('input[type="radio"]');
    debugContent.innerHTML += `<p>Nombre total de radios: ${radios.length}</p>`;
    
    // Vérifier l'état des radios de chaque compétence
    checkRadiosForCompetence('c02', 4, debugContent);
    checkRadiosForCompetence('c06', 6, debugContent);
    checkRadiosForCompetence('c09', 6, debugContent);
    checkRadiosForCompetence('c11', 5, debugContent);
}

// Collecter les valeurs et poids des radios pour une compétence
function collectRadioValues(compId, count) {
    const values = [];
    
    for (let i = 1; i <= count; i++) {
        const radio = document.querySelector(`input[name="${compId}-${i}"]:checked`);
        if (radio) {
            values.push({
                criteriaIndex: i,
                value: parseFloat(radio.value),
                weight: parseFloat(radio.dataset.weight) / 100
            });
        }
    }
    
    return values;
}

// Calculer le total d'une compétence
function calculateCompetenceTotal(compId, values) {
    let total = 0;
    
    values.forEach(item => {
        total += item.value * item.weight;
    });
    
    // Arrondir au 0.05 supérieur
    const rawTotal = (total * 3) / 4;
    return Math.ceil(rawTotal * 20) / 20;
}

// Calculer la note finale manuellement
function calculateFinalGradeManually(c02Total, c06Total, c09Total, c11Total) {
    // Pondérations: C02 (20%), C06 (20%), C09 (30%), C11 (30%)
    const weightedTotal = (
        (c02Total * 0.2) + 
        (c06Total * 0.2) + 
        (c09Total * 0.3) + 
        (c11Total * 0.3)
    );
    
    // Conversion en note sur 20
    return weightedTotal * (20/3);
}

// Vérifier les radios d'une compétence
function checkRadiosForCompetence(compId, count, container) {
    container.innerHTML += `<h5>Radios pour ${compId}:</h5>`;
    let html = '<ul>';
    
    for (let i = 1; i <= count; i++) {
        const radios = document.querySelectorAll(`input[name="${compId}-${i}"]`);
        const checkedRadio = document.querySelector(`input[name="${compId}-${i}"]:checked`);
        
        html += `<li>Critère ${i}: ${radios.length} radios trouvés, `;
        
        if (checkedRadio) {
            html += `valeur sélectionnée: ${checkedRadio.value}, poids: ${checkedRadio.dataset.weight}%`;
        } else {
            html += 'aucune valeur sélectionnée';
        }
        
        html += '</li>';
    }
    
    html += '</ul>';
    container.innerHTML += html;
}