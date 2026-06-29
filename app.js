/* ==========================================================================
   Data Definition - Criteria
   ========================================================================== */
const criteria = [
    // ESTRUTURA
    {
        id: 1,
        category: "estrutura",
        text: "O texto como um todo é claro, objetivo, usa linguagem acadêmica e sequência lógica?",
        maxWeight: 0.25
    },
    {
        id: 2,
        category: "estrutura",
        text: "A ortografia e a gramática são respeitadas, adequadas às normas vigentes?",
        maxWeight: 0.25
    },
    {
        id: 3,
        category: "estrutura",
        text: "As normas técnicas para trabalho acadêmico são respeitadas? A intertextualidade acadêmica (citações curtas e longas) está adequada?",
        maxWeight: 0.25
    },
    // CONTEÚDO
    {
        id: 4,
        category: "conteudo",
        text: "A introdução aborda o assunto e encaminha para a proposta?",
        maxWeight: 0.5
    },
    {
        id: 5,
        category: "conteudo",
        text: "Os objetivos estão claros e coerentes com o problema apresentado? Os objetivos geral e específicos estão diferenciados?",
        maxWeight: 0.5
    },
    {
        id: 6,
        category: "conteudo",
        text: "A justificativa é convincente e o problema está bem delimitado?",
        maxWeight: 0.5
    },
    {
        id: 7,
        category: "conteudo",
        text: "A metodologia (material e métodos) é claramente apresentada e adequada ao problema, com suporte da literatura? Está descrita com clareza e demonstra viabilidade? O nível de detalhamento está adequado?",
        maxWeight: 2.0
    },
    {
        id: 8,
        category: "conteudo",
        text: "Há suficiência de dados relevantes para a conclusão do trabalho? Conclusões e análise de resultados estão consistentes com a pesquisa realizada? Há apontamentos de novos caminhos para a pesquisa e benefícios?",
        maxWeight: 2.0
    },
    {
        id: 9,
        category: "conteudo",
        text: "Os resultados esperados e o cronograma estão adequados ao trabalho? Resultados e conclusão condizentes com o tema pesquisado e com o escopo do curso?",
        maxWeight: 0.5
    },
    // APRESENTAÇÃO
    {
        id: 10,
        category: "apresentacao",
        text: "O(a) candidato(a) demonstrou domínio no assunto?",
        maxWeight: 0.5
    },
    {
        id: 11,
        category: "apresentacao",
        text: "A apresentação é organizada, objetiva e respeita a linguagem acadêmica?",
        maxWeight: 0.5
    },
    // ARGUIÇÃO
    {
        id: 12,
        category: "arguicao",
        text: "O(a) candidato(a) demonstrou segurança e conhecimento ao responder sobre: Questões básicas, conceituais? Conhecimento da literatura?",
        maxWeight: 1.0
    },
    {
        id: 13,
        category: "arguicao",
        text: "Questões metodológicas? Relevância dos resultados que foram obtidos com o trabalho?",
        maxWeight: 1.25
    }
];

/* ==========================================================================
   State Management
   ========================================================================== */
let grades = {}; // Stores grades (0-10) by criterion ID
let evaluatorName = "";
let evaluatorRole = "Membro Avaliador";

// Initialize grades to null (empty)
criteria.forEach(c => {
    grades[c.id] = null;
});

/* ==========================================================================
   DOM Elements
   ========================================================================== */
// Inputs
const inputAluno = document.getElementById('input-aluno');
const inputTitulo = document.getElementById('input-titulo');
const inputOrientador = document.getElementById('input-orientador');
const inputCoorientador = document.getElementById('input-coorientador');
const inputCurso = document.getElementById('input-curso');
const inputCampus = document.getElementById('input-campus');
const inputCidade = document.getElementById('input-cidade');
const inputData = document.getElementById('input-data');
const inputAvaliador = document.getElementById('input-avaliador');
const selectFuncao = document.getElementById('select-funcao');

// Preview Output Targets
const docAluno = document.getElementById('doc-aluno');
const docOrientador = document.getElementById('doc-orientador');
const docCoorientador = document.getElementById('doc-coorientador');
const rowDocCoorientador = document.getElementById('row-doc-coorientador');
const docTitulo = document.getElementById('doc-titulo');
const docTableBody = document.getElementById('doc-table-body');
const docTotalMax = document.getElementById('doc-total-max');
const docTotalActual = document.getElementById('doc-total-actual');
const docDateLocation = document.getElementById('doc-date-location');
const docSignaturesContainer = document.getElementById('doc-signatures-container');
const docCampusHeader = document.getElementById('doc-campus-header');
const docCursoHeader = document.getElementById('doc-curso-header');

