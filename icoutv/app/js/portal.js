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
    getDoc,
    updateDoc,
    addDoc,
    serverTimestamp
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

// Variável global para armazenar dados do cliente, user e fatura
let dadosClienteGlobal = null;
let userGlobal = null;
let faturaGlobal = null;

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
    let statusDaConta = 'ativo';
    let dadosCliente = null;

    if (clienteSnap.exists()) {
        const dados = clienteSnap.data();
        dadosCliente = dados;
        nomeCliente = dados.nome_completo || 'Cliente';
        statusDaConta = dados.status_conta || 'ativo';

        // Calcular campos dinâmicos
        if (dados.data_vencimento_cliente) {
            const dataVenc = parseDateDDMMAAAA(dados.data_vencimento_cliente);
            if (dataVenc) {
                if (dados.hora_validade) {
                    const partes = dados.hora_validade.split(':');
                    dataVenc.setHours(parseInt(partes[0], 10) || 0, parseInt(partes[1], 10) || 0, 0, 0);
                } else {
                    dataVenc.setHours(23, 59, 59, 999);
                }
                const diff = dataVenc.getTime() - Date.now();
                dadosCliente.dias_restantes_calc = Math.ceil(diff / (1000 * 60 * 60 * 24));
                dadosCliente.situacao_calc = diff > 0 ? 'Não expirado' : 'Expirado';
            }
        }
    }

    // Se a conta foi excluída, deslogar e redirecionar
    if (statusDaConta === 'excluido') {
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

    // Exibir data de vencimento do cliente
    const vencClienteEl = document.getElementById('vencimento-cliente-info');
    const dataVencClienteEl = document.getElementById('data-vencimento-cliente');
    if (vencClienteEl && dataVencClienteEl && dadosCliente && dadosCliente.data_vencimento_cliente) {
        const horaVal = dadosCliente.hora_validade || '23:59';
        dataVencClienteEl.textContent = `${dadosCliente.data_vencimento_cliente} às ${horaVal}`;
        vencClienteEl.style.display = 'block';
    }

    // Indicador visual de prazo restante
    const prazoRestanteEl = document.getElementById('prazo-restante-info');
    if (prazoRestanteEl && dadosCliente) {
        const diasR = dadosCliente.dias_restantes_calc;
        if (typeof diasR === 'number') {
            const textoEl = document.getElementById('prazo-restante-texto');
            const iconeEl = document.getElementById('prazo-restante-icone');
            if (diasR > 0) {
                textoEl.textContent = `Restam: ${diasR} dia${diasR !== 1 ? 's' : ''}`;
                iconeEl.textContent = '⏳';
                prazoRestanteEl.className = 'prazo-restante prazo-ok';
            } else if (diasR === 0) {
                textoEl.textContent = 'Vence hoje';
                iconeEl.textContent = '⚠️';
                prazoRestanteEl.className = 'prazo-restante prazo-alerta';
            } else {
                textoEl.textContent = `Expirado há ${Math.abs(diasR)} dia${Math.abs(diasR) !== 1 ? 's' : ''}`;
                iconeEl.textContent = '🔴';
                prazoRestanteEl.className = 'prazo-restante prazo-expirado';
            }
            prazoRestanteEl.style.display = 'flex';
        }
    }

    // Status do acesso visual
    const statusAcessoEl = document.getElementById('status-acesso-visual');
    if (statusAcessoEl) {
        if (statusDaConta === 'suspenso') {
            statusAcessoEl.innerHTML = '<span class="status-acesso status-acesso-suspenso">🔴 Acesso suspenso</span>';
        } else if (statusDaConta === 'ativo') {
            statusAcessoEl.innerHTML = '<span class="status-acesso status-acesso-ativo">🟢 Acesso ativo</span>';
        }
        statusAcessoEl.style.display = 'block';
    }

    // Guardar referência global para edição
    dadosClienteGlobal = dadosCliente;
    userGlobal = user;

    // Preencher card Dados da Conta
    preencherDadosConta();

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
            // Filtrar mensagens ativas, por status ou por clientesAlvo específicos
            const mensagensParaCliente = lista
                .filter(m => {
                    if (m.ativa === false) return false;
                    if (m.destino === 'clientes_especificos') {
                        return m.clientesAlvo && m.clientesAlvo.includes(user.uid);
                    }
                    return m.destino === statusDaConta;
                })
                .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
            if (mensagensParaCliente.length > 0) {
                const modalEl = document.getElementById('modal-mensagem-admin');
                const conteudoEl = document.getElementById('modal-mensagem-conteudo');
                if (modalEl && conteudoEl) {
                    let indiceMsgAtual = 0;
                    const totalMsgs = mensagensParaCliente.length;
                    const tiposClasse = { 'ativo': 'msg-info', 'suspenso': 'msg-aviso', 'excluido': 'msg-erro' };

                    function exibirMensagemModal(index) {
                        const m = mensagensParaCliente[index];
                        // Processar variáveis no texto (texto agora é HTML)
                        let textoProcessado = m.texto || '';
                        textoProcessado = textoProcessado
                            .replace(/%nome%/g, escapeHTML(nomeCliente))
                            .replace(/%email%/g, escapeHTML(user.email || ''))
                            .replace(/%status%/g, escapeHTML(statusDaConta))
                            .replace(/%usuario%/g, escapeHTML(dadosCliente?.usuario || ''))
                            .replace(/%senha%/g, escapeHTML(dadosCliente?.senha_servico || ''))
                            .replace(/%dias_restantes%/g, escapeHTML(String(dadosCliente?.dias_restantes_calc || '--')))
                            .replace(/%data_vencimento%/g, escapeHTML(dadosCliente?.data_vencimento_cliente || '--'))
                            .replace(/%hora_validade%/g, escapeHTML(dadosCliente?.hora_validade || '--'))
                            .replace(/%situacao%/g, escapeHTML(dadosCliente?.situacao_calc || '--'))
                            .replace(/%telefone%/g, escapeHTML(dadosCliente?.telefone || '--'))
                            .replace(/%pacote%/g, escapeHTML(dadosCliente?.pacote || '--'));
                        // Determinar classe e estilos de formatação
                        const temCorCustom = (m.corFundo && m.corFundo !== '#ffffff');
                        const classeItem = temCorCustom
                            ? 'modal-mensagem-item msg-custom'
                            : `modal-mensagem-item ${tiposClasse[statusDaConta] || 'msg-info'}`;
                        const estilos = [];
                        if (m.corFundo && m.corFundo !== '#ffffff') estilos.push(`background-color:${m.corFundo}`);
                        if (m.fonte && m.fonte !== 'Inter') estilos.push(`font-family:'${m.fonte}',sans-serif`);
                        const estiloStr = estilos.length > 0 ? ` style="${estilos.join(';')}"` : '';
                        // Título opcional
                        const tituloHtml = m.titulo ? `<strong class="modal-msg-titulo">${escapeHTML(m.titulo)}</strong>` : '';
                        // Contador
                        const contadorHtml = totalMsgs > 1 ? `<span class="modal-msg-contador">${index + 1} de ${totalMsgs}</span>` : '';
                        // Botões dentro do bloco
                        const isUltima = index >= totalMsgs - 1;
                        let botoesHtml = '';
                        if (totalMsgs > 1 && !isUltima) {
                            botoesHtml = `<button id="btn-proxima-inline" class="btn btn-secundario btn-bloco modal-msg-btn">Próxima</button>`;
                        } else {
                            botoesHtml = `<button id="btn-entendido-inline" class="btn btn-primario btn-bloco modal-msg-btn">Entendi</button>`;
                        }
                        conteudoEl.innerHTML = `<div class="${classeItem}"${estiloStr}>${tituloHtml}<div class="modal-msg-texto">${textoProcessado}</div>${contadorHtml}${botoesHtml}</div>`;

                        // Bind botões inline
                        const btnProximaInline = document.getElementById('btn-proxima-inline');
                        const btnEntendidoInline = document.getElementById('btn-entendido-inline');
                        if (btnProximaInline) {
                            btnProximaInline.addEventListener('click', () => {
                                indiceMsgAtual++;
                                if (indiceMsgAtual < totalMsgs) {
                                    exibirMensagemModal(indiceMsgAtual);
                                }
                            });
                        }
                        if (btnEntendidoInline) {
                            btnEntendidoInline.addEventListener('click', fecharModalMensagem);
                        }
                    }

                    exibirMensagemModal(0);
                    modalEl.style.display = 'flex';
                }
            }
        }
    } catch (msgErr) {
        console.warn('Erro ao carregar mensagens:', msgErr);
    }

    // 1.6. Carregar banner de promoção
    try {
        const promoSnap = await getDoc(doc(db, 'configuracoes', 'promocao'));
        if (promoSnap.exists()) {
            const promo = promoSnap.data();
            renderizarBannerPromocao(promo);
        }
    } catch (e) { console.warn('Erro ao carregar promoção:', e); }

    // 1.7. Countdown de bloqueio de acesso
    renderizarCountdownBloqueio();

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
    // Guardar referência global
    faturaGlobal = fatura;

    // Mês de referência
    mesReferencia.textContent = fatura.mes_referencia || '--/----';
    faturaMes.textContent = `Fatura - ${fatura.mes_referencia || ''}`;

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

    // Botão "Já paguei"
    const btnJaPaguei = document.getElementById('btn-ja-paguei');
    if (btnJaPaguei) {
        btnJaPaguei.style.display = statusPag === 'pago' ? 'none' : 'flex';
    }

    // PIX — bloquear exibição quando fatura está paga
    const statusPago = statusPag === 'pago';
    const confirmacaoEl = document.getElementById('confirmacao-pagamento');
    if (statusPago) {
        codigoPix.style.display = 'none';
        btnCopiarPix.style.display = 'none';
        semPix.style.display = 'none';
        // Mostrar confirmação visual de pagamento no card PIX
        let infoEl = cardPix.querySelector('.fatura-paga-info');
        if (!infoEl) {
            infoEl = document.createElement('p');
            infoEl.className = 'fatura-paga-info';
            infoEl.textContent = 'Fatura já foi paga. O código PIX não está mais disponível.';
            cardPix.appendChild(infoEl);
        }
        infoEl.style.display = 'block';
        // Confirmação visual no card de fatura
        if (confirmacaoEl) {
            const dataVencCliente = dadosClienteGlobal?.data_vencimento_cliente || '--/--/----';
            const confirmTexto = document.getElementById('confirmacao-data-acesso');
            if (confirmTexto) confirmTexto.textContent = dataVencCliente;
            confirmacaoEl.style.display = 'block';
        }
    } else if (fatura.codigo_pix_copia) {
        codigoPix.textContent = fatura.codigo_pix_copia;
        codigoPix.style.display = 'block';
        btnCopiarPix.style.display = 'flex';
        semPix.style.display = 'none';
        btnCopiarPix.dataset.pix = fatura.codigo_pix_copia;
        // Esconder aviso de paga se existir
        const infoEl = cardPix.querySelector('.fatura-paga-info');
        if (infoEl) infoEl.style.display = 'none';
        if (confirmacaoEl) confirmacaoEl.style.display = 'none';
    } else {
        codigoPix.style.display = 'none';
        btnCopiarPix.style.display = 'none';
        semPix.style.display = 'block';
        const infoEl = cardPix.querySelector('.fatura-paga-info');
        if (infoEl) infoEl.style.display = 'none';
        if (confirmacaoEl) confirmacaoEl.style.display = 'none';
    }

    // Timer de validade da fatura
    renderizarTimerValidade(fatura, statusPag);

    // Avisos de vencimento/atraso
    renderizarAvisoPlano();
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

