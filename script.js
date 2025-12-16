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
    carregarTemaSalvo();
    
    // Verifica se estamos na página da ficha (procurando um elemento chave)
    const paginaFicha = document.getElementById('lista-pericias');
    
    if (paginaFicha) {
        gerarPericiasHTML();
        const atributos = ['for', 'des', 'con', 'int', 'sab', 'car'];
        atributos.forEach(attr => {
            const el = document.getElementById(`attr-${attr}`);
            if(el) el.addEventListener('input', calcularMods);
        });
        calcularMods();
    }
});

/* --- TEMA (CLARO/ESCURO) --- */
const btnTema = document.getElementById('btn-tema');
if(btnTema) {
    const iconTema = btnTema.querySelector('.material-icons');
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('tema', 'dark');
            iconTema.innerText = 'light_mode';
        } else {
            localStorage.setItem('tema', 'light');
            iconTema.innerText = 'dark_mode';
        }
    });
}

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
        const iconTema = document.querySelector('#btn-tema .material-icons');
        if(iconTema) iconTema.innerText = 'light_mode';
    }
}

/* --- SISTEMA T20 (Apenas executado se as funções forem chamadas) --- */
function gerarPericiasHTML() {
    const container = document.getElementById('lista-pericias');
    if(!container) return; // Segurança extra

    let html = '';
    periciasDB.forEach(p => {
        const idSafe = p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '');
        html += `
        <div class="pericia-item">
            <input type="checkbox" id="treino-${idSafe}" onchange="atualizarPericia('${idSafe}', '${p.attr}')">
            <span class="pericia-nome">${p.nome} <small>(${p.attr.toUpperCase()})</small></span>
            <input type="number" id="bonus-${idSafe}" class="pericia-bonus-manual" value="0" 
                   oninput="atualizarPericia('${idSafe}', '${p.attr}')" min="0"> 
            <span class="pericia-bonus" id="valor-${idSafe}">+0</span>
        </div>`;
    });
    container.innerHTML = html;
}

