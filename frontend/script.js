// ========================
// Sistema de Autenticação
// ========================

// Verificar se usuário está logado
function verificarAutenticacao() {
    const userLogado = JSON.parse(localStorage.getItem("userLogado"));
    if (!userLogado && !window.location.href.includes('login.html') && !window.location.href.includes('cadastro.html')) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Mostrar mensagem no site
function mostrarMensagem(mensagem, tipo = 'success') {
    // Remover mensagem anterior se existir
    const mensagemAnterior = document.getElementById('mensagem-global');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }

    // Criar elemento da mensagem
    const mensagemEl = document.createElement('div');
    mensagemEl.id = 'mensagem-global';
    mensagemEl.textContent = mensagem;
    mensagemEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;

    // Cor baseada no tipo
    if (tipo === 'success') {
        mensagemEl.style.background = 'var(--success)';
    } else if (tipo === 'error') {
        mensagemEl.style.background = 'var(--accent)';
    } else {
        mensagemEl.style.background = 'var(--primary)';
    }

    document.body.appendChild(mensagemEl);

    // Remover após 3 segundos
    setTimeout(() => {
        if (mensagemEl.parentNode) {
            mensagemEl.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => mensagemEl.remove(), 300);
        }
    }, 3000);
}

// Logout
function logout() {
    const user = JSON.parse(localStorage.getItem("userLogado"));
    localStorage.removeItem("userLogado");
    localStorage.removeItem("authToken");
    if (user) {
        mostrarMensagem(`Até logo, ${user.username}!`);
    }
    setTimeout(() => window.location.href = "login.html", 1000);
}

// Toggle senha
function toggleSenha(id) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

// ========================
// Sistema de Carrinho
// ========================

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let enderecoSelecionado = JSON.parse(localStorage.getItem("enderecoSelecionado")) || null;

// Carregar endereço selecionado do localStorage na inicialização
function carregarEnderecoSelecionado() {
    const enderecoSalvo = localStorage.getItem("enderecoSelecionado");
    if (enderecoSalvo) {
        try {
            enderecoSelecionado = JSON.parse(enderecoSalvo);
            console.log('Endereço carregado:', enderecoSelecionado);
        } catch (error) {
            console.error('Erro ao carregar endereço selecionado:', error);
            enderecoSelecionado = null;
        }
    } else {
        console.log('Nenhum endereço salvo no localStorage');
    }
}

// Carregar carrinho do localStorage na inicialização
function carregarCarrinhoLocal() {
    const carrinhoSalvo = localStorage.getItem("carrinho");
    if (carrinhoSalvo) {
        try {
            carrinho = JSON.parse(carrinhoSalvo);
            console.log('Carrinho carregado:', carrinho);
        } catch (error) {
            console.error('Erro ao carregar carrinho:', error);
            carrinho = [];
        }
    } else {
        console.log('Nenhum carrinho salvo no localStorage');
        carrinho = [];
    }
}

// Adicionar produto ao carrinho
function adicionarAoCarrinho(produto) {
    if (!verificarAutenticacao()) return;

    carrinho.push(produto);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarCarrinho();
    mostrarMensagem(`${produto.nome} adicionado ao carrinho! 🛒`);
}

// Atualizar ícone do carrinho
function atualizarCarrinho() {
    const count = document.getElementById("cart-count");
    if (count) count.textContent = carrinho.length;
}

// Exibir carrinho na página carrinho.html
function carregarCarrinho() {
    if (!verificarAutenticacao()) return;

    const lista = document.getElementById("lista-carrinho");
    const totalEl = document.getElementById("total-carrinho");
    if (!lista) return;

    lista.innerHTML = "";
    let total = 0;

    if (carrinho.length === 0) {
        lista.innerHTML = "<li class='carrinho-vazio'>Seu carrinho está vazio</li>";
    } else {
        carrinho.forEach((item, i) => {
            const li = document.createElement("li");
            li.classList.add("carrinho-item", "fade-in");
            li.innerHTML = `
                <span>${item.nome} - R$ ${item.preco.toFixed(2)}</span>
                <button class="btn-remove" onclick="removerItem(${i})">❌</button>
            `;
            lista.appendChild(li);
            total += item.preco;
        });
    }

    totalEl.textContent = total.toFixed(2);

    // Carregar endereço selecionado
    atualizarEnderecoSelecionado();
}

// Remover item específico
function removerItem(index) {
    const produtoRemovido = carrinho[index].nome;
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinho();
    atualizarCarrinho();
    mostrarMensagem(`${produtoRemovido} removido do carrinho`);
}

// Esvaziar carrinho
function esvaziarCarrinho() {
    if (carrinho.length === 0) {
        mostrarMensagem("Seu carrinho já está vazio", 'error');
        return;
    }

    // Criar modal de confirmação personalizado
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="background: var(--bg-card); padding: 2rem; border-radius: 12px; text-align: center; max-width: 400px;">
            <h3>Esvaziar Carrinho</h3>
            <p>Tem certeza que deseja remover todos os itens do carrinho?</p>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()"
                        style="flex: 1; padding: 0.8rem; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="confirmarEsvaziarCarrinho()"
                        style="flex: 1; padding: 0.8rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Esvaziar
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function confirmarEsvaziarCarrinho() {
    carrinho = [];
    localStorage.removeItem("carrinho");
    carregarCarrinho();
    atualizarCarrinho();

    // Remover modal
    const modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) modal.remove();

    mostrarMensagem("Carrinho esvaziado com sucesso");
}

// Finalizar compra -> abre modal de pagamento
function finalizarCompra() {
    if (carrinho.length === 0) {
        mostrarMensagem("Seu carrinho está vazio!", 'error');
        return;
    }

    if (!enderecoSelecionado) {
        mostrarMensagem("Selecione um endereço de entrega!", 'error');
        return;
    }

    abrirModalPagamento();
}

// ========================
// Checkout - Resumo e Funcionalidades
// ========================

