const URL = 'http://localhost:3400/produtos'
let modoEdicao = false;

let listaProdutos = [];

let btnAdicionar = document.getElementById('btn-adicionar');
let tabelaProduto = document.querySelector('table>tbody');
let modalProduto = new bootstrap.Modal(document.getElementById('modal-produto'), {});
let tituloModal = document.querySelector('h4.modal-title');

let btnSalvar = document.getElementById('btn-salvar');
let btnCancelar = document.getElementById('btn-cancelar');

let formModal = {
    id: document.getElementById('id'),
    nome: document.getElementById('nome'),
    valor: document.getElementById('valor'),
    Estoque: document.getElementById('quantidadeEstoque'),
    observação: document.getElementById('obs'),
    dataCadastro: document.getElementById('dataCadastro')
}

btnAdicionar.addEventListener('click', () =>{
    modoEdicao = false;
    tituloModal.textContent = "Adicionar produto"
    limparModalCliente();
    modalProduto.show();
});

btnSalvar.addEventListener('click', () => {
    // 1° Capturar os dados do modal
    let produto = obterProdutoDoModal();

    // 2° Se os campos obrigatorios foram preenchidos.
    if(!produto.valor || !produto.quantidadeEstoque){
        alert("Valor e quantidade devem ser apresentados!")
        return;
    }

    // if(modoEdicao){
    //     atualizarClienteBackEnd(cliente);
    // }else{
    //     adicionarClienteBackEnd(cliente);
    // }

    (modoEdicao) ? atualizarProdutoBackEnd(produto) : adicionarProdutoBackEnd(produto);

});

btnCancelar.addEventListener('click', () => {
    modalProduto.hide();
});

function obterProdutoDoModal(){

    return new Produto({
        id: formModal.id.value,
        valor: formModal.valor.value,
        nome: formModal.nome.value,
        Estoque: formModal.quantidadeEstoque.value,
        observação: formModal.obs.value,
        dataCadastro: (formModal.dataCadastro.value) 
                ? new Date(formModal.dataCadastro.value).toISOString()
                : new Date().toISOString()
    });
}

function obterProduto() {

    fetch(URL, {
        method: 'GET',
        headers :{
            'Authorization': obterToken()
        }
    })
        .then(response => response.json())
        .then(produto => {
            listaProdutos = produto;
            popularTabela(produto);
        })
        .catch()
}

function editarProduto(id){
    modoEdicao = true;
    tituloModal.textContent = "Editar produto"

    let produto = listaProdutos.find(produto => produto.id == id);
    
    atualizarModalProduto(produto);

    modalProduto.show();
}

function atualizarModalProduto(produto){

    formModal.id.value = produto.id;
    formModal.nome.value = produto.nome;
    formModal.valor.value = produto.valor;
    formModal.quantidadeEstoque.value = produto.quantidadeEstoque;
    formModal.obs.value = produto.obs;
    formModal.dataCadastro.value = produto.dataCadastro.substring(0,10);
}

function limparModalProduto(){

    formModal.id.value ="";
    formModal.nome.value = "";
    formModal.valor.value = "";
    formModal.quantidadeEstoque.value = "";
    formModal.obs.value = "";
    formModal.dataCadastro.value = "";
}

function excluirProduto(id){

    let produto = listaProdutos.find(c => c.id == id);

    if(confirm("Deseja realmente excluir o produto " + produto.nome)){
        excluirProdutoBackEnd(produto);
    }
    
}

function criarLinhaNaTabela(produto) {
    // 1° Criar uma linha da tabela OK
    let tr = document.createElement('tr');

    // 2° Criar as TDs OK
    let tdId = document.createElement('td');
    let tdNome = document.createElement('td');
    let tdValor = document.createElement('td');
    let tdEstoque = document.createElement('td');
    let tdObs = document.createElement('td');
    let tdDataCadastro = document.createElement('td');
    let tdAcoes = document.createElement('td');


    // 3° Atualizar as Tds com os valores do cliente OK
    tdId.textContent = cliente.id;
    tdNome.textContent = cliente.nome;
    tdValor.textContent = produto.valor;
    tdEstoque.textContent = produto.quantidadeEstoque;
    tdObs.textContent = produto.obs;
    tdDataCadastro.textContent = new Date(cliente.dataCadastro).toLocaleDateString();
    

    tdAcoes.innerHTML = `<button onclick="editarProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                             Editar
                         </button>
                         <button onclick="excluirProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                             Excluir
                         </button>`;



    // 4° Adicionar as TDs dentro da linha criei. OK
    tr.appendChild(tdId);
    tr.appendChild(tdNome);
    tr.appendChild(tdValor);
    tr.appendChild(tdEstoque);
    tr.appendChild(tdObs);
    tr.appendChild(tdDataCadastro);
    tr.appendChild(tdAcoes);

    // 5° Adicionar a linha na tabela.
    tabelaProduto.appendChild(tr);
}

function popularTabela(produto) {

    // Limpar a tabela...
    tabelaProduto.textContent = "";

    produto.forEach(produto => {
        criarLinhaNaTabela(produto);
    });
}

function adicionarProdutoBackEnd(produto){

    produto.dataCadastro = new Date().toISOString();

    fetch(URL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': obterToken()
        },
        body : JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(response => {

        let novoProduto = new Produto(response);
        listaProdutos.push(novoProduto);

        popularTabela(listaProdutos)

        modalProduto.hide();
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Produto cadastrado com sucesso!',
            showConfirmButton: false,
            timer: 2500
        });
    })
    .catch(error => {
        console.log(error)
    })
}

function atualizarProdutoBackEnd(produto){

    fetch(`${URL}/${produto.id}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': obterToken()
        },
        body : JSON.stringify(produto)
    })
    .then(response => response.json())
    .then(() => {
        atualizarProdutoNaLista(produto, false);
        modalProduto.hide();

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Produto atualizado com sucesso!',
            showConfirmButton: false,
            timer: 2500
        });
    })
    .catch(error => {
        console.log(error)
    })
}

function excluirProdutoBackEnd(produto){

    fetch(`${URL}/${produto.id}`, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': obterToken()
        }
    })
    .then(response => response.json())
    .then(() => {
        atualizarClienteNaLista(produto, true);
        modalProduto.hide();
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Produto excluido com sucesso!',
            showConfirmButton: false,
            timer: 2500
        });
    })
    .catch(error => {
        console.log(error)
    })
}

function atualizarProdutoNaLista(produto, removerProduto){

    let indice = listaProdutos.findIndex((c) => c.id == produto.id);

    (removerProduto) 
        ? listaProdutos.splice(indice, 1)
        : listaProdutos.splice(indice, 1, cliente);

    popularTabela(listaProdutos);
}

obterProdutos();

listaProduto