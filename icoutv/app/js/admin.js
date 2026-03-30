// ==============================================
// Painel Admin - icouTv Portal V1.1
// ==============================================

import { auth, db, firebaseConfig, ADMIN_EMAIL, CLOUDINARY_CONFIG } from './firebase-config.js';
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
    onAuthStateChanged,
    signOut,
    getAuth,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ---------- Elementos do DOM ----------
const carregando = document.getElementById('carregando');
const acessoNegado = document.getElementById('acesso-negado');
const adminApp = document.getElementById('admin-app');
const adminEmail = document.getElementById('admin-email');
const btnLogout = document.getElementById('btn-logout');
const toastContainer = document.getElementById('toast-container');

// Form Fatura
const formFatura = document.getElementById('form-fatura');
const clienteEmailInput = document.getElementById('cliente-email');
const btnBuscarCliente = document.getElementById('btn-buscar-cliente');
const clienteInfo = document.getElementById('cliente-info');
const clienteNomeEncontrado = document.getElementById('cliente-nome-encontrado');
const clienteUid = document.getElementById('cliente-uid');
const clienteNaoEncontrado = document.getElementById('cliente-nao-encontrado');
const mesRefInput = document.getElementById('mes-ref');
const uploadArea = document.getElementById('upload-area');
const inputPdf = document.getElementById('input-pdf');
const nomeArquivo = document.getElementById('nome-arquivo');
const urlPdfManual = document.getElementById('url-pdf-manual');
const codigoPIXInput = document.getElementById('codigo-pix-input');
const statusPagamento = document.getElementById('status-pagamento');
const dataVencimentoInput = document.getElementById('data-vencimento');
const btnSalvarFatura = document.getElementById('btn-salvar-fatura');
const btnSalvarTexto = document.getElementById('btn-salvar-texto');
const btnSalvarSpinner = document.getElementById('btn-salvar-spinner');

// Form Cliente
const formCliente = document.getElementById('form-cliente');
const novoNome = document.getElementById('novo-nome');
const novoEmail = document.getElementById('novo-email');
const novoStatus = document.getElementById('novo-status');
const novoUsuario = document.getElementById('novo-usuario');
const novoSenhaServico = document.getElementById('novo-senha-servico');
const novoDataVencimento = document.getElementById('novo-data-vencimento');
const novoHoraValidade = document.getElementById('novo-hora-validade');
const novoDiasRestantes = document.getElementById('novo-dias-restantes');
const novoSituacao = document.getElementById('novo-situacao');
const novoTelefone = document.getElementById('novo-telefone');
const novoPacote = document.getElementById('novo-pacote');
const novoObservacao = document.getElementById('novo-observacao');
const btnCadastrarCliente = document.getElementById('btn-cadastrar-cliente');
const btnCadastrarTexto = document.getElementById('btn-cadastrar-texto');
const btnCadastrarSpinner = document.getElementById('btn-cadastrar-spinner');

// Tabelas
const tabelaClientes = document.getElementById('tabela-clientes');
const tabelaClientesBody = document.getElementById('tabela-clientes-body');
const listaClientesVazia = document.getElementById('lista-clientes-vazia');
const tabelaFaturas = document.getElementById('tabela-faturas');
const tabelaFaturasBody = document.getElementById('tabela-faturas-body');
const listaFaturasVazia = document.getElementById('lista-faturas-vazia');

// Mensagens Personalizadas
const msgDestino = document.getElementById('msg-destino');
const msgTexto = document.getElementById('msg-texto');
const btnSalvarMensagens = document.getElementById('btn-salvar-mensagens');
const btnSalvarMsgTexto = document.getElementById('btn-salvar-msg-texto');
const btnSalvarMsgSpinner = document.getElementById('btn-salvar-msg-spinner');
const listaMensagensEl = document.getElementById('lista-mensagens');
const msgClientesAlvoGrupo = document.getElementById('msg-clientes-alvo-grupo');
const msgClientesAlvo = document.getElementById('msg-clientes-alvo');

// Formatação de Mensagens (criação)
const msgTitulo = document.getElementById('msg-titulo');
const msgCorTexto = document.getElementById('msg-cor-texto');
const msgCorFundo = document.getElementById('msg-cor-fundo');
const msgFonte = document.getElementById('msg-fonte');
const msgNegritoBotao = document.getElementById('msg-negrito');
const msgItalicoBotao = document.getElementById('msg-italico');

// Modal Editar Mensagem
const modalEditarMensagem = document.getElementById('modal-editar-mensagem');
const editarMsgId = document.getElementById('editar-msg-id');
const editarMsgDestino = document.getElementById('editar-msg-destino');
const editarMsgTitulo = document.getElementById('editar-msg-titulo');
const editarMsgTexto = document.getElementById('editar-msg-texto');
const editarMsgCorTexto = document.getElementById('editar-msg-cor-texto');
const editarMsgCorFundo = document.getElementById('editar-msg-cor-fundo');
const editarMsgFonte = document.getElementById('editar-msg-fonte');
const editarMsgNegritoBotao = document.getElementById('editar-msg-negrito');
const editarMsgItalicoBotao = document.getElementById('editar-msg-italico');
const btnFecharModalMensagem = document.getElementById('btn-fechar-modal-mensagem');
const btnSalvarEdicaoMensagem = document.getElementById('btn-salvar-edicao-mensagem');
const btnSalvarEdicaoMsgTexto = document.getElementById('btn-salvar-edicao-msg-texto');
const btnSalvarEdicaoMsgSpinner = document.getElementById('btn-salvar-edicao-msg-spinner');
const editarMsgClientesAlvoGrupo = document.getElementById('editar-msg-clientes-alvo-grupo');
const editarMsgClientesAlvo = document.getElementById('editar-msg-clientes-alvo');

// Modal Editar Cliente
const modalEditarCliente = document.getElementById('modal-editar-cliente');
const editarClienteId = document.getElementById('editar-cliente-id');
const editarClienteUid = document.getElementById('editar-cliente-uid');
const editarClienteNome = document.getElementById('editar-cliente-nome');
const editarClienteEmail = document.getElementById('editar-cliente-email');
const editarClienteStatus = document.getElementById('editar-cliente-status');
const editarClienteUsuario = document.getElementById('editar-cliente-usuario');
const editarClienteSenhaServico = document.getElementById('editar-cliente-senha-servico');
const editarClienteDataVencimento = document.getElementById('editar-cliente-data-vencimento');
const editarClienteHoraValidade = document.getElementById('editar-cliente-hora-validade');
const editarClienteDiasRestantes = document.getElementById('editar-cliente-dias-restantes');
const editarClienteSituacao = document.getElementById('editar-cliente-situacao');
const editarClienteTelefone = document.getElementById('editar-cliente-telefone');
const editarClientePacote = document.getElementById('editar-cliente-pacote');
const editarClienteObservacao = document.getElementById('editar-cliente-observacao');
const btnFecharModalCliente = document.getElementById('btn-fechar-modal-cliente');
const btnSalvarEdicaoCliente = document.getElementById('btn-salvar-edicao-cliente');
const btnSalvarEdicaoClienteTexto = document.getElementById('btn-salvar-edicao-cliente-texto');
const btnSalvarEdicaoClienteSpinner = document.getElementById('btn-salvar-edicao-cliente-spinner');

// Form Cliente - Campos CPF + Endereço
const novoCpf = document.getElementById('novo-cpf');
const novoCep = document.getElementById('novo-cep');
const novoEndereco = document.getElementById('novo-endereco');
const novoNumero = document.getElementById('novo-numero');
const novoComplemento = document.getElementById('novo-complemento');
const novoBairro = document.getElementById('novo-bairro');
const novoCidade = document.getElementById('novo-cidade');
const novoEstado = document.getElementById('novo-estado');

// Modal Editar Cliente - Campos CPF + Endereço
const editarClienteCpf = document.getElementById('editar-cliente-cpf');
const editarClienteCep = document.getElementById('editar-cliente-cep');
const editarClienteEndereco = document.getElementById('editar-cliente-endereco');
const editarClienteNumero = document.getElementById('editar-cliente-numero');
const editarClienteComplemento = document.getElementById('editar-cliente-complemento');
const editarClienteBairro = document.getElementById('editar-cliente-bairro');
const editarClienteCidade = document.getElementById('editar-cliente-cidade');
const editarClienteEstado = document.getElementById('editar-cliente-estado');

// Modal Editar Fatura
const modalEditarFatura = document.getElementById('modal-editar-fatura');
const editarFaturaId = document.getElementById('editar-fatura-id');
const editarFaturaUid = document.getElementById('editar-fatura-uid');
const editarFaturaCliente = document.getElementById('editar-fatura-cliente');
const editarFaturaMes = document.getElementById('editar-fatura-mes');
const editarFaturaVencimento = document.getElementById('editar-fatura-vencimento');
const editarFaturaHoraValidade = document.getElementById('editar-fatura-hora-validade');
const editarFaturaUrlPdf = document.getElementById('editar-fatura-url-pdf');
const editarUploadArea = document.getElementById('editar-upload-area');
const editarInputPdf = document.getElementById('editar-input-pdf');
const editarNomeArquivo = document.getElementById('editar-nome-arquivo');
const editarFaturaPix = document.getElementById('editar-fatura-pix');
const editarFaturaStatus = document.getElementById('editar-fatura-status');
const btnFecharModalFatura = document.getElementById('btn-fechar-modal-fatura');
const btnSalvarEdicaoFatura = document.getElementById('btn-salvar-edicao-fatura');
const btnSalvarEdicaoFaturaTexto = document.getElementById('btn-salvar-edicao-fatura-texto');
const btnSalvarEdicaoFaturaSpinner = document.getElementById('btn-salvar-edicao-fatura-spinner');

// Filtros
const filtroClientesNome = document.getElementById('filtro-clientes-nome');
const filtroClientesStatus = document.getElementById('filtro-clientes-status');
const filtroFaturasCliente = document.getElementById('filtro-faturas-cliente');
const filtroFaturasRef = document.getElementById('filtro-faturas-ref');
const filtroFaturasStatus = document.getElementById('filtro-faturas-status');
const filtroLogsAcao = document.getElementById('filtro-logs-acao');

// Paginação Clientes
const paginacaoClientes = document.getElementById('paginacao-clientes');
const paginacaoClientesInfo = document.getElementById('paginacao-clientes-info');
const paginacaoClientesSize = document.getElementById('paginacao-clientes-size');
const pagClientesPrev = document.getElementById('pag-clientes-prev');
const pagClientesNext = document.getElementById('pag-clientes-next');
const pagClientesPagina = document.getElementById('pag-clientes-pagina');

// Paginação Faturas
const paginacaoFaturas = document.getElementById('paginacao-faturas');
const paginacaoFaturasInfo = document.getElementById('paginacao-faturas-info');
const paginacaoFaturasSize = document.getElementById('paginacao-faturas-size');
const pagFaturasPrev = document.getElementById('pag-faturas-prev');
const pagFaturasNext = document.getElementById('pag-faturas-next');
const pagFaturasPagina = document.getElementById('pag-faturas-pagina');

// Estado
let arquivoPdfSelecionado = null;
let editarPdfSelecionado = null;
let clientesCache = {};
let faturasCache = {};
let selecaoSalva = null;
let clientesPaginaAtual = 1;
let faturasPaginaAtual = 1;
let allFaturasDocs = [];
let logsCache = [];

// Elemento hora validade na Nova Fatura
const horaValidadeFaturaInput = document.getElementById('hora-validade-fatura');

// ========================================
// MÁSCARAS DE INPUT (CPF, CEP, Data DD/MM/AAAA)
// ========================================
function aplicarMascaraCPF(valor) {
    const nums = valor.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 3) return nums;
    if (nums.length <= 6) return nums.slice(0, 3) + '.' + nums.slice(3);
    if (nums.length <= 9) return nums.slice(0, 3) + '.' + nums.slice(3, 6) + '.' + nums.slice(6);
    return nums.slice(0, 3) + '.' + nums.slice(3, 6) + '.' + nums.slice(6, 9) + '-' + nums.slice(9);
}

function aplicarMascaraCEP(valor) {
    const nums = valor.replace(/\D/g, '').slice(0, 8);
    if (nums.length <= 5) return nums;
    return nums.slice(0, 5) + '-' + nums.slice(5);
}

function aplicarMascaraData(valor) {
    const nums = valor.replace(/\D/g, '').slice(0, 8);
    if (nums.length <= 2) return nums;
    if (nums.length <= 4) return nums.slice(0, 2) + '/' + nums.slice(2);
    return nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4);
}

function aplicarMascaraTelefone(valor) {
    const nums = valor.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) return nums.length ? '(' + nums : '';
    if (nums.length <= 7) return '(' + nums.slice(0, 2) + ') ' + nums.slice(2);
    return '(' + nums.slice(0, 2) + ') ' + nums.slice(2, 7) + '-' + nums.slice(7);
}

function vincularMascara(input, mascaraFn) {
    if (!input) return;
    input.addEventListener('input', () => { input.value = mascaraFn(input.value); });
}

// Aplicar máscaras nos campos de cadastro e edição
vincularMascara(novoCpf, aplicarMascaraCPF);
vincularMascara(novoCep, aplicarMascaraCEP);
vincularMascara(novoDataVencimento, aplicarMascaraData);
vincularMascara(novoTelefone, aplicarMascaraTelefone);
vincularMascara(editarClienteCpf, aplicarMascaraCPF);
vincularMascara(editarClienteCep, aplicarMascaraCEP);
vincularMascara(editarClienteDataVencimento, aplicarMascaraData);
vincularMascara(editarClienteTelefone, aplicarMascaraTelefone);
// Máscara data no modal Nova Data Vencimento
vincularMascara(document.getElementById('nova-data-venc-input'), aplicarMascaraData);

// Salvar/restaurar seleção (para usar com color picker que rouba foco)
function salvarSelecao() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        selecaoSalva = sel.getRangeAt(0);
    }
}
function restaurarSelecao() {
    if (selecaoSalva) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(selecaoSalva);
    }
}

// ========================================
// UTILITÁRIOS DE DATA
// ========================================
function parseDateDDMMAAAA(str) {
    if (!str) return null;
    const partes = str.split('/');
    if (partes.length !== 3) return null;
    const d = parseInt(partes[0], 10);
    const m = parseInt(partes[1], 10) - 1;
    const a = parseInt(partes[2], 10);
    if (isNaN(d) || isNaN(m) || isNaN(a)) return null;
    return new Date(a, m, d);
}

function formatDateDDMMAAAA(date) {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const a = date.getFullYear();
    return `${d}/${m}/${a}`;
}

function formatarVencimentoFatura(dataStr) {
    if (!dataStr) return '--';
    // Se já está no formato dd/mm/aaaa
    if (dataStr.includes('/')) return dataStr;
    // Converter yyyy-mm-dd para dd/mm/aaaa
    const partes = dataStr.split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    return dataStr;
}

function calcularDiasRestantes(dataVencStr, horaStr) {
    const dataVenc = parseDateDDMMAAAA(dataVencStr);
    if (!dataVenc) return { dias: '--', situacao: '--' };
    const agora = new Date();
    if (horaStr) {
        const partes = horaStr.split(':');
        dataVenc.setHours(parseInt(partes[0], 10) || 0, parseInt(partes[1], 10) || 0, 0, 0);
    } else {
        dataVenc.setHours(23, 59, 59, 999);
    }
    const diff = dataVenc.getTime() - agora.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return {
        dias: dias,
        situacao: diff > 0 ? 'Não expirado' : 'Expirado'
    };
}

function autoCalcDataVencimento(dataInput, horaInput, diasEl, situacaoEl) {
    const calc = calcularDiasRestantes(dataInput.value, horaInput.value);
    if (diasEl) diasEl.value = calc.dias;
    if (situacaoEl) situacaoEl.value = calc.situacao;
}

// Auto-cálculo no form de cadastro
novoDataVencimento.addEventListener('input', () => autoCalcDataVencimento(novoDataVencimento, novoHoraValidade, novoDiasRestantes, novoSituacao));
novoHoraValidade.addEventListener('input', () => autoCalcDataVencimento(novoDataVencimento, novoHoraValidade, novoDiasRestantes, novoSituacao));

// Auto-cálculo no modal de edição
editarClienteDataVencimento.addEventListener('input', () => autoCalcDataVencimento(editarClienteDataVencimento, editarClienteHoraValidade, editarClienteDiasRestantes, editarClienteSituacao));
editarClienteHoraValidade.addEventListener('input', () => autoCalcDataVencimento(editarClienteDataVencimento, editarClienteHoraValidade, editarClienteDiasRestantes, editarClienteSituacao));

// ========================================
// DASHBOARD + PAINÉIS AUXILIARES
// ========================================
const dashTotalClientes = document.getElementById('dash-total-clientes');
const dashNaoExpirados = document.getElementById('dash-nao-expirados');
const dashExpirados = document.getElementById('dash-expirados');
const dashSuspensos = document.getElementById('dash-suspensos');
const dashNovosMes = document.getElementById('dash-novos-mes');
const dashFaturasPendentes = document.getElementById('dash-faturas-pendentes');
const dashFaturasPagasHoje = document.getElementById('dash-faturas-pagas-hoje');
const listaPrestesVencer = document.getElementById('lista-prestes-vencer');
const expiradosHojeBody = document.getElementById('expirados-hoje-body');
const expirados3diasBody = document.getElementById('expirados-3dias-body');
const expirados7diasBody = document.getElementById('expirados-7dias-body');
const listaExpiradosVazia = document.getElementById('lista-expirados-vazia');
const btnVerPainel = document.getElementById('btn-ver-painel');
const avisoVencBloqueado = document.getElementById('aviso-venc-bloqueado');