// Action Buttons & Controls
const btnPrint = document.getElementById('btn-print');
const btnDownload = document.getElementById('btn-download');
const btnResetGrades = document.getElementById('btn-reset-grades');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const zoomLevelText = document.getElementById('zoom-level-text');

/* ==========================================================================
   Formatters
   ========================================================================== */
// Convert ISO date (YYYY-MM-DD) to Portuguese text
function formatDateToPortuguese(dateStr, city) {
    if (!dateStr) return `${city}, ____ de _________________ de 20__.`;
    
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) return `${city}, ____ de _________________ de 20__.`;
    
    // Parse using local timezone to avoid off-by-one day errors
    const year = parseInt(dateParts[0], 10);
    const monthIndex = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    
    const months = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    return `${city}, ${day} de ${months[monthIndex]} de ${year}.`;
}

// Convert float to PT-BR string format (e.g. 1.25 -> "1,25")
function formatDecimal(val) {
    if (val === null || val === undefined || isNaN(val)) return "";
    return val.toFixed(2).replace('.', ',');
}

/* ==========================================================================
   Render Functions
   ========================================================================== */

// Render criteria editor inputs
function renderCriteriaEditor() {
    const categories = {
        estrutura: document.getElementById('cat-estrutura'),
        conteudo: document.getElementById('cat-conteudo'),
        apresentacao: document.getElementById('cat-apresentacao'),
        arguicao: document.getElementById('cat-arguicao')
    };
    
    // Clear containers
    Object.values(categories).forEach(container => container.innerHTML = '');
    
    criteria.forEach(item => {
        const card = document.createElement('div');
        card.className = 'criterion-card';
        card.dataset.id = item.id;
        
        const currentValue = grades[item.id];
        const gradeStr = currentValue !== null ? currentValue.toFixed(1) : '';
        const convertedScore = currentValue !== null ? (item.maxWeight * (currentValue / 10)) : 0;
        
        card.innerHTML = `
            <div class="criterion-header">
                <span class="criterion-number">${item.id}</span>
                <span class="criterion-desc">${item.text}</span>
                <div class="criterion-badges">
                    <span class="badge-max-weight" title="Peso máximo do item">Peso: ${formatDecimal(item.maxWeight)}</span>
                    <span class="badge-converted-val" id="badge-conv-${item.id}">Nota: ${currentValue !== null ? formatDecimal(convertedScore) : '—'}</span>
                </div>
            </div>
            <div class="grade-controls-row">
                <div class="grade-slider-container">
                    <input type="range" class="grade-slider" id="slider-${item.id}" min="0" max="10" step="0.1" value="${currentValue !== null ? currentValue : 0}">
                </div>
                <div class="grade-input-box">
                    <input type="number" class="grade-input-numeric" id="num-${item.id}" min="0" max="10" step="0.1" placeholder="—" value="${gradeStr}">
                </div>
                <div class="quick-grades">
                    <button type="button" class="btn-quick-grade" data-val="10">10</button>
                    <button type="button" class="btn-quick-grade" data-val="9">9</button>
                    <button type="button" class="btn-quick-grade" data-val="8">8</button>
                    <button type="button" class="btn-quick-grade" data-val="0">0</button>
                </div>
            </div>
        `;
        
        categories[item.category].appendChild(card);
        
        // Add listeners
        const slider = card.querySelector(`#slider-${item.id}`);
        const numInput = card.querySelector(`#num-${item.id}`);
        const quickBtns = card.querySelectorAll('.btn-quick-grade');
        
        const updateValue = (val) => {
            let numVal = parseFloat(val);
            if (isNaN(numVal)) {
                grades[item.id] = null;
                slider.value = 0;
                numInput.value = '';
            } else {
                numVal = Math.max(0, Math.min(10, numVal));
                grades[item.id] = parseFloat(numVal.toFixed(2));
                slider.value = numVal;
                numInput.value = numVal.toFixed(1);
            }
            
            // Recalculate and update display
            updateSingleCriterionDisplay(item.id);
            updateTotalScore();
        };
        
        slider.addEventListener('input', (e) => updateValue(e.target.value));
        numInput.addEventListener('change', (e) => updateValue(e.target.value));
        numInput.addEventListener('input', (e) => {
            // Keep slider in sync during typing if valid
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0 && val <= 10) {
                slider.value = val;
            }
        });
        
        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseFloat(btn.dataset.val);
                updateValue(val);
                
                // Toggle active class for quick buttons
                quickBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    });
}

