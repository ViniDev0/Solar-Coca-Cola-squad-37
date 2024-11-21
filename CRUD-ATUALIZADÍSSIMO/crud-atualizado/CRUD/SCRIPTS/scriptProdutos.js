// Seletores principais
const openModalButton = document.querySelector(".open-modal");
const closeModalButton = document.querySelector("#close-modal");
const cancelButton = document.querySelector("#cancelar");
const modal = document.querySelector("#modal");
const fade = document.querySelector("#fade");

// Abrir modal
const openModal = () => {
    modal.classList.remove("hide");
    fade.classList.remove("hide");
};

// Fechar modal
const closeModal = () => {
    modal.classList.add("hide");
    fade.classList.add("hide");
    clearFields();
    resetImage(); // Reseta a imagem ao fechar o modal
};

// Eventos para abrir e fechar o modal
openModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);
fade.addEventListener("click", closeModal);

// LocalStorage
const getLocalStorage = () => JSON.parse(localStorage.getItem("db_produtos")) ?? [];
const setLocalStorage = (dbProdutos) => localStorage.setItem("db_produtos", JSON.stringify(dbProdutos));

// CRUD: Create
const createProduto = (produto) => {
    const dbProdutos = getLocalStorage();
    dbProdutos.push(produto);
    setLocalStorage(dbProdutos);

    resetImage(); // Reseta a imagem após criar o produto
};

// CRUD: Read
const readProduto = () => getLocalStorage();

// CRUD: Update
const updateProduto = (index, produto) => {
    const dbProdutos = readProduto();
    dbProdutos[index] = produto;
    setLocalStorage(dbProdutos);
};

// CRUD: Delete
const deleteProduto = (index) => {
    const dbProdutos = readProduto();
    dbProdutos.splice(index, 1);
    setLocalStorage(dbProdutos);
};

// Validar campos
const isValidFields = () => document.getElementById("form").reportValidity();

// Limpar campos
const clearFields = () => {
    const fields = document.querySelectorAll(".modal-field");
    fields.forEach((field) => (field.value = ""));
};

// Salvar produto
const saveProduto = () => {
    if (isValidFields()) {
        const produto = {
            id: document.getElementById("id").value,
            nome: document.getElementById("nome").value,
            descricao: document.getElementById("descricao").value,
            categoria: document.getElementById("categoria").value,
            imagem: localStorage.getItem("imagemModal"), // Salva a imagem associada ao produto
        };
        const index = document.getElementById("nome").dataset.index;
        if (index === "new") {
            createProduto(produto);
        } else {
            updateProduto(index, produto);
        }
        updateTable();
        closeModal();
    }
};

document.getElementById("salvar").addEventListener("click", saveProduto);