// ---------- Copiar PIX (RF04) - Feedback melhorado ----------
btnCopiarPix.addEventListener('click', async () => {
    const codigo = btnCopiarPix.dataset.pix;

    if (!codigo) {
        mostrarToast('Nenhum código PIX disponível.', 'erro');
        return;
    }

    async function aplicarFeedbackCopiado() {
        // Feedback visual melhorado no botão
        btnCopiarTexto.innerHTML = 'Código copiado ✔';
        btnCopiarPix.classList.add('btn-copiado');

        // Instrução abaixo do botão
        const instrucaoEl = document.getElementById('pix-instrucao-copiar');
        if (instrucaoEl) {
            instrucaoEl.textContent = 'Abra seu banco e cole o código PIX';
            instrucaoEl.style.display = 'block';
        }

        mostrarToast('Código PIX copiado com sucesso!', 'sucesso');

        // Restaurar após 4 segundos
        setTimeout(() => {
            btnCopiarTexto.innerHTML = 'Copiar Código PIX';
            btnCopiarPix.classList.remove('btn-copiado');
            if (instrucaoEl) instrucaoEl.style.display = 'none';
        }, 4000);
    }

    try {
        await navigator.clipboard.writeText(codigo);
        await aplicarFeedbackCopiado();
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
            await aplicarFeedbackCopiado();
        } catch (fallbackError) {
            mostrarToast('Não foi possível copiar. Selecione o código manualmente.', 'erro');
        }
    }
});

