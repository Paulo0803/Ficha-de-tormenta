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
    { nome: "Vontade", attr: "sab" }, { nome: "Terapia", attr: "sab" }
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

/* --- FUNÇÕES DE CRIAÇÃO DINÂMICA --- */

function addArmor(nome = "", prot = "", desc = ""){
    const container = document.getElementById('armor');
    const div = document.createElement('div');
    div.classList.add('painel', 'painel-child', 'item-dinamico-armor');
    div.innerHTML = `
        <div class="item-dinamico-grid">
            <label>Nome: <input type="text" class="input-nome" value="${nome}"></label>
            <label>Defesa: <input type="text" class="input-protecao" value="${prot}"></label>
            <div class="input-full">
                <textarea class="input-desc" placeholder="Descrição/Penalidade...">${desc}</textarea>
            </div>
        </div>
        <button onclick="removerCampo(this)" class="btn-add">- Remover</button>
    `;
    container.appendChild(div);
}

function addArma(nome = "", dano = "", desc = ""){
    const container = document.getElementById('arma');
    const div = document.createElement('div');
    div.classList.add('painel', 'painel-child', 'item-dinamico-arma');
    div.innerHTML = `
        <div class="item-dinamico-grid">
            <label>Arma: <input type="text" class="input-nome" value="${nome}"></label>
            <label>Dano: <input type="text" class="input-dano" value="${dano}"></label>
            <div class="input-full">
                <textarea class="input-desc" placeholder="Crítico, Alcance, Tipo...">${desc}</textarea>
            </div>
        </div>
        <button onclick="removerCampo(this)" class="btn-add">- Remover</button>
    `;
    container.appendChild(div);
}

function addHabilidade(n="", ex="", alc="", area="", res="", dur="", desc=""){
    const container = document.getElementById('lista-habilidades');
    const div = document.createElement('div');
    div.classList.add('painel', 'painel-child', 'item-dinamico-hab');
    div.innerHTML = `
        <div class="item-dinamico-grid">
            <label>Nome: <input type="text" class="input-nome" value="${n}"></label>
            <label>Execução: <input type="text" class="input-exec" value="${ex}"></label>
            <label>Alcance: <input type="text" class="input-alc" value="${alc}"></label>
            <label>Área: <input type="text" class="input-area" value="${area}"></label>
            <label>Resistência: <input type="text" class="input-res" value="${res}"></label>
            <label>Duração: <input type="text" class="input-dur" value="${dur}"></label>
            <div class="input-full">
                <textarea class="input-desc" placeholder="Efeito da habilidade...">${desc}</textarea>
            </div>
        </div>
        <button onclick="removerCampo(this)" class="btn-add">- Remover</button>
    `;
    container.appendChild(div);
}

function addInventario(n="", desc="", peso="", qtd=""){
    const container = document.getElementById('lista-inventario');
    const div = document.createElement('div');
    div.classList.add('painel', 'painel-child', 'item-dinamico-inv');
    div.innerHTML = `
        <div class="item-dinamico-grid">
            <label>Item: <input type="text" class="input-nome" value="${n}"></label>
            <label>Qtd: <input type="number" class="input-qtd" value="${qtd}"></label>
            <label>Peso: <input type="text" class="input-peso" value="${peso}"></label>
            <div class="input-full">
                <textarea class="input-desc" placeholder="Detalhes do item...">${desc}</textarea>
            </div>
        </div>
        <button onclick="removerCampo(this)" class="btn-add">- Remover</button>
    `;
    container.appendChild(div);
}

function removerCampo(btn) { btn.parentElement.remove(); }

/* --- SISTEMA DE SALVAMENTO ATUALIZADO --- */

function salvarFicha() {
    const data = {};
    
    // Salva todos os inputs normais (ID: valor)
    document.querySelectorAll('input[id], textarea[id]').forEach(el => {
        if(el.type !== 'file') {
            data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
        }
    });

    // Coletar Armaduras
    data.armaduras = Array.from(document.querySelectorAll('.item-dinamico-armor')).map(el => ({
        nome: el.querySelector('.input-nome').value,
        prot: el.querySelector('.input-protecao').value,
        desc: el.querySelector('.input-desc').value
    }));

    // Coletar Armas
    data.armas = Array.from(document.querySelectorAll('.item-dinamico-arma')).map(el => ({
        nome: el.querySelector('.input-nome').value,
        dano: el.querySelector('.input-dano').value,
        desc: el.querySelector('.input-desc').value
    }));

    // Coletar Habilidades
    data.habilidades = Array.from(document.querySelectorAll('.item-dinamico-hab')).map(el => ({
        nome: el.querySelector('.input-nome').value,
        exec: el.querySelector('.input-exec').value,
        alc: el.querySelector('.input-alc').value,
        area: el.querySelector('.input-area').value,
        res: el.querySelector('.input-res').value,
        dur: el.querySelector('.input-dur').value,
        desc: el.querySelector('.input-desc').value
    }));

    // Coletar Inventário
    data.inventario = Array.from(document.querySelectorAll('.item-dinamico-inv')).map(el => ({
        nome: el.querySelector('.input-nome').value,
        qtd: el.querySelector('.input-qtd').value,
        peso: el.querySelector('.input-peso').value,
        desc: el.querySelector('.input-desc').value
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${data['n-personagem'] || 'Ficha'}_T20.json`;
    a.click();
}

function carregarFicha(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Limpa campos dinâmicos existentes
            document.querySelectorAll('.item-dinamico-armor, .item-dinamico-arma, .item-dinamico-hab, .item-dinamico-inv').forEach(el => el.remove());

            // Preenche campos fixos
            for (let key in data) {
                const el = document.getElementById(key);
                if (el) {
                    if (el.type === 'checkbox') el.checked = data[key];
                    else el.value = data[key];
                }
            }

            // Recria itens dinâmicos
            if(data.armaduras) data.armaduras.forEach(x => addArmor(x.nome, x.prot, x.desc));
            if(data.armas) data.armas.forEach(x => addArma(x.nome, x.dano, x.desc));
            if(data.habilidades) data.habilidades.forEach(x => addHabilidade(x.nome, x.exec, x.alc, x.area, x.res, x.dur, x.desc));
            if(data.inventario) data.inventario.forEach(x => addInventario(x.nome, x.desc, x.peso, x.qtd));

            calcularMods();
            alert("Ficha carregada com sucesso!");
        } catch(err) {
            console.error(err);
            alert("Erro ao carregar o arquivo JSON.");
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