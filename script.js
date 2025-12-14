/* --- BANCO DE DADOS DE PERÍCIAS --- */
const periciasDB = [
    { nome: "Acrobacia", attr: "des" }, { nome: "Adestramento", attr: "car" },
    { nome: "Atletismo", attr: "for" }, { nome: "Atuação", attr: "car" },
    { nome: "Cavalgar", attr: "des" }, { nome: "Conhecimento", attr: "int" },
    { nome: "Cura", attr: "sab" }, { nome: "Diplomacia", attr: "car" },
    { nome: "Enganação", attr: "car" }, { nome: "Fortitude", attr: "con" },
    { nome: "Furtividade", attr: "des" }, { nome: "Guerra", attr: "int" },
    { nome: "Iniciativa", attr: "des" }, { nome: "Intimidação", attr: "car" },
    { nome: "Intuição", attr: "sab" }, { nome: "Investigação", attr: "int" },
    { nome: "Jogatina", attr: "car" }, { nome: "Ladinagem", attr: "des" },
    { nome: "Luta", attr: "for" }, { nome: "Misticismo", attr: "int" },
    { nome: "Nobreza", attr: "int" }, { nome: "Ofício", attr: "int" },
    { nome: "Percepção", attr: "sab" }, { nome: "Pilotagem", attr: "des" },
    { nome: "Pontaria", attr: "des" }, { nome: "Reflexos", attr: "des" },
    { nome: "Religião", attr: "sab" }, { nome: "Sobrevivência", attr: "sab" },
    { nome: "Vontade", attr: "sab" }
];

/* --- INICIALIZAÇÃO --- */
document.addEventListener("DOMContentLoaded", () => {
    gerarPericiasHTML();
    carregarTemaSalvo(); // Verifica se usuário prefere Dark Mode
    
    // Adiciona listeners para cálculo automático em todos os atributos
    const atributos = ['for', 'des', 'con', 'int', 'sab', 'car'];
    atributos.forEach(attr => {
        document.getElementById(`attr-${attr}`).addEventListener('input', calcularMods);
    });
    
    calcularMods(); // Cálculo inicial
});

/* --- TEMA (CLARO/ESCURO) --- */
const btnTema = document.getElementById('btn-tema');
const iconTema = btnTema.querySelector('.material-icons');

btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Salva preferência e atualiza ícone
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('tema', 'dark');
        iconTema.innerText = 'light_mode';
    } else {
        localStorage.setItem('tema', 'light');
        iconTema.innerText = 'dark_mode';
    }
});

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
        iconTema.innerText = 'light_mode';
    }
}

/* --- SISTEMA T20 --- */
function gerarPericiasHTML() {
    const container = document.getElementById('lista-pericias');
    let html = '';
    periciasDB.forEach(p => {
        const idSafe = p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
        html += `
        <div class="pericia-item">
            <input type="checkbox" id="treino-${idSafe}" onchange="atualizarPericia('${idSafe}', '${p.attr}')">
            <span class="pericia-nome">${p.nome} <small>(${p.attr.toUpperCase()})</small></span>
            <span class="pericia-bonus" id="valor-${idSafe}">+0</span>
        </div>`;
    });
    container.innerHTML = html;
}

function calcularMods() {
    const atributos = ['for', 'des', 'con', 'int', 'sab', 'car'];
    atributos.forEach(attr => {
        const input = document.getElementById(`attr-${attr}`);
        const valor = parseInt(input.value) || 10;
        const mod = Math.floor((valor - 10) / 2);
        
        const spanMod = document.getElementById(`mod-${attr}`);
        spanMod.innerText = mod >= 0 ? `+${mod}` : mod;
        
        // Cor dinâmica para o modificador
        spanMod.style.color = mod >= 0 ? 'var(--good-numb)' : 'var(--bad-numb)';
    });
    atualizarTodasPericias();
}

function atualizarTodasPericias() {
    periciasDB.forEach(p => {
        const idSafe = p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
        atualizarPericia(idSafe, p.attr);
    });
}

function atualizarPericia(idPericia, attr) {
    const valorAttr = parseInt(document.getElementById(`attr-${attr}`).value) || 10;
    const mod = Math.floor((valorAttr - 10) / 2);
    const checkbox = document.getElementById(`treino-${idPericia}`);
    const spanValor = document.getElementById(`valor-${idPericia}`);
    const nivel = parseInt(document.getElementById('nivel').value) || 1;
}
    let bonusTreino = 0;
    if(checkbox.checked) {
        if(nivel >= 15) bonusTreino = 6;
        else if(nivel >= 7) bonusTreino = 4;
        else bonusTreino = 2;

    const metadeNivel = Math.floor(nivel / 2);
    const total = mod + bonusTreino + metadeNivel;
    
    spanValor.innerText = total >= 0 ? `+${total}` : total;
    spanValor.style.opacity = checkbox.checked ? '1' : '0.6';
}

/* --- SALVAR E CARREGAR --- */
function salvarFicha() {
    const inputs = document.querySelectorAll('input, textarea');
    const data = {};
    inputs.forEach(el => {
        if(el.type === 'file') return;
        data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${document.getElementById('nome').value || 'Personagem'}_T20.json`;
    a.click();
}

function carregarFicha(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            for (const key in data) {
                const el = document.getElementById(key);
                if (el) {
                    if (el.type === 'checkbox') el.checked = data[key];
                    else el.value = data[key];
                }
            }
            calcularMods();
            alert("Ficha carregada!");
        } catch(err) { alert("Erro ao ler arquivo."); }
    };
    reader.readAsText(file);
}

function limparFicha() {
    if(confirm("Deseja limpar toda a ficha?")) {
        document.querySelectorAll('input').forEach(i => {
            if(i.type !== 'file') {
                if(i.type === 'number') i.value = i.defaultValue || 0;
                else if(i.type === 'checkbox') i.checked = false;
                else i.value = "";
            }
        });
        document.querySelectorAll('textarea').forEach(t => t.value = "");
        calcularMods();
    }
}