// ---------- Botão "Já paguei" ----------
document.addEventListener('click', async (e) => {
    if (!e.target.closest('#btn-ja-paguei')) return;
    if (!userGlobal || !faturaGlobal) return;

    const btn = document.getElementById('btn-ja-paguei');
    const btnTexto = document.getElementById('btn-ja-paguei-texto');
    const btnSpinner = document.getElementById('btn-ja-paguei-spinner');

    btn.disabled = true;
    btnTexto.style.display = 'none';
    btnSpinner.style.display = 'block';

    try {
        await addDoc(collection(db, 'confirmacoes_pagamento'), {
            id_cliente: userGlobal.uid,
            nome_cliente: dadosClienteGlobal?.nome_completo || '',
            email_cliente: userGlobal.email || '',
            fatura_referencia: faturaGlobal.mes_referencia || '',
            fatura_id: faturaGlobal.id || '',
            data: serverTimestamp(),
            status: 'pendente'
        });

        btnTexto.innerHTML = '✔ Notificação enviada';
        btnTexto.style.display = 'inline';
        btnSpinner.style.display = 'none';
        btn.classList.add('btn-ja-paguei-enviado');
        mostrarToast('Confirmação de pagamento enviada ao administrador!', 'sucesso');

        // Não restaurar — manter como enviado
    } catch (error) {
        console.error('Erro ao enviar confirmação:', error);
        mostrarToast('Erro ao enviar confirmação. Tente novamente.', 'erro');
        btn.disabled = false;
        btnTexto.style.display = 'inline';
        btnSpinner.style.display = 'none';
    }
});