let cupomAplicado = null;
let valorFrete = 0;
let valorDesconto = 0;

function carregarResumo() {
    if (!verificarAutenticacao()) return;

    const resumo = document.getElementById("resumo-pedido");
    const resumoSidebar = document.getElementById("resumo-sidebar");
    const subtotalEl = document.getElementById("subtotal");
    const freteEl = document.getElementById("frete");
    const descontoEl = document.getElementById("desconto");
    const totalEl = document.getElementById("total-final");

    // Sidebar elements
    const subtotalSidebarEl = document.getElementById("subtotal-sidebar");
    const freteSidebarEl = document.getElementById("frete-sidebar");
    const descontoSidebarEl = document.getElementById("desconto-sidebar");
    const totalSidebarEl = document.getElementById("total-sidebar");

    if (!resumo) return;

    resumo.innerHTML = "";
    if (resumoSidebar) resumoSidebar.innerHTML = "";

    let subtotal = 0;

    carrinho.forEach((item, index) => {
        const div = document.createElement("div");
        div.classList.add("order-item");
        div.innerHTML = `
            <div class="order-item-info">${item.nome}</div>
            <div class="order-item-price">R$ ${item.preco.toFixed(2)}</div>
        `;
        resumo.appendChild(div);

        // Sidebar item (mais compacto)
        if (resumoSidebar && index < 3) { // Mostrar apenas os primeiros 3 itens na sidebar
            const sidebarDiv = document.createElement("div");
            sidebarDiv.classList.add("sidebar-item");
            sidebarDiv.innerHTML = `
                <span class="sidebar-item-name">${item.nome.length > 20 ? item.nome.substring(0, 20) + '...' : item.nome}</span>
                <span class="sidebar-item-price">R$ ${item.preco.toFixed(2)}</span>
            `;
            resumoSidebar.appendChild(sidebarDiv);
        }

        subtotal += item.preco;
    });

    // Adicionar indicador se houver mais itens
    if (resumoSidebar && carrinho.length > 3) {
        const moreItems = document.createElement("div");
        moreItems.classList.add("sidebar-more-items");
        moreItems.textContent = `+ ${carrinho.length - 3} item(s)`;
        resumoSidebar.appendChild(moreItems);
    }

    // Calcular frete
    valorFrete = subtotal > 299 ? 0 : 15.90;

    // Aplicar desconto se houver cupom
    valorDesconto = cupomAplicado ? calcularDesconto(cupomAplicado, subtotal) : 0;

    const total = subtotal + valorFrete - valorDesconto;

    // Atualizar elementos principais
    subtotalEl.textContent = subtotal.toFixed(2);
    freteEl.textContent = valorFrete.toFixed(2);
    descontoEl.textContent = valorDesconto.toFixed(2);
    totalEl.textContent = total.toFixed(2);

    // Atualizar sidebar
    if (subtotalSidebarEl) subtotalSidebarEl.textContent = subtotal.toFixed(2);
    if (freteSidebarEl) freteSidebarEl.textContent = valorFrete.toFixed(2);
    if (descontoSidebarEl) descontoSidebarEl.textContent = valorDesconto.toFixed(2);
    if (totalSidebarEl) totalSidebarEl.textContent = total.toFixed(2);

    // Mostrar/ocultar linha de desconto
    const descontoLine = document.getElementById("desconto-line");
    const descontoSidebarLine = document.getElementById("desconto-sidebar-line");
    if (descontoLine) {
        descontoLine.style.display = valorDesconto > 0 ? 'flex' : 'none';
    }
    if (descontoSidebarLine) {
        descontoSidebarLine.style.display = valorDesconto > 0 ? 'flex' : 'none';
    }

    // Carregar endereço selecionado no checkout
    const enderecoCheckout = document.getElementById("endereco-checkout");
    if (enderecoCheckout) {
        if (enderecoSelecionado) {
            enderecoCheckout.innerHTML = `
                <div class="endereco-info">
                    <strong>${enderecoSelecionado.apelido || 'Endereço'}</strong><br>
                    ${enderecoSelecionado.logradouro}, ${enderecoSelecionado.numero}<br>
                    ${enderecoSelecionado.complemento ? enderecoSelecionado.complemento + '<br>' : ''}
                    ${enderecoSelecionado.bairro} - ${enderecoSelecionado.localidade}/${enderecoSelecionado.uf}<br>
                    CEP: ${enderecoSelecionado.cep}
                </div>
            `;
        } else {
            enderecoCheckout.innerHTML = `
                <p class="endereco-aviso">Nenhum endereço selecionado. <a href="carrinho.html">Voltar ao carrinho</a> para selecionar.</p>
            `;
        }
    }

    // Configurar métodos de pagamento
    configurarMetodosPagamento();
}

// Calcular desconto baseado no cupom
function calcularDesconto(cupom, subtotal) {
    if (cupom.tipoDesconto === 'PERCENTUAL') {
        let desconto = (subtotal * cupom.valorDesconto) / 100;
        if (cupom.valorMaximoDesconto && desconto > cupom.valorMaximoDesconto) {
            desconto = cupom.valorMaximoDesconto;
        }
        return desconto;
    } else if (cupom.tipoDesconto === 'FIXO') {
        return cupom.valorDesconto;
    }
    return 0;
}

