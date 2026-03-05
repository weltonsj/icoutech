// ==============================================
// Painel Admin - icouTv Portal V1.0
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
    serverTimestamp
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

// Estado
let arquivoPdfSelecionado = null;
let editarPdfSelecionado = null;
let clientesCache = {}; // Cache de clientes por UID (objeto completo)
let faturasCache = {}; // Cache de faturas por ID (objeto completo)

// Modal Editar Cliente
const modalEditarCliente = document.getElementById('modal-editar-cliente');
const editarClienteId = document.getElementById('editar-cliente-id');
const editarClienteNome = document.getElementById('editar-cliente-nome');
const editarClienteEmail = document.getElementById('editar-cliente-email');
const editarClienteStatus = document.getElementById('editar-cliente-status');
const btnFecharModalCliente = document.getElementById('btn-fechar-modal-cliente');
const btnSalvarEdicaoCliente = document.getElementById('btn-salvar-edicao-cliente');
const btnSalvarEdicaoClienteTexto = document.getElementById('btn-salvar-edicao-cliente-texto');
const btnSalvarEdicaoClienteSpinner = document.getElementById('btn-salvar-edicao-cliente-spinner');

// Modal Editar Fatura
const modalEditarFatura = document.getElementById('modal-editar-fatura');
const editarFaturaId = document.getElementById('editar-fatura-id');
const editarFaturaCliente = document.getElementById('editar-fatura-cliente');
const editarFaturaMes = document.getElementById('editar-fatura-mes');
const editarFaturaVencimento = document.getElementById('editar-fatura-vencimento');
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