// ---------- Aviso de vencimento próximo / atraso ----------
function renderizarAvisoPlano() {
    const avisoEl = document.getElementById('aviso-plano');
    if (!avisoEl || !dadosClienteGlobal) return;

    const dias = dadosClienteGlobal.dias_restantes_calc;
    if (typeof dias !== 'number') return;

    if (dias <= 0) {
        // Aviso de atraso (vencido)
        avisoEl.className = 'aviso-plano aviso-plano-atraso';
        avisoEl.innerHTML = `
            <div class="aviso-plano-icone">❌</div>
            <div class="aviso-plano-conteudo">
                <p class="aviso-plano-titulo">Seu plano venceu</p>
                <p class="aviso-plano-texto">Realize o pagamento para voltar a utilizar.</p>
            </div>
        `;
        avisoEl.style.display = 'flex';
    } else if (dias <= 3) {
        // Aviso de vencimento próximo
        avisoEl.className = 'aviso-plano aviso-plano-alerta';
        avisoEl.innerHTML = `
            <div class="aviso-plano-icone">⚠️</div>
            <div class="aviso-plano-conteudo">
                <p class="aviso-plano-titulo">Seu plano vence em ${dias} dia${dias !== 1 ? 's' : ''}</p>
                <p class="aviso-plano-texto">Evite interrupções no serviço.</p>
            </div>
        `;
        avisoEl.style.display = 'flex';
    }
}

