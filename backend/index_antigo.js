const express = require('express');
const cors = require('cors');
const conexao = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Confere se o CPF é válido: 11 números e os dois dígitos verificadores corretos
function cpfValido(cpf) {
    if (!/^\d{11}$/.test(cpf)) {
        return false;
    }
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }
    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;
    if (digito1 !== Number(cpf[9])) {
        return false;
    }
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }
    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;
    return digito2 === Number(cpf[10]);
}

// Deixa só os números do CPF (tira pontos e traço)
function limparCpf(cpf) {
    return String(cpf || '').replace(/\D/g, '');
}

// Listar todos os voluntários
app.get('/voluntarios', (req, res) => {
    conexao.query('SELECT * FROM voluntarios', (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao buscar voluntários' });
        }
        res.json(resultados);
    });
});

// Buscar um voluntário pelo id
app.get('/voluntarios/:id', (req, res) => {
    const { id } = req.params;
    conexao.query('SELECT * FROM voluntarios WHERE id = ?', [id], (erro, resultados) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao buscar voluntário' });
        }
        res.json(resultados[0]);
    });
});

// Cadastrar um novo voluntário
app.post('/voluntarios', (req, res) => {
    const { nome, email, telefone, sexo, idade, estado_civil } = req.body;
    const cpf = limparCpf(req.body.cpf);

    if (!cpfValido(cpf)) {
        return res.status(400).json({ erro: 'CPF inválido. Confira os 11 números.' });
    }

    conexao.query('SELECT id FROM voluntarios WHERE cpf = ?', [cpf], (erro, existentes) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao verificar o CPF' });
        }
        if (existentes.length > 0) {
            return res.status(409).json({ erro: 'Já existe um voluntário cadastrado com este CPF.' });
        }
        const sql = 'INSERT INTO voluntarios (nome, email, telefone, cpf, sexo, idade, estado_civil) VALUES (?, ?, ?, ?, ?, ?, ?)';
        conexao.query(sql, [nome, email, telefone, cpf, sexo, idade, estado_civil], (erroGravar, resultado) => {
            if (erroGravar) {
                return res.status(500).json({ erro: 'Erro ao cadastrar voluntário' });
            }
            res.status(201).json({ mensagem: 'Voluntário cadastrado com sucesso!', id: resultado.insertId });
        });
    });
});

// Atualizar um voluntário
app.put('/voluntarios/:id', (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, sexo, idade, estado_civil } = req.body;
    const cpf = limparCpf(req.body.cpf);

    if (!cpfValido(cpf)) {
        return res.status(400).json({ erro: 'CPF inválido. Confira os 11 números.' });
    }

    conexao.query('SELECT id FROM voluntarios WHERE cpf = ? AND id <> ?', [cpf, id], (erro, existentes) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao verificar o CPF' });
        }
        if (existentes.length > 0) {
            return res.status(409).json({ erro: 'Já existe outro voluntário cadastrado com este CPF.' });
        }
        const sql = 'UPDATE voluntarios SET nome=?, email=?, telefone=?, cpf=?, sexo=?, idade=?, estado_civil=? WHERE id=?';
        conexao.query(sql, [nome, email, telefone, cpf, sexo, idade, estado_civil, id], (erroGravar) => {
            if (erroGravar) {
                return res.status(500).json({ erro: 'Erro ao atualizar voluntário' });
            }
            res.json({ mensagem: 'Voluntário atualizado com sucesso!' });
        });
    });
});

// Deletar um voluntário
app.delete('/voluntarios/:id', (req, res) => {
    const { id } = req.params;
    conexao.query('DELETE FROM voluntarios WHERE id = ?', [id], (erro) => {
        if (erro) {
            return res.status(500).json({ erro: 'Erro ao deletar voluntário' });
        }
        res.json({ mensagem: 'Voluntário deletado com sucesso!' });
    });
});

const PORTA = 3001;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});