// ---------- Verificar Autenticação & Permissão ----------
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../index.html';
        return;
    }

    // Verificar se é o administrador
    if (user.email !== ADMIN_EMAIL) {
        carregando.style.display = 'none';
        acessoNegado.style.display = 'flex';
        return;
    }

    adminEmail.textContent = user.email;
    carregando.style.display = 'none';
    adminApp.style.display = 'block';

    // Carregar dados
    await carregarClientes();
    await carregarFaturas();
    await carregarMensagens();
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
// BUSCAR CLIENTE POR E-MAIL
// ========================================
btnBuscarCliente.addEventListener('click', async () => {
    const email = clienteEmailInput.value.trim();
    if (!email) {
        mostrarToast('Informe o e-mail do cliente.', 'erro');
        return;
    }

    clienteInfo.style.display = 'none';
    clienteNaoEncontrado.style.display = 'none';

    try {
        const clientesRef = collection(db, 'clientes');
        const q = query(clientesRef, where('email', '==', email));
        const snap = await getDocs(q);

        if (!snap.empty) {
            const clienteDoc = snap.docs[0];
            const dados = clienteDoc.data();
            clienteNomeEncontrado.textContent = `${dados.nome_completo} (${dados.status_conta})`;
            clienteUid.textContent = clienteDoc.id;
            clienteInfo.style.display = 'block';
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

// ---------- Upload para Cloudinary ----------
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

    // Validações
    if (!uidCliente) {
        mostrarToast('Busque e selecione um cliente primeiro.', 'erro');
        return;
    }
    if (!mesRef) {
        mostrarToast('Informe o mês de referência.', 'erro');
        return;
    }
    if (!dataVenc) {
        mostrarToast('Informe a data de vencimento.', 'erro');
        return;
    }
    if (!codigoPix) {
        mostrarToast('Informe o código PIX.', 'erro');
        return;
    }

    setCarregandoFatura(true);

    try {
        let urlPdf = urlPdfManual.value.trim();

        // Se tem arquivo PDF selecionado, fazer upload no Cloudinary
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

        // Salvar fatura no Firestore
        const faturaData = {
            id_cliente: uidCliente,
            mes_referencia: mesRef,
            data_vencimento: dataVenc,
            url_pdf_cloudinary: urlPdf,
            codigo_pix_copia: codigoPix,
            status_pagamento: status,
            data_geracao: serverTimestamp()
        };

        await addDoc(collection(db, 'faturas'), faturaData);

        mostrarToast('Fatura salva com sucesso!', 'sucesso');

        // Limpar formulário
        formFatura.reset();
        clienteInfo.style.display = 'none';
        clienteUid.textContent = '';
        nomeArquivo.style.display = 'none';
        arquivoPdfSelecionado = null;

        // Recarregar tabela de faturas
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
// Usa um app Firebase secundário para criar o usuário
// sem deslogar o admin da sessão principal.
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

    // Gerar senha temporária aleatória (o cliente vai redefinir via e-mail)
    const senha = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(36)).join('').slice(0, 16);

    setCarregandoCliente(true);

    try {
        // Verificar se já existe no Firestore
        const clientesRef = collection(db, 'clientes');
        const q = query(clientesRef, where('email', '==', email));
        const snap = await getDocs(q);

        if (!snap.empty) {
            mostrarToast('Já existe um cliente com este e-mail.', 'erro');
            setCarregandoCliente(false);
            return;
        }

        // ----- CRIAR USUÁRIO NO FIREBASE AUTH -----
        // App secundário para não deslogar o admin
        const appSecundario = initializeApp(firebaseConfig, 'cadastro-cliente');
        const authSecundario = getAuth(appSecundario);

        let uid;
        try {
            const userCredential = await createUserWithEmailAndPassword(authSecundario, email, senha);
            uid = userCredential.user.uid;

            // Deslogar do app secundário (não afeta o admin)
            await signOut(authSecundario);
        } catch (authError) {
            // Limpar app secundário em caso de erro
            await deleteApp(appSecundario);

            const msgErro = traduzirErroAuth(authError.code);
            mostrarToast(msgErro, 'erro');
            setCarregandoCliente(false);
            return;
        }

        // Deletar app secundário
        await deleteApp(appSecundario);

        // ----- SALVAR NO FIRESTORE (com o UID do Auth como ID do documento) -----
        await setDoc(doc(db, 'clientes', uid), {
            nome_completo: nome,
            email: email,
            status_conta: status
        });

        // ----- ENVIAR E-MAIL DE REDEFINIÇÃO DE SENHA -----
        try {
            await sendPasswordResetEmail(auth, email);
            mostrarToast(`Cliente "${nome}" criado! E-mail de redefinição enviado.`, 'sucesso');
        } catch (emailError) {
            console.warn('Aviso: Não foi possível enviar e-mail de redefinição:', emailError);
            mostrarToast(`Cliente "${nome}" criado com sucesso! (e-mail não enviado)`, 'sucesso');
        }

        // Limpar formulário
        formCliente.reset();

        // Recarregar tabela
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
// CARREGAR CLIENTES
// ========================================
async function carregarClientes() {
    try {
        const clientesRef = collection(db, 'clientes');
        const snap = await getDocs(clientesRef);

        tabelaClientesBody.innerHTML = '';
        clientesCache = {};

        if (snap.empty) {
            tabelaClientes.style.display = 'none';
            listaClientesVazia.innerHTML = '<p>Nenhum cliente cadastrado.</p>';
            listaClientesVazia.style.display = 'block';
            return;
        }

        listaClientesVazia.style.display = 'none';
        tabelaClientes.style.display = 'table';

        snap.forEach((docSnap) => {
            const dados = docSnap.data();
            clientesCache[docSnap.id] = dados;

            const statusCliente = dados.status_conta || 'ativa';
            const nomeCliente = escapeHTML(dados.nome_completo || dados.email);
            const tr = document.createElement('tr');

            // Botões comuns: Editar + Reenviar senha
            let botoesHtml = `
                <button class="btn btn-sm btn-editar-cliente" data-id="${docSnap.id}" style="background:var(--cor-primaria);color:#fff;border:none;" title="Editar cliente">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                </button>
                <button class="btn btn-sm btn-reenviar-senha" data-id="${docSnap.id}" style="background:#3b82f6;color:#fff;border:none;" title="Reenviar e-mail de redefinição de senha">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                </button>`;

            if (statusCliente === 'ativa') {
                // Ativa: pode Inativar ou Excluir
                botoesHtml += `
                    <button class="btn btn-sm btn-alterar-status" data-id="${docSnap.id}" data-nome="${nomeCliente}" data-novo-status="inativa" style="background:var(--cor-pendente);color:#fff;border:none;" title="Inativar cliente">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    </button>
                    <button class="btn btn-perigo btn-sm btn-alterar-status" data-id="${docSnap.id}" data-nome="${nomeCliente}" data-novo-status="excluida" title="Excluir cliente">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>`;
            } else if (statusCliente === 'inativa') {
                // Inativa: pode Ativar ou Excluir
                botoesHtml += `
                    <button class="btn btn-sm btn-alterar-status" data-id="${docSnap.id}" data-nome="${nomeCliente}" data-novo-status="ativa" style="background:var(--cor-sucesso);color:#fff;border:none;" title="Ativar cliente">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button class="btn btn-perigo btn-sm btn-alterar-status" data-id="${docSnap.id}" data-nome="${nomeCliente}" data-novo-status="excluida" title="Excluir cliente">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>`;
            } else {
                // Excluída: pode Ativar
                botoesHtml += `
                    <button class="btn btn-sm btn-alterar-status" data-id="${docSnap.id}" data-nome="${nomeCliente}" data-novo-status="ativa" style="background:var(--cor-sucesso);color:#fff;border:none;" title="Reativar cliente">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>`;
            }

            tr.innerHTML = `
                <td>${escapeHTML(dados.nome_completo || '--')}</td>
                <td style="font-size:var(--fonte-tamanho-xs);">${escapeHTML(dados.email || '--')}</td>
                <td><span class="badge badge-${statusCliente}">${statusCliente}</span></td>
                <td class="acoes">${botoesHtml}</td>
            `;
            tabelaClientesBody.appendChild(tr);
        });

        // Event listeners para todos os botões de alteração de status
        document.querySelectorAll('.btn-alterar-status').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const botao = e.currentTarget;
                const clienteId = botao.dataset.id;
                const nomeCliente = botao.dataset.nome;
                const novoStatus = botao.dataset.novoStatus;

                // Desabilitar botão para evitar duplo clique
                botao.disabled = true;

                try {
                    await updateDoc(doc(db, 'clientes', clienteId), {
                        status_conta: novoStatus
                    });
                    const labelsStatus = { 'ativa': 'ativado', 'inativa': 'inativado', 'excluida': 'excluído' };
                    mostrarToast(`Cliente "${nomeCliente}" ${labelsStatus[novoStatus]} com sucesso!`, 'sucesso');
                    await carregarClientes();
                } catch (error) {
                    console.error('Erro ao alterar status:', error);
                    mostrarToast('Erro ao alterar status do cliente.', 'erro');
                    botao.disabled = false;
                }
            });
        });

        // Event listeners: Editar cliente
        document.querySelectorAll('.btn-editar-cliente').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const clienteId = e.currentTarget.dataset.id;
                abrirModalEditarCliente(clienteId);
            });
        });

        // Event listeners: Reenviar e-mail de redefinição de senha
        document.querySelectorAll('.btn-reenviar-senha').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const clienteId = e.currentTarget.dataset.id;
                const dados = clientesCache[clienteId];
                if (!dados || !dados.email) {
                    mostrarToast('E-mail do cliente não encontrado.', 'erro');
                    return;
                }
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

    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        listaClientesVazia.innerHTML = '<p style="color:var(--cor-erro);">Erro ao carregar clientes.</p>';
    }
}

