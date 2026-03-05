// ==============================================
// Portal do Cliente - icouTv Portal V1.0
// ==============================================

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ---------- Elementos do DOM ----------
const carregando = document.getElementById('carregando');
const portalApp = document.getElementById('portal-app');
const saudacao = document.getElementById('saudacao');
const statusConta = document.getElementById('status-conta');
const mesReferencia = document.getElementById('mes-referencia');
const faturaInfo = document.getElementById('fatura-info');
const faturaMes = document.getElementById('fatura-mes');
const faturaStatus = document.getElementById('fatura-status');
const btnVisualizarPdf = document.getElementById('btn-visualizar-pdf');
const semFatura = document.getElementById('sem-fatura');
const codigoPix = document.getElementById('codigo-pix');
const btnCopiarPix = document.getElementById('btn-copiar-pix');
const btnCopiarTexto = document.getElementById('btn-copiar-texto');
const semPix = document.getElementById('sem-pix');
const btnLogout = document.getElementById('btn-logout');
const toastContainer = document.getElementById('toast-container');
const cardFatura = document.getElementById('card-fatura');
const cardPix = document.getElementById('card-pix');

// ---------- Verificar Autenticação ----------
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    try {
        await carregarDadosCliente(user);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarToast('Erro ao carregar seus dados. Tente novamente.', 'erro');
    }
});

// ---------- Carregar Dados do Cliente ----------
async function carregarDadosCliente(user) {
    // 1. Buscar dados do cliente na coleção "clientes"
    const clienteRef = doc(db, 'clientes', user.uid);
    const clienteSnap = await getDoc(clienteRef);

    let nomeCliente = 'Cliente';
    let statusDaConta = 'ativa';

    if (clienteSnap.exists()) {
        const dados = clienteSnap.data();
        nomeCliente = dados.nome_completo || 'Cliente';
        statusDaConta = dados.status_conta || 'ativa';
    }

    // Se a conta foi excluída, deslogar e redirecionar
    if (statusDaConta === 'excluida') {
        await signOut(auth);
        window.location.href = '../index.html';
        return;
    }

    // Atualizar saudação
    const hora = new Date().getHours();
    let cumprimento = 'Olá';
    if (hora >= 5 && hora < 12) cumprimento = 'Bom dia';
    else if (hora >= 12 && hora < 18) cumprimento = 'Boa tarde';
    else cumprimento = 'Boa noite';

    saudacao.textContent = `${cumprimento}, ${nomeCliente}!`;

    // Atualizar status da conta
    statusConta.textContent = statusDaConta.charAt(0).toUpperCase() + statusDaConta.slice(1);
    statusConta.className = `badge badge-${statusDaConta}`;

    // 1.5. Buscar mensagens do admin para este status
    try {
        const msgRef = doc(db, 'configuracoes', 'mensagens');
        const msgSnap = await getDoc(msgRef);
        if (msgSnap.exists()) {
            const dados = msgSnap.data();
            const lista = dados.lista || [];
            const mensagensParaCliente = lista.filter(m => m.destino === statusDaConta);
            if (mensagensParaCliente.length > 0) {
                const tiposClasse = { 'ativa': 'msg-info', 'inativa': 'msg-aviso', 'excluida': 'msg-erro' };
                const iconeSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>';
                const modalEl = document.getElementById('modal-mensagem-admin');
                const conteudoEl = document.getElementById('modal-mensagem-conteudo');
                if (modalEl && conteudoEl) {
                    conteudoEl.innerHTML = mensagensParaCliente.map(m =>
                        `<div class="modal-mensagem-item ${tiposClasse[statusDaConta] || 'msg-info'}">${iconeSvg}<span>${escapeHTML(m.texto)}</span></div>`
                    ).join('');
                    modalEl.style.display = 'flex';
                }
            }
        }
    } catch (msgErr) {
        console.warn('Erro ao carregar mensagens:', msgErr);
    }

    // 2. Buscar fatura mais recente na coleção "faturas"
    // Query simples sem orderBy para evitar necessidade de índice composto
    const faturasRef = collection(db, 'faturas');
    const q = query(
        faturasRef,
        where('id_cliente', '==', user.uid)
    );

    const faturasSnap = await getDocs(q);

    if (!faturasSnap.empty) {
        // Ordenar pelo campo data_geracao localmente e pegar a mais recente
        const faturasDocs = faturasSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => {
                const dataA = a.data_geracao?.toMillis?.() || 0;
                const dataB = b.data_geracao?.toMillis?.() || 0;
                return dataB - dataA; // Mais recente primeiro
            });
        exibirFatura(faturasDocs[0]);
    } else {
        exibirSemFatura();
    }

    // Exibir o portal
    carregando.style.display = 'none';
    portalApp.style.display = 'block';
}