// Contador faturas pagas hoje (localStorage por dia)
let faturasPagasHojeContador = 0;

function inicializarContadorFaturasPagas() {
    const hojeKey = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem('icoutv_faturas_pagas_data');
    if (savedDate === hojeKey) {
        faturasPagasHojeContador = parseInt(localStorage.getItem('icoutv_faturas_pagas_contador') || '0', 10);
    } else {
        faturasPagasHojeContador = 0;
        localStorage.setItem('icoutv_faturas_pagas_data', hojeKey);
        localStorage.setItem('icoutv_faturas_pagas_contador', '0');
    }
}

function incrementarFaturasPagas() {
    faturasPagasHojeContador++;
    localStorage.setItem('icoutv_faturas_pagas_contador', String(faturasPagasHojeContador));
    localStorage.setItem('icoutv_faturas_pagas_data', new Date().toISOString().slice(0, 10));
    dashFaturasPagasHoje.textContent = faturasPagasHojeContador;
}

function decrementarFaturasPagas() {
    faturasPagasHojeContador = Math.max(0, faturasPagasHojeContador - 1);
    localStorage.setItem('icoutv_faturas_pagas_contador', String(faturasPagasHojeContador));
    dashFaturasPagasHoje.textContent = faturasPagasHojeContador;
}

// Template WhatsApp (configurável pelo admin)
let whatsAppTemplate = 'Olá %nome%, sua assinatura icouTv venceu em %data_vencimento%. Renove agora pelo portal: https://icoutech.com/icoutv/app';
let whatsAppMensagens = [];

async function carregarWhatsAppConfig() {
    try {
        const snap = await getDoc(doc(db, 'configuracoes', 'whatsapp'));
        if (snap.exists()) {
            if (snap.data().template) whatsAppTemplate = snap.data().template;
            if (snap.data().mensagens) whatsAppMensagens = snap.data().mensagens;
        }
        const templateEl = document.getElementById('whatsapp-msg-template');
        if (templateEl) templateEl.value = whatsAppTemplate;
        renderizarListaWhatsApp();
    } catch (e) { console.warn('Erro ao carregar config WhatsApp:', e); }
}

function renderizarListaWhatsApp() {
    const container = document.getElementById('lista-whatsapp-mensagens');
    if (!container) return;
    if (whatsAppMensagens.length === 0) {
        container.innerHTML = '<p style="font-size:var(--fonte-tamanho-sm);color:var(--cor-texto-claro);text-align:center;padding:var(--espacamento-sm);">Nenhuma mensagem salva.</p>';
        return;
    }
    const categoriaLabels = { cobranca: 'Cobrança', boas_vindas: 'Boas-vindas', renovacao: 'Renovação', aviso: 'Aviso', personalizada: 'Personalizada' };
    container.innerHTML = whatsAppMensagens.map((m, i) => `
        <div class="lista-mensagens-item" style="align-items:center;">
            <div class="msg-conteudo">
                <div class="msg-destino"><span class="msg-status-badge msg-badge-ativa">${categoriaLabels[m.categoria] || m.categoria}</span></div>
                <div class="msg-texto" style="white-space:pre-wrap;font-size:var(--fonte-tamanho-xs);max-height:60px;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(m.texto)}</div>
            </div>
            <div class="msg-acoes" style="flex-direction:row;gap:4px;">
                <button class="btn-excluir-msg btn-excluir-wa-msg" data-wa-index="${i}" title="Excluir">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
                <button class="btn btn-sm btn-usar-wa-msg" data-wa-index="${i}" style="font-size:var(--fonte-tamanho-xs);min-height:28px;" title="Usar como padrão de cobrança">Usar</button>
            </div>
        </div>
    `).join('');
}

// ---------- Carregar Promoção ----------
async function carregarPromocao() {
    try {
        const snap = await getDoc(doc(db, 'configuracoes', 'promocao'));
        if (snap.exists()) {
            const d = snap.data();
            const ativaEl = document.getElementById('promo-ativa');
            const tituloEl = document.getElementById('promo-titulo');
            const textoEl = document.getElementById('promo-texto');
            if (ativaEl) ativaEl.checked = !!d.ativa;
            if (tituloEl) tituloEl.value = d.titulo || '';
            if (textoEl) textoEl.value = d.texto || '';
        }
    } catch (e) { console.warn('Erro ao carregar promoção:', e); }
}

// Botão scrollar para painel (legacy, removido do HTML)
if (btnVerPainel) {
    btnVerPainel.addEventListener('click', () => {
        const proximaSecao = document.getElementById('secao-prestes-vencer');
        if (proximaSecao) proximaSecao.scrollIntoView({ behavior: 'smooth' });
    });
}

// ========================================
// NAVEGAÇÃO SIDEBAR + PÁGINAS
// ========================================
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const btnAbrirSidebar = document.getElementById('btn-abrir-sidebar');
const btnFecharSidebar = document.getElementById('btn-fechar-sidebar');
const topbarTitulo = document.getElementById('topbar-titulo');

const paginaTitulos = {
    dashboard: 'Dashboard',
    clientes: 'Clientes',
    faturas: 'Faturas',
    notificacoes: 'Notificações',
    configuracoes: 'Configurações',
    logs: 'Logs de Ações'
};

let paginaAtual = 'dashboard';

function navegarPara(pagina) {
    paginaAtual = pagina;
    // Mostrar/ocultar seções
    document.querySelectorAll('.admin-container > [data-pagina]').forEach(el => {
        el.style.display = el.dataset.pagina === pagina ? '' : 'none';
    });
    // Atualizar sidebar ativa
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('ativo', link.dataset.pagina === pagina);
    });
    // Atualizar título topbar
    if (topbarTitulo) topbarTitulo.textContent = paginaTitulos[pagina] || pagina;
    // Scroll ao topo
    window.scrollTo({ top: 0 });
    // Fechar sidebar mobile
    fecharSidebar();
}

function abrirSidebar() {
    if (sidebar) sidebar.classList.add('aberta');
    if (sidebarOverlay) sidebarOverlay.classList.add('ativo');
}

function fecharSidebar() {
    if (sidebar) sidebar.classList.remove('aberta');
    if (sidebarOverlay) sidebarOverlay.classList.remove('ativo');
}

// Links sidebar
document.querySelectorAll('.sidebar-link[data-pagina]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navegarPara(link.dataset.pagina);
    });
});