// Aplicar cupom
async function aplicarCupom() {
    const cupomInput = document.getElementById("cupom-codigo");
    const statusEl = document.getElementById("cupom-status");
    const infoEl = document.getElementById("cupom-info");

    const codigo = cupomInput.value.trim().toUpperCase();
    if (!codigo) {
        mostrarStatusCupom("Digite um código de cupom", 'error');
        return;
    }

    const subtotal = carrinho.reduce((sum, item) => sum + item.preco, 0);

    try {
        const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ codigo, valorCompra: subtotal })
        });

        const data = await response.json();

        if (response.ok) {
            cupomAplicado = data.cupom;
            valorDesconto = data.descontoAplicado;
            mostrarStatusCupom("Cupom aplicado com sucesso!", 'success');
            infoEl.innerHTML = `
                <strong>${data.cupom.descricao}</strong><br>
                Desconto: R$ ${data.descontoAplicado.toFixed(2)}
            `;
            infoEl.className = 'coupon-info success';
            infoEl.style.display = 'block';
            carregarResumo(); // Recalcular totais
        } else {
            cupomAplicado = null;
            valorDesconto = 0;
            mostrarStatusCupom(data.error || "Cupom inválido", 'error');
            infoEl.style.display = 'none';
            carregarResumo();
        }
    } catch (error) {
        console.error('Erro ao validar cupom:', error);
        mostrarStatusCupom("Erro ao validar cupom", 'error');
    }
}

function mostrarStatusCupom(mensagem, tipo) {
    const statusEl = document.getElementById("cupom-status");
    statusEl.textContent = mensagem;
    statusEl.style.color = tipo === 'success' ? 'var(--success)' : 'var(--accent)';
}

// Configurar métodos de pagamento
function configurarMetodosPagamento() {
    const radios = document.querySelectorAll('input[name="metodo-pagamento"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Esconder todos os formulários
            document.getElementById('cartao-form').style.display = 'none';
            document.getElementById('pix-info').style.display = 'none';
            document.getElementById('boleto-info').style.display = 'none';
            document.getElementById('debito-info').style.display = 'none';

            // Mostrar formulário correspondente
            if (this.value === 'CARTAO_CREDITO') {
                document.getElementById('cartao-form').style.display = 'block';
            } else if (this.value === 'PIX') {
                document.getElementById('pix-info').style.display = 'block';
            } else if (this.value === 'BOLETO') {
                document.getElementById('boleto-info').style.display = 'block';
            } else if (this.value === 'DEBITO_ONLINE') {
                document.getElementById('debito-info').style.display = 'block';
            }
        });
    });

    // Configurar formatação de cartão
    configurarFormatacaoCartao();
}

// Configurar formatação de cartão
function configurarFormatacaoCartao() {
    const numeroCartao = document.getElementById('numero-cartao');
    const validadeCartao = document.getElementById('validade-cartao');
    const cvvCartao = document.getElementById('cvv-cartao');

    if (numeroCartao) {
        numeroCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value.substring(0, 19);
        });
    }

    if (validadeCartao) {
        validadeCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cvvCartao) {
        cvvCartao.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}

// Validar dados do cartão
function validarCartao() {
    const erros = [];
    const nome = document.getElementById('nome-cartao').value.trim();
    const numero = document.getElementById('numero-cartao').value.replace(/\s/g, '');
    const validade = document.getElementById('validade-cartao').value;
    const cvv = document.getElementById('cvv-cartao').value;

    // Validar nome
    if (!nome || nome.length < 2) {
        erros.push("Nome no cartão deve ter pelo menos 2 caracteres");
    }

    // Validar número
    if (!numero || numero.length < 13 || numero.length > 19) {
        erros.push("Número do cartão deve ter entre 13 e 19 dígitos");
    } else if (!validarNumeroCartao(numero)) {
        erros.push("Número do cartão inválido");
    }

    // Validar validade
    if (!validade || !/^\d{2}\/\d{2}$/.test(validade)) {
        erros.push("Validade deve estar no formato MM/AA");
    } else {
        const [mes, ano] = validade.split('/');
        const mesNum = parseInt(mes);
        const anoNum = parseInt('20' + ano);
        const agora = new Date();
        const dataValidade = new Date(anoNum, mesNum - 1);

        if (mesNum < 1 || mesNum > 12) {
            erros.push("Mês de validade inválido");
        } else if (dataValidade < agora) {
            erros.push("Cartão expirado");
        }
    }

    // Validar CVV
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
        erros.push("CVV deve ter 3 ou 4 dígitos");
    }

    return erros;
}

// Algoritmo de Luhn para validar número do cartão
function validarNumeroCartao(numero) {
    let soma = 0;
    let alternar = false;

    for (let i = numero.length - 1; i >= 0; i--) {
        let digito = parseInt(numero.charAt(i));

        if (alternar) {
            digito *= 2;
            if (digito > 9) {
                digito -= 9;
            }
        }

        soma += digito;
        alternar = !alternar;
    }

    return soma % 10 === 0;
}

// ========================
// Sistema de Geração de PIX e Boleto
// ========================

// Gerar código PIX
function gerarCodigoPIX(valor) {
    // Simulação de código PIX (EMV QR Code format)
    const chavePIX = "+5511999999999"; // Chave PIX da loja
    const nomeRecebedor = "TechStore LTDA";
    const cidade = "SAO PAULO";

    // Formatar valor para PIX (com 2 casas decimais)
    const valorFormatado = valor.toFixed(2).replace('.', '');

    // Gerar código PIX simplificado (apenas para demonstração)
    const codigoPIX = `00020101021126330014BR.GOV.BCB.PIX0114${chavePIX}5204000053039865802BR5913${nomeRecebedor}6009${cidade}62070503***6304ABCD`;

    return codigoPIX;
}

// Copiar código PIX
function copiarCodigoPIX() {
    const codigoElement = document.getElementById('pix-codigo');
    const codigo = codigoElement.textContent;

    navigator.clipboard.writeText(codigo).then(() => {
        mostrarMensagem("Código PIX copiado!");
    }).catch(() => {
        // Fallback para navegadores antigos
        const textArea = document.createElement('textarea');
        textArea.value = codigo;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        mostrarMensagem("Código PIX copiado!");
    });
}

