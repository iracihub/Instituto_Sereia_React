const mysql = require('mysql2');

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'instituto_sereia'
});

conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar no banco:', erro);
        return;
    }
    console.log('Conectado ao banco instituto_sereia!');
});

module.exports = conexao;