// Hamburger / fechar sidebar
if (btnAbrirSidebar) btnAbrirSidebar.addEventListener('click', abrirSidebar);
if (btnFecharSidebar) btnFecharSidebar.addEventListener('click', fecharSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', fecharSidebar);

// Atalhos Dashboard
document.querySelectorAll('.dash-atalho[data-ir-pagina]').forEach(btn => {
    btn.addEventListener('click', () => {
        navegarPara(btn.dataset.irPagina);
    });
});

// Botão "Ver todas notificações" no dashboard
const btnVerNotificacoes = document.getElementById('btn-ver-notificacoes');
if (btnVerNotificacoes) {
    btnVerNotificacoes.addEventListener('click', () => navegarPara('notificacoes'));
}

// Dashboard mini-notificações preview
function renderizarDashNotifPreview() {
    const preview = document.getElementById('dash-notificacoes-preview');
    const badge = document.getElementById('dash-notif-badge');
    const sidebarBadge = document.getElementById('sidebar-badge-notif');
    if (!preview) return;

    const pendentes = confirmacoesPagamentoCache.filter(c => c.status === 'pendente');
    const count = pendentes.length;

    // Badges
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
    if (sidebarBadge) {
        sidebarBadge.textContent = count;
        sidebarBadge.style.display = count > 0 ? 'inline' : 'none';
    }

    if (count === 0) {
        preview.innerHTML = '<p style="font-size:var(--fonte-tamanho-sm);color:var(--cor-texto-claro);padding:var(--espacamento-sm) 0;">Nenhuma confirmação pendente.</p>';
        return;
    }

    const primeiros = pendentes.slice(0, 3);
    preview.innerHTML = primeiros.map(c => {
        const nome = c.nome_cliente || c.email_cliente || 'Cliente';
        const tipo = c.tipo === 'exclusao_conta' ? '🗑️ Exclusão' : '💰 Pagamento';
        return `<div class="dash-notif-item"><span>${tipo}</span><strong>${escapeHTML(nome)}</strong></div>`;
    }).join('');

    if (count > 3) {
        preview.innerHTML += `<p style="font-size:var(--fonte-tamanho-xs);color:var(--cor-texto-claro);padding-top:var(--espacamento-xs);">+ ${count - 3} mais...</p>`;
    }
}

// Inicializar página: mostrar apenas dashboard
function inicializarPaginas() {
    navegarPara('dashboard');
}

function atualizarPaineis() {
    renderizarDashboard();
    renderizarPrestesAVencer();
    renderizarClientesExpirados();
}

function renderizarDashboard() {
    const clientes = Object.entries(clientesCache);
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    let naoExpirados = 0;
    let expirados = 0;
    let suspensos = 0;
    let novosMes = 0;

    clientes.forEach(([id, c]) => {
        if (c.status_conta === 'suspenso') { suspensos++; return; }
        if (c.status_conta === 'excluido') return;
        const calc = calcularDiasRestantes(c.data_vencimento_cliente, c.hora_validade);
        if (typeof calc.dias === 'number' && calc.dias > 0) naoExpirados++;
        else expirados++;
        // Novos no mês: criado_em é Firestore Timestamp
        if (c.criado_em) {
            const dataCriacao = c.criado_em.toDate ? c.criado_em.toDate() : new Date(c.criado_em);
            if (dataCriacao.getMonth() === mesAtual && dataCriacao.getFullYear() === anoAtual) novosMes++;
        }
    });

    let faturasPendentes = 0;

    allFaturasDocs.forEach(f => {
        if (f.status_pagamento === 'pendente') faturasPendentes++;
    });

    dashNaoExpirados.textContent = naoExpirados;
    dashExpirados.textContent = expirados;
    dashSuspensos.textContent = suspensos;
    dashNovosMes.textContent = novosMes;
    dashFaturasPendentes.textContent = faturasPendentes;
    dashFaturasPagasHoje.textContent = faturasPagasHojeContador;
    if (dashTotalClientes) dashTotalClientes.textContent = naoExpirados + expirados + suspensos;
}

function renderizarPrestesAVencer() {
    const clientes = Object.entries(clientesCache)
        .map(([id, c]) => {
            if (c.status_conta === 'suspenso' || c.status_conta === 'excluido') return null;
            const calc = calcularDiasRestantes(c.data_vencimento_cliente, c.hora_validade);
            if (typeof calc.dias === 'number' && calc.dias > 0 && calc.dias <= 3) {
                return { id, ...c, dias_restantes_calc: calc.dias };
            }
            return null;
        })
        .filter(Boolean)
        .sort((a, b) => a.dias_restantes_calc - b.dias_restantes_calc);

    if (clientes.length === 0) {
        listaPrestesVencer.innerHTML = '<p class="sem-dados-texto">Nenhum cliente prestes a vencer.</p>';
        return;
    }

    const dotsSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>';

    listaPrestesVencer.innerHTML = `
        <table class="tabela-alertas">
            <thead>
                <tr><th class="col-nome-alertas">Nome</th><th class="col-telefone-dash">Telefone</th><th class="col-vencimento-alertas">Vencimento</th><th class="col-hora">Hora</th><th class="col-dias">Dias</th><th class="col-acoes">Ações</th></tr></thead>
            <tbody>${clientes.map(c => {
        const telWA = formatarTelefoneWhatsApp(c.telefone);
        const calcWA = calcularDiasRestantes(c.data_vencimento_cliente, c.hora_validade);
        let whatsAppItem = '';
        if (telWA) {
            const msgWA = whatsAppTemplate
                .replace(/%nome%/g, c.nome_completo || '')
                .replace(/%data_vencimento%/g, c.data_vencimento_cliente || '')
                .replace(/%email%/g, c.email || '')
                .replace(/%telefone%/g, c.telefone || '')
                .replace(/%pacote%/g, c.pacote || '')
                .replace(/%usuario%/g, c.usuario || '')
                .replace(/%senha%/g, c.senha_servico || '')
                .replace(/%situacao%/g, calcWA.situacao || '')
                .replace(/%dias_restantes%/g, String(calcWA.dias));
            const waLink = `https://wa.me/${encodeURIComponent(telWA)}?text=${encodeURIComponent(msgWA)}`;
            whatsAppItem = `<a class="acoes-menu-item btn-whatsapp-cobrar" href="${waLink}" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;color:#25D366;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.339 0-4.508-.758-6.262-2.044l-.438-.327-2.67.895.895-2.67-.327-.438A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                        Enviar via WhatsApp
                    </a>`;
        }
        return `<tr>
                    <td class="celula-truncada" title="${escapeHTML(c.nome_completo || '--')}">${escapeHTML(c.nome_completo || '--')}</td>
                    <td class="col-telefone-dash">${escapeHTML(c.telefone || '--')}</td>
                    <td>${escapeHTML(c.data_vencimento_cliente || '--')}</td>
                    <td>${escapeHTML(c.hora_validade || '--')}</td>
                    <td><span class="badge-dias badge-dias-alerta">${c.dias_restantes_calc}d</span></td>
                    <td class="acoes">
                        <div class="acoes-container">
                            <button class="btn-mais-acoes" title="Mais ações">${dotsSvg}</button>
                            <div class="acoes-menu">
                                <button class="acoes-menu-item btn-detalhes-cliente-dash" data-id="${c.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    Detalhes
                                </button>
                                ${whatsAppItem}
                            </div>
                        </div>
                    </td>
                </tr>`;
    }).join('')}
            </tbody>
        </table>`;
}

function renderizarClientesExpirados() {
    const hoje = [];
    const ate3dias = [];
    const ate7dias = [];

    Object.entries(clientesCache).forEach(([id, c]) => {
        if (c.status_conta === 'suspenso' || c.status_conta === 'excluido') return;
        const calc = calcularDiasRestantes(c.data_vencimento_cliente, c.hora_validade);
        if (typeof calc.dias !== 'number' || calc.dias > 0) return;
        const diasNeg = Math.abs(calc.dias);
        const item = { id, ...c, dias_expirado: diasNeg };
        if (diasNeg === 0) hoje.push(item);
        else if (diasNeg <= 3) ate3dias.push(item);
        else if (diasNeg <= 7) ate7dias.push(item);
    });

    const temDados = hoje.length > 0 || ate3dias.length > 0 || ate7dias.length > 0;
    const dotsSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>';

    function renderGrupo(container, lista, grupoId) {
        const grupoEl = document.getElementById(grupoId);
        if (lista.length === 0) {
            grupoEl.style.display = 'none';
            return;
        }
        grupoEl.style.display = 'block';
        container.innerHTML = lista.map(c => {
            const telWA = formatarTelefoneWhatsApp(c.telefone);
            const calcWA = calcularDiasRestantes(c.data_vencimento_cliente, c.hora_validade);
            let whatsAppItem = '';
            if (telWA) {
                const msgWA = whatsAppTemplate
                    .replace(/%nome%/g, c.nome_completo || '')
                    .replace(/%data_vencimento%/g, c.data_vencimento_cliente || '')
                    .replace(/%email%/g, c.email || '')
                    .replace(/%telefone%/g, c.telefone || '')
                    .replace(/%pacote%/g, c.pacote || '')
                    .replace(/%usuario%/g, c.usuario || '')
                    .replace(/%senha%/g, c.senha_servico || '')
                    .replace(/%situacao%/g, calcWA.situacao || '')
                    .replace(/%dias_restantes%/g, String(calcWA.dias));
                const waLink = `https://wa.me/${encodeURIComponent(telWA)}?text=${encodeURIComponent(msgWA)}`;
                whatsAppItem = `<a class="acoes-menu-item btn-whatsapp-cobrar" href="${waLink}" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;color:#25D366;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.339 0-4.508-.758-6.262-2.044l-.438-.327-2.67.895.895-2.67-.327-.438A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    Enviar via WhatsApp
                </a>`;
            }
            return `<div class="alerta-item alerta-item-expirado">
                <div class="alerta-item-info">
                    <strong class="celula-truncada" style="display:block;" title="${escapeHTML(c.nome_completo || '--')}">${escapeHTML(c.nome_completo || '--')}</strong>
                    <span>${escapeHTML(c.telefone || '--')}</span>
                </div>
                <div class="alerta-item-meta">
                    <span>Venc: ${escapeHTML(c.data_vencimento_cliente || '--')}</span>
                    <span>${escapeHTML(c.pacote || '--')}</span>
                </div>
                <div class="alerta-item-acoes">
                    <div class="acoes-container">
                        <button class="btn-mais-acoes" title="Mais ações">${dotsSvg}</button>
                        <div class="acoes-menu">
                            <button class="acoes-menu-item btn-detalhes-cliente-dash" data-id="${c.id}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                Detalhes
                            </button>
                            ${whatsAppItem}
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    renderGrupo(expiradosHojeBody, hoje, 'lista-expirados-hoje');
    renderGrupo(expirados3diasBody, ate3dias, 'lista-expirados-3dias');
    renderGrupo(expirados7diasBody, ate7dias, 'lista-expirados-7dias');

    if (temDados) {
        listaExpiradosVazia.style.display = 'none';
    } else {
        listaExpiradosVazia.innerHTML = '<p>Nenhum cliente expirado no momento.</p>';
        listaExpiradosVazia.style.display = 'block';
    }
}

function formatarTelefoneWhatsApp(telefone) {
    if (!telefone) return '';
    let num = telefone.replace(/\D/g, '');
    if (num.startsWith('0')) num = num.substring(1);
    if (!num.startsWith('55')) num = '55' + num;
    return num;
}

// ---------- Verificar Autenticação & Permissão ----------
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    if (user.email !== ADMIN_EMAIL) {
        carregando.style.display = 'none';
        acessoNegado.style.display = 'flex';
        return;
    }

    adminEmail.textContent = user.email;
    carregando.style.display = 'none';
    adminApp.style.display = 'block';

    inicializarPaginas();
    inicializarContadorFaturasPagas();

    await carregarClientes();
    await carregarFaturas();
    atualizarPaineis();
    await carregarMensagens();
    await carregarWhatsAppConfig();
    await carregarPromocao();
    await carregarConfirmacoesPagamento();
    await carregarLogs();

    // Salvar config WhatsApp
    const btnSalvarWhatsApp = document.getElementById('btn-salvar-whatsapp');
    if (btnSalvarWhatsApp) {
        btnSalvarWhatsApp.addEventListener('click', async () => {
            const templateEl = document.getElementById('whatsapp-msg-template');
            const categoriaEl = document.getElementById('whatsapp-msg-categoria');
            const template = templateEl ? templateEl.value.trim() : '';
            const categoria = categoriaEl ? categoriaEl.value : 'cobranca';
            if (!template) { mostrarToast('Informe a mensagem.', 'erro'); return; }
            btnSalvarWhatsApp.disabled = true;
            try {
                // Salvar como template padrão de cobrança E adicionar à lista de mensagens
                whatsAppMensagens.push({ categoria, texto: template, criadoEm: new Date().toISOString() });
                if (categoria === 'cobranca') whatsAppTemplate = template;
                await setDoc(doc(db, 'configuracoes', 'whatsapp'), { template: whatsAppTemplate, mensagens: whatsAppMensagens });
                await registrarLog('whatsapp_config', `Mensagem WhatsApp salva (${categoria})`);
                mostrarToast('Mensagem WhatsApp salva!', 'sucesso');
                templateEl.value = '';
                renderizarListaWhatsApp();
            } catch (error) {
                console.error('Erro ao salvar config WhatsApp:', error);
                mostrarToast('Erro ao salvar configuração.', 'erro');
            }
            btnSalvarWhatsApp.disabled = false;
        });
    }

    // Excluir e Usar mensagem WhatsApp (delegação)
    document.addEventListener('click', async (e) => {
        const btnExcluir = e.target.closest('.btn-excluir-wa-msg');
        if (btnExcluir) {
            const idx = parseInt(btnExcluir.dataset.waIndex, 10);
            if (isNaN(idx) || idx < 0 || idx >= whatsAppMensagens.length) return;
            whatsAppMensagens.splice(idx, 1);
            try {
                await setDoc(doc(db, 'configuracoes', 'whatsapp'), { template: whatsAppTemplate, mensagens: whatsAppMensagens });
                renderizarListaWhatsApp();
                mostrarToast('Mensagem excluída.', 'sucesso');
            } catch (err) { mostrarToast('Erro ao excluir.', 'erro'); }
            return;
        }
        const btnUsar = e.target.closest('.btn-usar-wa-msg');
        if (btnUsar) {
            const idx = parseInt(btnUsar.dataset.waIndex, 10);
            if (isNaN(idx) || idx < 0 || idx >= whatsAppMensagens.length) return;
            whatsAppTemplate = whatsAppMensagens[idx].texto;
            try {
                await setDoc(doc(db, 'configuracoes', 'whatsapp'), { template: whatsAppTemplate, mensagens: whatsAppMensagens });
                mostrarToast('Mensagem definida como padrão de cobrança!', 'sucesso');
            } catch (err) { mostrarToast('Erro ao definir como padrão.', 'erro'); }
        }
    });

    // Salvar promoção
    const btnSalvarPromo = document.getElementById('btn-salvar-promocao');
    if (btnSalvarPromo) {
        btnSalvarPromo.addEventListener('click', async () => {
            const ativa = document.getElementById('promo-ativa')?.checked || false;
            const titulo = document.getElementById('promo-titulo')?.value.trim() || '';
            const texto = document.getElementById('promo-texto')?.value.trim() || '';
            if (ativa && !titulo && !texto) {
                mostrarToast('Informe o título ou texto da promoção.', 'erro');
                return;
            }
            btnSalvarPromo.disabled = true;
            try {
                await setDoc(doc(db, 'configuracoes', 'promocao'), { ativa, titulo, texto });
                await registrarLog('promocao_config', ativa ? 'Promoção ativada' : 'Promoção desativada');
                mostrarToast('Promoção salva com sucesso!', 'sucesso');
            } catch (error) {
                console.error('Erro ao salvar promoção:', error);
                mostrarToast('Erro ao salvar promoção.', 'erro');
            }
            btnSalvarPromo.disabled = false;
        });
    }
});

// ---------- Logout ----------
btnLogout.addEventListener('click', async () => {
    const overlay = document.getElementById('overlay-saindo');
    overlay.style.display = 'flex';
    try {
        await signOut(auth);
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Erro ao sair:', error);
        overlay.style.display = 'none';
        mostrarToast('Erro ao sair.', 'erro');
    }
});

// ========================================
// BUSCAR CLIENTE POR NOME OU E-MAIL
// ========================================
btnBuscarCliente.addEventListener('click', async () => {
    const termo = clienteEmailInput.value.trim().toLowerCase();
    if (!termo) {
        mostrarToast('Informe o nome ou e-mail do cliente.', 'erro');
        return;
    }

    clienteInfo.style.display = 'none';
    clienteNaoEncontrado.style.display = 'none';

    try {
        // Buscar todos os clientes e filtrar localmente por nome ou email
        const clientesRef = collection(db, 'clientes');
        const snap = await getDocs(clientesRef);
        let encontrado = null;

        snap.forEach((docSnap) => {
            const dados = docSnap.data();
            const email = (dados.email || '').toLowerCase();
            const nome = (dados.nome_completo || '').toLowerCase();
            if (email === termo || nome.includes(termo)) {
                if (!encontrado) encontrado = { id: docSnap.id, dados };
            }
        });

        if (encontrado) {
            const dados = encontrado.dados;
            clienteNomeEncontrado.textContent = `${dados.nome_completo} (${dados.status_conta})`;
            clienteUid.textContent = encontrado.id;
            clienteInfo.style.display = 'block';
            // Auto-preencher data de vencimento do cliente na fatura
            if (dados.data_vencimento_cliente) {
                const dataVencCliente = parseDateDDMMAAAA(dados.data_vencimento_cliente);
                if (dataVencCliente) {
                    const yyyy = dataVencCliente.getFullYear();
                    const mm = String(dataVencCliente.getMonth() + 1).padStart(2, '0');
                    const dd = String(dataVencCliente.getDate()).padStart(2, '0');
                    dataVencimentoInput.value = `${yyyy}-${mm}-${dd}`;
                }
            }
            // Auto-preencher hora de validade
            if (dados.hora_validade && horaValidadeFaturaInput) {
                horaValidadeFaturaInput.value = dados.hora_validade;
            }
            mostrarToast('Cliente encontrado!', 'sucesso');
        } else {
            clienteNaoEncontrado.style.display = 'block';
            clienteUid.textContent = '';
        }
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        mostrarToast('Erro ao buscar cliente.', 'erro');
    }
});

// ========================================
// UPLOAD DE PDF (DRAG & DROP + CLICK)
// ========================================
uploadArea.addEventListener('click', () => inputPdf.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('arrastando');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('arrastando');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('arrastando');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        arquivoPdfSelecionado = files[0];
        nomeArquivo.textContent = files[0].name;
        nomeArquivo.style.display = 'block';
    } else {
        mostrarToast('Selecione um arquivo PDF válido.', 'erro');
    }
});

inputPdf.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        arquivoPdfSelecionado = e.target.files[0];
        nomeArquivo.textContent = e.target.files[0].name;
        nomeArquivo.style.display = 'block';
    }
});

async function uploadParaCloudinary(arquivo) {
    const formData = new FormData();
    formData.append('file', arquivo);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    const data = await response.json();

    if (!response.ok) {
        const msgErro = data?.error?.message || JSON.stringify(data);
        console.error('Cloudinary erro detalhado:', msgErro);
        throw new Error(msgErro);
    }

    return data.secure_url;
}

// ========================================
// SALVAR FATURA
// ========================================
formFatura.addEventListener('submit', async (e) => {
    e.preventDefault();

    const uidCliente = clienteUid.textContent.trim();
    const mesRef = mesRefInput.value.trim();
    const codigoPix = codigoPIXInput.value.trim();
    const status = statusPagamento.value;
    const dataVenc = dataVencimentoInput.value;

    if (!uidCliente) { mostrarToast('Busque e selecione um cliente primeiro.', 'erro'); return; }
    if (!mesRef) { mostrarToast('Informe o mês de referência.', 'erro'); return; }
    if (!dataVenc) { mostrarToast('Informe a data de vencimento.', 'erro'); return; }
    if (!codigoPix) { mostrarToast('Informe o código PIX.', 'erro'); return; }

    setCarregandoFatura(true);

    try {
        let urlPdf = urlPdfManual.value.trim();

        if (arquivoPdfSelecionado && !urlPdf) {
            try {
                urlPdf = await uploadParaCloudinary(arquivoPdfSelecionado);
                mostrarToast('PDF enviado ao Cloudinary!', 'sucesso');
            } catch (uploadError) {
                console.error('Erro no upload:', uploadError);
                mostrarToast(`Erro no upload: ${uploadError.message}`, 'erro');
                setCarregandoFatura(false);
                return;
            }
        }

        if (!urlPdf) {
            mostrarToast('Forneça o PDF (upload ou URL).', 'erro');
            setCarregandoFatura(false);
            return;
        }

        const faturaData = {
            id_cliente: uidCliente,
            mes_referencia: mesRef,
            data_vencimento: dataVenc,
            hora_validade: horaValidadeFaturaInput ? horaValidadeFaturaInput.value.trim() : '',
            url_pdf_cloudinary: urlPdf,
            codigo_pix_copia: codigoPix,
            status_pagamento: status,
            data_geracao: serverTimestamp()
        };

        await addDoc(collection(db, 'faturas'), faturaData);
        await registrarLog('fatura_criada', `Fatura ${mesRef} criada para cliente ${clientesCache[uidCliente]?.nome_completo || uidCliente}`);

        mostrarToast('Fatura salva com sucesso!', 'sucesso');

        formFatura.reset();
        clienteInfo.style.display = 'none';
        clienteUid.textContent = '';
        nomeArquivo.style.display = 'none';
        arquivoPdfSelecionado = null;

        await carregarFaturas();

    } catch (error) {
        console.error('Erro ao salvar fatura:', error);
        mostrarToast('Erro ao salvar fatura. Tente novamente.', 'erro');
    }

    setCarregandoFatura(false);
});

function setCarregandoFatura(carregando) {
    btnSalvarFatura.disabled = carregando;
    btnSalvarTexto.style.display = carregando ? 'none' : 'inline';
    btnSalvarSpinner.style.display = carregando ? 'block' : 'none';
}

// ========================================
// CADASTRAR CLIENTE (Firebase Auth + Firestore)
// ========================================
formCliente.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = novoNome.value.trim();
    const email = novoEmail.value.trim();
    const status = novoStatus.value;

    if (!nome || !email) {
        mostrarToast('Preencha nome e e-mail do cliente.', 'erro');
        return;
    }

    const senha = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(36)).join('').slice(0, 16);

    setCarregandoCliente(true);

    try {
        const clientesRef = collection(db, 'clientes');
        const q = query(clientesRef, where('email', '==', email));
        const snap = await getDocs(q);

        if (!snap.empty) {
            mostrarToast('Já existe um cliente com este e-mail.', 'erro');
            setCarregandoCliente(false);
            return;
        }

        const appSecundario = initializeApp(firebaseConfig, 'cadastro-cliente');
        const authSecundario = getAuth(appSecundario);

        let uid;
        try {
            const userCredential = await createUserWithEmailAndPassword(authSecundario, email, senha);
            uid = userCredential.user.uid;
            await signOut(authSecundario);
        } catch (authError) {
            await deleteApp(appSecundario);
            const msgErro = traduzirErroAuth(authError.code);
            mostrarToast(msgErro, 'erro');
            setCarregandoCliente(false);
            return;
        }

        await deleteApp(appSecundario);

        const clienteData = {
            nome_completo: nome,
            email: email,
            status_conta: status,
            cpf: novoCpf.value.trim(),
            usuario: novoUsuario.value.trim(),
            senha_servico: novoSenhaServico.value.trim(),
            data_vencimento_cliente: novoDataVencimento.value.trim(),
            hora_validade: novoHoraValidade.value.trim(),
            telefone: novoTelefone.value.trim(),
            observacao: novoObservacao.value.trim(),
            pacote: novoPacote.value.trim() || 'Pacote Básico',
            dados_endereco: {
                cep: novoCep.value.trim(),
                endereco: novoEndereco.value.trim(),
                numero: novoNumero.value.trim(),
                complemento: novoComplemento.value.trim(),
                bairro: novoBairro.value.trim(),
                cidade: novoCidade.value.trim(),
                estado: novoEstado.value.trim()
            }
        };

        await setDoc(doc(db, 'clientes', uid), clienteData);
        await registrarLog('cliente_criado', `Cliente "${nome}" (${email}) cadastrado`);

        try {
            await sendPasswordResetEmail(auth, email);
            mostrarToast(`Cliente "${nome}" criado! E-mail de redefinição enviado.`, 'sucesso');
        } catch (emailError) {
            console.warn('Aviso: Não foi possível enviar e-mail de redefinição:', emailError);
            mostrarToast(`Cliente "${nome}" criado com sucesso! (e-mail não enviado)`, 'sucesso');
        }

        formCliente.reset();
        novoPacote.value = 'Pacote Básico';
        novoDiasRestantes.value = '';
        novoSituacao.value = '';

        await carregarClientes();

    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        mostrarToast('Erro ao cadastrar cliente. Tente novamente.', 'erro');
    }

    setCarregandoCliente(false);
});

function traduzirErroAuth(codigo) {
    const erros = {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado no Firebase Auth.',
        'auth/invalid-email': 'E-mail inválido.',
        'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres).',
        'auth/operation-not-allowed': 'Cadastro por e-mail/senha não está habilitado no Firebase.',
    };
    return erros[codigo] || `Erro ao criar usuário: ${codigo}`;
}

function setCarregandoCliente(carregando) {
    btnCadastrarCliente.disabled = carregando;
    btnCadastrarTexto.style.display = carregando ? 'none' : 'inline';
    btnCadastrarSpinner.style.display = carregando ? 'block' : 'none';
}

// ========================================
// CARREGAR CLIENTES (com filtro + paginação)
// ========================================
async function carregarClientes() {
    try {
        const clientesRef = collection(db, 'clientes');
        const snap = await getDocs(clientesRef);

        clientesCache = {};
        let todosClientes = [];

        snap.forEach((docSnap) => {
            const dados = docSnap.data();
            clientesCache[docSnap.id] = dados;
            todosClientes.push({ id: docSnap.id, ...dados });
        });

        renderizarTabelaClientes(todosClientes);
        atualizarPaineis();
    } catch (error) {
    }
}

function getClientesFiltrados() {
    const filtroNome = (filtroClientesNome.value || '').trim().toLowerCase();
    const filtroStatus = filtroClientesStatus.value;
    let lista = Object.entries(clientesCache).map(([id, dados]) => ({ id, ...dados }));
    if (filtroNome) {
        lista = lista.filter(c =>
            (c.nome_completo || '').toLowerCase().includes(filtroNome) ||
            (c.email || '').toLowerCase().includes(filtroNome) ||
            (c.telefone || '').toLowerCase().includes(filtroNome) ||
            (c.usuario || '').toLowerCase().includes(filtroNome)
        );
    }
    if (filtroStatus) {
        lista = lista.filter(c => c.status_conta === filtroStatus);
    }
    // Filtros rápidos
    if (filtroRapidoAtivo && filtroRapidoAtivo !== 'todos') {
        lista = lista.filter(c => {
            const calc = calcularDiasRestantes(c.data_vencimento_cliente, c.hora_validade);
            if (filtroRapidoAtivo === 'nao_expirados') return c.status_conta !== 'suspenso' && typeof calc.dias === 'number' && calc.dias > 0;
            if (filtroRapidoAtivo === 'expirados') return c.status_conta !== 'suspenso' && c.status_conta !== 'excluido' && typeof calc.dias === 'number' && calc.dias < 0;
            if (filtroRapidoAtivo === 'suspensos') return c.status_conta === 'suspenso';
            if (filtroRapidoAtivo === 'vencem_3dias') return c.status_conta !== 'suspenso' && typeof calc.dias === 'number' && calc.dias >= 0 && calc.dias <= 3;
            return true;
        });
    }
    return lista;
}

function renderizarTabelaClientes(todosClientesParam) {
    const lista = todosClientesParam ? todosClientesParam : getClientesFiltrados();
    const pageSize = parseInt(paginacaoClientesSize.value, 10);
    const totalPaginas = Math.max(1, Math.ceil(lista.length / pageSize));
    if (clientesPaginaAtual > totalPaginas) clientesPaginaAtual = totalPaginas;
    const inicio = (clientesPaginaAtual - 1) * pageSize;
    const paginados = lista.slice(inicio, inicio + pageSize);

    tabelaClientesBody.innerHTML = '';

    if (lista.length === 0) {
        tabelaClientes.style.display = 'none';
        paginacaoClientes.style.display = 'none';
        listaClientesVazia.innerHTML = '<p>Nenhum cliente encontrado.</p>';
        listaClientesVazia.style.display = 'block';
        return;
    }

    listaClientesVazia.style.display = 'none';
    tabelaClientes.style.display = 'table';
    paginacaoClientes.style.display = 'flex';
    paginacaoClientesInfo.textContent = `${inicio + 1}–${Math.min(inicio + pageSize, lista.length)} de ${lista.length}`;
    pagClientesPagina.textContent = `${clientesPaginaAtual}/${totalPaginas}`;
    pagClientesPrev.disabled = clientesPaginaAtual <= 1;
    pagClientesNext.disabled = clientesPaginaAtual >= totalPaginas;

    paginados.forEach((cliente) => {
        const dados = cliente;
        const docId = cliente.id;
        const statusCliente = dados.status_conta || 'ativo';
        const nomeCliente = escapeHTML(dados.nome_completo || dados.email);
        const tr = document.createElement('tr');

        let inlineHtml = `
            <button class="btn btn-sm btn-detalhes-cliente-dash" data-id="${docId}" style="background:var(--cor-info, #17a2b8);color:#fff;border:none;" title="Detalhes">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="btn btn-sm btn-editar-cliente" data-id="${docId}" style="background:var(--cor-primaria);color:#fff;border:none;" title="Editar cliente">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
            </button>
            <button class="btn btn-sm btn-adicionar-fatura-cliente" data-id="${docId}" data-nome="${nomeCliente}" style="background:var(--cor-secundaria, #6c757d);color:#fff;border:none;" title="Adicionar Fatura">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" x2="12" y1="18" y2="12"></line><line x1="9" x2="15" y1="15" y2="15"></line></svg>
            </button>`;

        let menuHtml = `
            <button class="acoes-menu-item btn-detalhes-cliente-dash" data-id="${docId}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                Detalhes
            </button>
            <button class="acoes-menu-item btn-editar-cliente" data-id="${docId}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                Editar
            </button>
            <button class="acoes-menu-item btn-reenviar-senha" data-id="${docId}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                Reenviar Senha
            </button>
            <button class="acoes-menu-item btn-renovar" data-id="${docId}" data-dias="30" data-nome="${nomeCliente}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                Renovar +30 dias
            </button>
            <button class="acoes-menu-item btn-renovar" data-id="${docId}" data-dias="60" data-nome="${nomeCliente}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                Renovar +60 dias
            </button>
            <button class="acoes-menu-item btn-historico-cliente" data-id="${docId}" data-nome="${nomeCliente}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Histórico
            </button>
            <button class="acoes-menu-item btn-adicionar-fatura-cliente" data-id="${docId}" data-nome="${nomeCliente}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" x2="12" y1="18" y2="12"></line><line x1="9" x2="15" y1="15" y2="15"></line></svg>
                Adicionar Fatura
            </button>`;

        if (statusCliente === 'ativo') {
            inlineHtml += `
                <button class="btn btn-sm btn-alterar-status" data-id="${docId}" data-nome="${nomeCliente}" data-novo-status="suspenso" style="background:var(--cor-pendente);color:#fff;border:none;" title="Suspender cliente">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                </button>`;
            menuHtml += `
                <button class="acoes-menu-item btn-alterar-status" data-id="${docId}" data-nome="${nomeCliente}" data-novo-status="suspenso">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    Suspender
                </button>
                <button class="acoes-menu-item item-perigo btn-alterar-status" data-id="${docId}" data-nome="${nomeCliente}" data-novo-status="excluido">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Excluir
                </button>`;
        } else if (statusCliente === 'suspenso') {
            inlineHtml += `
                <button class="btn btn-sm btn-alterar-status" data-id="${docId}" data-nome="${nomeCliente}" data-novo-status="ativo" style="background:var(--cor-sucesso);color:#fff;border:none;" title="Ativar cliente">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>`;
            menuHtml += `
                <button class="acoes-menu-item btn-alterar-status" data-id="${docId}" data-nome="${nomeCliente}" data-novo-status="ativo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Ativar
                </button>
                <button class="acoes-menu-item item-perigo btn-alterar-status" data-id="${docId}" data-nome="${nomeCliente}" data-novo-status="excluido">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Excluir
                </button>`;
        } else {
            inlineHtml += `
                <button class="btn btn-sm btn-alterar-status" data-id="${docId}" data-nome="${nomeCliente}" data-novo-status="ativo" style="background:var(--cor-sucesso);color:#fff;border:none;" title="Reativar cliente">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>`;
        }

        const dotsSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>';

        // Indicador visual de situação
        const calcSit = calcularDiasRestantes(dados.data_vencimento_cliente, dados.hora_validade);
        let indicador = '';
        let indicadorClasse = '';
        if (statusCliente === 'suspenso') {
            indicador = '⚫ Suspenso'; indicadorClasse = 'indicador-suspenso';
        } else if (typeof calcSit.dias === 'number') {
            if (calcSit.dias > 0) { indicador = '🟢 Não expirado'; indicadorClasse = 'indicador-ok'; }
            else if (calcSit.dias === 0) { indicador = '🟡 Vence hoje'; indicadorClasse = 'indicador-alerta'; }
            else { indicador = '🔴 Expirado'; indicadorClasse = 'indicador-expirado'; }
        } else {
            indicador = '--'; indicadorClasse = '';
        }

        // Botão WhatsApp Enviar (submenu com categorias)
        const telWhatsApp = formatarTelefoneWhatsApp(dados.telefone);
        if (telWhatsApp) {
            const calcWA = calcularDiasRestantes(dados.data_vencimento_cliente, dados.hora_validade);
            const waVars = {
                '%nome%': dados.nome_completo || '',
                '%data_vencimento%': dados.data_vencimento_cliente || '',
                '%email%': dados.email || '',
                '%telefone%': dados.telefone || '',
                '%pacote%': dados.pacote || '',
                '%usuario%': dados.usuario || '',
                '%senha%': dados.senha_servico || '',
                '%situacao%': calcWA.situacao || '',
                '%dias_restantes%': String(calcWA.dias)
            };
            function gerarLinkWA(template) {
                let msg = template;
                for (const [k, v] of Object.entries(waVars)) msg = msg.replace(new RegExp(k.replace(/%/g, '%'), 'g'), v);
                return `https://wa.me/${encodeURIComponent(telWhatsApp)}?text=${encodeURIComponent(msg)}`;
            }
            const categoriaLabels = { cobranca: 'Cobrança', boas_vindas: 'Boas-vindas', renovacao: 'Renovação', aviso: 'Aviso', personalizada: 'Personalizada' };
            if (whatsAppMensagens.length > 0) {
                let waSubItems = whatsAppMensagens.map(m =>
                    `<a class="acoes-submenu-item" href="${gerarLinkWA(m.texto)}" target="_blank" rel="noopener noreferrer">${escapeHTML(categoriaLabels[m.categoria] || m.categoria)}</a>`
                ).join('');
                menuHtml += `
                <div class="acoes-menu-item acoes-submenu-trigger" style="position:relative;cursor:pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;color:#25D366;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.339 0-4.508-.758-6.262-2.044l-.438-.327-2.67.895.895-2.67-.327-.438A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    Enviar via WhatsApp ▸
                    <div class="acoes-submenu">${waSubItems}</div>
                </div>`;
            } else {
                const whatsAppLink = gerarLinkWA(whatsAppTemplate);
                menuHtml += `
                <a class="acoes-menu-item btn-whatsapp-cobrar" href="${whatsAppLink}" target="_blank" rel="noopener noreferrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;color:#25D366;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.339 0-4.508-.758-6.262-2.044l-.438-.327-2.67.895.895-2.67-.327-.438A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    Enviar via WhatsApp
                </a>`;
            }
        }

        // Observação administrativa
        const obsTexto = dados.observacao ? escapeHTML(dados.observacao) : '';
        const obsHtml = obsTexto
            ? `<span class="obs-icon" title="${obsTexto}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--cor-primaria)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></span>`
            : '<span class="obs-icon obs-vazio">--</span>';

        tr.innerHTML = `
            <td class="celula-truncada" title="${escapeHTML(dados.nome_completo || '--')}">${escapeHTML(dados.nome_completo || '--')}</td>
            <td class="celula-truncada col-email-clientes" style="font-size:var(--fonte-tamanho-xs);" title="${escapeHTML(dados.email || '--')}">${escapeHTML(dados.email || '--')}</td>
            <td><span class="badge badge-${statusCliente}">${statusCliente}</span></td>
            <td><span class="indicador-situacao ${indicadorClasse}">${indicador}</span></td>
            <td class="td-obs">${obsHtml}</td>
            <td class="acoes">
                <div class="acoes-container">
                    <div class="acoes-inline">${inlineHtml}</div>
                    <button class="btn-mais-acoes" title="Mais ações">${dotsSvg}</button>
                    <div class="acoes-menu">${menuHtml}</div>
                </div>
            </td>
        `;
        tabelaClientesBody.appendChild(tr);
    });

    // Event listeners
    document.querySelectorAll('.btn-alterar-status').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const botao = e.currentTarget;
            const clienteId = botao.dataset.id;
            const nomeC = botao.dataset.nome;
            const novoSt = botao.dataset.novoStatus;
            botao.disabled = true;
            try {
                await updateDoc(doc(db, 'clientes', clienteId), { status_conta: novoSt });
                const labelsStatus = { 'ativo': 'ativado', 'suspenso': 'suspenso', 'excluido': 'excluído' };
                await registrarLog('cliente_status', `Cliente "${nomeC}" marcado como ${novoSt}`);
                mostrarToast(`Cliente "${nomeC}" ${labelsStatus[novoSt]} com sucesso!`, 'sucesso');
                await carregarClientes();
            } catch (error) {
                console.error('Erro ao alterar status:', error);
                mostrarToast('Erro ao alterar status do cliente.', 'erro');
                botao.disabled = false;
            }
        });
    });

    document.querySelectorAll('.btn-editar-cliente').forEach(btn => {
        btn.addEventListener('click', (e) => {
            abrirModalEditarCliente(e.currentTarget.dataset.id);
        });
    });

    document.querySelectorAll('.btn-reenviar-senha').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const clienteId = e.currentTarget.dataset.id;
            const dados = clientesCache[clienteId];
            if (!dados || !dados.email) { mostrarToast('E-mail do cliente não encontrado.', 'erro'); return; }
            const botao = e.currentTarget;
            botao.disabled = true;
            try {
                await sendPasswordResetEmail(auth, dados.email);
                mostrarToast(`E-mail de redefinição enviado para ${escapeHTML(dados.email)}!`, 'sucesso');
            } catch (error) {
                console.error('Erro ao reenviar e-mail:', error);
                mostrarToast('Erro ao reenviar e-mail de redefinição.', 'erro');
            }
            botao.disabled = false;
        });
    });

    // Renovação rápida (+30 / +60 dias)
    document.querySelectorAll('.btn-renovar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const botao = e.currentTarget;
            const clienteId = botao.dataset.id;
            const dias = parseInt(botao.dataset.dias, 10);
            const nomeC = botao.dataset.nome;
            const dados = clientesCache[clienteId];
            if (!dados) { mostrarToast('Dados do cliente não encontrados.', 'erro'); return; }
            botao.disabled = true;
            try {
                let dataBase = parseDateDDMMAAAA(dados.data_vencimento_cliente);
                if (!dataBase) dataBase = new Date();
                dataBase.setDate(dataBase.getDate() + dias);
                const novaData = formatDateDDMMAAAA(dataBase);
                const agora = new Date();
                const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
                await updateDoc(doc(db, 'clientes', clienteId), {
                    data_vencimento_cliente: novaData,
                    hora_validade: horaAtual
                });
                clientesCache[clienteId].data_vencimento_cliente = novaData;
                clientesCache[clienteId].hora_validade = horaAtual;
                await registrarLog('cliente_renovado', `Cliente "${nomeC}" renovado +${dias} dias. Novo vencimento: ${novaData}`);
                mostrarToast(`Cliente "${nomeC}" renovado +${dias} dias! Novo vencimento: ${novaData}`, 'sucesso');
                await carregarClientes();
            } catch (error) {
                console.error('Erro ao renovar cliente:', error);
                mostrarToast('Erro ao renovar cliente.', 'erro');
                botao.disabled = false;
            }
        });
    });

    // Histórico de ações por cliente
    document.querySelectorAll('.btn-historico-cliente').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const clienteId = e.currentTarget.dataset.id;
            const nomeC = e.currentTarget.dataset.nome;
            abrirModalHistoricoCliente(clienteId, nomeC);
        });
    });

    // Adicionar Fatura para cliente
    document.querySelectorAll('.btn-adicionar-fatura-cliente').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const clienteId = e.currentTarget.dataset.id;
            const dados = clientesCache[clienteId];
            if (!dados) { mostrarToast('Dados do cliente não encontrados.', 'erro'); return; }
            // Navegar para a página de faturas
            document.querySelectorAll('.nav-link').forEach(nl => {
                if (nl.dataset.pagina === 'faturas') nl.click();
            });
            // Preencher dados do cliente no formulário de nova fatura
            clienteEmailInput.value = dados.nome_completo || dados.email || '';
            clienteNomeEncontrado.textContent = `${dados.nome_completo} (${dados.status_conta})`;
            clienteUid.textContent = clienteId;
            clienteInfo.style.display = 'block';
            clienteNaoEncontrado.style.display = 'none';
            // Auto-preencher data de vencimento e hora
            if (dados.data_vencimento_cliente) {
                const dtVenc = parseDateDDMMAAAA(dados.data_vencimento_cliente);
                if (dtVenc) {
                    const yyyy = dtVenc.getFullYear();
                    const mm = String(dtVenc.getMonth() + 1).padStart(2, '0');
                    const dd = String(dtVenc.getDate()).padStart(2, '0');
                    dataVencimentoInput.value = `${yyyy}-${mm}-${dd}`;
                }
            }
            if (dados.hora_validade && horaValidadeFaturaInput) {
                horaValidadeFaturaInput.value = dados.hora_validade;
            }
        });
    });
}