// Atualizar tabela
const createRow = (produto, index) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>${produto.descricao}</td>
        <td>${produto.categoria}</td>
        <td>
            <img src="./imgs/icons8-lixeira.svg" class="exclude" data-action="delete-${index}">
            <img src="./imgs/icons8-editar.svg" class="edit" data-action="edit-${index}">
        </td>
    `;
    document.querySelector("#tableClient>tbody").appendChild(newRow);
};

const updateTable = () => {
    const dbProdutos = readProduto();
    clearTable();
    dbProdutos.forEach((produto, index) => createRow(produto, index));
};

const clearTable = () => {
    const rows = document.querySelectorAll("#tableClient>tbody tr");
    rows.forEach((row) => row.parentNode.removeChild(row));
};

// Inicializar tabela
updateTable();

// Editar produto
const editProduto = (index) => {
    const produto = readProduto()[index];
    produto.index = index;
    preencherCampos(produto);
    openModal();
};

// Preencher campos no modal
const preencherCampos = (produto) => {
    document.getElementById("id").value = produto.id;
    document.getElementById("nome").value = produto.nome;
    document.getElementById("descricao").value = produto.descricao;
    document.getElementById("categoria").value = produto.categoria;
    document.getElementById("nome").dataset.index = produto.index;

    // Carregar a imagem associada ao produto (se houver)
    const botaoImagem = document.querySelector(".muda-imagem");
    if (produto.imagem) {
        botaoImagem.src = produto.imagem; // Exibe a imagem associada ao produto
    } else {
        botaoImagem.src = "./imgs/botao-adicionar.png"; // Exibe o ícone padrão caso não haja imagem
    }
};

// Editar ou excluir
const editDelete = (event) => {
    const action = event.target.dataset.action;
    if (action) {
        const [type, index] = action.split("-");
        if (type === "edit") {
            editProduto(index);
        } else if (type === "delete") {
            deleteProduto(index);
            updateTable();
        }
    }
};

document.querySelector("#tableClient>tbody").addEventListener("click", editDelete);

// Função de busca
const pesquisaInput = document.getElementById("pesquisa");
const tabela = document.getElementById("tableClient");
const linhas = tabela.getElementsByTagName("tr");

pesquisaInput.addEventListener("input", function () {
    const termoDeBusca = pesquisaInput.value.toLowerCase();
    for (let i = 1; i < linhas.length; i++) {
        const celulas = linhas[i].getElementsByTagName("td");
        let linhaVisivel = false;

        for (let j = 0; j < celulas.length; j++) {
            const textoCelula = celulas[j].textContent || celulas[j].innerText;
            if (textoCelula.toLowerCase().includes(termoDeBusca)) {
                linhaVisivel = true;
            }
        }

        linhas[i].style.display = linhaVisivel ? "" : "none";
}});

// Selecionar o botão e o input escondido
const botaoImagem = document.querySelector(".muda-imagem");
const inputUpload = document.getElementById("uploadImagem");

// Configurar o evento no botão para abrir o seletor de arquivos
botaoImagem.addEventListener("click", () => {
    inputUpload.click(); 
});

// Seleção do arquivo
inputUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        // Converte o arquivo em Base64
        reader.onload = () => {
            const base64Image = reader.result;
            
            // Salva no localStorage
            localStorage.setItem("imagemModal", base64Image);
            
            // Atualiza a exibição da imagem
            botaoImagem.src = base64Image;
        };

        reader.readAsDataURL(file); 
    }
});

// Ao carregar a página, verifica se já existe uma imagem salva
window.addEventListener("DOMContentLoaded", () => {
    const imagemSalva = localStorage.getItem("imagemModal");
    if (imagemSalva) {
        botaoImagem.src = imagemSalva; 
    } else {
        botaoImagem.src = "../imgs/botao-adicionar.png"; 
    }
});

// Reseta a imagem ao cancelar ou fechar o modal
const resetImage = () => {
    botaoImagem.src = "../imgs/botao-adicionar.png"; 

    // Limpa o campo de upload
    if (inputUpload) {
        inputUpload.value = ""; 
    }
    localStorage.removeItem("imagemModal");
};

// Ao abrir o modal, reseta a imagem para o ícone de "adicionar"
openModalButton.addEventListener("click", () => {
    resetImage();  // Resetar imagem ao abrir o modal para adicionar um novo produto
    openModal();   // Depois abre o modal
});

//botão para imprimir relatório
const botaoImprimir = document.getElementById("button-imprimir");

botaoImprimir.addEventListener("click",(event)=>{
//pegando o conteudo da tabela e guardando na const conteudo
  const conteudo = document.querySelector('.tabela-conteiner').innerHTML;
//estilo da tabela (tudo isso está dentro da variavel estilo, e os estilos estão sendo concatenados nela)
  let estilo = "<style>";
  // Estilos gerais para a tabela
  // Estilos gerais para a tabela
estilo += "#tableClient {";
estilo += "    width: 100%;";
estilo += "    font-family: Calibri, Arial, sans-serif;"; // Fonte da tabela
estilo += "    font-size: 25px;"; // Tamanho da fonte
estilo += "    border-collapse: collapse;"; // Colapso das bordas internas
estilo += "    border: 2px solid #ddd;"; // Bordas externas
estilo += "}";

// Estilos para o cabeçalho da tabela (thead)
estilo += "#tableClient thead th {";
estilo += "    background-color: #f4f4f4;"; // Cor de fundo suave para o cabeçalho
estilo += "    color: #333;"; // Cor do texto do cabeçalho
estilo += "    padding: 12px 15px;"; // Espaciamento interno das células do cabeçalho
estilo += "    border: 2px solid #ddd;"; // Bordas finas para o cabeçalho
estilo += "    text-align: center;"; // Alinhar o texto no centro
estilo += "    font-weight: bold;"; // Negrito no texto do cabeçalho
estilo += "}";

// Estilos para as células do corpo da tabela (tbody)
estilo += "#tableClient tbody td {";
estilo += "    padding: 10px 15px;"; // Espaciamento interno das células do corpo
estilo += "    border: 2px solid #ddd;"; // Bordas em todas as células do corpo
estilo += "    text-align: center;"; // Alinhar o texto no centro
estilo += "}";

// Estilo para as linhas alternadas no corpo (tbody)
estilo += "#tableClient tbody tr:nth-child(odd) {";
estilo += "    background-color: #f9f9f9;"; // Cor de fundo alternada para as linhas ímpares
estilo += "}";

// Estilo para as linhas do corpo (tbody) quando o mouse passa por cima
estilo += "#tableClient tbody tr:hover {";
estilo += "    background-color: #f1f1f1;"; // Cor de fundo ao passar o mouse por cima
estilo += "    cursor: pointer;"; // Cursor em forma de mão para mostrar que é interativo
estilo += "}";

// Estilos para adicionar bordas laterais no primeiro e último elemento da tabela
estilo += "#tableClient thead th:first-child {";
estilo += "    border-left: 2px solid #ddd;"; // Adiciona borda à esquerda do primeiro th
estilo += "}";

estilo += "#tableClient thead th:last-child {";
estilo += "    border-right: 2px solid #ddd;"; // Adiciona borda à direita do último th
estilo += "}";

estilo += "#tableClient tbody td:first-child {";
estilo += "    border-left: 2px solid #ddd;"; // Adiciona borda à esquerda do primeiro td
estilo += "}";

estilo += "#tableClient tbody td:last-child {";
estilo += "    border-right: 2px solid #ddd;"; // Adiciona borda à direita do último td
estilo += "}";

// Escondendo a coluna "Ações" durante a impressão
estilo += "@media print {";
estilo += "    #tableClient td:nth-child(5),"; // Esconde a 5ª coluna (Ações)
estilo += "    #tableClient th:nth-child(5) {";
estilo += "        display: none;";
estilo += "    }";

  // Adicionando o título para a impressão
estilo += "    #h2-impressao {";
estilo += "        text-align: center;"; // Alinha o título ao centro
estilo += "        font-size: 30px;"; // Tamanho da fonte do título
estilo += "        margin-bottom: 20px;"; // Espaçamento abaixo do título
estilo += "        display: block;"; // Assegura que ele seja exibido na impressão
estilo += "    }";
estilo += "}";

// Fechando a tag <style>
estilo += "</style>";

// ___________________________________________________________________________

//passamos de parametro apenas as features(configuraçoes). O resto passamos vazio;
//dentro da const win, guardamos a funçao do objeto window;
  const win = window.open('', '', 'height = 700, width = 700');

  //escrevendo estilos e conteudos dentro da nova window
  win.document.write('<html>');
  win.document.write('<head>');
  win.document.write('<title>Relatório</title>');
  win.document.write(estilo);
  win.document.write('</head>');
  win.document.write('<body>');
//   escrevendo a tabela na nova janela;
  win.document.write(conteudo);
  win.document.write('</body></html>');

  //da um print na tabela que acabamos de criar
  win.print();
})