// ---------- Timer de validade da fatura ----------
function renderizarTimerValidade(fatura, statusPag) {
    const timerEl = document.getElementById('timer-validade-fatura');
    if (!timerEl) return;

    // Não mostrar se fatura já está paga
    if (statusPag === 'pago') {
        timerEl.style.display = 'none';
        return;
    }

    // Usar data_vencimento_cliente e hora_validade como referência
    if (!dadosClienteGlobal?.data_vencimento_cliente) {
        timerEl.style.display = 'none';
        return;
    }

    const dataVenc = parseDateDDMMAAAA(dadosClienteGlobal.data_vencimento_cliente);
    if (!dataVenc) { timerEl.style.display = 'none'; return; }

    const horaVal = dadosClienteGlobal.hora_validade || '23:59';
    const partesHora = horaVal.split(':');
    dataVenc.setHours(parseInt(partesHora[0], 10) || 23, parseInt(partesHora[1], 10) || 59, 0, 0);

    const agora = new Date();
    const diffMs = dataVenc.getTime() - agora.getTime();

    if (diffMs <= 0) {
        timerEl.innerHTML = '<span class="timer-icone">⏰</span> <span>Renove agora e evite cancelamento</span>';
        timerEl.className = 'timer-validade timer-validade-expirado';
        timerEl.style.display = 'flex';
    } else {
        // Verificar se vence hoje
        const hoje = new Date();
        const ehHoje = dataVenc.getDate() === hoje.getDate() &&
                       dataVenc.getMonth() === hoje.getMonth() &&
                       dataVenc.getFullYear() === hoje.getFullYear();

        if (ehHoje) {
            timerEl.innerHTML = `<span class="timer-icone">⏰</span> <span>Oferta válida até hoje às ${horaVal}</span>`;
            timerEl.className = 'timer-validade timer-validade-hoje';
            timerEl.style.display = 'flex';
        } else {
            // Vence em breve (próximos dias)
            const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (dias <= 3) {
                timerEl.innerHTML = `<span class="timer-icone">⏰</span> <span>Renove hoje e evite interrupção</span>`;
                timerEl.className = 'timer-validade timer-validade-alerta';
                timerEl.style.display = 'flex';
            } else {
                timerEl.style.display = 'none';
            }
        }
    }
}

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

// ---------- Parse DD/MM/AAAA ----------
function parseDateDDMMAAAA(str) {
    if (!str) return null;
    const partes = str.split('/');
    if (partes.length !== 3) return null;
    const d = parseInt(partes[0], 10);
    const m = parseInt(partes[1], 10) - 1;
    const y = parseInt(partes[2], 10);
    const date = new Date(y, m, d);
    if (isNaN(date.getTime())) return null;
    return date;
}

// ---------- Modal de Mensagens (fechar) ----------
function fecharModalMensagem() {
    const modal = document.getElementById('modal-mensagem-admin');
    if (modal) modal.style.display = 'none';
}

// ---------- Editar Dados Cadastrais (Modal) ----------
document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-config-cliente')) {
        abrirModalEditarDados();
    }
});