// Filtros de clientes
filtroClientesNome.addEventListener('input', () => { clientesPaginaAtual = 1; renderizarTabelaClientes(getClientesFiltrados()); });
filtroClientesStatus.addEventListener('change', () => { clientesPaginaAtual = 1; renderizarTabelaClientes(getClientesFiltrados()); });

// Filtros rápidos de clientes
let filtroRapidoAtivo = 'todos';
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-filtro-rapido');
    if (!btn) return;
    document.querySelectorAll('.btn-filtro-rapido').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    filtroRapidoAtivo = btn.dataset.filtro;
    filtroClientesStatus.value = '';
    clientesPaginaAtual = 1;
    renderizarTabelaClientes(getClientesFiltrados());
});

// Exportar clientes
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-exportar-clientes]');
    if (btn) exportarClientes(btn.dataset.exportarClientes);
    const btnLog = e.target.closest('[data-exportar-logs]');
    if (btnLog) exportarLogs(btnLog.dataset.exportarLogs);
});

// Paginação de clientes
paginacaoClientesSize.addEventListener('change', () => { clientesPaginaAtual = 1; renderizarTabelaClientes(getClientesFiltrados()); });
pagClientesPrev.addEventListener('click', () => { if (clientesPaginaAtual > 1) { clientesPaginaAtual--; renderizarTabelaClientes(getClientesFiltrados()); } });
pagClientesNext.addEventListener('click', () => { clientesPaginaAtual++; renderizarTabelaClientes(getClientesFiltrados()); });

// ========================================
// MENSAGENS PERSONALIZADAS (CRUD)
// ========================================
let mensagensLista = [];

async function carregarMensagens() {
    try {
        const docRef = doc(db, 'configuracoes', 'mensagens');
        const docSnap = await getDoc(docRef);
        let precisaMigrar = false;
        if (docSnap.exists()) {
            const dados = docSnap.data();
            if (dados.lista && Array.isArray(dados.lista)) {
                mensagensLista = dados.lista;
                mensagensLista.forEach((msg, i) => {
                    if (msg.ativa === undefined) { msg.ativa = true; precisaMigrar = true; }
                    if (msg.ordem === undefined) { msg.ordem = i + 1; precisaMigrar = true; }
                });
            } else if (dados.mensagem_usuario_excluido) {
                mensagensLista = [{
                    id: gerarIdMensagem(),
                    texto: dados.mensagem_usuario_excluido,
                    destino: 'excluido',
                    ativa: true,
                    ordem: 1,
                    criadoEm: new Date().toISOString()
                }];
                precisaMigrar = true;
            } else {
                mensagensLista = [];
            }
        } else {
            mensagensLista = [];
        }
        mensagensLista.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        if (precisaMigrar && mensagensLista.length > 0) {
            await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
        }
        renderizarListaMensagens();
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
    }
}