function calcularMods() {
    const atributos = ['for', 'des', 'con', 'int', 'sab', 'car'];
    atributos.forEach(attr => {
        const input = document.getElementById(`attr-${attr}`);
        if(!input) return;
        
        const valor = parseInt(input.value) || 10;
        const mod = Math.floor((valor - 10) / 2);
        
        const spanMod = document.getElementById(`mod-${attr}`);
        if(spanMod) {
            spanMod.innerText = mod >= 0 ? `+${mod}` : mod;
            spanMod.style.color = mod >= 0 ? 'var(--good-numb)' : 'var(--bad-numb)';
        }
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
    const elAttr = document.getElementById(`attr-${attr}`);
    if(!elAttr) return;

    const valorAttr = parseInt(elAttr.value) || 10;
    const mod = Math.floor((valorAttr - 10) / 2);
    const checkbox = document.getElementById(`treino-${idPericia}`);
    const spanValor = document.getElementById(`valor-${idPericia}`);
    const inputBonus = document.getElementById(`bonus-${idPericia}`); 
    const nivel = parseInt(document.getElementById('nivel').value) || 1;
    
    let bonusTreino = 0;
    if(checkbox && checkbox.checked) {
        if(nivel >= 15) bonusTreino = 6;
        else if(nivel >= 7) bonusTreino = 4;
        else bonusTreino = 2;
    }

    const bonusManual = inputBonus ? (parseInt(inputBonus.value) || 0) : 0;
    const metadeNivel = Math.floor(nivel / 2);
    const total = mod + bonusTreino + metadeNivel + bonusManual; 
    
    if(spanValor) {
        spanValor.innerText = total >= 0 ? `+${total}` : total;
        spanValor.style.opacity = (checkbox && checkbox.checked) || bonusManual !== 0 ? '1' : '0.6';
    }
}

/* --- FUNÇÕES DO SISTEMA DINÂMICO --- */
let contArmor = 0;
const armorContainer = document.getElementById('armor');

function addArmor(nomeDesc = "", protecaoVal = ""){
    if(!armorContainer) return;
    contArmor++;
    const novoDiv = document.createElement('div');
    novoDiv.classList.add('painel', 'painel-child', 'item-dinamico-armor');
    novoDiv.innerHTML = `
        <label>Armadura/Escudo ${contArmor}: <input type="text" class="input-nome" placeholder="Nome da armadura..."></label>
        <label>Proteção: <input type="text" class="input-protecao" placeholder="+Defesa"></label>
        <button onclick="removerCampo(this)" class="btn-add">-</button>
    `;
    novoDiv.querySelector('.input-nome').value = nomeDesc;
    novoDiv.querySelector('.input-protecao').value = protecaoVal;
    armorContainer.appendChild(novoDiv);
}

let contArma = 0;
const armaContainer = document.getElementById('arma');

function addArma(nomeDesc = "", danoVal = ""){
    if(!armaContainer) return;
    contArma++;
    const novoDiv = document.createElement('div');
    novoDiv.classList.add('painel', 'painel-child', 'item-dinamico-arma');
    novoDiv.innerHTML = `
        <label>Arma ${contArma}: <input type="text" class="input-nome" placeholder="Nome da arma..."></label>
        <label>Dano: <input type="text" class="input-dano" placeholder="Ex: 1d8, 2d6..."></label>
        <button onclick="removerCampo(this)" class="btn-add">-</button>
    `;
    novoDiv.querySelector('.input-nome').value = nomeDesc;
    novoDiv.querySelector('.input-dano').value = danoVal;
    armaContainer.appendChild(novoDiv);
}

function removerCampo(botaoRemover) {
    botaoRemover.parentElement.remove();
}

/* --- SALVAR E CARREGAR --- */
function salvarFicha() {
    const data = {};
    const inputs = document.querySelectorAll('input[id], textarea[id]');
    inputs.forEach(el => {
        if(el.type === 'file') return;
        data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    });

    data.listaArmaduras = [];
    document.querySelectorAll('.item-dinamico-armor').forEach(div => {
        const nome = div.querySelector('.input-nome').value;
        const protecao = div.querySelector('.input-protecao').value;
        data.listaArmaduras.push({ nome, protecao });
    });

    data.listaArmas = [];
    document.querySelectorAll('.item-dinamico-arma').forEach(div => {
        const nome = div.querySelector('.input-nome').value;
        const dano = div.querySelector('.input-dano').value;
        data.listaArmas.push({ nome, dano });
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${document.getElementById('n-personagem').value || 'Personagem'}_T20.json`;
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
                if(key === 'listaArmaduras' || key === 'listaArmas') continue;
                const el = document.getElementById(key);
                if (el) {
                    if (el.type === 'checkbox') el.checked = data[key];
                    else el.value = data[key];
                }
            }
            // Limpa e recarrega dinâmicos
            if(document.querySelector('.item-dinamico-armor')) limparDinamicos('.item-dinamico-armor');
            if(data.listaArmaduras && Array.isArray(data.listaArmaduras)){
                data.listaArmaduras.forEach(item => addArmor(item.nome, item.protecao));
            }
            if(document.querySelector('.item-dinamico-arma')) limparDinamicos('.item-dinamico-arma');
            if(data.listaArmas && Array.isArray(data.listaArmas)){
                data.listaArmas.forEach(item => addArma(item.nome, item.dano));
            }
            calcularMods();
            alert("Ficha carregada com sucesso!");
        } catch(err) { 
            console.error(err);
            alert("Erro ao ler arquivo ou arquivo inválido."); 
        }
    };
    reader.readAsText(file);
    input.value = ''; 
}

function limparDinamicos(selector) {
    document.querySelectorAll(selector).forEach(el => el.remove());
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
        limparDinamicos('.item-dinamico-armor');
        limparDinamicos('.item-dinamico-arma');
        contArmor = 0; contArma = 0;
        calcularMods();
    }
}