function abrirModalEditarDados() {
    const modal = document.getElementById('modal-editar-dados');
    if (!modal || !dadosClienteGlobal) return;

    // Campos somente leitura
    document.getElementById('edit-nome').value = dadosClienteGlobal.nome_completo || '';
    document.getElementById('edit-email').value = userGlobal?.email || dadosClienteGlobal.email || '';
    document.getElementById('edit-cpf').value = dadosClienteGlobal.cpf || '';
    document.getElementById('edit-usuario').value = dadosClienteGlobal.usuario || '';
    document.getElementById('edit-senha').value = dadosClienteGlobal.senha_servico || '';
    document.getElementById('edit-pacote').value = dadosClienteGlobal.pacote || '';

    // Campos editáveis
    document.getElementById('edit-telefone').value = dadosClienteGlobal.telefone || '';
    const end = dadosClienteGlobal.dados_endereco || {};
    document.getElementById('edit-cep').value = end.cep || '';
    document.getElementById('edit-endereco').value = end.endereco || '';
    document.getElementById('edit-numero').value = end.numero || '';
    document.getElementById('edit-complemento').value = end.complemento || '';
    document.getElementById('edit-bairro').value = end.bairro || '';
    document.getElementById('edit-cidade').value = end.cidade || '';
    document.getElementById('edit-estado').value = end.estado || '';

    modal.style.display = 'flex';
}

function fecharModalEditarDados() {
    const modal = document.getElementById('modal-editar-dados');
    if (modal) modal.style.display = 'none';
}

document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-fechar-editar-dados')) fecharModalEditarDados();
    const modal = document.getElementById('modal-editar-dados');
    if (e.target === modal) fecharModalEditarDados();
});

document.addEventListener('click', async (e) => {
    if (!e.target.closest('#btn-solicitar-exclusao')) return;
    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) modal.style.display = 'flex';
});

document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-cancelar-exclusao')) {
        const modal = document.getElementById('modal-confirmar-exclusao');
        if (modal) modal.style.display = 'none';
    }
    const modal = document.getElementById('modal-confirmar-exclusao');
    if (e.target === modal) modal.style.display = 'none';
});

document.addEventListener('click', async (e) => {
    if (!e.target.closest('#btn-confirmar-exclusao')) return;
    if (!userGlobal) return;

    const btn = document.getElementById('btn-confirmar-exclusao');
    btn.disabled = true;
    btn.textContent = 'Processando...';

    try {
        await updateDoc(doc(db, 'clientes', userGlobal.uid), {
            status_conta: 'exclusao_solicitada'
        });

        await addDoc(collection(db, 'confirmacoes_pagamento'), {
            tipo: 'exclusao_conta',
            email_cliente: userGlobal.email,
            nome_cliente: dadosClienteGlobal?.nome_completo || userGlobal.email,
            status: 'pendente',
            data: serverTimestamp(),
            fatura_referencia: 'Solicitação de exclusão de conta'
        });

        document.getElementById('modal-confirmar-exclusao').style.display = 'none';
        fecharModalEditarDados();
        mostrarToast('Solicitação de exclusão enviada. Seus dados serão removidos em até 30 dias.', 'sucesso');
    } catch (error) {
        console.error('Erro ao solicitar exclusão:', error);
        mostrarToast('Erro ao enviar solicitação. Tente novamente.', 'erro');
    }

    btn.disabled = false;
    btn.textContent = 'Confirmar Exclusão';
});

// ---------- Banner de Promoção ----------
function renderizarBannerPromocao(promo) {
    const bannerEl = document.getElementById('banner-promocao');
    if (!bannerEl || !promo || !promo.ativa) return;
    if (!promo.titulo && !promo.texto) return;

    const tituloHtml = promo.titulo ? `<p class="banner-promocao-titulo">${escapeHTML(promo.titulo)}</p>` : '';
    const textoHtml = promo.texto ? `<p class="banner-promocao-texto">${escapeHTML(promo.texto)}</p>` : '';

    bannerEl.innerHTML = `
        <div class="banner-promocao-icone">🎉</div>
        <div class="banner-promocao-conteudo">${tituloHtml}${textoHtml}</div>
    `;
    bannerEl.style.display = 'flex';
}