function gerarIdMensagem() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Toggle para clientes específicos
msgDestino.addEventListener('change', () => {
    msgClientesAlvoGrupo.style.display = msgDestino.value === 'clientes_especificos' ? 'block' : 'none';
    if (msgDestino.value === 'clientes_especificos') preencherCheckboxesClientes(msgClientesAlvo, []);
});

editarMsgDestino.addEventListener('change', () => {
    editarMsgClientesAlvoGrupo.style.display = editarMsgDestino.value === 'clientes_especificos' ? 'block' : 'none';
    if (editarMsgDestino.value === 'clientes_especificos') preencherCheckboxesClientes(editarMsgClientesAlvo, []);
});

function preencherCheckboxesClientes(container, selecionados) {
    container.innerHTML = '';
    const clientes = Object.entries(clientesCache);
    if (clientes.length === 0) {
        container.innerHTML = '<p style="font-size:var(--fonte-tamanho-xs);color:var(--cor-texto-claro);">Nenhum cliente cadastrado.</p>';
        return;
    }
    clientes.forEach(([uid, dados]) => {
        const label = document.createElement('label');
        const checked = selecionados.includes(uid) ? 'checked' : '';
        label.innerHTML = `<input type="checkbox" value="${uid}" ${checked}> ${escapeHTML(dados.nome_completo || dados.email)} <small style="color:var(--cor-texto-claro);">(${dados.email})</small>`;
        container.appendChild(label);
    });
}

function getClientesSelecionados(container) {
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
}

