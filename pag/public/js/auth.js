// ==============================================
// Autenticação - icouTv Portal V1.0
// ==============================================

import { auth, db, ADMIN_EMAIL } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ---------- Elementos do DOM ----------
const formLogin = document.getElementById('form-login');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const btnLogin = document.getElementById('btn-login');
const btnLoginTexto = document.getElementById('btn-login-texto');
const btnLoginSpinner = document.getElementById('btn-login-spinner');
const authErro = document.getElementById('auth-erro');
const authErroMsg = document.getElementById('auth-erro-msg');
const authSucesso = document.getElementById('auth-sucesso');
const authSucessoMsg = document.getElementById('auth-sucesso-msg');
const btnToggleSenha = document.getElementById('btn-toggle-senha');
const iconeOlhoAberto = document.getElementById('icone-olho-aberto');
const iconeOlhoFechado = document.getElementById('icone-olho-fechado');
const linkSemSenha = document.getElementById('link-sem-senha');
const linkRecuperarSenha = document.getElementById('link-recuperar-senha');
const grupoSenha = senhaInput.closest('.auth-input-grupo');

// ---------- Estado ----------
let modoLogin = 'senha'; // 'senha' ou 'sem-senha'

// ---------- Verificar callback de Email Link (sign-in sem senha) ----------
if (isSignInWithEmailLink(auth, window.location.href)) {
    let emailParaLogin = localStorage.getItem('emailParaLogin');

    if (!emailParaLogin) {
        emailParaLogin = prompt('Por favor, informe seu e-mail para confirmar o acesso:');
    }

    if (emailParaLogin) {
        signInWithEmailLink(auth, emailParaLogin, window.location.href)
            .then(async (result) => {
                localStorage.removeItem('emailParaLogin');
                const user = result.user;

                if (user.email === ADMIN_EMAIL) {
                    window.location.href = 'admin.html';
                    return;
                }

                const statusCheck = await verificarStatusCliente(user);
                if (statusCheck.bloqueado) {
                    await signOut(auth);
                    mostrarErro(statusCheck.mensagem);
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                }

                window.location.href = 'portal.html';
            })
            .catch((error) => {
                console.error('Erro no login por link:', error);
                mostrarErro('O link de acesso expirou ou é inválido. Solicite um novo.');
                window.history.replaceState({}, document.title, window.location.pathname);
            });
    }
}

// ---------- Verificar se já está logado ----------
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (user.email === ADMIN_EMAIL) {
            window.location.href = 'admin.html';
            return;
        }

        const statusCheck = await verificarStatusCliente(user);
        if (statusCheck.bloqueado) {
            await signOut(auth);
            return;
        }

        window.location.href = 'portal.html';
    }
});

// ---------- Verificar status do cliente e buscar mensagem ----------
async function verificarStatusCliente(user) {
    try {
        const clienteRef = doc(db, 'clientes', user.uid);
        const clienteSnap = await getDoc(clienteRef);

        if (clienteSnap.exists() && clienteSnap.data().status_conta === 'excluida') {
            let mensagem = 'Sua conta foi desativada. Entre em contato com o suporte.';
            try {
                const msgRef = doc(db, 'configuracoes', 'mensagens');
                const msgSnap = await getDoc(msgRef);
                if (msgSnap.exists()) {
                    const dados = msgSnap.data();
                    const lista = dados.lista || [];
                    const msgsExcluida = lista.filter(m => m.destino === 'excluida');
                    if (msgsExcluida.length > 0) {
                        mensagem = msgsExcluida.map(m => m.texto).join('\n\n');
                    } else if (dados.mensagem_usuario_excluido) {
                        mensagem = dados.mensagem_usuario_excluido;
                    }
                }
            } catch (msgError) {
                console.warn('Erro ao buscar mensagem:', msgError);
            }
            return { bloqueado: true, mensagem };
        }
    } catch (err) {
        console.warn('Erro ao verificar status:', err);
    }
    return { bloqueado: false, mensagem: '' };
}

// ---------- Toggle Modo Login (com/sem senha) ----------
linkSemSenha.addEventListener('click', (e) => {
    e.preventDefault();
    esconderErro();
    esconderSucesso();

    if (modoLogin === 'senha') {
        modoLogin = 'sem-senha';
        grupoSenha.style.display = 'none';
        btnLoginTexto.textContent = 'Enviar link de acesso';
        linkSemSenha.textContent = 'Acessar com senha';
    } else {
        modoLogin = 'senha';
        grupoSenha.style.display = 'block';
        btnLoginTexto.textContent = 'Entrar';
        linkSemSenha.textContent = 'Acessar sem senha';
    }
});