// Gerar boleto
function gerarBoleto(valor) {
    // Simulação de geração de boleto
    const numeroBoleto = Math.random().toString().replace('0.', '').substring(0, 48);
    const dataAtual = new Date();
    const dataVencimento = new Date(dataAtual);
    dataVencimento.setDate(dataAtual.getDate() + 3); // 3 dias úteis

    const vencimentoFormatado = dataVencimento.toLocaleDateString('pt-BR');

    return {
        numero: numeroBoleto,
        vencimento: vencimentoFormatado,
        valor: valor.toFixed(2)
    };
}

// Baixar boleto (simulação)
function baixarBoleto() {
    const numeroBoleto = document.getElementById('numero-boleto').textContent;
    const vencimento = document.getElementById('vencimento-boleto').textContent;
    const valor = document.getElementById('valor-boleto').textContent;

    // Simulação de download - em produção, isso seria um link para PDF real
    const conteudoBoleto = `
BOLETO BANCÁRIO
================

Número: ${numeroBoleto}
Vencimento: ${vencimento}
Valor: R$ ${valor}

Pagável em qualquer banco até a data de vencimento.
    `.trim();

    const blob = new Blob([conteudoBoleto], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boleto_${numeroBoleto.substring(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    mostrarMensagem("Boleto baixado com sucesso!");
}

// Copiar número do boleto
function copiarNumeroBoleto() {
    const numeroElement = document.getElementById('numero-boleto');
    const numero = numeroElement.textContent;

    navigator.clipboard.writeText(numero).then(() => {
        mostrarMensagem("Número do boleto copiado!");
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = numero;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        mostrarMensagem("Número do boleto copiado!");
    });
}

// Finalizar pedido
async function finalizarPedido() {
    if (carrinho.length === 0) {
        mostrarMensagem("Seu carrinho está vazio!", 'error');
        return;
    }

    if (!enderecoSelecionado) {
        mostrarMensagem("Selecione um endereço de entrega!", 'error');
        return;
    }

    const metodoPagamento = document.querySelector('input[name="metodo-pagamento"]:checked');
    if (!metodoPagamento) {
        mostrarMensagem("Selecione um método de pagamento!", 'error');
        return;
    }

    // Validar dados do cartão se for cartão de crédito
    if (metodoPagamento.value === 'CARTAO_CREDITO') {
        const errosCartao = validarCartao();
        if (errosCartao.length > 0) {
            const errosEl = document.getElementById('cartao-erros');
            errosEl.innerHTML = errosCartao.join('<br>');
            mostrarMensagem("Corrija os erros no formulário do cartão", 'error');
            return;
        }
    }

    // Mostrar loading
    const btn = document.getElementById('btn-finalizar');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
        // Calcular valores corretos
        const subtotal = carrinho.reduce((sum, item) => sum + item.preco, 0);
        const valorFrete = subtotal > 299 ? 0 : 15.90;
        const valorDesconto = cupomAplicado ? calcularDesconto(cupomAplicado, subtotal) : 0;
        const totalAmount = subtotal + valorFrete - valorDesconto;

        const items = carrinho.map(item => ({
            product_id: item.codProduto || item.id || 1,
            quantity: 1,
            price: item.preco
        }));

        const orderData = {
            items,
            totalAmount,
            metodoPagamento: metodoPagamento.value,
            idEndereco: enderecoSelecionado.codEndereco,
            cupomCodigo: cupomAplicado ? cupomAplicado.codigo : undefined
        };

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (response.ok) {
            // Gerar códigos de pagamento se necessário
            if (metodoPagamento.value === 'PIX') {
                const codigoPIX = gerarCodigoPIX(totalAmount);
                document.getElementById('pix-codigo').textContent = codigoPIX;
                document.getElementById('pix-aguardando').style.display = 'none';
                document.getElementById('pix-qr-code').style.display = 'block';
            } else if (metodoPagamento.value === 'BOLETO') {
                const boletoData = gerarBoleto(totalAmount);
                document.getElementById('numero-boleto').textContent = boletoData.numero;
                document.getElementById('vencimento-boleto').textContent = boletoData.vencimento;
                document.getElementById('valor-boleto').textContent = boletoData.valor;
                document.getElementById('boleto-aguardando').style.display = 'none';
                document.getElementById('boleto-gerado').style.display = 'block';
            }

            // Limpar dados locais
            localStorage.removeItem("carrinho");
            localStorage.removeItem("enderecoSelecionado");
            carrinho = [];
            enderecoSelecionado = null;
            cupomAplicado = null;

            mostrarMensagem("🎉 Pedido confirmado com sucesso!");

            // Para PIX e Boleto, mostrar informações de pagamento
            if (metodoPagamento.value === 'PIX' || metodoPagamento.value === 'BOLETO') {
                // Não redirecionar imediatamente, mostrar informações de pagamento
                setTimeout(() => {
                    mostrarMensagem("Acompanhe o status do seu pedido no perfil!");
                }, 2000);
            } else {
                // Para cartão e débito, redirecionar para perfil
                setTimeout(() => window.location.href = "perfil.html", 1500);
            }
        } else {
            mostrarMensagem(data.error || "Erro ao finalizar pedido", 'error');
        }
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    } finally {
        // Esconder loading
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Carregar rastreamento se houver pedido
async function carregarRastreamento() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');

    if (orderId) {
        try {
            const response = await fetch(`${API_BASE_URL}/delivery/${orderId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (response.ok) {
                exibirRastreamento(data);
            }
        } catch (error) {
            console.error('Erro ao carregar rastreamento:', error);
        }
    }
}

function exibirRastreamento(delivery) {
    const rastreamentoSection = document.getElementById('rastreamento-section');
    if (!rastreamentoSection) return;

    const statusMap = {
        'AGUARDANDO_ENVIO': { text: 'Aguardando Envio', icon: '📦', active: true },
        'EM_TRANSITO': { text: 'Em Trânsito', icon: '🚚', active: true },
        'SAIU_PARA_ENTREGA': { text: 'Saiu para Entrega', icon: '🚚', active: true },
        'ENTREGUE': { text: 'Entregue', icon: '✅', active: true, completed: true }
    };

    const statusAtual = statusMap[delivery.statusEntrega] || { text: delivery.statusEntrega, icon: '❓' };

    rastreamentoSection.innerHTML = `
        <h3>🚚 Rastreamento do Pedido</h3>
        <div class="tracking-info">
            <div class="tracking-step ${statusAtual.active ? 'active' : ''} ${statusAtual.completed ? 'completed' : ''}">
                <span class="tracking-icon">${statusAtual.icon}</span>
                <div>
                    <strong>${statusAtual.text}</strong>
                    ${delivery.dataEstimada ? `<br>Data estimada: ${new Date(delivery.dataEstimada).toLocaleDateString('pt-BR')}` : ''}
                    ${delivery.codigoRastreio ? `<br>Código: ${delivery.codigoRastreio}` : ''}
                    ${delivery.transportadora ? `<br>Transportadora: ${delivery.transportadora}` : ''}
                </div>
            </div>
        </div>
    `;

    rastreamentoSection.style.display = 'block';
}

// ========================
// Perfil do usuário
// ========================

function carregarPerfil() {
    if (!verificarAutenticacao()) return;

    const user = JSON.parse(localStorage.getItem("userLogado"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("perfil-usuario").textContent = user.username;
    document.getElementById("perfil-email").textContent = user.email;

    // Histórico de compras
    const historico = JSON.parse(localStorage.getItem("historico")) || [];
    const lista = document.getElementById("historico-compras");

    if (lista) {
        lista.innerHTML = "";
        if (historico.length === 0) {
            lista.innerHTML = "<li>Nenhuma compra realizada ainda.</li>";
        } else {
            // Filtrar histórico do usuário atual
            const historicoUsuario = historico.filter(compra => compra.usuario === user.username);

            if (historicoUsuario.length === 0) {
                lista.innerHTML = "<li>Nenhuma compra realizada ainda.</li>";
            } else {
                historicoUsuario.forEach((compra, i) => {
                    const li = document.createElement("li");
                    li.classList.add("fade-in");
                    li.innerHTML = `
                        <strong>Pedido ${i + 1}</strong> - ${compra.data}<br>
                        Itens: ${compra.itens.join(", ")}<br>
                        Total: R$ ${compra.total.toFixed(2)}
                    `;
                    lista.appendChild(li);
                });
            }
        }
    }

    // Atualizar dados
    const formPerfil = document.getElementById("form-perfil");
    if (formPerfil) {
        formPerfil.addEventListener("submit", function(e) {
            e.preventDefault();
            const novoEmail = document.getElementById("novoEmail").value;
            const novaSenha = document.getElementById("novaSenha").value;

            if (novoEmail || novaSenha) {
                // Atualizar usuário
                const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
                const usuarioIndex = usuarios.findIndex(u => u.username === user.username);

                if (usuarioIndex !== -1) {
                    if (novoEmail) usuarios[usuarioIndex].email = novoEmail;
                    if (novaSenha) usuarios[usuarioIndex].password = novaSenha;

                    localStorage.setItem("usuarios", JSON.stringify(usuarios));
                    localStorage.setItem("userLogado", JSON.stringify(usuarios[usuarioIndex]));

                    mostrarMensagem("Dados atualizados com sucesso!");
                    setTimeout(() => carregarPerfil(), 1000);
                }
            } else {
                mostrarMensagem("Preencha pelo menos um campo para atualizar", 'error');
            }
        });
    }
}

// ========================
// Checkout - Sistema Simplificado
// ========================

function carregarCheckout() {
    if (!verificarAutenticacao()) return;

    // Carregar carrinho
    carregarCarrinhoCheckout();

    // Carregar endereço
    atualizarEnderecoSelecionado();

    // Configurar métodos de pagamento
    configurarMetodosPagamento();
}

function carregarCarrinhoCheckout() {
    const itensContainer = document.getElementById("itens-carrinho");
    if (!itensContainer) return;

    itensContainer.innerHTML = "";

    if (carrinho.length === 0) {
        itensContainer.innerHTML = "<p>Seu carrinho está vazio</p>";
        return;
    }

    let subtotal = 0;

    carrinho.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        itemDiv.innerHTML = `
            <div class="item-info">
                <h4>${item.nome}</h4>
                <p>R$ ${item.preco.toFixed(2)}</p>
            </div>
            <div class="item-actions">
                <button onclick="removerItemCarrinho(${index})" class="btn-remove">×</button>
            </div>
        `;
        itensContainer.appendChild(itemDiv);
        subtotal += item.preco;
    });

    // Calcular totais
    const frete = subtotal > 299 ? 0 : 15.90;
    const desconto = cupomAplicado ? calcularDesconto(cupomAplicado, subtotal) : 0;
    const total = subtotal + frete - desconto;

    // Atualizar valores na tela
    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("frete").textContent = frete.toFixed(2);
    document.getElementById("desconto").textContent = desconto.toFixed(2);
    document.getElementById("total-final").textContent = total.toFixed(2);

    // Mostrar/ocultar desconto
    const descontoLine = document.getElementById("desconto-line");
    if (descontoLine) {
        descontoLine.style.display = desconto > 0 ? 'flex' : 'none';
    }
}

function removerItemCarrinho(index) {
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    carregarCarrinhoCheckout();
    atualizarCarrinho();
    mostrarMensagem("Item removido do carrinho");
}

function configurarMetodosPagamento() {
    const radios = document.querySelectorAll('input[name="metodo-pagamento"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Esconder todos os formulários
            document.getElementById('cartao-form').style.display = 'none';
            document.getElementById('pix-info').style.display = 'none';
            document.getElementById('boleto-info').style.display = 'none';

            // Mostrar formulário correspondente
            if (this.value === 'CARTAO_CREDITO') {
                document.getElementById('cartao-form').style.display = 'block';
            } else if (this.value === 'PIX') {
                document.getElementById('pix-info').style.display = 'block';
            } else if (this.value === 'BOLETO') {
                document.getElementById('boleto-info').style.display = 'block';
            }
        });
    });

    // Configurar formatação de cartão
    configurarFormatacaoCartao();
}

function configurarFormatacaoCartao() {
    const numeroCartao = document.getElementById('numero-cartao');
    const validadeCartao = document.getElementById('validade-cartao');
    const cvvCartao = document.getElementById('cvv-cartao');

    if (numeroCartao) {
        numeroCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value.substring(0, 19);
        });
    }

    if (validadeCartao) {
        validadeCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cvvCartao) {
        cvvCartao.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
}

async function finalizarPedido() {
    if (carrinho.length === 0) {
        mostrarMensagem("Seu carrinho está vazio!", 'error');
        return;
    }

    if (!enderecoSelecionado) {
        mostrarMensagem("Selecione um endereço de entrega!", 'error');
        return;
    }

    const metodoPagamento = document.querySelector('input[name="metodo-pagamento"]:checked');
    if (!metodoPagamento) {
        mostrarMensagem("Selecione um método de pagamento!", 'error');
        return;
    }

    // Validar dados do cartão se for cartão de crédito
    if (metodoPagamento.value === 'CARTAO_CREDITO') {
        const errosCartao = validarCartao();
        if (errosCartao.length > 0) {
            const errosEl = document.getElementById('cartao-erros');
            errosEl.innerHTML = errosCartao.join('<br>');
            mostrarMensagem("Corrija os erros no formulário do cartão", 'error');
            return;
        }
    }

    // Mostrar loading
    const btn = document.getElementById('btn-finalizar');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
        // Calcular valores
        const subtotal = carrinho.reduce((sum, item) => sum + item.preco, 0);
        const frete = subtotal > 299 ? 0 : 15.90;
        const desconto = cupomAplicado ? calcularDesconto(cupomAplicado, subtotal) : 0;
        const totalAmount = subtotal + frete - desconto;

        const items = carrinho.map(item => ({
            product_id: item.codProduto || item.id || 1,
            quantity: 1,
            price: item.preco
        }));

        const orderData = {
            items,
            totalAmount,
            metodoPagamento: metodoPagamento.value,
            idEndereco: enderecoSelecionado.codEndereco,
            cupomCodigo: cupomAplicado ? cupomAplicado.codigo : undefined
        };

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (response.ok) {
            // Para cartão de crédito, redirecionar direto
            if (metodoPagamento.value === 'CARTAO_CREDITO') {
                localStorage.removeItem("carrinho");
                localStorage.removeItem("enderecoSelecionado");
                carrinho = [];
                enderecoSelecionado = null;
                cupomAplicado = null;

                mostrarMensagem("🎉 Pedido realizado com sucesso!");
                setTimeout(() => window.location.href = "perfil.html", 1500);
            } else {
                // Para PIX e Boleto, mostrar painel de pagamento
                mostrarPainelPagamento(data.order, metodoPagamento.value, totalAmount);
            }
        } else {
            mostrarMensagem(data.error || "Erro ao finalizar pedido", 'error');
        }
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    } finally {
        // Esconder loading
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

function mostrarPainelPagamento(order, metodoPagamento, valorTotal) {
    // Criar painel de pagamento profissional
    const painel = document.createElement('div');
    painel.id = 'painel-pagamento';
    painel.innerHTML = `
        <div class="painel-overlay">
            <div class="painel-conteudo">
                <div class="painel-header">
                    <h2>🎉 Pedido Realizado com Sucesso!</h2>
                    <p class="pedido-numero">Pedido #${order.id || Math.floor(Math.random() * 10000)}</p>
                </div>

                <div class="painel-corpo">
                    <div class="pagamento-info">
                        <div class="valor-total">
                            <span class="label">Valor Total:</span>
                            <span class="valor">R$ ${valorTotal.toFixed(2)}</span>
                        </div>

                        ${metodoPagamento === 'PIX' ? `
                            <div class="pagamento-pix">
                                <h3>📱 Pagamento via PIX</h3>
                                <div class="pix-qr-container">
                                    <div class="qr-placeholder">
                                        <div class="qr-code">QR CODE</div>
                                        <p>Escaneie com seu app bancário</p>
                                    </div>
                                    <div class="pix-dados">
                                        <p><strong>Chave PIX:</strong></p>
                                        <div class="chave-pix">+5511999999999</div>
                                        <button onclick="copiarChavePIX()" class="btn-copiar">Copiar Chave</button>
                                    </div>
                                </div>
                                <div class="pagamento-instrucoes">
                                    <h4>Como pagar:</h4>
                                    <ol>
                                        <li>Abra o app do seu banco</li>
                                        <li>Escolha a opção PIX</li>
                                        <li>Escaneie o QR Code ou use a chave</li>
                                        <li>Confirme o pagamento</li>
                                    </ol>
                                </div>
                            </div>
                        ` : metodoPagamento === 'BOLETO' ? `
                            <div class="pagamento-boleto">
                                <h3>📄 Pagamento via Boleto</h3>
                                <div class="boleto-info">
                                    <div class="boleto-dados">
                                        <p><strong>Número do Boleto:</strong></p>
                                        <div class="numero-boleto">${gerarNumeroBoleto()}</div>
                                        <button onclick="copiarNumeroBoleto()" class="btn-copiar">Copiar Número</button>
                                    </div>
                                    <div class="boleto-dados">
                                        <p><strong>Vencimento:</strong></p>
                                        <div class="vencimento">${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                    <div class="boleto-dados">
                                        <p><strong>Valor:</strong></p>
                                        <div class="valor-boleto">R$ ${valorTotal.toFixed(2)}</div>
                                    </div>
                                </div>
                                <div class="pagamento-instrucoes">
                                    <h4>Como pagar:</h4>
                                    <ol>
                                        <li>Copie o número do boleto</li>
                                        <li>Acesse seu banco online ou app</li>
                                        <li>Escolha "Pagar Boleto"</li>
                                        <li>Cole o número e confirme</li>
                                    </ol>
                                </div>
                                <button onclick="baixarBoleto()" class="btn-baixar">📄 Baixar Boleto (PDF)</button>
                            </div>
                        ` : ''}
                    </div>

                    <div class="pagamento-status">
                        <div class="status-pendente">
                            <div class="status-icon">⏳</div>
                            <div class="status-info">
                                <h4>Aguardando Pagamento</h4>
                                <p>Assim que confirmado, seu pedido será processado</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="painel-acoes">
                    <button onclick="irParaPerfil()" class="btn-secundario">Ver Meus Pedidos</button>
                    <button onclick="continuarComprando()" class="btn-primario">Continuar Comprando</button>
                </div>

                <div class="pagamento-ajuda">
                    <p>📞 Precisa de ajuda? <a href="contato.html">Entre em contato</a></p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(painel);

    // Animação de entrada
    setTimeout(() => {
        painel.classList.add('ativo');
    }, 100);
}

function gerarNumeroBoleto() {
    // Gerar número de boleto simulado
    const parte1 = Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
    const parte2 = Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
    return parte1 + parte2;
}

function copiarChavePIX() {
    navigator.clipboard.writeText('+5511999999999').then(() => {
        mostrarMensagem("Chave PIX copiada!");
    });
}

function copiarNumeroBoleto() {
    const numero = document.querySelector('.numero-boleto').textContent;
    navigator.clipboard.writeText(numero).then(() => {
        mostrarMensagem("Número do boleto copiado!");
    });
}

function baixarBoleto() {
    const numero = document.querySelector('.numero-boleto').textContent;
    const vencimento = document.querySelector('.vencimento').textContent;
    const valor = document.querySelector('.valor-boleto').textContent;

    const conteudo = `
BOLETO BANCÁRIO - TechStore
============================

Número: ${numero}
Vencimento: ${vencimento}
Valor: ${valor}

Pagável em qualquer banco até a data de vencimento.
    `.trim();

    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boleto_${numero.substring(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    mostrarMensagem("Boleto baixado com sucesso!");
}

function irParaPerfil() {
    // Limpar dados locais
    localStorage.removeItem("carrinho");
    localStorage.removeItem("enderecoSelecionado");
    carrinho = [];
    enderecoSelecionado = null;
    cupomAplicado = null;

    window.location.href = "perfil.html";
}

function continuarComprando() {
    // Limpar dados locais
    localStorage.removeItem("carrinho");
    localStorage.removeItem("enderecoSelecionado");
    carrinho = [];
    enderecoSelecionado = null;
    cupomAplicado = null;

    window.location.href = "index.html";
}

// ========================
// Inicialização
// ========================

// Inicializar quando a página carregar
document.addEventListener("DOMContentLoaded", function() {
    // Carregar dados do localStorage na inicialização
    carregarCarrinhoLocal();
    carregarEnderecoSelecionado();

    // Verificar autenticação em páginas protegidas
    if (!window.location.href.includes('login.html') && !window.location.href.includes('cadastro.html')) {
        verificarAutenticacao();
    }

    // Atualizar carrinho
    atualizarCarrinho();

    // Carregar funções específicas da página
    if (window.location.href.includes('carrinho.html')) {
        carregarCarrinho();
        // Adicionar event listener para formulário de novo endereço
        const formNovoEndereco = document.getElementById("form-novo-endereco");
        if (formNovoEndereco) {
            formNovoEndereco.addEventListener("submit", salvarNovoEndereco);
        }
    } else if (window.location.href.includes('checkout.html')) {
        carregarCheckout();
    } else if (window.location.href.includes('perfil.html')) {
        carregarPerfil();
    }

    // Adicionar animação de entrada
    setTimeout(() => {
        document.body.classList.add('fade-in');
    }, 100);
});

// ========================
// API Integration
// ========================

const API_BASE_URL = 'http://localhost:3000/api';

// Headers para requisições autenticadas
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Login com API
async function login(event) {
    if (event) event.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usuario, password: senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userLogado', JSON.stringify(data.user));
            mostrarMensagem(`Bem-vindo, ${usuario}!`);
            setTimeout(() => window.location.href = "../index.html", 1000);
        } else {
            mostrarMensagem(data.error || "Erro no login", 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    }
}

// Cadastro com API
async function cadastrarAPI(event) {
    if (event) event.preventDefault();

    const username = document.getElementById('novoUsername').value;
    const nome = document.getElementById('novoNomeCompleto').value;
    const email = document.getElementById('novoEmail').value;
    const telefone = document.getElementById('novoTelefone').value;
    const cpf = document.getElementById('novoCPF').value;
    const password = document.getElementById('novaSenha').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                nome: nome,
                email: email,
                password: password,
                telefone: telefone || undefined,
                cpf: cpf || undefined
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userLogado', JSON.stringify(data.user));
            mostrarMensagem(`Cadastro realizado com sucesso! Bem-vindo, ${nome}!`);
            setTimeout(() => window.location.href = "index.html", 1500);
        } else {
            mostrarMensagem(data.error || "Erro no cadastro", 'error');
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    }
}

// Função para formatar CPF
function formatarCPF(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        input.value = value;
    }
}

// ========================
// Sistema de Endereços
// ========================

// Atualizar exibição do endereço selecionado
function atualizarEnderecoSelecionado() {
    const enderecoDiv = document.getElementById("endereco-selecionado");
    if (!enderecoDiv) return;

    if (enderecoSelecionado) {
        enderecoDiv.innerHTML = `
            <div class="endereco-info">
                <strong>${enderecoSelecionado.apelido || 'Endereço'}</strong><br>
                ${enderecoSelecionado.logradouro}, ${enderecoSelecionado.numero}<br>
                ${enderecoSelecionado.bairro} - ${enderecoSelecionado.localidade}/${enderecoSelecionado.uf}<br>
                CEP: ${enderecoSelecionado.cep}
            </div>
            <button class="btn-secondary" onclick="abrirModalEnderecos()">Alterar</button>
        `;
    } else {
        enderecoDiv.innerHTML = `
            <p>Nenhum endereço selecionado</p>
            <button class="btn-secondary" onclick="abrirModalEnderecos()">Selecionar Endereço</button>
        `;
    }
}

// Abrir modal de endereços
function abrirModalEnderecos() {
    const modal = document.getElementById("modal-enderecos");
    if (modal) {
        modal.style.display = "flex";
        carregarEnderecosUsuario();
    }
}

// Fechar modal de endereços
function fecharModalEnderecos() {
    const modal = document.getElementById("modal-enderecos");
    if (modal) {
        modal.style.display = "none";
    }
}

// Carregar endereços do usuário via API
async function carregarEnderecosUsuario() {
    try {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const enderecos = await response.json();

        if (response.ok) {
            exibirEnderecos(enderecos);
        } else {
            mostrarMensagem("Erro ao carregar endereços", 'error');
        }
    } catch (error) {
        console.error('Erro ao carregar endereços:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    }
}

// Exibir endereços no modal
function exibirEnderecos(enderecos) {
    const lista = document.getElementById("lista-enderecos");
    if (!lista) return;

    lista.innerHTML = "";

    if (enderecos.length === 0) {
        lista.innerHTML = "<p>Nenhum endereço cadastrado.</p>";
        return;
    }

    enderecos.forEach(endereco => {
        const enderecoDiv = document.createElement("div");
        enderecoDiv.classList.add("endereco-item");
        enderecoDiv.innerHTML = `
            <div class="endereco-detalhes">
                <strong>${endereco.apelido || 'Endereço'}</strong>
                ${endereco.is_principal ? ' <span class="principal">(Principal)</span>' : ''}
                <br>
                ${endereco.logradouro}, ${endereco.numero}<br>
                ${endereco.complemento ? endereco.complemento + '<br>' : ''}
                ${endereco.bairro} - ${endereco.localidade}/${endereco.uf}<br>
                CEP: ${endereco.cep}
            </div>
            <button class="btn-primary" onclick="selecionarEndereco(${endereco.codEndereco})">Selecionar</button>
        `;
        lista.appendChild(enderecoDiv);
    });
}

// Selecionar endereço
function selecionarEndereco(codEndereco) {
    // Buscar novamente a lista e encontrar o endereço
    fetch(`${API_BASE_URL}/addresses`, {
        method: 'GET',
        headers: getAuthHeaders()
    })
    .then(response => response.json())
    .then(enderecos => {
        const endereco = enderecos.find(e => e.codEndereco === codEndereco);
        if (endereco) {
            enderecoSelecionado = endereco;
            localStorage.setItem("enderecoSelecionado", JSON.stringify(endereco));
            atualizarEnderecoSelecionado();
            fecharModalEnderecos();
            mostrarMensagem("Endereço selecionado com sucesso!");
        }
    })
    .catch(error => {
        console.error('Erro ao selecionar endereço:', error);
        mostrarMensagem("Erro ao selecionar endereço", 'error');
    });
}

// Abrir modal de novo endereço
function abrirModalNovoEndereco() {
    fecharModalEnderecos();
    const modal = document.getElementById("modal-novo-endereco");
    if (modal) {
        modal.style.display = "flex";
    }
}

// Fechar modal de novo endereço
function fecharModalNovoEndereco() {
    const modal = document.getElementById("modal-novo-endereco");
    if (modal) {
        modal.style.display = "none";
        // Limpar formulário
        const form = document.getElementById("form-novo-endereco");
        if (form) form.reset();
    }
}

// Buscar CEP via ViaCEP
async function buscarCEP() {
    const cepInput = document.getElementById("cep");
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        mostrarMensagem("CEP deve ter 8 dígitos", 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/addresses/viacep/${cep}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById("logradouro").value = data.logradouro || '';
            document.getElementById("bairro").value = data.bairro || '';
            document.getElementById("localidade").value = data.localidade || '';
            document.getElementById("uf").value = data.uf || '';
        } else {
            mostrarMensagem(data.error || "CEP não encontrado", 'error');
        }
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        mostrarMensagem("Erro ao buscar CEP", 'error');
    }
}

// Salvar novo endereço
async function salvarNovoEndereco(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const enderecoData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_BASE_URL}/addresses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(enderecoData)
        });

        const data = await response.json();

        if (response.ok) {
            mostrarMensagem("Endereço salvo com sucesso!");
            fecharModalNovoEndereco();
            // Recarregar endereços se o modal de endereços estiver aberto
            if (document.getElementById("modal-enderecos").style.display === "flex") {
                carregarEnderecosUsuario();
            }
        } else {
            mostrarMensagem(data.error || "Erro ao salvar endereço", 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar endereço:', error);
        mostrarMensagem("Erro de conexão com o servidor", 'error');
    }
}

// ========================
// Sistema de Modal de Pagamento
// ========================

// Abrir modal de pagamento
function abrirModalPagamento() {
    const modal = document.getElementById("modal-pagamento");
    if (modal) {
        modal.style.display = "flex";
    }
}

// Fechar modal de pagamento
function fecharModalPagamento() {
    const modal = document.getElementById("modal-pagamento");
    if (modal) {
        modal.style.display = "none";
    }
}

// Confirmar método de pagamento e ir para checkout
function confirmarMetodoPagamento() {
    const metodoSelecionado = document.querySelector('input[name="metodo-pagamento-modal"]:checked');
    if (!metodoSelecionado) {
        mostrarMensagem("Selecione um método de pagamento!", 'error');
        return;
    }

    // Fechar modal e redirecionar para checkout com parâmetro
    fecharModalPagamento();
    window.location.href = `checkout.html?metodo=${metodoSelecionado.value}`;
}