function renderizarListaMensagens() {
    if (!listaMensagensEl) return;
    listaMensagensEl.innerHTML = '';

    if (mensagensLista.length === 0) {
        listaMensagensEl.innerHTML = '<p style="font-size:var(--fonte-tamanho-sm);color:var(--cor-texto-claro);text-align:center;padding:var(--espacamento-md);">Nenhuma mensagem cadastrada.</p>';
        return;
    }

    const labelsDestino = { 'ativo': 'Ativo', 'suspenso': 'Suspenso', 'excluido': 'Excluído', 'clientes_especificos': 'Específicos' };
    const coresDestino = { 'ativo': 'var(--cor-sucesso)', 'suspenso': 'var(--cor-pendente)', 'excluido': 'var(--cor-erro)', 'clientes_especificos': 'var(--cor-primaria)' };

    mensagensLista.forEach((msg, index) => {
        const isAtiva = msg.ativa !== false;
        const estilosPreview = [];
        if (msg.corFundo && msg.corFundo !== '#ffffff') estilosPreview.push(`background-color:${msg.corFundo};padding:6px 8px;border-radius:4px`);
        if (msg.fonte && msg.fonte !== 'Inter') estilosPreview.push(`font-family:'${msg.fonte}',sans-serif`);
        const estiloAttr = estilosPreview.length > 0 ? ` style="${estilosPreview.join(';')}"` : '';
        const item = document.createElement('div');
        item.className = `lista-mensagens-item${!isAtiva ? ' msg-desativada' : ''}`;

        let destinoLabel = labelsDestino[msg.destino] || msg.destino;
        if (msg.destino === 'clientes_especificos' && msg.clientesAlvo && msg.clientesAlvo.length > 0) {
            const nomes = msg.clientesAlvo.map(uid => clientesCache[uid]?.nome_completo || uid).slice(0, 3);
            destinoLabel += `: ${nomes.join(', ')}${msg.clientesAlvo.length > 3 ? '...' : ''}`;
        }

        item.innerHTML = `
            <div class="msg-ordem-controles">
                <button class="btn-ordem btn-ordem-subir" data-msg-id="${msg.id}" ${index === 0 ? 'disabled' : ''} title="Subir">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><polyline points="18 15 12 9 6 15"></polyline></svg>
                </button>
                <span class="msg-ordem-numero">${index + 1}</span>
                <button class="btn-ordem btn-ordem-descer" data-msg-id="${msg.id}" ${index === mensagensLista.length - 1 ? 'disabled' : ''} title="Descer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
            </div>
            <div class="msg-conteudo">
                <div class="msg-destino" style="color:${coresDestino[msg.destino] || 'var(--cor-texto-claro)'};">
                    Para: ${escapeHTML(destinoLabel)}
                    <span class="msg-status-badge ${isAtiva ? 'msg-badge-ativa' : 'msg-badge-desativada'}">${isAtiva ? 'Ativa' : 'Desativada'}</span>
                </div>
                ${msg.titulo ? `<div class="msg-titulo-preview">${escapeHTML(msg.titulo)}</div>` : ''}
                <div class="msg-texto"${estiloAttr}>${msg.texto}</div>
            </div>
            <div class="msg-acoes">
                <div class="acoes-container">
                    <div class="acoes-inline">
                        <button class="btn-editar-msg" data-msg-id="${msg.id}" title="Editar mensagem">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--cor-primaria)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                        </button>
                        <button class="btn-toggle-msg" data-msg-id="${msg.id}" title="${isAtiva ? 'Desativar' : 'Ativar'} mensagem">
                            ${isAtiva
                ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--cor-pendente)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--cor-sucesso)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            }
                        </button>
                    </div>
                    <button class="btn-mais-acoes" title="Mais ações">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                    </button>
                    <div class="acoes-menu">
                        <button class="acoes-menu-item item-perigo btn-excluir-msg" data-msg-id="${msg.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
        listaMensagensEl.appendChild(item);
    });

    // Toggle
    listaMensagensEl.querySelectorAll('.btn-toggle-msg').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const msgId = e.currentTarget.dataset.msgId;
            const msg = mensagensLista.find(m => m.id === msgId);
            if (!msg) return;
            msg.ativa = msg.ativa === false ? true : false;
            try {
                await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
                mostrarToast(msg.ativa ? 'Mensagem ativada.' : 'Mensagem desativada.', 'sucesso');
                renderizarListaMensagens();
            } catch (error) {
                console.error('Erro ao alterar status da mensagem:', error);
                mostrarToast('Erro ao alterar status.', 'erro');
            }
        });
    });

    // Subir
    listaMensagensEl.querySelectorAll('.btn-ordem-subir').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const msgId = e.currentTarget.dataset.msgId;
            const idx = mensagensLista.findIndex(m => m.id === msgId);
            if (idx <= 0) return;
            [mensagensLista[idx - 1], mensagensLista[idx]] = [mensagensLista[idx], mensagensLista[idx - 1]];
            recalcularOrdem();
            try {
                await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
                renderizarListaMensagens();
            } catch (error) {
                console.error('Erro ao reordenar:', error);
                mostrarToast('Erro ao reordenar mensagem.', 'erro');
            }
        });
    });

    // Descer
    listaMensagensEl.querySelectorAll('.btn-ordem-descer').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const msgId = e.currentTarget.dataset.msgId;
            const idx = mensagensLista.findIndex(m => m.id === msgId);
            if (idx < 0 || idx >= mensagensLista.length - 1) return;
            [mensagensLista[idx], mensagensLista[idx + 1]] = [mensagensLista[idx + 1], mensagensLista[idx]];
            recalcularOrdem();
            try {
                await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
                renderizarListaMensagens();
            } catch (error) {
                console.error('Erro ao reordenar:', error);
                mostrarToast('Erro ao reordenar mensagem.', 'erro');
            }
        });
    });

    // Editar
    listaMensagensEl.querySelectorAll('.btn-editar-msg').forEach(btn => {
        btn.addEventListener('click', (e) => {
            abrirModalEditarMensagem(e.currentTarget.dataset.msgId);
        });
    });

    // Excluir
    listaMensagensEl.querySelectorAll('.btn-excluir-msg').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const msgId = e.currentTarget.dataset.msgId;
            const confirmou = await confirmarAcao('Tem certeza que deseja excluir esta mensagem?');
            if (confirmou) {
                mensagensLista = mensagensLista.filter(m => m.id !== msgId);
                recalcularOrdem();
                try {
                    await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
                    await registrarLog('mensagem_excluida', 'Mensagem excluída');
                    mostrarToast('Mensagem excluída.', 'sucesso');
                    renderizarListaMensagens();
                } catch (error) {
                    console.error('Erro ao excluir mensagem:', error);
                    mostrarToast('Erro ao excluir mensagem.', 'erro');
                }
            }
        });
    });
}

function recalcularOrdem() {
    mensagensLista.forEach((msg, i) => { msg.ordem = i + 1; });
}

// Formatação por seleção (criação) - execCommand
msgNegritoBotao.addEventListener('mousedown', (e) => { e.preventDefault(); document.execCommand('bold'); });
msgItalicoBotao.addEventListener('mousedown', (e) => { e.preventDefault(); document.execCommand('italic'); });
msgCorTexto.addEventListener('mousedown', salvarSelecao);
msgCorTexto.addEventListener('input', () => { restaurarSelecao(); document.execCommand('foreColor', false, msgCorTexto.value); });
msgFonte.addEventListener('mousedown', salvarSelecao);
msgFonte.addEventListener('change', () => { restaurarSelecao(); document.execCommand('fontName', false, msgFonte.value); });

// Alinhamento (criação)
document.querySelectorAll('.btn-align-cmd').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd);
    });
});

// Alinhamento (edição)
document.querySelectorAll('.btn-align-cmd-edit').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.execCommand(btn.dataset.cmd);
    });
});

btnSalvarMensagens.addEventListener('click', async () => {
    const texto = msgTexto.innerHTML.trim();
    const destino = msgDestino.value;

    if (!texto || texto === '<br>') {
        mostrarToast('Digite o texto da mensagem.', 'erro');
        return;
    }

    btnSalvarMensagens.disabled = true;
    btnSalvarMsgTexto.style.display = 'none';
    btnSalvarMsgSpinner.style.display = 'block';

    try {
        const maiorOrdem = mensagensLista.reduce((max, m) => Math.max(max, m.ordem || 0), 0);
        const novaMensagem = {
            id: gerarIdMensagem(),
            texto: texto,
            destino: destino,
            ativa: true,
            ordem: maiorOrdem + 1,
            criadoEm: new Date().toISOString(),
            titulo: msgTitulo.value.trim(),
            corFundo: msgCorFundo.value,
            fonte: msgFonte.value
        };

        if (destino === 'clientes_especificos') {
            novaMensagem.clientesAlvo = getClientesSelecionados(msgClientesAlvo);
            if (novaMensagem.clientesAlvo.length === 0) {
                mostrarToast('Selecione pelo menos um cliente.', 'erro');
                btnSalvarMensagens.disabled = false;
                btnSalvarMsgTexto.style.display = 'inline';
                btnSalvarMsgSpinner.style.display = 'none';
                return;
            }
        }

        mensagensLista.push(novaMensagem);

        await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
        await registrarLog('mensagem_criada', `Mensagem criada para ${destino}`);
        mostrarToast('Mensagem salva com sucesso!', 'sucesso');
        msgTexto.innerHTML = '';
        msgTitulo.value = '';
        msgCorTexto.value = '#333333';
        msgCorFundo.value = '#ffffff';
        msgFonte.value = 'Inter';
        msgDestino.value = 'excluido';
        msgClientesAlvoGrupo.style.display = 'none';
        renderizarListaMensagens();
    } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
        mostrarToast('Erro ao salvar mensagem.', 'erro');
    }

    btnSalvarMensagens.disabled = false;
    btnSalvarMsgTexto.style.display = 'inline';
    btnSalvarMsgSpinner.style.display = 'none';
});

// ========================================
// CARREGAR FATURAS (com filtro + paginação)
// ========================================
async function carregarFaturas() {
    try {
        const faturasRef = collection(db, 'faturas');
        const q = query(faturasRef, orderBy('data_geracao', 'desc'));
        const snap = await getDocs(q);

        faturasCache = {};
        allFaturasDocs = [];

        snap.forEach((docSnap) => {
            const dados = docSnap.data();
            faturasCache[docSnap.id] = dados;
            allFaturasDocs.push({ id: docSnap.id, ...dados });
        });

        renderizarTabelaFaturas();
    } catch (error) {
        console.error('Erro ao carregar faturas:', error);
        listaFaturasVazia.innerHTML = '<p style="color:var(--cor-erro);">Erro ao carregar faturas.</p>';
    }
}

function getFaturasFiltradas() {
    const filtroCliente = (filtroFaturasCliente.value || '').trim().toLowerCase();
    const filtroRef = (filtroFaturasRef.value || '').trim().toLowerCase();
    const filtroStatus = filtroFaturasStatus.value;
    let lista = [...allFaturasDocs];

    if (filtroCliente) {
        lista = lista.filter(f => {
            const dados = clientesCache[f.id_cliente];
            const nome = (dados?.nome_completo || '').toLowerCase();
            const email = (dados?.email || '').toLowerCase();
            return nome.includes(filtroCliente) || email.includes(filtroCliente);
        });
    }
    if (filtroRef) {
        lista = lista.filter(f => (f.mes_referencia || '').toLowerCase().includes(filtroRef));
    }
    if (filtroStatus) {
        lista = lista.filter(f => f.status_pagamento === filtroStatus);
    }
    return lista;
}

function renderizarTabelaFaturas() {
    const lista = getFaturasFiltradas();
    const pageSize = parseInt(paginacaoFaturasSize.value, 10);
    const totalPaginas = Math.max(1, Math.ceil(lista.length / pageSize));
    if (faturasPaginaAtual > totalPaginas) faturasPaginaAtual = totalPaginas;
    const inicio = (faturasPaginaAtual - 1) * pageSize;
    const paginados = lista.slice(inicio, inicio + pageSize);

    tabelaFaturasBody.innerHTML = '';

    if (lista.length === 0) {
        tabelaFaturas.style.display = 'none';
        paginacaoFaturas.style.display = 'none';
        listaFaturasVazia.innerHTML = '<p>Nenhuma fatura encontrada.</p>';
        listaFaturasVazia.style.display = 'block';
        return;
    }

    listaFaturasVazia.style.display = 'none';
    tabelaFaturas.style.display = 'table';
    paginacaoFaturas.style.display = 'flex';
    paginacaoFaturasInfo.textContent = `${inicio + 1}–${Math.min(inicio + pageSize, lista.length)} de ${lista.length}`;
    pagFaturasPagina.textContent = `${faturasPaginaAtual}/${totalPaginas}`;
    pagFaturasPrev.disabled = faturasPaginaAtual <= 1;
    pagFaturasNext.disabled = faturasPaginaAtual >= totalPaginas;

    paginados.forEach((fatura) => {
        const dados = fatura;
        const docId = fatura.id;
        const dadosCliente = clientesCache[dados.id_cliente];
        const nomeCliente = dadosCliente?.nome_completo || dadosCliente?.email || dados.id_cliente;
        const statusAtual = dados.status_pagamento || 'pendente';
        const isPendente = statusAtual === 'pendente';

        const tr = document.createElement('tr');

        let inlineHtml = `
            <button class="btn btn-sm btn-editar-fatura" data-id="${docId}" style="background:var(--cor-primaria);color:#fff;border:none;" title="Editar fatura">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
            </button>`;

        if (dados.url_pdf_cloudinary) {
            inlineHtml += `<a href="${escapeHTML(dados.url_pdf_cloudinary)}" target="_blank" rel="noopener noreferrer" class="btn btn-secundario btn-sm">PDF</a>`;
        }

        if (isPendente) {
            inlineHtml += `
                <button class="btn btn-sm btn-marcar-pago" data-id="${docId}" style="background:var(--cor-sucesso);color:#fff;border:none;" title="Marcar como Pago">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </button>`;
        } else {
            inlineHtml += `
                <button class="btn btn-sm btn-marcar-pendente" data-id="${docId}" style="background:var(--cor-pendente);color:#fff;border:none;" title="Marcar como Pendente">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </button>`;
        }

        let menuHtml = `
            <button class="acoes-menu-item btn-editar-fatura" data-id="${docId}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                Editar Fatura
            </button>`;

        if (dados.url_pdf_cloudinary) {
            menuHtml += `<a class="acoes-menu-item" href="${escapeHTML(dados.url_pdf_cloudinary)}" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Ver PDF
            </a>`;
        }

        if (isPendente) {
            menuHtml += `<button class="acoes-menu-item btn-marcar-pago" data-id="${docId}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Marcar como Pago
            </button>`;
        } else {
            menuHtml += `<button class="acoes-menu-item btn-marcar-pendente" data-id="${docId}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Marcar como Pendente
            </button>`;
        }

        menuHtml += `
            <button class="acoes-menu-item item-perigo btn-deletar-fatura" data-id="${docId}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Excluir
            </button>`;

        const dotsSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>';

        tr.innerHTML = `
            <td class="col-uid-faturas" style="font-size:var(--fonte-tamanho-xs);font-family:monospace;" title="${escapeHTML(dados.id_cliente || '--')}">${escapeHTML((dados.id_cliente || '--').substring(0, 8))}…</td>
            <td class="celula-truncada" style="font-size:var(--fonte-tamanho-xs);" title="${escapeHTML(nomeCliente)}">${escapeHTML(nomeCliente)}</td>
            <td>${escapeHTML(dados.mes_referencia || '--')}</td>
            <td class="col-vencimento-faturas">${escapeHTML(formatarVencimentoFatura(dados.data_vencimento))}</td>
            <td><span class="badge badge-${statusAtual}">${statusAtual}</span></td>
            <td class="acoes">
                <div class="acoes-container">
                    <div class="acoes-inline">${inlineHtml}</div>
                    <button class="btn-mais-acoes" title="Mais ações">${dotsSvg}</button>
                    <div class="acoes-menu">${menuHtml}</div>
                </div>
            </td>
        `;
        tabelaFaturasBody.appendChild(tr);
    });

    // Marcar como PAGO (sempre mostra modal com data sugerida ou vazia)
    document.querySelectorAll('.btn-marcar-pago').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const faturaId = e.currentTarget.dataset.id;
            const fatura = faturasCache[faturaId];
            try {
                // Verificar se o cliente está expirado e calcular sugestão
                let clienteExpirado = false;
                let dataSugerida = '';
                let horaSugerida = '';
                if (fatura && fatura.id_cliente) {
                    const clienteData = clientesCache[fatura.id_cliente];
                    if (clienteData && clienteData.data_vencimento_cliente) {
                        const dataVencAtual = parseDateDDMMAAAA(clienteData.data_vencimento_cliente);
                        if (dataVencAtual) {
                            if (clienteData.hora_validade) {
                                const partes = clienteData.hora_validade.split(':');
                                dataVencAtual.setHours(parseInt(partes[0], 10) || 0, parseInt(partes[1], 10) || 0, 0, 0);
                            } else {
                                dataVencAtual.setHours(23, 59, 59, 999);
                            }
                            clienteExpirado = dataVencAtual.getTime() <= Date.now();
                            if (!clienteExpirado) {
                                // Sugerir +30 dias a partir do vencimento atual
                                const dataBase = parseDateDDMMAAAA(clienteData.data_vencimento_cliente);
                                dataBase.setDate(dataBase.getDate() + 30);
                                dataSugerida = formatDateDDMMAAAA(dataBase);
                                const agora = new Date();
                                horaSugerida = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
                            }
                        }
                    }
                }

                const novaDataInfo = await pedirNovaDataVencimento(dataSugerida, horaSugerida);
                if (!novaDataInfo) return; // Cancelou

                await updateDoc(doc(db, 'faturas', faturaId), { status_pagamento: 'pago' });

                if (fatura && fatura.id_cliente) {
                    await updateDoc(doc(db, 'clientes', fatura.id_cliente), {
                        data_vencimento_cliente: novaDataInfo.data,
                        hora_validade: novaDataInfo.hora
                    });
                    clientesCache[fatura.id_cliente].data_vencimento_cliente = novaDataInfo.data;
                    clientesCache[fatura.id_cliente].hora_validade = novaDataInfo.hora;
                }

                const logMsg = clienteExpirado
                    ? `Fatura ${fatura?.mes_referencia || faturaId} marcada como PAGO (cliente expirado, novo vencimento: ${novaDataInfo.data} ${novaDataInfo.hora})`
                    : `Fatura ${fatura?.mes_referencia || faturaId} marcada como PAGO (novo vencimento: ${novaDataInfo.data} ${novaDataInfo.hora})`;
                await registrarLog('fatura_pago', logMsg);
                mostrarToast('Fatura marcada como PAGO! Novo vencimento definido.', 'sucesso');

                incrementarFaturasPagas();
                await carregarFaturas();
            } catch (error) {
                console.error('Erro ao atualizar:', error);
                mostrarToast('Erro ao atualizar status.', 'erro');
            }
        });
    });

    // Marcar como PENDENTE (requer motivo)
    document.querySelectorAll('.btn-marcar-pendente').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const faturaId = e.currentTarget.dataset.id;
            const motivo = await pedirMotivo();
            if (!motivo) return;

            try {
                await updateDoc(doc(db, 'faturas', faturaId), {
                    status_pagamento: 'pendente',
                    motivo_reversao: motivo
                });
                const fatura = faturasCache[faturaId];
                await registrarLog('fatura_pendente', `Fatura ${fatura?.mes_referencia || faturaId} revertida para PENDENTE. Motivo: ${motivo}`);
                mostrarToast('Fatura marcada como PENDENTE.', 'info');
                decrementarFaturasPagas();
                await carregarFaturas();
            } catch (error) {
                console.error('Erro ao atualizar:', error);
                mostrarToast('Erro ao atualizar status.', 'erro');
            }
        });
    });

    // Deletar
    document.querySelectorAll('.btn-deletar-fatura').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const faturaId = e.currentTarget.dataset.id;
            const confirmou = await confirmarAcao('Tem certeza que deseja excluir esta fatura?');
            if (confirmou) {
                try {
                    const fatura = faturasCache[faturaId];
                    await deleteDoc(doc(db, 'faturas', faturaId));
                    await registrarLog('fatura_excluida', `Fatura ${fatura?.mes_referencia || faturaId} excluída`);
                    mostrarToast('Fatura excluída.', 'sucesso');
                    await carregarFaturas();
                } catch (error) {
                    console.error('Erro ao excluir:', error);
                    mostrarToast('Erro ao excluir fatura.', 'erro');
                }
            }
        });
    });

    // Editar fatura
    document.querySelectorAll('.btn-editar-fatura').forEach(btn => {
        btn.addEventListener('click', (e) => {
            abrirModalEditarFatura(e.currentTarget.dataset.id);
        });
    });
}

// Filtros de faturas
filtroFaturasCliente.addEventListener('input', () => { faturasPaginaAtual = 1; renderizarTabelaFaturas(); });
filtroFaturasRef.addEventListener('input', () => { faturasPaginaAtual = 1; renderizarTabelaFaturas(); });
filtroFaturasStatus.addEventListener('change', () => { faturasPaginaAtual = 1; renderizarTabelaFaturas(); });

// Paginação de faturas
paginacaoFaturasSize.addEventListener('change', () => { faturasPaginaAtual = 1; renderizarTabelaFaturas(); });
pagFaturasPrev.addEventListener('click', () => { if (faturasPaginaAtual > 1) { faturasPaginaAtual--; renderizarTabelaFaturas(); } });
pagFaturasNext.addEventListener('click', () => { faturasPaginaAtual++; renderizarTabelaFaturas(); });

// ========================================
// MODAL MOTIVO DA REVERSÃO
// ========================================
function pedirMotivo() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-motivo');
        const textarea = document.getElementById('motivo-reversao');
        const btnConfirmar = document.getElementById('btn-motivo-confirmar');
        const btnCancelar = document.getElementById('btn-motivo-cancelar');
        const btnFechar = document.getElementById('btn-fechar-modal-motivo');

        textarea.value = '';
        overlay.style.display = 'flex';

        function limpar() {
            overlay.style.display = 'none';
            btnConfirmar.removeEventListener('click', confirmar);
            btnCancelar.removeEventListener('click', cancelar);
            btnFechar.removeEventListener('click', cancelar);
            overlay.removeEventListener('click', clickOverlay);
        }

        function confirmar() {
            const motivo = textarea.value.trim();
            if (!motivo) { mostrarToast('Informe o motivo da reversão.', 'erro'); return; }
            limpar();
            resolve(motivo);
        }
        function cancelar() { limpar(); resolve(null); }
        function clickOverlay(e) { if (e.target === overlay) cancelar(); }

        btnConfirmar.addEventListener('click', confirmar);
        btnCancelar.addEventListener('click', cancelar);
        btnFechar.addEventListener('click', cancelar);
        overlay.addEventListener('click', clickOverlay);
    });
}

// ========================================
// MODAL NOVA DATA DE VENCIMENTO (marcar como pago)
// ========================================
function pedirNovaDataVencimento(dataSugerida, horaSugerida) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-nova-data-vencimento');
        const inputData = document.getElementById('nova-data-venc-input');
        const inputHora = document.getElementById('nova-hora-venc-input');
        const btnConfirmar = document.getElementById('btn-nova-data-confirmar');
        const btnCancelar = document.getElementById('btn-nova-data-cancelar');
        const btnFechar = document.getElementById('btn-fechar-modal-nova-data');

        inputData.value = dataSugerida || '';
        inputHora.value = horaSugerida || '';
        overlay.style.display = 'flex';

        function limpar() {
            overlay.style.display = 'none';
            btnConfirmar.removeEventListener('click', confirmar);
            btnCancelar.removeEventListener('click', cancelar);
            btnFechar.removeEventListener('click', cancelar);
            overlay.removeEventListener('click', clickOverlay);
        }

        function confirmar() {
            const data = inputData.value.trim();
            const hora = inputHora.value.trim();
            if (!data) { mostrarToast('Informe a nova data de vencimento.', 'erro'); return; }
            if (!hora) { mostrarToast('Informe a hora de validade.', 'erro'); return; }
            const dataObj = parseDateDDMMAAAA(data);
            if (!dataObj) { mostrarToast('Data inválida. Use o formato DD/MM/AAAA.', 'erro'); return; }
            limpar();
            resolve({ data, hora });
        }
        function cancelar() { limpar(); resolve(null); }
        function clickOverlay(e) { if (e.target === overlay) cancelar(); }

        btnConfirmar.addEventListener('click', confirmar);
        btnCancelar.addEventListener('click', cancelar);
        btnFechar.addEventListener('click', cancelar);
        overlay.addEventListener('click', clickOverlay);
    });
}

// ========================================
// EDIÇÃO DE CLIENTES (Modal)
// ========================================
function abrirModalEditarCliente(clienteId) {
    const dados = clientesCache[clienteId];
    if (!dados) { mostrarToast('Dados do cliente não encontrados.', 'erro'); return; }
    editarClienteId.value = clienteId;
    editarClienteUid.value = clienteId;
    editarClienteNome.value = dados.nome_completo || '';
    editarClienteEmail.value = dados.email || '';
    editarClienteStatus.value = dados.status_conta || 'ativo';
    editarClienteUsuario.value = dados.usuario || '';
    editarClienteSenhaServico.value = dados.senha_servico || '';
    editarClienteDataVencimento.value = dados.data_vencimento_cliente || '';
    editarClienteHoraValidade.value = dados.hora_validade || '';
    editarClienteTelefone.value = dados.telefone || '';
    editarClientePacote.value = dados.pacote || '';
    editarClienteObservacao.value = dados.observacao || '';
    editarClienteCpf.value = dados.cpf || '';
    const end = dados.dados_endereco || {};
    editarClienteCep.value = end.cep || '';
    editarClienteEndereco.value = end.endereco || '';
    editarClienteNumero.value = end.numero || '';
    editarClienteComplemento.value = end.complemento || '';
    editarClienteBairro.value = end.bairro || '';
    editarClienteCidade.value = end.cidade || '';
    editarClienteEstado.value = end.estado || '';
    autoCalcDataVencimento(editarClienteDataVencimento, editarClienteHoraValidade, editarClienteDiasRestantes, editarClienteSituacao);

    // Verificar se o cliente tem fatura com status "pago" — bloquear vencimento/hora
    let temFaturaPaga = false;
    allFaturasDocs.forEach(f => {
        if (f.id_cliente === clienteId && f.status_pagamento === 'pago') {
            temFaturaPaga = true;
        }
    });

    editarClienteDataVencimento.disabled = temFaturaPaga;
    editarClienteHoraValidade.disabled = temFaturaPaga;
    editarClienteDataVencimento.style.opacity = temFaturaPaga ? '0.5' : '1';
    editarClienteHoraValidade.style.opacity = temFaturaPaga ? '0.5' : '1';
    if (avisoVencBloqueado) {
        avisoVencBloqueado.style.display = temFaturaPaga ? 'block' : 'none';
    }

    modalEditarCliente.style.display = 'flex';
}

function fecharModalEditarCliente() {
    modalEditarCliente.style.display = 'none';
    editarClienteId.value = '';
}

btnFecharModalCliente.addEventListener('click', fecharModalEditarCliente);
modalEditarCliente.addEventListener('click', (e) => { if (e.target === modalEditarCliente) fecharModalEditarCliente(); });

btnSalvarEdicaoCliente.addEventListener('click', async () => {
    const clienteId = editarClienteId.value;
    const nome = editarClienteNome.value.trim();
    const status = editarClienteStatus.value;

    if (!nome) { mostrarToast('Informe o nome do cliente.', 'erro'); return; }

    btnSalvarEdicaoCliente.disabled = true;
    btnSalvarEdicaoClienteTexto.style.display = 'none';
    btnSalvarEdicaoClienteSpinner.style.display = 'block';

    try {
        await updateDoc(doc(db, 'clientes', clienteId), {
            nome_completo: nome,
            status_conta: status,
            cpf: editarClienteCpf.value.trim(),
            usuario: editarClienteUsuario.value.trim(),
            senha_servico: editarClienteSenhaServico.value.trim(),
            data_vencimento_cliente: editarClienteDataVencimento.value.trim(),
            hora_validade: editarClienteHoraValidade.value.trim(),
            telefone: editarClienteTelefone.value.trim(),
            pacote: editarClientePacote.value.trim(),
            observacao: editarClienteObservacao.value.trim(),
            dados_endereco: {
                cep: editarClienteCep.value.trim(),
                endereco: editarClienteEndereco.value.trim(),
                numero: editarClienteNumero.value.trim(),
                complemento: editarClienteComplemento.value.trim(),
                bairro: editarClienteBairro.value.trim(),
                cidade: editarClienteCidade.value.trim(),
                estado: editarClienteEstado.value.trim()
            }
        });

        await registrarLog('cliente_editado', `Cliente "${nome}" editado`);
        mostrarToast('Cliente atualizado com sucesso!', 'sucesso');
        fecharModalEditarCliente();
        await carregarClientes();
        await carregarFaturas();
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        mostrarToast('Erro ao atualizar cliente.', 'erro');
    }

    btnSalvarEdicaoCliente.disabled = false;
    btnSalvarEdicaoClienteTexto.style.display = 'inline';
    btnSalvarEdicaoClienteSpinner.style.display = 'none';
});

// ========================================
// EDIÇÃO DE FATURAS (Modal)
// ========================================
editarUploadArea.addEventListener('click', () => editarInputPdf.click());

editarUploadArea.addEventListener('dragover', (e) => { e.preventDefault(); editarUploadArea.classList.add('arrastando'); });
editarUploadArea.addEventListener('dragleave', () => { editarUploadArea.classList.remove('arrastando'); });

editarUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    editarUploadArea.classList.remove('arrastando');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        editarPdfSelecionado = files[0];
        editarNomeArquivo.textContent = files[0].name;
        editarNomeArquivo.style.display = 'block';
    } else {
        mostrarToast('Selecione um arquivo PDF válido.', 'erro');
    }
});

editarInputPdf.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        editarPdfSelecionado = e.target.files[0];
        editarNomeArquivo.textContent = e.target.files[0].name;
        editarNomeArquivo.style.display = 'block';
    }
});

function abrirModalEditarFatura(faturaId) {
    const dados = faturasCache[faturaId];
    if (!dados) { mostrarToast('Dados da fatura não encontrados.', 'erro'); return; }
    const dadosCliente = clientesCache[dados.id_cliente];
    const nomeCliente = dadosCliente?.nome_completo || dadosCliente?.email || dados.id_cliente;

    editarFaturaId.value = faturaId;
    editarFaturaUid.value = dados.id_cliente || faturaId;
    editarFaturaCliente.value = nomeCliente;
    editarFaturaMes.value = dados.mes_referencia || '';
    editarFaturaVencimento.value = dados.data_vencimento || '';
    editarFaturaHoraValidade.value = dados.hora_validade || '';
    editarFaturaUrlPdf.value = dados.url_pdf_cloudinary || '';
    editarFaturaPix.value = dados.codigo_pix_copia || '';
    editarFaturaStatus.value = dados.status_pagamento || 'pendente';
    editarPdfSelecionado = null;
    editarNomeArquivo.textContent = '';
    editarNomeArquivo.style.display = 'none';
    editarInputPdf.value = '';
    modalEditarFatura.style.display = 'flex';
}

function fecharModalEditarFatura() {
    modalEditarFatura.style.display = 'none';
    editarFaturaId.value = '';
    editarPdfSelecionado = null;
    editarNomeArquivo.style.display = 'none';
    editarInputPdf.value = '';
}

btnFecharModalFatura.addEventListener('click', fecharModalEditarFatura);
modalEditarFatura.addEventListener('click', (e) => { if (e.target === modalEditarFatura) fecharModalEditarFatura(); });

btnSalvarEdicaoFatura.addEventListener('click', async () => {
    const faturaId = editarFaturaId.value;
    const mesRef = editarFaturaMes.value.trim();
    const dataVenc = editarFaturaVencimento.value;
    const codigoPix = editarFaturaPix.value.trim();
    const status = editarFaturaStatus.value;

    if (!mesRef) { mostrarToast('Informe o mês de referência.', 'erro'); return; }
    if (!dataVenc) { mostrarToast('Informe a data de vencimento.', 'erro'); return; }
    if (!codigoPix) { mostrarToast('Informe o código PIX.', 'erro'); return; }

    btnSalvarEdicaoFatura.disabled = true;
    btnSalvarEdicaoFaturaTexto.style.display = 'none';
    btnSalvarEdicaoFaturaSpinner.style.display = 'block';

    try {
        let urlPdf = editarFaturaUrlPdf.value.trim();

        if (editarPdfSelecionado) {
            try {
                urlPdf = await uploadParaCloudinary(editarPdfSelecionado);
                mostrarToast('Novo PDF enviado!', 'sucesso');
            } catch (uploadError) {
                console.error('Erro no upload:', uploadError);
                mostrarToast(`Erro no upload: ${uploadError.message}`, 'erro');
                btnSalvarEdicaoFatura.disabled = false;
                btnSalvarEdicaoFaturaTexto.style.display = 'inline';
                btnSalvarEdicaoFaturaSpinner.style.display = 'none';
                return;
            }
        }

        if (!urlPdf) {
            mostrarToast('Forneça o PDF (upload ou URL).', 'erro');
            btnSalvarEdicaoFatura.disabled = false;
            btnSalvarEdicaoFaturaTexto.style.display = 'inline';
            btnSalvarEdicaoFaturaSpinner.style.display = 'none';
            return;
        }

        await updateDoc(doc(db, 'faturas', faturaId), {
            mes_referencia: mesRef,
            data_vencimento: dataVenc,
            hora_validade: editarFaturaHoraValidade.value.trim(),
            url_pdf_cloudinary: urlPdf,
            codigo_pix_copia: codigoPix,
            status_pagamento: status
        });

        // Sync: se status for "pago", sincronizar data_vencimento da fatura com data_vencimento_cliente
        if (status === 'pago') {
            const faturaData = faturasCache[faturaId];
            if (faturaData && faturaData.id_cliente) {
                // Converter data_vencimento (yyyy-mm-dd) para DD/MM/AAAA
                const partes = dataVenc.split('-');
                if (partes.length === 3) {
                    const novaDataCliente = `${partes[2]}/${partes[1]}/${partes[0]}`;
                    const agora = new Date();
                    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
                    await updateDoc(doc(db, 'clientes', faturaData.id_cliente), {
                        data_vencimento_cliente: novaDataCliente,
                        hora_validade: horaAtual
                    });
                    if (clientesCache[faturaData.id_cliente]) {
                        clientesCache[faturaData.id_cliente].data_vencimento_cliente = novaDataCliente;
                        clientesCache[faturaData.id_cliente].hora_validade = horaAtual;
                    }
                }
            }
        }

        await registrarLog('fatura_editada', `Fatura ${mesRef} editada`);
        mostrarToast('Fatura atualizada com sucesso!', 'sucesso');
        fecharModalEditarFatura();
        await carregarFaturas();
    } catch (error) {
        console.error('Erro ao atualizar fatura:', error);
        mostrarToast('Erro ao atualizar fatura.', 'erro');
    }

    btnSalvarEdicaoFatura.disabled = false;
    btnSalvarEdicaoFaturaTexto.style.display = 'inline';
    btnSalvarEdicaoFaturaSpinner.style.display = 'none';
});

// ========================================
// EDIÇÃO DE MENSAGENS (Modal)
// ========================================
editarMsgNegritoBotao.addEventListener('mousedown', (e) => { e.preventDefault(); document.execCommand('bold'); });
editarMsgItalicoBotao.addEventListener('mousedown', (e) => { e.preventDefault(); document.execCommand('italic'); });
editarMsgCorTexto.addEventListener('mousedown', salvarSelecao);
editarMsgCorTexto.addEventListener('input', () => { restaurarSelecao(); document.execCommand('foreColor', false, editarMsgCorTexto.value); });
editarMsgFonte.addEventListener('mousedown', salvarSelecao);
editarMsgFonte.addEventListener('change', () => { restaurarSelecao(); document.execCommand('fontName', false, editarMsgFonte.value); });

function abrirModalEditarMensagem(msgId) {
    const msg = mensagensLista.find(m => m.id === msgId);
    if (!msg) { mostrarToast('Mensagem não encontrada.', 'erro'); return; }
    editarMsgId.value = msgId;
    editarMsgDestino.value = msg.destino || 'excluido';
    editarMsgTitulo.value = msg.titulo || '';
    editarMsgTexto.innerHTML = msg.texto || '';
    editarMsgCorTexto.value = '#333333';
    editarMsgCorFundo.value = msg.corFundo || '#ffffff';
    editarMsgFonte.value = msg.fonte || 'Inter';

    // Clientes específicos
    if (msg.destino === 'clientes_especificos') {
        editarMsgClientesAlvoGrupo.style.display = 'block';
        preencherCheckboxesClientes(editarMsgClientesAlvo, msg.clientesAlvo || []);
    } else {
        editarMsgClientesAlvoGrupo.style.display = 'none';
    }

    modalEditarMensagem.style.display = 'flex';
}

function fecharModalEditarMensagem() {
    modalEditarMensagem.style.display = 'none';
    editarMsgId.value = '';
}

btnFecharModalMensagem.addEventListener('click', fecharModalEditarMensagem);
modalEditarMensagem.addEventListener('click', (e) => { if (e.target === modalEditarMensagem) fecharModalEditarMensagem(); });

btnSalvarEdicaoMensagem.addEventListener('click', async () => {
    const msgId = editarMsgId.value;
    const texto = editarMsgTexto.innerHTML.trim();
    if (!texto || texto === '<br>') {
        mostrarToast('Digite o texto da mensagem.', 'erro');
        return;
    }
    btnSalvarEdicaoMensagem.disabled = true;
    btnSalvarEdicaoMsgTexto.style.display = 'none';
    btnSalvarEdicaoMsgSpinner.style.display = 'block';

    try {
        const msg = mensagensLista.find(m => m.id === msgId);
        if (!msg) throw new Error('Mensagem não encontrada');
        msg.texto = texto;
        msg.destino = editarMsgDestino.value;
        msg.titulo = editarMsgTitulo.value.trim();
        msg.corFundo = editarMsgCorFundo.value;
        msg.fonte = editarMsgFonte.value;

        if (msg.destino === 'clientes_especificos') {
            msg.clientesAlvo = getClientesSelecionados(editarMsgClientesAlvo);
            if (msg.clientesAlvo.length === 0) {
                mostrarToast('Selecione pelo menos um cliente.', 'erro');
                btnSalvarEdicaoMensagem.disabled = false;
                btnSalvarEdicaoMsgTexto.style.display = 'inline';
                btnSalvarEdicaoMsgSpinner.style.display = 'none';
                return;
            }
        } else {
            delete msg.clientesAlvo;
        }

        await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
        await registrarLog('mensagem_editada', `Mensagem editada (destino: ${msg.destino})`);
        mostrarToast('Mensagem atualizada com sucesso!', 'sucesso');
        fecharModalEditarMensagem();
        renderizarListaMensagens();
    } catch (error) {
        console.error('Erro ao atualizar mensagem:', error);
        mostrarToast('Erro ao atualizar mensagem.', 'erro');
    }
    btnSalvarEdicaoMensagem.disabled = false;
    btnSalvarEdicaoMsgTexto.style.display = 'inline';
    btnSalvarEdicaoMsgSpinner.style.display = 'none';
});

// Click em tag de variável para inserir no editor contenteditable
document.addEventListener('click', (e) => {
    if (e.target.matches('.msg-variaveis-tags code')) {
        const variavel = e.target.textContent;
        const container = e.target.closest('.modal-body') || e.target.closest('.card');
        const editor = container?.querySelector('.msg-editor');
        if (editor) {
            editor.focus();
            document.execCommand('insertText', false, variavel);
        }
    }
});

// ========================================
// HISTÓRICO DE AÇÕES POR CLIENTE (Modal)
// ========================================
function abrirModalHistoricoCliente(clienteId, nomeCliente) {
    const overlay = document.getElementById('modal-historico-cliente');
    const titulo = document.getElementById('historico-cliente-titulo');
    const corpo = document.getElementById('historico-cliente-corpo');
    const btnFechar = document.getElementById('btn-fechar-historico');

    titulo.textContent = `Histórico: ${nomeCliente}`;
    corpo.innerHTML = '<p style="text-align:center;color:var(--cor-texto-claro);padding:var(--espacamento-md);">Carregando...</p>';
    overlay.style.display = 'flex';

    // Filtrar logs que mencionam o cliente (por ID ou nome)
    const dadosCliente = clientesCache[clienteId];
    const nomeParaBusca = (dadosCliente?.nome_completo || nomeCliente || '').toLowerCase();
    const emailParaBusca = (dadosCliente?.email || '').toLowerCase();

    const logsCliente = logsCache.filter(log => {
        const detalhes = (log.detalhes || '').toLowerCase();
        return detalhes.includes(clienteId.toLowerCase()) ||
            (nomeParaBusca && detalhes.includes(nomeParaBusca)) ||
            (emailParaBusca && detalhes.includes(emailParaBusca));
    });

    if (logsCliente.length === 0) {
        corpo.innerHTML = '<p style="text-align:center;color:var(--cor-texto-claro);padding:var(--espacamento-md);">Nenhuma atividade registrada para este cliente.</p>';
    } else {
        corpo.innerHTML = '';
        logsCliente.forEach(log => {
            const div = document.createElement('div');
            div.className = 'log-item';
            const dataStr = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('pt-BR') : '--';
            const acaoLabel = (log.acao || '').replace(/_/g, ' ');
            div.innerHTML = `
                <span class="log-acao">${escapeHTML(acaoLabel)}</span>
                <span class="log-detalhe">${escapeHTML(log.detalhes || '')}</span>
                <span class="log-data">${dataStr}</span>
            `;
            corpo.appendChild(div);
        });
    }

    function fechar() {
        overlay.style.display = 'none';
        btnFechar.removeEventListener('click', fechar);
        overlay.removeEventListener('click', clickOverlay);
    }
    function clickOverlay(e) { if (e.target === overlay) fechar(); }
    btnFechar.addEventListener('click', fechar);
    overlay.addEventListener('click', clickOverlay);
}

// ========================================
// DETALHES DO CLIENTE (Modal Dashboard)
// ========================================
function abrirModalDetalhesCliente(clienteId) {
    const dados = clientesCache[clienteId];
    if (!dados) { mostrarToast('Cliente não encontrado.', 'erro'); return; }

    const overlay = document.getElementById('modal-detalhes-cliente');
    const corpo = document.getElementById('detalhes-cliente-corpo');

    const calc = calcularDiasRestantes(dados.data_vencimento_cliente, dados.hora_validade);
    const sit = dados.status_conta === 'suspenso' ? 'Suspenso' : (calc.situacao || '--');
    const diasR = typeof calc.dias === 'number' ? `${calc.dias} dia(s)` : '--';
    const ultimoAcesso = dados.ultimo_acesso ? (dados.ultimo_acesso.toDate ? dados.ultimo_acesso.toDate().toLocaleString('pt-BR') : new Date(dados.ultimo_acesso).toLocaleString('pt-BR')) : '--';

    corpo.innerHTML = `
        <div class="detalhes-grid">
            <div class="detalhe-item"><span class="detalhe-label">Nome</span><span class="detalhe-valor">${escapeHTML(dados.nome_completo || '--')}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">E-mail</span><span class="detalhe-valor">${escapeHTML(dados.email || '--')}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">Telefone</span><span class="detalhe-valor">${escapeHTML(dados.telefone || '--')}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">CPF</span><span class="detalhe-valor">${escapeHTML(dados.cpf || '--')}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">Usuário</span><span class="detalhe-valor">${escapeHTML(dados.usuario || '--')}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">Pacote</span><span class="detalhe-valor">${escapeHTML(dados.pacote || '--')}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">Status</span><span class="detalhe-valor"><span class="badge badge-${dados.status_conta || 'ativo'}">${dados.status_conta || 'ativo'}</span></span></div>
            <div class="detalhe-item"><span class="detalhe-label">Situação</span><span class="detalhe-valor">${escapeHTML(sit)}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">Vencimento</span><span class="detalhe-valor">${escapeHTML(dados.data_vencimento_cliente || '--')} ${escapeHTML(dados.hora_validade || '')}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">Dias Restantes</span><span class="detalhe-valor">${escapeHTML(diasR)}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">Último Acesso</span><span class="detalhe-valor">${ultimoAcesso}</span></div>
            <div class="detalhe-item"><span class="detalhe-label">Observação</span><span class="detalhe-valor">${escapeHTML(dados.observacao || '--')}</span></div>
            ${dados.endereco || dados.cidade ? `<div class="detalhe-item detalhe-full"><span class="detalhe-label">Endereço</span><span class="detalhe-valor">${escapeHTML([dados.endereco, dados.numero, dados.complemento, dados.bairro, dados.cidade, dados.estado, dados.cep].filter(Boolean).join(', ') || '--')}</span></div>` : ''}
        </div>`;

    overlay.style.display = 'flex';

    function fechar() {
        overlay.style.display = 'none';
        overlay.removeEventListener('click', clickFora);
    }
    function clickFora(e) { if (e.target === overlay) fechar(); }
    overlay.querySelector('.modal-btn-fechar').onclick = fechar;
    overlay.addEventListener('click', clickFora);
}

// Delegação de evento para botão detalhes no dashboard
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-detalhes-cliente-dash');
    if (btn) {
        abrirModalDetalhesCliente(btn.dataset.id);
    }
});

// ========================================
// EXPORTAR CLIENTES (CSV / XLSX)
// ========================================
function exportarClientes(formato) {
    const lista = Object.entries(clientesCache).map(([id, dados]) => ({ id, ...dados }));
    if (lista.length === 0) { mostrarToast('Nenhum cliente para exportar.', 'erro'); return; }

    const cabecalho = ['Nome', 'E-mail', 'Telefone', 'CPF', 'Usuário', 'Senha', 'Pacote', 'Status Conta', 'Situação', 'Data Vencimento', 'Hora Validade', 'Dias Restantes', 'Último Acesso', 'Observação', 'Endereço', 'Número', 'Complemento', 'Bairro', 'Cidade', 'Estado', 'CEP'];
    const dados = lista.map(c => {
        const calc = calcularDiasRestantes(c.data_vencimento_cliente, c.hora_validade);
        const sit = c.status_conta === 'suspenso' ? 'Suspenso' : (calc.situacao || '--');
        const diasR = typeof calc.dias === 'number' ? String(calc.dias) : '--';
        const ultimoAcesso = c.ultimo_acesso
            ? (c.ultimo_acesso.toDate ? c.ultimo_acesso.toDate().toLocaleString('pt-BR') : new Date(c.ultimo_acesso).toLocaleString('pt-BR'))
            : '--';
        const end = c.dados_endereco || {};
        return [
            c.nome_completo || '',
            c.email || '',
            c.telefone || '',
            c.cpf || '',
            c.usuario || '',
            c.senha_servico || '',
            c.pacote || '',
            c.status_conta || 'ativo',
            sit,
            c.data_vencimento_cliente || '',
            c.hora_validade || '',
            diasR,
            ultimoAcesso,
            c.observacao || '',
            end.endereco || '',
            end.numero || '',
            end.complemento || '',
            end.bairro || '',
            end.cidade || '',
            end.estado || '',
            end.cep || ''
        ];
    });

    const nomeArquivo = `clientes_icoutv_${new Date().toISOString().slice(0, 10)}`;
    if (formato === 'xlsx') {
        gerarXLSX(cabecalho, dados, nomeArquivo);
    } else {
        gerarCSV(cabecalho, dados, nomeArquivo);
    }
    mostrarToast('Clientes exportados com sucesso!', 'sucesso');
}

// ========================================
// EXPORTAR LOGS (CSV / XLSX)
// ========================================
function exportarLogs(formato) {
    if (logsCache.length === 0) { mostrarToast('Nenhum log para exportar.', 'erro'); return; }

    const cabecalho = ['Ação', 'Detalhes', 'Admin', 'Data/Hora'];
    const dados = logsCache.map(log => {
        const dataStr = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('pt-BR') : '--';
        return [
            (log.acao || '').replace(/_/g, ' '),
            log.detalhes || '',
            log.admin_email || '',
            dataStr
        ];
    });

    if (formato === 'xlsx') {
        gerarXLSX(cabecalho, dados, `logs_icoutv_${new Date().toISOString().slice(0, 10)}`);
    } else {
        gerarCSV(cabecalho, dados, `logs_icoutv_${new Date().toISOString().slice(0, 10)}`);
    }
    mostrarToast('Logs exportados com sucesso!', 'sucesso');
}

// ========================================
// GERAR CSV (utilitário)
// ========================================
function gerarCSV(cabecalho, linhas, nomeArquivo) {
    const csvLinhas = linhas.map(linha =>
        linha.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = '\uFEFF' + cabecalho.join(',') + '\n' + csvLinhas.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${nomeArquivo}.csv`);
}

// ========================================
// GERAR XLSX (formato OOXML real - .xlsx)
// ========================================
function gerarXLSX(cabecalho, linhas, nomeArquivo) {
    // Montar sharedStrings
    const allStrings = [];
    cabecalho.forEach(s => allStrings.push(String(s)));
    linhas.forEach(row => row.forEach(v => allStrings.push(String(v))));

    let sharedStringsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    sharedStringsXml += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${allStrings.length}" uniqueCount="${allStrings.length}">`;
    allStrings.forEach(s => { sharedStringsXml += `<si><t>${escapeXML(s)}</t></si>`; });
    sharedStringsXml += '</sst>';

    // Montar sheet1.xml
    let sheetXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    sheetXml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
    sheetXml += '<sheetData>';
    let idx = 0;
    // Header row
    sheetXml += '<row r="1">';
    cabecalho.forEach((_, ci) => {
        const col = String.fromCharCode(65 + (ci % 26)) + (ci >= 26 ? String.fromCharCode(65 + Math.floor(ci / 26) - 1) : '');
        const ref = (ci < 26 ? String.fromCharCode(65 + ci) : 'A' + String.fromCharCode(65 + ci - 26)) + '1';
        sheetXml += `<c r="${ref}" t="s" s="1"><v>${idx}</v></c>`;
        idx++;
    });
    sheetXml += '</row>';
    // Data rows
    linhas.forEach((row, ri) => {
        sheetXml += `<row r="${ri + 2}">`;
        row.forEach((_, ci) => {
            const ref = (ci < 26 ? String.fromCharCode(65 + ci) : 'A' + String.fromCharCode(65 + ci - 26)) + String(ri + 2);
            sheetXml += `<c r="${ref}" t="s"><v>${idx}</v></c>`;
            idx++;
        });
        sheetXml += '</row>';
    });
    sheetXml += '</sheetData></worksheet>';

    // Montar workbook.xml
    const workbookXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados" sheetId="1" r:id="rId1"/></sheets></workbook>';

    // styles.xml (minimalista com negrito para header)
    const stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>';

    // [Content_Types].xml
    const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/></Types>';

    // _rels/.rels
    const relsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';

    // xl/_rels/workbook.xml.rels
    const wbRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>';

    // Criar ZIP manualmente (store method, sem compressão)
    const files = [
        { name: '[Content_Types].xml', data: contentTypes },
        { name: '_rels/.rels', data: relsXml },
        { name: 'xl/workbook.xml', data: workbookXml },
        { name: 'xl/_rels/workbook.xml.rels', data: wbRelsXml },
        { name: 'xl/styles.xml', data: stylesXml },
        { name: 'xl/sharedStrings.xml', data: sharedStringsXml },
        { name: 'xl/worksheets/sheet1.xml', data: sheetXml }
    ];

    const zipBlob = criarZipBlob(files);
    downloadBlob(zipBlob, `${nomeArquivo}.xlsx`);
}

function criarZipBlob(files) {
    const encoder = new TextEncoder();
    const entries = files.map(f => ({ name: encoder.encode(f.name), data: encoder.encode(f.data) }));

    let offset = 0;
    const localHeaders = [];
    const centralHeaders = [];

    entries.forEach(entry => {
        const localHeaderOffset = offset;
        // CRC32
        const crc = crc32(entry.data);
        // Local file header (30 + nameLen + dataLen)
        const lh = new Uint8Array(30 + entry.name.length);
        const lhView = new DataView(lh.buffer);
        lhView.setUint32(0, 0x04034b50, true); // signature
        lhView.setUint16(4, 20, true);          // version needed
        lhView.setUint16(6, 0, true);           // flags
        lhView.setUint16(8, 0, true);           // compression (store)
        lhView.setUint16(10, 0, true);          // mod time
        lhView.setUint16(12, 0, true);          // mod date
        lhView.setUint32(14, crc, true);        // crc32
        lhView.setUint32(18, entry.data.length, true); // compressed size
        lhView.setUint32(22, entry.data.length, true); // uncompressed size
        lhView.setUint16(26, entry.name.length, true); // name length
        lhView.setUint16(28, 0, true);          // extra field length
        lh.set(entry.name, 30);
        localHeaders.push({ header: lh, data: entry.data });
        offset += lh.length + entry.data.length;

        // Central directory header (46 + nameLen)
        const ch = new Uint8Array(46 + entry.name.length);
        const chView = new DataView(ch.buffer);
        chView.setUint32(0, 0x02014b50, true);     // signature
        chView.setUint16(4, 20, true);              // version made by
        chView.setUint16(6, 20, true);              // version needed
        chView.setUint16(8, 0, true);               // flags
        chView.setUint16(10, 0, true);              // compression
        chView.setUint16(12, 0, true);              // mod time
        chView.setUint16(14, 0, true);              // mod date
        chView.setUint32(16, crc, true);            // crc32
        chView.setUint32(20, entry.data.length, true); // compressed size
        chView.setUint32(24, entry.data.length, true); // uncompressed size
        chView.setUint16(28, entry.name.length, true); // name length
        chView.setUint16(30, 0, true);              // extra field length
        chView.setUint16(32, 0, true);              // comment length
        chView.setUint16(34, 0, true);              // disk number
        chView.setUint16(36, 0, true);              // internal attributes
        chView.setUint32(38, 0, true);              // external attributes
        chView.setUint32(42, localHeaderOffset, true); // offset
        ch.set(entry.name, 46);
        centralHeaders.push(ch);
    });

    const centralDirOffset = offset;
    let centralDirSize = 0;
    centralHeaders.forEach(ch => centralDirSize += ch.length);

    // End of central directory (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);                // signature
    eocdView.setUint16(4, 0, true);                          // disk number
    eocdView.setUint16(6, 0, true);                          // central dir disk
    eocdView.setUint16(8, entries.length, true);              // entries on this disk
    eocdView.setUint16(10, entries.length, true);             // total entries
    eocdView.setUint32(12, centralDirSize, true);             // central dir size
    eocdView.setUint32(16, centralDirOffset, true);           // central dir offset
    eocdView.setUint16(20, 0, true);                          // comment length

    const parts = [];
    localHeaders.forEach(lh => { parts.push(lh.header); parts.push(lh.data); });
    centralHeaders.forEach(ch => parts.push(ch));
    parts.push(eocd);

    return new Blob(parts, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function escapeXML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function downloadBlob(blob, nome) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========================================
// CONFIRMAÇÕES DE PAGAMENTO (CLIENTES)
// ========================================
let confirmacoesPagamentoCache = [];

async function carregarConfirmacoesPagamento() {
    const container = document.getElementById('confirmacoes-container');
    try {
        const ref = collection(db, 'confirmacoes_pagamento');
        const q = query(ref, orderBy('data', 'desc'), limit(50));
        const snap = await getDocs(q);

        confirmacoesPagamentoCache = [];
        snap.forEach((docSnap) => {
            confirmacoesPagamentoCache.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderizarConfirmacoes();
    } catch (error) {
        console.error('Erro ao carregar confirmações:', error);
        if (container) container.innerHTML = '<p style="font-size:var(--fonte-tamanho-sm);color:var(--cor-erro);text-align:center;padding:var(--espacamento-md);">Erro ao carregar confirmações.</p>';
    }
}

function renderizarConfirmacoes() {
    const container = document.getElementById('confirmacoes-container');
    if (!container) return;

    const pendentes = confirmacoesPagamentoCache.filter(c => c.status === 'pendente');
    const resolvidas = confirmacoesPagamentoCache.filter(c => c.status !== 'pendente');

    // Badge com contagem de pendentes
    const badge = document.getElementById('confirmacoes-badge');
    if (badge) {
        if (pendentes.length > 0) {
            badge.textContent = pendentes.length;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }

    // Atualizar preview do dashboard
    renderizarDashNotifPreview();

    if (confirmacoesPagamentoCache.length === 0) {
        container.innerHTML = '<p style="font-size:var(--fonte-tamanho-sm);color:var(--cor-texto-claro);text-align:center;padding:var(--espacamento-md);">Nenhuma confirmação de pagamento recebida.</p>';
        return;
    }

    container.innerHTML = '';

    // Pendentes primeiro
    pendentes.forEach(conf => {
        container.appendChild(criarCardConfirmacao(conf, true));
    });

    // Resolvidas
    resolvidas.forEach(conf => {
        container.appendChild(criarCardConfirmacao(conf, false));
    });
}

function criarCardConfirmacao(conf, isPendente) {
    const div = document.createElement('div');
    const isExclusao = conf.tipo === 'exclusao_conta';
    div.className = `confirmacao-item ${isPendente ? (isExclusao ? 'confirmacao-exclusao' : 'confirmacao-pendente') : 'confirmacao-resolvida'}`;

    const dataStr = conf.data?.toDate ? conf.data.toDate().toLocaleString('pt-BR') : '--';
    const nomeCliente = escapeHTML(conf.nome_cliente || conf.email_cliente || 'Cliente');
    const faturaRef = escapeHTML(conf.fatura_referencia || '--');
    const tipoLabel = isExclusao ? '⚠️ Exclusão de conta' : `Fatura: ${faturaRef}`;

    div.innerHTML = `
        <div class="confirmacao-item-info">
            <p class="confirmacao-item-nome">${nomeCliente}</p>
            <p class="confirmacao-item-detalhe">${tipoLabel} · ${dataStr}</p>
        </div>
        <div class="confirmacao-item-acoes">
            ${isPendente
            ? `<button class="btn btn-sm btn-sucesso" data-resolver-confirmacao="${conf.id}" title="Marcar como resolvida">✔ Resolver</button>`
            : '<span class="badge badge-ativo" style="font-size:var(--fonte-tamanho-xs);">Resolvida</span>'
        }
            <button class="btn btn-sm btn-deletar-notificacao" data-deletar-confirmacao="${conf.id}" title="Excluir notificação" style="background:none;border:1px solid var(--cor-borda);color:var(--cor-texto-claro);padding:2px 6px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `;
    return div;
}

// Resolver confirmação
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-resolver-confirmacao]');
    if (!btn) return;

    const id = btn.dataset.resolverConfirmacao;
    btn.disabled = true;
    btn.textContent = '...';

    try {
        await updateDoc(doc(db, 'confirmacoes_pagamento', id), {
            status: 'resolvida',
            resolvido_em: serverTimestamp(),
            resolvido_por: ADMIN_EMAIL
        });

        // Atualizar cache local
        const item = confirmacoesPagamentoCache.find(c => c.id === id);
        if (item) item.status = 'resolvida';

        renderizarConfirmacoes();
        await registrarLog('confirmacao_pagamento_resolvida', `Confirmação de ${item?.nome_cliente || item?.email_cliente || id} resolvida`);
        mostrarToast('Confirmação resolvida!', 'sucesso');
    } catch (error) {
        console.error('Erro ao resolver confirmação:', error);
        mostrarToast('Erro ao resolver confirmação.', 'erro');
        btn.disabled = false;
        btn.textContent = '✔ Resolver';
    }
});

// Excluir notificação
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-deletar-confirmacao]');
    if (!btn) return;

    const id = btn.dataset.deletarConfirmacao;
    if (!confirm('Excluir esta notificação?')) return;

    btn.disabled = true;
    try {
        await deleteDoc(doc(db, 'confirmacoes_pagamento', id));
        confirmacoesPagamentoCache = confirmacoesPagamentoCache.filter(c => c.id !== id);
        renderizarConfirmacoes();
        await registrarLog('notificacao_excluida', `Notificação ${id} excluída`);
        mostrarToast('Notificação excluída.', 'sucesso');
    } catch (error) {
        console.error('Erro ao excluir notificação:', error);
        mostrarToast('Erro ao excluir notificação.', 'erro');
        btn.disabled = false;
    }
});