// ---------- Exibir Fatura ----------
function exibirFatura(fatura) {
    // Mês de referência
    mesReferencia.textContent = fatura.mes_referencia || '--/----';
    faturaMes.textContent = `Fatura - ${fatura.mes_referencia || ''}`;

    // Data de vencimento
    const vencimentoInfo = document.getElementById('vencimento-info');
    const dataVencimentoEl = document.getElementById('data-vencimento');
    if (fatura.data_vencimento) {
        // Formatar de yyyy-mm-dd para dd/mm/aaaa
        const partes = fatura.data_vencimento.split('-');
        if (partes.length === 3) {
            dataVencimentoEl.textContent = `${partes[2]}/${partes[1]}/${partes[0]}`;
        } else {
            dataVencimentoEl.textContent = fatura.data_vencimento;
        }
        vencimentoInfo.style.display = 'block';
    } else {
        vencimentoInfo.style.display = 'none';
    }

    // Status do pagamento
    const statusPag = fatura.status_pagamento || 'pendente';
    faturaStatus.textContent = statusPag.charAt(0).toUpperCase() + statusPag.slice(1);
    faturaStatus.className = `status badge badge-${statusPag}`;

    // PDF
    if (fatura.url_pdf_cloudinary) {
        faturaInfo.style.display = 'flex';
        btnVisualizarPdf.dataset.url = fatura.url_pdf_cloudinary;
        btnVisualizarPdf.style.display = 'inline-flex';
        semFatura.style.display = 'none';
    } else {
        faturaInfo.style.display = 'none';
        btnVisualizarPdf.style.display = 'none';
        semFatura.style.display = 'block';
    }

    // PIX
    if (fatura.codigo_pix_copia) {
        codigoPix.textContent = fatura.codigo_pix_copia;
        codigoPix.style.display = 'block';
        btnCopiarPix.style.display = 'flex';
        semPix.style.display = 'none';

        // Armazenar o código para copiar
        btnCopiarPix.dataset.pix = fatura.codigo_pix_copia;
    } else {
        codigoPix.style.display = 'none';
        btnCopiarPix.style.display = 'none';
        semPix.style.display = 'block';
    }
}

// ---------- Sem Fatura ----------
function exibirSemFatura() {
    faturaInfo.style.display = 'none';
    btnVisualizarPdf.style.display = 'none';
    semFatura.style.display = 'block';

    codigoPix.style.display = 'none';
    btnCopiarPix.style.display = 'none';
    semPix.style.display = 'block';

    mesReferencia.textContent = '--/----';
}

// ---------- Visualizar PDF (abre em nova aba) ----------
btnVisualizarPdf.addEventListener('click', () => {
    const url = btnVisualizarPdf.dataset.url;
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
});

// ---------- Copiar PIX (RF04) ----------
btnCopiarPix.addEventListener('click', async () => {
    const codigo = btnCopiarPix.dataset.pix;

    if (!codigo) {
        mostrarToast('Nenhum código PIX disponível.', 'erro');
        return;
    }

    try {
        await navigator.clipboard.writeText(codigo);

        // Feedback visual no botão
        const textoOriginal = btnCopiarTexto.textContent;
        btnCopiarTexto.textContent = 'Copiado!';
        btnCopiarPix.style.backgroundColor = 'var(--cor-sucesso)';

        mostrarToast('Código PIX copiado com sucesso!', 'sucesso');

        // Restaurar botão após 2 segundos
        setTimeout(() => {
            btnCopiarTexto.textContent = textoOriginal;
            btnCopiarPix.style.backgroundColor = '';
        }, 2000);

    } catch (error) {
        // Fallback para navegadores antigos
        try {
            const textarea = document.createElement('textarea');
            textarea.value = codigo;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            btnCopiarTexto.textContent = 'Copiado!';
            btnCopiarPix.style.backgroundColor = 'var(--cor-sucesso)';
            mostrarToast('Código PIX copiado com sucesso!', 'sucesso');

            setTimeout(() => {
                btnCopiarTexto.textContent = 'Copiar Código PIX';
                btnCopiarPix.style.backgroundColor = '';
            }, 2000);
        } catch (fallbackError) {
            mostrarToast('Não foi possível copiar. Selecione o código manualmente.', 'erro');
        }
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
        mostrarToast('Erro ao sair. Tente novamente.', 'erro');
    }
});

// ---------- Toast / Notificação ----------
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

    // Remover após a animação
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// ---------- Escape HTML (prevenir XSS) ----------
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---------- Modal de Mensagens (fechar) ----------
function fecharModalMensagem() {
    const modal = document.getElementById('modal-mensagem-admin');
    if (modal) modal.style.display = 'none';
}

document.getElementById('btn-fechar-modal')?.addEventListener('click', fecharModalMensagem);
document.getElementById('btn-entendido-modal')?.addEventListener('click', fecharModalMensagem);
