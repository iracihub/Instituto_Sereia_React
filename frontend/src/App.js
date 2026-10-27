import { useState, useEffect } from "react";

const API = "http://localhost:3001/voluntarios";
const API_LOGIN = "http://localhost:3001/login";

const vazio = {
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    sexo: "",
    idade: "",
    estado_civil: ""
}

// ---------- Comunicação com o servidor (sempre enviando a chave de acesso) ----------

function chamar(url, token, aoExpirar, opcoes = {}) {
    return fetch(url, {
        ...opcoes,
        headers: { ...(opcoes.headers || {}), Authorization: `Bearer ${token}` }
    }).then((resposta) => {
        if (resposta.status === 401) {
            aoExpirar()
            throw new Error("sessao")
        }
        return resposta.json()
    })
}

function buscar(setLista, token, aoExpirar) {
    chamar(API, token, aoExpirar)
        .then((dados) => setLista(Array.isArray(dados) ? dados : []))
        .catch(() => setLista([]))
}

// ---------- Funções de apoio das validações ----------

function somenteNumeros(texto) {
    return String(texto || "").replace(/\D/g, "")
}

function formatarCPF(valor) {
    const n = somenteNumeros(valor).slice(0, 11)
    if (n.length <= 3) return n
    if (n.length <= 6) return `${n.slice(0, 3)}.${n.slice(3)}`
    if (n.length <= 9) return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6)}`
    return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`
}