// Update single criterion display in both editor badge and PDF table row
function updateSingleCriterionDisplay(id) {
    const item = criteria.find(c => c.id === id);
    const val = grades[id];
    
    // Editor badge update
    const badge = document.getElementById(`badge-conv-${id}`);
    const slider = document.getElementById(`slider-${id}`);
    const numInput = document.getElementById(`num-${id}`);
    
    if (val === null) {
        if (badge) badge.innerText = "Nota: —";
        if (slider) slider.value = 0;
        if (numInput) numInput.value = '';
    } else {
        const converted = item.maxWeight * (val / 10);
        if (badge) badge.innerText = `Nota: ${formatDecimal(converted)}`;
    }
    
    // Preview Table Row update
    const tableGradeCell = document.getElementById(`doc-grade-${id}`);
    if (tableGradeCell) {
        if (val === null) {
            tableGradeCell.innerText = '';
        } else {
            const converted = item.maxWeight * (val / 10);
            tableGradeCell.innerText = formatDecimal(converted);
        }
    }
}

// Render the official sheet's criteria table
function renderDocTable() {
    docTableBody.innerHTML = '';
    
    let currentCategory = "";
    
    criteria.forEach(item => {
        // If category changes, insert category divider row
        if (item.category !== currentCategory) {
            currentCategory = item.category;
            const dividerRow = document.createElement('tr');
            dividerRow.innerHTML = `
                <td colspan="3" class="category-row-title">${currentCategory.toUpperCase()}</td>
            `;
            docTableBody.appendChild(dividerRow);
        }
        
        const row = document.createElement('tr');
        const currentValue = grades[item.id];
        const displayGrade = currentValue !== null ? formatDecimal(item.maxWeight * (currentValue / 10)) : '';
        
        row.innerHTML = `
            <td class="col-item">${item.id} – ${item.text}</td>
            <td class="col-max text-center">${formatDecimal(item.maxWeight)}</td>
            <td class="col-grade text-center" id="doc-grade-${item.id}">${displayGrade}</td>
        `;
        docTableBody.appendChild(row);
    });
}

// Calculate total score and update document total rows
function updateTotalScore() {
    let totalMax = 0;
    let totalActual = 0;
    let anyGraded = false;
    
    criteria.forEach(item => {
        totalMax += item.maxWeight;
        const val = grades[item.id];
        if (val !== null) {
            totalActual += item.maxWeight * (val / 10);
            anyGraded = true;
        }
    });
    
    docTotalMax.innerText = formatDecimal(totalMax);
    
    if (anyGraded) {
        docTotalActual.innerText = formatDecimal(totalActual);
    } else {
        docTotalActual.innerText = '0,00';
    }
}

// Render evaluator signature block at bottom of A4 preview page
function renderDocSignatures() {
    docSignaturesContainer.innerHTML = '';
    
    const sigBlock = document.createElement('div');
    sigBlock.className = 'sig-block';
    
    // Fallback if empty
    const nameText = evaluatorName.trim() !== '' ? evaluatorName : 'Nome do Avaliador';
    const roleText = evaluatorRole;
    
    sigBlock.innerHTML = `
        <div class="sig-line"></div>
        <div class="sig-name">${nameText}</div>
        <div class="sig-role">${roleText}</div>
    `;
    
    docSignaturesContainer.appendChild(sigBlock);
}

// Update the entire document preview based on current editor settings
function updateDocPreview() {
    docAluno.innerHTML = inputAluno.value.trim() !== '' ? inputAluno.value : '&nbsp;';
    docOrientador.innerHTML = inputOrientador.value.trim() !== '' ? inputOrientador.value : '&nbsp;';
    
    // TCC Title text
    docTitulo.innerHTML = inputTitulo.value.trim() !== '' ? inputTitulo.value : '&nbsp;';
    
    // Co-advisor handling and label updates (orientador(a) vs orientador(es))
    const orientadorLabel = document.getElementById('doc-orientador-label');
    if (inputCoorientador.value.trim() !== '') {
        docCoorientador.innerText = inputCoorientador.value;
        rowDocCoorientador.style.display = 'flex';
        if (orientadorLabel) orientadorLabel.innerText = "Orientador(es):";
    } else {
        rowDocCoorientador.style.display = 'none';
        if (orientadorLabel) orientadorLabel.innerText = "Orientador(a):";
    }
    
    docCampusHeader.innerText = inputCampus.value;
    docCursoHeader.innerText = `Coordenação do Curso de ${inputCurso.value}`;
    
    // Format date text
    docDateLocation.innerText = formatDateToPortuguese(inputData.value, inputCidade.value);
    
    // Update Evaluator State and Signatures
    evaluatorName = inputAvaliador.value;
    evaluatorRole = selectFuncao.value;
    renderDocSignatures();
}