// ---------- Card Dados da Conta ----------
function preencherDadosConta() {
    if (!dadosClienteGlobal) return;
    const usuarioEl = document.getElementById('dados-conta-usuario');
    const senhaEl = document.getElementById('dados-conta-senha');
    const pacoteEl = document.getElementById('dados-conta-pacote');
    if (usuarioEl) usuarioEl.textContent = dadosClienteGlobal.usuario || '--';
    if (senhaEl) {
        senhaEl.textContent = '********';
        senhaEl.dataset.real = dadosClienteGlobal.senha_servico || '';
        senhaEl.dataset.visivel = 'false';
    }
    if (pacoteEl) pacoteEl.textContent = dadosClienteGlobal.pacote || '--';
}

// Toggle mostrar/ocultar senha
document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-toggle-senha')) {
        const senhaEl = document.getElementById('dados-conta-senha');
        if (!senhaEl) return;
        const visivel = senhaEl.dataset.visivel === 'true';
        if (visivel) {
            senhaEl.textContent = '********';
            senhaEl.dataset.visivel = 'false';
        } else {
            senhaEl.textContent = senhaEl.dataset.real || '';
            senhaEl.dataset.visivel = 'true';
        }
    }
});

// Copiar usuário
document.addEventListener('click', async (e) => {
    if (!e.target.closest('#btn-copiar-usuario')) return;
    const val = dadosClienteGlobal?.usuario;
    if (!val) return;
    await copiarTexto(val, 'Usuário copiado!');
});

// Copiar senha
document.addEventListener('click', async (e) => {
    if (!e.target.closest('#btn-copiar-senha')) return;
    const val = dadosClienteGlobal?.senha_servico;
    if (!val) return;
    await copiarTexto(val, 'Senha copiada!');
});

async function copiarTexto(texto, msgSucesso) {
    try {
        await navigator.clipboard.writeText(texto);
        mostrarToast(msgSucesso, 'sucesso');
    } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = texto;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            mostrarToast(msgSucesso, 'sucesso');
        } catch {
            mostrarToast('Não foi possível copiar.', 'erro');
        }
    }
}

// ---------- Countdown de Bloqueio de Acesso ----------
function renderizarCountdownBloqueio() {
    const el = document.getElementById('countdown-bloqueio');
    if (!el || !dadosClienteGlobal?.data_vencimento_cliente) return;

    const dataVenc = parseDateDDMMAAAA(dadosClienteGlobal.data_vencimento_cliente);
    if (!dataVenc) return;

    const horaVal = dadosClienteGlobal.hora_validade || '23:59';
    const partesHora = horaVal.split(':');
    dataVenc.setHours(parseInt(partesHora[0], 10) || 23, parseInt(partesHora[1], 10) || 59, 0, 0);

    function atualizar() {
        const agora = Date.now();
        const diffMs = dataVenc.getTime() - agora;

        if (diffMs <= 0) {
            el.innerHTML = '<span class="countdown-icone">🔒</span><span>Acesso interrompido — realize o pagamento para reativar</span>';
            el.className = 'countdown-bloqueio countdown-bloqueio-expirado';
            el.style.display = 'flex';
            return false; // parar interval
        }

        const horasTotal = diffMs / (1000 * 60 * 60);
        if (horasTotal > 24) {
            el.style.display = 'none';
            return false;
        }

        const h = Math.floor(horasTotal);
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        let textoTempo = '';
        if (h > 0) textoTempo = `${h}h ${m}min`;
        else textoTempo = `${m} minuto${m !== 1 ? 's' : ''}`;

        el.innerHTML = `<span class="countdown-icone">⏳</span><span>Acesso será interrompido em: <strong>${textoTempo}</strong></span>`;
        el.className = horasTotal <= 3 ? 'countdown-bloqueio countdown-bloqueio-critico' : 'countdown-bloqueio countdown-bloqueio-alerta';
        el.style.display = 'flex';
        return true; // continuar
    }

    if (atualizar()) {
        const intervalo = setInterval(() => {
            if (!atualizar()) clearInterval(intervalo);
        }, 60000);
    }
}