function formatarTelefone(valor) {
    const n = somenteNumeros(valor).slice(0, 11)
    if (n.length === 0) return ""
    if (n.length <= 2) return `(${n}`
    if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`
    if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}

function cpfValido(valor) {
    const n = somenteNumeros(valor)
    if (n.length !== 11) return false
    if (/^(\d)\1{10}$/.test(n)) return false

    let soma = 0
    for (let i = 0; i < 9; i++) {
        soma += Number(n[i]) * (10 - i)
    }
    let resto = (soma * 10) % 11
    if (resto === 10) resto = 0
    if (resto !== Number(n[9])) return false

    soma = 0
    for (let i = 0; i < 10; i++) {
        soma += Number(n[i]) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10) resto = 0
    return resto === Number(n[10])
}

function emailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)
}

function validar(form) {
    const erros = {}

    if (form.nome.trim().length < 3) {
        erros.nome = "Informe o nome completo (mínimo 3 letras)."
    }
    if (form.email.trim() === "") {
        erros.email = "Informe o e-mail."
    } else if (!emailValido(form.email.trim())) {
        erros.email = "E-mail inválido. Exemplo: nome@email.com"
    }
    const tel = somenteNumeros(form.telefone)
    if (tel === "") {
        erros.telefone = "Informe o telefone."
    } else if (tel.length < 10) {
        erros.telefone = "Telefone incompleto. Digite o DDD e o número."
    }
    if (somenteNumeros(form.cpf) === "") {
        erros.cpf = "Informe o CPF."
    } else if (!cpfValido(form.cpf)) {
        erros.cpf = "CPF inválido. Confira os números."
    }
    if (form.sexo === "") {
        erros.sexo = "Escolha uma opção."
    }
    const idade = Number(form.idade)
    if (form.idade === "") {
        erros.idade = "Informe a idade."
    } else if (!Number.isInteger(idade) || idade < 16 || idade > 100) {
        erros.idade = "Idade deve ser um número entre 16 e 100."
    }
    if (form.estado_civil === "") {
        erros.estado_civil = "Escolha uma opção."
    }

    return erros
}

// ---------- Cores e estilos (cores inspiradas no site do Instituto Sereia) ----------
// Para mudar o visual inteiro, basta ajustar as cores aqui neste quadro.

const cores = {
    azul: "#1a6fd1",
    azulEscuro: "#14459b",
    azulClaro: "#e9f2fc",
    zebra: "#f4f8fd",
    borda: "#c5d6ec",
    texto: "#1f2d3d",
    branco: "#ffffff",
    erro: "#c0392b",
    sucesso: "#1e7e34"
}

const pagina = { minHeight: "100vh", background: cores.azulClaro, fontFamily: "Arial, sans-serif", color: cores.texto }
const conteudo = { maxWidth: "1040px", margin: "0 auto", padding: "20px 16px" }
const cabecalho = { background: cores.azul, color: cores.branco, padding: "16px" }
const cabecalhoInterno = { maxWidth: "1040px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }
const cartao = { background: cores.branco, border: `1px solid ${cores.borda}`, borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(20, 69, 155, 0.12)" }
const titulo = { marginTop: 0, color: cores.azulEscuro, fontSize: "20px" }

const campo = { display: "block", marginBottom: "12px", fontWeight: "bold", fontSize: "14px" }
const entrada = { display: "block", width: "100%", padding: "8px", marginTop: "4px", boxSizing: "border-box", background: cores.branco, border: `1px solid ${cores.borda}`, borderRadius: "6px", fontSize: "15px", fontWeight: "normal", fontFamily: "Arial, sans-serif" }
const entradaErro = { ...entrada, border: `2px solid ${cores.erro}` }
const textoErro = { color: cores.erro, fontSize: "13px", marginTop: "3px", fontWeight: "normal" }

const botao = { background: cores.azul, color: cores.branco, border: "none", borderRadius: "6px", padding: "9px 18px", fontSize: "14px", cursor: "pointer" }
const botaoSecundario = { ...botao, background: cores.branco, color: cores.azulEscuro, border: `1px solid ${cores.azulEscuro}` }
const botaoPerigo = { ...botao, background: cores.branco, color: cores.erro, border: `1px solid ${cores.erro}` }
const botaoClaro = { background: "transparent", color: cores.branco, border: "1px solid rgba(255, 255, 255, 0.85)", borderRadius: "6px", padding: "6px 12px", fontSize: "14px", cursor: "pointer", marginLeft: "8px" }
const botaoPequeno = { padding: "6px 0", width: "72px", fontSize: "13px", textAlign: "center", boxSizing: "border-box" }
const acoes = { display: "flex", gap: "6px", alignItems: "center" }

const tabelaTitulo = { background: cores.azulEscuro, color: cores.branco, padding: "10px 8px", textAlign: "left", fontSize: "14px" }
const celula = { padding: "10px 8px", borderBottom: `1px solid ${cores.borda}`, fontSize: "14px", verticalAlign: "middle" }

// ---------- Tela de login ----------

function Login({ aoEntrar }) {
    const [usuario, setUsuario] = useState("")
    const [senha, setSenha] = useState("")
    const [mensagem, setMensagem] = useState("")
    const [entrando, setEntrando] = useState(false)

    function enviar(evento) {
        evento.preventDefault()
        if (usuario.trim() === "" || senha === "") {
            setMensagem("Informe o usuário e a senha.")
            return
        }
        setEntrando(true)
        setMensagem("")
        fetch(API_LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario: usuario.trim(), senha })
        })
            .then((resposta) => resposta.json())
            .then((dados) => {
                if (dados.token) {
                    aoEntrar(dados.token, dados.nome)
                } else {
                    setMensagem(dados.erro || "Não foi possível entrar.")
                    setSenha("")
                }
            })
            .catch(() => setMensagem("Não foi possível falar com o servidor."))
            .finally(() => setEntrando(false))
    }

    return (
        <div style={pagina}>
            <div style={cabecalho}>
                <div style={{ ...cabecalhoInterno, fontSize: "22px", fontWeight: "bold" }}>Instituto Sereia</div>
            </div>
            <div style={{ maxWidth: "380px", margin: "40px auto", padding: "0 16px" }}>
                <div style={cartao}>
                    <h2 style={titulo}>Entrar</h2>
                    <form onSubmit={enviar}>
                        <label style={campo}>Usuário
                            <input style={entrada} value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
                        </label>
                        <label style={campo}>Senha
                            <input style={entrada} type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
                        </label>
                        <button type="submit" style={botao} disabled={entrando}>
                            {entrando ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                    {mensagem && <p style={{ color: cores.erro }}>{mensagem}</p>}
                </div>
            </div>
        </div>
    )
}

// ---------- Painel de cadastro (aparece depois do login) ----------

function Painel({ token, nomeUsuario, aoSair }) {
    const [voluntarios, setVoluntarios] = useState([])
    const [form, setForm] = useState(vazio)
    const [erros, setErros] = useState({})
    const [editandoId, setEditandoId] = useState(null)
    const [busca, setBusca] = useState("")
    const [trocandoSenha, setTrocandoSenha] = useState(false)
    const termo = busca.trim().toLowerCase()
    const termoNumeros = somenteNumeros(busca)
    const filtrados = voluntarios.filter((v) =>
        termo === "" ||
        String(v.nome).toLowerCase().includes(termo) ||
        (termoNumeros !== "" && somenteNumeros(v.cpf).includes(termoNumeros))
    )
    const [mensagem, setMensagem] = useState("")

    useEffect(() => {
        buscar(setVoluntarios, token, aoSair)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function mudar(evento) {
        const { name, value } = evento.target
        let novoValor = value

        if (name === "cpf") novoValor = somenteNumeros(value).slice(0, 11)
        if (name === "telefone") novoValor = somenteNumeros(value).slice(0, 11)

        setForm({ ...form, [name]: novoValor })

        if (erros[name]) {
            const restantes = { ...erros }
            delete restantes[name]
            setErros(restantes)
        }
    }

    function salvar(evento) {
        evento.preventDefault()

        const encontrados = validar(form)
        setErros(encontrados)
        if (Object.keys(encontrados).length > 0) {
            setMensagem("Corrija os campos em vermelho antes de salvar.")
            return
        }

        const editando = editandoId !== null
        const url = editando ? `${API}/${editandoId}` : API

        const dadosParaEnviar = {
            ...form,
            nome: form.nome.trim(),
            email: form.email.trim()
        }

        chamar(url, token, aoSair, {
            method: editando ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosParaEnviar)
        })
            .then((dados) => {
                setMensagem(dados.mensagem || dados.erro)
                if (dados.mensagem) {
                    setForm(vazio)
                    setErros({})
                    setEditandoId(null)
                    buscar(setVoluntarios, token, aoSair)
                }
            })
            .catch((erro) => {
                if (erro.message === "sessao") return
                setMensagem("Não foi possível falar com o servidor.")
            })
    }

    function editar(v) {
        setForm({
            nome: v.nome,
            email: v.email,
            telefone: somenteNumeros(v.telefone),
            cpf: somenteNumeros(v.cpf),
            sexo: v.sexo,
            idade: v.idade,
            estado_civil: v.estado_civil
        })
        setErros({})
        setEditandoId(v.id)
        setMensagem("")
        window.scrollTo(0, 0)
    }

    function cancelar() {
        setForm(vazio)
        setErros({})
        setEditandoId(null)
    }

    function excluir(id) {
        if (!window.confirm("Deseja realmente excluir este voluntário?")) {
            return
        }
        chamar(`${API}/${id}`, token, aoSair, { method: "DELETE" })
            .then((dados) => {
                setMensagem(dados.mensagem || dados.erro)
                if (editandoId === id) {
                    cancelar()
                }
                buscar(setVoluntarios, token, aoSair)
            })
            .catch((erro) => {
                if (erro.message === "sessao") return
                setMensagem("Não foi possível falar com o servidor.")
            })
    }

    return (
        <div style={pagina}>
            <div style={cabecalho}>
                <div style={cabecalhoInterno}>
                    <div>
                        <div style={{ fontSize: "22px", fontWeight: "bold" }}>Instituto Sereia</div>
                        <div style={{ fontSize: "14px", opacity: 0.9 }}>Cadastro de voluntários</div>
                    </div>
                    <div>
                        <span>Olá, {nomeUsuario}</span>
                        <button onClick={() => setTrocandoSenha(!trocandoSenha)} style={botaoClaro}>Trocar senha</button>
                        <button onClick={aoSair} style={botaoClaro}>Sair</button>
                    </div>
                </div>
            </div>

            <div style={conteudo}>
                {trocandoSenha && <TrocarSenha token={token} aoSair={aoSair} aoFechar={() => setTrocandoSenha(false)} />}

                <div style={cartao}>
                    <h2 style={titulo}>{editandoId !== null ? "Editar voluntário" : "Novo voluntário"}</h2>

                    <form onSubmit={salvar} noValidate>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 16px" }}>
                            <label style={campo}>Nome
                                <input style={erros.nome ? entradaErro : entrada} name="nome" value={form.nome} onChange={mudar} />
                                {erros.nome && <div style={textoErro}>{erros.nome}</div>}
                            </label>
                            <label style={campo}>E-mail
                                <input style={erros.email ? entradaErro : entrada} type="email" name="email" value={form.email} onChange={mudar} />
                                {erros.email && <div style={textoErro}>{erros.email}</div>}
                            </label>
                            <label style={campo}>Telefone
                                <input style={erros.telefone ? entradaErro : entrada} name="telefone" value={formatarTelefone(form.telefone)} onChange={mudar} placeholder="(18) 99999-9999" />
                                {erros.telefone && <div style={textoErro}>{erros.telefone}</div>}
                            </label>
                            <label style={campo}>CPF
                                <input style={erros.cpf ? entradaErro : entrada} name="cpf" value={formatarCPF(form.cpf)} onChange={mudar} placeholder="000.000.000-00" />
                                {erros.cpf && <div style={textoErro}>{erros.cpf}</div>}
                            </label>
                            <label style={campo}>Sexo
                                <select style={erros.sexo ? entradaErro : entrada} name="sexo" value={form.sexo} onChange={mudar}>
                                    <option value="">Escolha...</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                                {erros.sexo && <div style={textoErro}>{erros.sexo}</div>}
                            </label>
                            <label style={campo}>Idade
                                <input style={erros.idade ? entradaErro : entrada} type="number" name="idade" value={form.idade} onChange={mudar} />
                                {erros.idade && <div style={textoErro}>{erros.idade}</div>}
                            </label>
                            <label style={campo}>Estado civil
                                <select style={erros.estado_civil ? entradaErro : entrada} name="estado_civil" value={form.estado_civil} onChange={mudar}>
                                    <option value="">Escolha...</option>
                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                    <option value="Casado(a)">Casado(a)</option>
                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                    <option value="União estável">União estável</option>
                                </select>
                                {erros.estado_civil && <div style={textoErro}>{erros.estado_civil}</div>}
                            </label>
                        </div>
                        <button type="submit" style={botao}>
                            {editandoId !== null ? "Salvar alterações" : "Cadastrar"}
                        </button>
                        {editandoId !== null && (
                            <button type="button" onClick={cancelar} style={{ ...botaoSecundario, marginLeft: "10px" }}>
                                Cancelar
                            </button>
                        )}
                    </form>
                    {mensagem && (
                        <p style={{ color: /sucesso/i.test(mensagem) ? cores.sucesso : cores.erro, fontWeight: "bold" }}>{mensagem}</p>
                    )}
                </div>

                <div style={cartao}>
                    <h2 style={titulo}>Voluntários cadastrados</h2>
                    <input
                        style={{ ...entrada, marginBottom: "12px" }}
                        placeholder="Buscar por CPF ou nome"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                            <thead>
                                <tr>
                                    <th style={tabelaTitulo}>Nome</th>
                                    <th style={tabelaTitulo}>E-mail</th>
                                    <th style={tabelaTitulo}>Telefone</th>
                                    <th style={tabelaTitulo}>CPF</th>
                                    <th style={tabelaTitulo}>Sexo</th>
                                    <th style={tabelaTitulo}>Idade</th>
                                    <th style={tabelaTitulo}>Estado civil</th>
                                    <th style={tabelaTitulo}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtrados.map((v, posicao) => (
                                    <tr key={v.id} style={{ background: posicao % 2 === 0 ? cores.branco : cores.zebra }}>
                                        <td style={celula}>{v.nome}</td>
                                        <td style={celula}>{v.email}</td>
                                        <td style={{ ...celula, whiteSpace: "nowrap" }}>{formatarTelefone(v.telefone)}</td>
                                        <td style={{ ...celula, whiteSpace: "nowrap" }}>{formatarCPF(v.cpf)}</td>
                                        <td style={celula}>{v.sexo}</td>
                                        <td style={celula}>{v.idade}</td>
                                        <td style={celula}>{v.estado_civil}</td>
                                        <td style={{ ...celula, width: "160px" }}>
                                            <div style={acoes}>
                                                <button onClick={() => editar(v)} style={{ ...botaoSecundario, ...botaoPequeno }}>Editar</button>
                                                <button onClick={() => excluir(v.id)} style={{ ...botaoPerigo, ...botaoPequeno }}>Excluir</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {voluntarios.length === 0 && <p>Nenhum voluntário cadastrado ainda.</p>}
                    {voluntarios.length > 0 && filtrados.length === 0 && <p>Nenhum voluntário encontrado para essa busca.</p>}
                </div>
            </div>
        </div>
    )
}

// ---------- Trocar a própria senha ----------

function TrocarSenha({ token, aoSair, aoFechar }) {
    const [atual, setAtual] = useState("")
    const [nova, setNova] = useState("")
    const [confirmar, setConfirmar] = useState("")
    const [mensagem, setMensagem] = useState("")
    const [sucesso, setSucesso] = useState(false)

    function enviar(evento) {
        evento.preventDefault()
        setSucesso(false)

        if (atual === "" || nova === "" || confirmar === "") {
            setMensagem("Preencha os três campos.")
            return
        }
        if (nova.length < 8) {
            setMensagem("A nova senha precisa ter pelo menos 8 caracteres.")
            return
        }
        if (nova !== confirmar) {
            setMensagem("A confirmação não é igual à nova senha.")
            return
        }
        if (nova === atual) {
            setMensagem("A nova senha precisa ser diferente da atual.")
            return
        }

        chamar("http://localhost:3001/trocar-senha", token, aoSair, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senhaAtual: atual, senhaNova: nova })
        })
            .then((dados) => {
                if (dados.mensagem) {
                    setSucesso(true)
                    setMensagem(dados.mensagem)
                    setAtual("")
                    setNova("")
                    setConfirmar("")
                } else {
                    setMensagem(dados.erro || "Não foi possível trocar a senha.")
                }
            })
            .catch((erro) => {
                if (erro.message === "sessao") return
                setMensagem("Não foi possível falar com o servidor.")
            })
    }

    return (
        <div style={{ ...cartao, maxWidth: "400px" }}>
            <h2 style={titulo}>Trocar senha</h2>
            <form onSubmit={enviar}>
                <label style={campo}>Senha atual
                    <input style={entrada} type="password" value={atual} onChange={(e) => setAtual(e.target.value)} />
                </label>
                <label style={campo}>Nova senha (mínimo 8 caracteres)
                    <input style={entrada} type="password" value={nova} onChange={(e) => setNova(e.target.value)} />
                </label>
                <label style={campo}>Repita a nova senha
                    <input style={entrada} type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
                </label>
                <button type="submit" style={botao}>Trocar senha</button>
                <button type="button" onClick={aoFechar} style={{ ...botaoSecundario, marginLeft: "10px" }}>Fechar</button>
            </form>
            {mensagem && <p style={{ color: sucesso ? cores.sucesso : cores.erro, fontWeight: "bold" }}>{mensagem}</p>}
        </div>
    )
}

// ---------- Aplicativo: decide se mostra o login ou o painel ----------

function App() {
    const [sessao, setSessao] = useState(() => {
        try {
            const guardada = sessionStorage.getItem("sessao")
            return guardada ? JSON.parse(guardada) : null
        } catch (e) {
            return null
        }
    })

    function entrar(token, nome) {
        const nova = { token, nome }
        try {
            sessionStorage.setItem("sessao", JSON.stringify(nova))
        } catch (e) {
            // sem problema: a pessoa só precisará entrar de novo ao recarregar
        }
        setSessao(nova)
    }

    function sair() {
        try {
            sessionStorage.removeItem("sessao")
        } catch (e) {
            // sem problema
        }
        setSessao(null)
    }

    if (!sessao) {
        return <Login aoEntrar={entrar} />
    }

    return <Painel token={sessao.token} nomeUsuario={sessao.nome} aoSair={sair} />
}

export default App