/* ==========================================================================
   Interaction & Actions
   ========================================================================== */

// Helper to get local date in YYYY-MM-DD format
function getLocalDateStr() {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
}

// Reset form fields and grades
function resetGrades() {
    // Clear inputs
    inputAluno.value = '';
    inputTitulo.value = '';
    inputOrientador.value = '';
    inputCoorientador.value = '';
    inputAvaliador.value = '';
    selectFuncao.value = 'Membro Avaliador';
    inputData.value = getLocalDateStr();
    
    criteria.forEach(c => {
        grades[c.id] = null;
    });
    
    // Re-render editor
    renderCriteriaEditor();
    
    // Reset quick grade buttons active state
    document.querySelectorAll('.btn-quick-grade').forEach(btn => btn.classList.remove('active'));
    
    // Update preview
    criteria.forEach(c => {
        updateSingleCriterionDisplay(c.id);
    });
    updateTotalScore();
    updateDocPreview();
}



// Zoom Management State & Functions
let currentZoom = 1.0;

function applyZoom(zoomVal) {
    currentZoom = Math.max(0.3, Math.min(2.0, zoomVal));
    const docElement = document.getElementById('document-to-print');
    if (docElement) {
        docElement.style.zoom = currentZoom;
        docElement.style.transform = `scale(${currentZoom})`;
    }
    if (zoomLevelText) {
        zoomLevelText.innerText = `${Math.round(currentZoom * 100)}%`;
    }
}

function autoAdjustZoom() {
    const scrollContainer = document.querySelector('.document-scroll-container');
    if (scrollContainer && window.innerWidth <= 1024) {
        const availableWidth = scrollContainer.clientWidth - 30;
        let idealScale = availableWidth / 794; // 794px is standard A4 display width
        idealScale = Math.max(0.35, Math.min(1.0, idealScale));
        applyZoom(idealScale);
    } else {
        applyZoom(1.0);
    }
}

// Generate PDF for download via html2pdf.js
function downloadPDF() {
    const element = document.getElementById('document-to-print');
    
    // Temporarily reset zoom to 1.0 for perfect 1:1 crisp vector/canvas PDF capture
    const savedZoom = element.style.zoom;
    const savedTransform = element.style.transform;
    element.style.zoom = '1.0';
    element.style.transform = 'none';
    
    const rawName = inputAluno.value.trim() !== '' ? inputAluno.value.trim() : 'documento';
    const studentCleanName = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    // Setup option parameters
    const opt = {
        margin:       [0, 0, 0, 0], // Zero margin for custom page size
        filename:     `ficha_tcc_${studentCleanName}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2.5, // High resolution
            useCORS: true, 
            letterRendering: true,
            scrollY: 0,
            scrollX: 0
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        // Restore zoom after capture completes
        element.style.zoom = savedZoom;
        element.style.transform = savedTransform;
    }).catch(() => {
        element.style.zoom = savedZoom;
        element.style.transform = savedTransform;
    });
}

/* ==========================================================================
   Event Bindings
   ========================================================================== */

// Binder for General Info inputs
[inputAluno, inputOrientador, inputCoorientador, inputCurso, inputCampus, inputCidade, inputData, inputAvaliador, selectFuncao].forEach(el => {
    el.addEventListener('input', updateDocPreview);
    el.addEventListener('change', updateDocPreview);
});

// Categories Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.criteria-category-group').forEach(grp => grp.classList.remove('active'));
        
        btn.classList.add('active');
        const targetId = btn.dataset.target;
        document.getElementById(targetId).classList.add('active');
    });
});

// Action buttons
btnResetGrades.addEventListener('click', resetGrades);
btnPrint.addEventListener('click', () => window.print());
btnDownload.addEventListener('click', () => downloadPDF());

if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => applyZoom(currentZoom + 0.1));
}
if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => applyZoom(currentZoom - 0.1));
}

window.addEventListener('resize', autoAdjustZoom);

/* ==========================================================================
   Initialization
   ========================================================================== */
function init() {
    // Default to current date
    inputData.value = getLocalDateStr();
    
    renderCriteriaEditor();
    renderDocTable();
    updateTotalScore();
    updateDocPreview();
    autoAdjustZoom();
}

// Kickstart
document.addEventListener('DOMContentLoaded', init);
window.onload = init;
init();