// ---------- Recuperar Senha ----------
linkRecuperarSenha.addEventListener('click', async (e) => {
    e.preventDefault();
    esconderErro();
    esconderSucesso();

    const email = emailInput.value.trim();
    if (!email) {
        mostrarErro('Informe seu e-mail no campo acima para recuperar a senha.');
        emailInput.focus();
        return;
    }

    setCarregando(true);

    try {
        await sendPasswordResetEmail(auth, email);
        mostrarSucesso(`E-mail de recuperação enviado para ${email}. Verifique sua caixa de entrada e spam.`);
    } catch (error) {
        console.error('Erro ao enviar recuperação:', error.code);
        if (error.code === 'auth/user-not-found') {
            mostrarErro('Nenhuma conta encontrada com este e-mail.');
        } else if (error.code === 'auth/invalid-email') {
            mostrarErro('E-mail inválido.');
        } else {
            mostrarErro('Erro ao enviar e-mail de recuperação. Tente novamente.');
        }
    }

    setCarregando(false);
});

// ---------- Toggle Mostrar/Ocultar Senha ----------
btnToggleSenha.addEventListener('click', () => {
    const tipo = senhaInput.type === 'password' ? 'text' : 'password';
    senhaInput.type = tipo;

    if (tipo === 'text') {
        iconeOlhoAberto.style.display = 'none';
        iconeOlhoFechado.style.display = 'block';
        btnToggleSenha.setAttribute('aria-label', 'Ocultar senha');
    } else {
        iconeOlhoAberto.style.display = 'block';
        iconeOlhoFechado.style.display = 'none';
        btnToggleSenha.setAttribute('aria-label', 'Mostrar senha');
    }
});

// ---------- Exibir Erro ----------
function mostrarErro(mensagem) {
    authErroMsg.textContent = mensagem;
    authErro.classList.add('visivel');
    esconderSucesso();
}

function esconderErro() {
    authErro.classList.remove('visivel');
}

// ---------- Exibir Sucesso ----------
function mostrarSucesso(mensagem) {
    authSucessoMsg.textContent = mensagem;
    authSucesso.classList.add('visivel');
    esconderErro();
}

function esconderSucesso() {
    authSucesso.classList.remove('visivel');
}

// ---------- Estado de Carregamento ----------
function setCarregando(carregando) {
    btnLogin.disabled = carregando;
    btnLoginTexto.style.display = carregando ? 'none' : 'inline';
    btnLoginSpinner.style.display = carregando ? 'block' : 'none';
    emailInput.disabled = carregando;
    senhaInput.disabled = carregando;
}

// ---------- Traduzir Erros do Firebase ----------
function traduzirErroFirebase(codigoErro) {
    const erros = {
        'auth/invalid-email': 'E-mail inválido. Verifique e tente novamente.',
        'auth/user-disabled': 'Esta conta foi desativada. Entre em contato com o suporte.',
        'auth/user-not-found': 'Nenhuma conta encontrada com este e-mail.',
        'auth/wrong-password': 'Senha incorreta. Tente novamente.',
        'auth/invalid-credential': 'E-mail ou senha incorretos. Verifique e tente novamente.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
        'auth/internal-error': 'Erro interno. Tente novamente mais tarde.'
    };
    return erros[codigoErro] || 'Erro ao fazer login. Tente novamente.';
}

// ---------- Submit do Formulário ----------
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    esconderErro();
    esconderSucesso();

    const email = emailInput.value.trim();

    if (!email) {
        mostrarErro('Por favor, insira seu e-mail.');
        emailInput.focus();
        return;
    }

    // ========== MODO SEM SENHA (Email Link) ==========
    if (modoLogin === 'sem-senha') {
        setCarregando(true);

        try {
            const actionCodeSettings = {
                url: window.location.origin + window.location.pathname,
                handleCodeInApp: true,
            };

            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            localStorage.setItem('emailParaLogin', email);
            mostrarSucesso(`Link de acesso enviado para ${email}. Verifique sua caixa de entrada e spam.`);
        } catch (error) {
            console.error('Erro ao enviar link:', error.code);
            if (error.code === 'auth/invalid-email') {
                mostrarErro('E-mail inválido.');
            } else if (error.code === 'auth/missing-email') {
                mostrarErro('Informe um e-mail válido.');
            } else if (error.code === 'auth/unauthorized-continue-uri') {
                mostrarErro('Domínio não autorizado no Firebase. O administrador precisa adicionar este domínio nas configurações do projeto.');
            } else {
                mostrarErro('Erro ao enviar o link de acesso. Tente novamente.');
            }
        }

        setCarregando(false);
        return;
    }

    // ========== MODO COM SENHA ==========
    const senha = senhaInput.value;

    if (!senha) {
        mostrarErro('Por favor, insira sua senha.');
        senhaInput.focus();
        return;
    }

    setCarregando(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        if (user.email === ADMIN_EMAIL) {
            window.location.href = 'admin.html';
            return;
        }

        const statusCheck = await verificarStatusCliente(user);
        if (statusCheck.bloqueado) {
            await signOut(auth);
            mostrarErro(statusCheck.mensagem);
            setCarregando(false);
            return;
        }

        window.location.href = 'portal.html';
    } catch (error) {
        console.error('Erro de login:', error.code);
        mostrarErro(traduzirErroFirebase(error.code));
        setCarregando(false);
    }
});