// ========================================
// LOGS DE AÇÕES
// ========================================
async function registrarLog(acao, detalhes) {
    try {
        await addDoc(collection(db, 'logs'), {
            acao: acao,
            detalhes: detalhes,
            admin_email: ADMIN_EMAIL,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.warn('Erro ao registrar log:', error);
    }
}

async function carregarLogs() {
    const logsContainer = document.getElementById('logs-container');
    try {
        const logsRef = collection(db, 'logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));
        const snap = await getDocs(q);

        logsCache = [];
        snap.forEach((docSnap) => {
            logsCache.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderizarLogs();
    } catch (error) {
        console.error('Erro ao carregar logs:', error);
        logsContainer.innerHTML = '<p style="font-size:var(--fonte-tamanho-sm);color:var(--cor-erro);text-align:center;padding:var(--espacamento-md);">Erro ao carregar logs.</p>';
    }
}

function renderizarLogs() {
    const logsContainer = document.getElementById('logs-container');
    const filtroAcao = filtroLogsAcao.value;
    let lista = [...logsCache];
    if (filtroAcao) {
        lista = lista.filter(l => l.acao === filtroAcao);
    }

    if (lista.length === 0) {
        logsContainer.innerHTML = '<p style="font-size:var(--fonte-tamanho-sm);color:var(--cor-texto-claro);text-align:center;padding:var(--espacamento-md);">Nenhum log encontrado.</p>';
        return;
    }

    logsContainer.innerHTML = '';
    lista.forEach((log, index) => {
        const div = document.createElement('div');
        div.className = 'log-item log-item-clicavel';
        div.dataset.logIndex = index;
        const dataStr = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('pt-BR') : '--';
        const acaoLabel = (log.acao || '').replace(/_/g, ' ');
        div.innerHTML = `
            <span class="log-acao celula-truncada">${escapeHTML(acaoLabel)}</span>
            <span class="log-detalhe celula-truncada">${escapeHTML(log.detalhes || '')}</span>
            <span class="log-data">${dataStr}</span>
        `;
        div.addEventListener('click', () => {
            const overlay = document.getElementById('modal-detalhes-log');
            const corpo = document.getElementById('detalhes-log-corpo');
            corpo.innerHTML = `
                <div class="detalhes-grid">
                    <div class="detalhe-item"><span class="detalhe-label">Ação</span><span class="detalhe-valor">${escapeHTML(acaoLabel)}</span></div>
                    <div class="detalhe-item detalhe-full"><span class="detalhe-label">Detalhes</span><span class="detalhe-valor" style="word-break:break-all;">${escapeHTML(log.detalhes || '--')}</span></div>
                    <div class="detalhe-item"><span class="detalhe-label">Admin</span><span class="detalhe-valor">${escapeHTML(log.admin_email || '--')}</span></div>
                    <div class="detalhe-item"><span class="detalhe-label">Data/Hora</span><span class="detalhe-valor">${dataStr}</span></div>
                </div>`;
            overlay.style.display = 'flex';
            function fechar() { overlay.style.display = 'none'; overlay.removeEventListener('click', clickFora); }
            function clickFora(e) { if (e.target === overlay) fechar(); }
            overlay.querySelector('.modal-btn-fechar').onclick = fechar;
            overlay.addEventListener('click', clickFora);
        });
        logsContainer.appendChild(div);
    });
}

filtroLogsAcao.addEventListener('change', renderizarLogs);

// ========================================
// MINI MENU DE AÇÕES (toggle/fechar)
// ========================================
document.addEventListener('click', (e) => {
    // Toggle export dropdown
    const btnExportar = e.target.closest('.btn-exportar-toggle');
    if (btnExportar) {
        e.stopPropagation();
        const dropdown = btnExportar.closest('.export-dropdown');
        const aberto = dropdown.classList.contains('aberto');
        document.querySelectorAll('.export-dropdown.aberto').forEach(d => d.classList.remove('aberto'));
        if (!aberto) dropdown.classList.add('aberto');
        return;
    }
    // Fechar export dropdowns ao clicar em item ou fora
    if (e.target.closest('.export-dropdown-item')) {
        document.querySelectorAll('.export-dropdown.aberto').forEach(d => d.classList.remove('aberto'));
    }
    if (!e.target.closest('.export-dropdown')) {
        document.querySelectorAll('.export-dropdown.aberto').forEach(d => d.classList.remove('aberto'));
    }

    const btnMais = e.target.closest('.btn-mais-acoes');
    if (btnMais) {
        e.stopPropagation();
        const menu = btnMais.nextElementSibling;
        const estaAberto = menu.classList.contains('aberto');
        // Fechar todos os menus abertos
        document.querySelectorAll('.acoes-menu.aberto').forEach(m => m.classList.remove('aberto'));
        // Toggle do menu clicado
        if (!estaAberto) menu.classList.add('aberto');
        return;
    }
    // Clicou fora de qualquer menu → fechar todos
    if (!e.target.closest('.acoes-menu')) {
        document.querySelectorAll('.acoes-menu.aberto').forEach(m => m.classList.remove('aberto'));
    }
});

// ========================================
// CONFIRMAÇÃO PERSONALIZADA (substitui confirm nativo)
// ========================================
function confirmarAcao(mensagem) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-confirmacao');
        const msgEl = document.getElementById('confirmacao-mensagem');
        const btnSim = document.getElementById('btn-confirmar-sim');
        const btnNao = document.getElementById('btn-confirmar-nao');
        msgEl.textContent = mensagem;
        overlay.style.display = 'flex';

        function limpar() {
            overlay.style.display = 'none';
            btnSim.removeEventListener('click', confirmar);
            btnNao.removeEventListener('click', cancelar);
            overlay.removeEventListener('click', clickOverlay);
        }

        function confirmar() { limpar(); resolve(true); }
        function cancelar() { limpar(); resolve(false); }
        function clickOverlay(e) { if (e.target === overlay) cancelar(); }

        btnSim.addEventListener('click', confirmar);
        btnNao.addEventListener('click', cancelar);
        overlay.addEventListener('click', clickOverlay);
    });
}

// ========================================
// UTILITÁRIOS
// ========================================
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    const icones = {
        sucesso: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        erro: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>'
    };

    toast.innerHTML = `${icones[tipo] || icones.info}<span>${mensagem}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}
