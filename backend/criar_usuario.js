// Cria um usuário para entrar no sistema do Instituto Sereia.
// Como usar (dentro da pasta backend):  node criar_usuario.js

const readline = require('readline');
const bcrypt = require('bcryptjs');
const conexao = require('./db');

const leitor = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function perguntar(texto) {
    return new Promise((resolve) => leitor.question(texto, resolve));
}

async function criar() {
    const nome = (await perguntar('Nome da pessoa: ')).trim();
    const usuario = (await perguntar('Nome de usuário para entrar (sem espaços): ')).trim();
    const senha = await perguntar('Senha (mínimo 8 caracteres): ');
    leitor.close();

    if (nome.length < 3 || usuario.length < 3 || /\s/.test(usuario)) {
        console.log('Nome ou usuário inválido. Tente de novo.');
        return conexao.end();
    }
    if (senha.length < 8) {
        console.log('A senha precisa ter pelo menos 8 caracteres. Tente de novo.');
        return conexao.end();
    }

    // A senha nunca é guardada em texto puro: vira um "hash" criptografado
    const senhaHash = await bcrypt.hash(senha, 10);

    conexao.query(
        'INSERT INTO usuarios (nome, usuario, senha_hash) VALUES (?, ?, ?)',
        [nome, usuario, senhaHash],
        (erro) => {
            if (erro) {
                if (erro.code === 'ER_DUP_ENTRY') {
                    console.log('Esse nome de usuário já existe. Escolha outro.');
                } else {
                    console.log('Erro ao criar o usuário:', erro.message);
                }
            } else {
                console.log('Usuário criado com sucesso!');
            }
            conexao.end();
        }
    );
}

criar();