// ========================================
// MENSAGENS PERSONALIZADAS (CRUD)
// ========================================
let mensagensLista = []; // Array local das mensagens

async function carregarMensagens() {
    try {
        const docRef = doc(db, 'configuracoes', 'mensagens');
        const docSnap = await getDoc(docRef);
        let precisaMigrar = false;
        if (docSnap.exists()) {
            const dados = docSnap.data();
            if (dados.lista && Array.isArray(dados.lista)) {
                mensagensLista = dados.lista;
                // Migrar mensagens antigas sem os campos ativa/ordem
                mensagensLista.forEach((msg, i) => {
                    if (msg.ativa === undefined) { msg.ativa = true; precisaMigrar = true; }
                    if (msg.ordem === undefined) { msg.ordem = i + 1; precisaMigrar = true; }
                });
            } else if (dados.mensagem_usuario_excluido) {
                mensagensLista = [{
                    id: gerarIdMensagem(),
                    texto: dados.mensagem_usuario_excluido,
                    destino: 'excluida',
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
        // Ordenar por campo ordem
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

function renderizarListaMensagens() {
    if (!listaMensagensEl) return;
    listaMensagensEl.innerHTML = '';

    if (mensagensLista.length === 0) {
        listaMensagensEl.innerHTML = '<p style="font-size:var(--fonte-tamanho-sm);color:var(--cor-texto-claro);text-align:center;padding:var(--espacamento-md);">Nenhuma mensagem cadastrada.</p>';
        return;
    }

    const labelsDestino = { 'ativa': 'Ativo', 'inativa': 'Inativo', 'excluida': 'Excluído' };
    const coresDestino = { 'ativa': 'var(--cor-sucesso)', 'inativa': 'var(--cor-pendente)', 'excluida': 'var(--cor-erro)' };

    mensagensLista.forEach((msg, index) => {
        const isAtiva = msg.ativa !== false;
        const item = document.createElement('div');
        item.className = `lista-mensagens-item${!isAtiva ? ' msg-desativada' : ''}`;
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
                    Para: ${labelsDestino[msg.destino] || msg.destino}
                    <span class="msg-status-badge ${isAtiva ? 'msg-badge-ativa' : 'msg-badge-desativada'}">${isAtiva ? 'Ativa' : 'Desativada'}</span>
                </div>
                <div class="msg-texto">${escapeHTML(msg.texto)}</div>
            </div>
            <div class="msg-acoes">
                <button class="btn-toggle-msg" data-msg-id="${msg.id}" title="${isAtiva ? 'Desativar' : 'Ativar'} mensagem">
                    ${isAtiva
                        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--cor-pendente)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>'
                        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--cor-sucesso)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                    }
                </button>
                <button class="btn-excluir-msg" data-msg-id="${msg.id}" title="Excluir mensagem">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;
        listaMensagensEl.appendChild(item);
    });

    // Event listeners: Toggle ativa/desativada
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

    // Event listeners: Reordenar (subir)
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

    // Event listeners: Reordenar (descer)
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

    // Event listeners: Excluir
    listaMensagensEl.querySelectorAll('.btn-excluir-msg').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const msgId = e.currentTarget.dataset.msgId;
            if (confirm('Excluir esta mensagem?')) {
                mensagensLista = mensagensLista.filter(m => m.id !== msgId);
                recalcularOrdem();
                try {
                    await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
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

btnSalvarMensagens.addEventListener('click', async () => {
    const texto = msgTexto.value.trim();
    const destino = msgDestino.value;

    if (!texto) {
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
            criadoEm: new Date().toISOString()
        };
        mensagensLista.push(novaMensagem);

        await setDoc(doc(db, 'configuracoes', 'mensagens'), { lista: mensagensLista });
        mostrarToast('Mensagem salva com sucesso!', 'sucesso');
        msgTexto.value = '';
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
// CARREGAR FATURAS (com edição de status)
// ========================================
async function carregarFaturas() {
    try {
        const faturasRef = collection(db, 'faturas');
        const q = query(faturasRef, orderBy('data_geracao', 'desc'), limit(20));
        const snap = await getDocs(q);

        tabelaFaturasBody.innerHTML = '';

        if (snap.empty) {
            tabelaFaturas.style.display = 'none';
            listaFaturasVazia.innerHTML = '<p>Nenhuma fatura cadastrada.</p>';
            listaFaturasVazia.style.display = 'block';
            return;
        }

        listaFaturasVazia.style.display = 'none';
        tabelaFaturas.style.display = 'table';

        snap.forEach((docSnap) => {
            const dados = docSnap.data();
            faturasCache[docSnap.id] = dados;
            const dadosCliente = clientesCache[dados.id_cliente];
            const nomeCliente = dadosCliente?.nome_completo || dadosCliente?.email || dados.id_cliente;
            const statusAtual = dados.status_pagamento || 'pendente';
            const isPendente = statusAtual === 'pendente';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size:var(--fonte-tamanho-xs);">${escapeHTML(nomeCliente)}</td>
                <td>${escapeHTML(dados.mes_referencia || '--')}</td>
                <td><span class="badge badge-${statusAtual}">${statusAtual}</span></td>
                <td class="acoes">
                    <button class="btn btn-sm btn-editar-fatura" data-id="${docSnap.id}" style="background:var(--cor-primaria);color:#fff;border:none;" title="Editar fatura">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                    </button>
                    ${dados.url_pdf_cloudinary
                        ? `<a href="${escapeHTML(dados.url_pdf_cloudinary)}" target="_blank" class="btn btn-secundario btn-sm">PDF</a>`
                        : ''
                    }
                    ${isPendente
                        ? `<button class="btn btn-sm btn-marcar-pago" data-id="${docSnap.id}" style="background:var(--cor-sucesso);color:#fff;border:none;" title="Marcar como Pago">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                           </button>`
                        : `<button class="btn btn-sm btn-marcar-pendente" data-id="${docSnap.id}" style="background:var(--cor-pendente);color:#fff;border:none;" title="Marcar como Pendente">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                           </button>`
                    }
                    <button class="btn btn-perigo btn-sm btn-deletar-fatura" data-id="${docSnap.id}" title="Excluir fatura">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </td>
            `;
            tabelaFaturasBody.appendChild(tr);
        });

        // Event listeners: Marcar como PAGO
        document.querySelectorAll('.btn-marcar-pago').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const faturaId = e.currentTarget.dataset.id;
                try {
                    await updateDoc(doc(db, 'faturas', faturaId), {
                        status_pagamento: 'pago'
                    });
                    mostrarToast('Fatura marcada como PAGO!', 'sucesso');
                    await carregarFaturas();
                } catch (error) {
                    console.error('Erro ao atualizar:', error);
                    mostrarToast('Erro ao atualizar status.', 'erro');
                }
            });
        });

        // Event listeners: Marcar como PENDENTE
        document.querySelectorAll('.btn-marcar-pendente').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const faturaId = e.currentTarget.dataset.id;
                try {
                    await updateDoc(doc(db, 'faturas', faturaId), {
                        status_pagamento: 'pendente'
                    });
                    mostrarToast('Fatura marcada como PENDENTE.', 'info');
                    await carregarFaturas();
                } catch (error) {
                    console.error('Erro ao atualizar:', error);
                    mostrarToast('Erro ao atualizar status.', 'erro');
                }
            });
        });

        // Event listeners: Deletar
        document.querySelectorAll('.btn-deletar-fatura').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const faturaId = e.currentTarget.dataset.id;
                if (confirm('Tem certeza que deseja excluir esta fatura?')) {
                    try {
                        await deleteDoc(doc(db, 'faturas', faturaId));
                        mostrarToast('Fatura excluída.', 'sucesso');
                        await carregarFaturas();
                    } catch (error) {
                        console.error('Erro ao excluir:', error);
                        mostrarToast('Erro ao excluir fatura.', 'erro');
                    }
                }
            });
        });

        // Event listeners: Editar fatura
        document.querySelectorAll('.btn-editar-fatura').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const faturaId = e.currentTarget.dataset.id;
                abrirModalEditarFatura(faturaId);
            });
        });

    } catch (error) {
        console.error('Erro ao carregar faturas:', error);
        listaFaturasVazia.innerHTML = '<p style="color:var(--cor-erro);">Erro ao carregar faturas.</p>';
    }
}

// ========================================
// EDIÇÃO DE CLIENTES (Modal)
// ========================================

function abrirModalEditarCliente(clienteId) {
    const dados = clientesCache[clienteId];
    if (!dados) {
        mostrarToast('Dados do cliente não encontrados.', 'erro');
        return;
    }
    editarClienteId.value = clienteId;
    editarClienteNome.value = dados.nome_completo || '';
    editarClienteEmail.value = dados.email || '';
    editarClienteStatus.value = dados.status_conta || 'ativa';
    modalEditarCliente.style.display = 'flex';
}

function fecharModalEditarCliente() {
    modalEditarCliente.style.display = 'none';
    editarClienteId.value = '';
    editarClienteNome.value = '';
    editarClienteEmail.value = '';
}

btnFecharModalCliente.addEventListener('click', fecharModalEditarCliente);
modalEditarCliente.addEventListener('click', (e) => {
    if (e.target === modalEditarCliente) fecharModalEditarCliente();
});

btnSalvarEdicaoCliente.addEventListener('click', async () => {
    const clienteId = editarClienteId.value;
    const nome = editarClienteNome.value.trim();
    const status = editarClienteStatus.value;

    if (!nome) {
        mostrarToast('Informe o nome do cliente.', 'erro');
        return;
    }

    btnSalvarEdicaoCliente.disabled = true;
    btnSalvarEdicaoClienteTexto.style.display = 'none';
    btnSalvarEdicaoClienteSpinner.style.display = 'block';

    try {
        await updateDoc(doc(db, 'clientes', clienteId), {
            nome_completo: nome,
            status_conta: status
        });
        mostrarToast('Cliente atualizado com sucesso!', 'sucesso');
        fecharModalEditarCliente();
        await carregarClientes();
        await carregarFaturas(); // Atualizar nomes nas faturas
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

// Upload area para edição de fatura
editarUploadArea.addEventListener('click', () => editarInputPdf.click());

editarUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    editarUploadArea.classList.add('arrastando');
});

editarUploadArea.addEventListener('dragleave', () => {
    editarUploadArea.classList.remove('arrastando');
});

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
    if (!dados) {
        mostrarToast('Dados da fatura não encontrados.', 'erro');
        return;
    }
    const dadosCliente = clientesCache[dados.id_cliente];
    const nomeCliente = dadosCliente?.nome_completo || dadosCliente?.email || dados.id_cliente;

    editarFaturaId.value = faturaId;
    editarFaturaCliente.value = nomeCliente;
    editarFaturaMes.value = dados.mes_referencia || '';
    editarFaturaVencimento.value = dados.data_vencimento || '';
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
modalEditarFatura.addEventListener('click', (e) => {
    if (e.target === modalEditarFatura) fecharModalEditarFatura();
});

btnSalvarEdicaoFatura.addEventListener('click', async () => {
    const faturaId = editarFaturaId.value;
    const mesRef = editarFaturaMes.value.trim();
    const dataVenc = editarFaturaVencimento.value;
    const codigoPix = editarFaturaPix.value.trim();
    const status = editarFaturaStatus.value;

    if (!mesRef) {
        mostrarToast('Informe o mês de referência.', 'erro');
        return;
    }
    if (!dataVenc) {
        mostrarToast('Informe a data de vencimento.', 'erro');
        return;
    }
    if (!codigoPix) {
        mostrarToast('Informe o código PIX.', 'erro');
        return;
    }

    btnSalvarEdicaoFatura.disabled = true;
    btnSalvarEdicaoFaturaTexto.style.display = 'none';
    btnSalvarEdicaoFaturaSpinner.style.display = 'block';

    try {
        let urlPdf = editarFaturaUrlPdf.value.trim();

        // Se tem novo PDF selecionado, fazer upload
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
            url_pdf_cloudinary: urlPdf,
            codigo_pix_copia: codigoPix,
            status_pagamento: status
        });

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
// UTILITÁRIOS
// ========================================

// Escape HTML para prevenir XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Toast / Notificação
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
