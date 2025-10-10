// ---------------------- CONTROLE DE ABAS ----------------------
document.querySelectorAll('nav a[data-tab]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();

    const tabId = link.getAttribute('data-tab');

    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('nav a[data-tab]').forEach(l => l.classList.remove('active'));

    link.classList.add('active');
    const currentTab = document.getElementById(tabId);
    if (currentTab) {
      currentTab.classList.add('active');
    }
  });
});

// ---------------------- CARRINHO ----------------------
let cart = [];

const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.getElementById('close-cart');
const cartIcon = document.getElementById('cart-icon');

if (cartIcon) {
  cartIcon.addEventListener('click', () => {
    cartSidebar.classList.add('active');
  });
}
if (closeCartBtn) {
  closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('active');
  });
}

function updateCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  cartItemsContainer.innerHTML = '';

  let total = 0;
  cart.forEach((item, index) => {
    total += item.preco;

    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <span>${item.nome} - R$${item.preco}</span>
      <button onclick="removeFromCart(${index})">X</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  cartCount.textContent = cart.length;
  cartTotal.textContent = `Total: R$${total}`;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// Adicionar ao carrinho
document.querySelectorAll('.btn-add').forEach(btn => {
  btn.addEventListener('click', () => {
    const produto = btn.getAttribute('data-produto');
    const preco = parseFloat(btn.getAttribute('data-preco'));
    cart.push({ nome: produto, preco });
    updateCart();
  });
});

// Comprar direto (abre popup com fluxo email -> qr)
document.querySelectorAll('.btn-comprar').forEach(btn => {
  btn.addEventListener('click', () => {
    const produto = btn.getAttribute('data-produto');
    const preco = btn.getAttribute('data-preco');
    abrirPopupPagamento(produto, preco);
  });
});

// Finalizar compra no carrinho
const finalizarBtn = document.getElementById('finalizar-compra');
if (finalizarBtn) {
  finalizarBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
    const total = cart.reduce((acc, item) => acc + item.preco, 0);
    abrirPopupPagamento("Compra Completa", total);
  });
}

// ---------------------- POPUP PAGAMENTO ----------------------
function gerarUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function abrirPopupPagamento(produto, preco) {
  const chaveAleatoria = 'daf0530d-702a-425f-8006-047e505a50cb';
  const qrCodeUrl = 'img/qrcode.jpg';

  const html = `
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <title>Pagamento - ${produto}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        background: url('img/dollar.jpg') center/cover no-repeat;
        position: relative;
        color: #fff;
      }
      body::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6);
        z-index: 0;
      }
      .container {
        position: relative;
        z-index: 1;
        background: rgba(0,0,0,0.7);
        padding: 2rem;
        border-radius: 20px;
        text-align: center;
        max-width: 420px;
        width: 92%;
      }
      h2 { color: #b19aff; margin-bottom: 1rem; }
      input {
        width: 92%;
        padding: 0.55rem;
        margin: 0.45rem 0;
        border-radius: 6px;
        border: none;
        font-size: 1rem;
      }
      button {
        background: #7f5af0;
        border: none;
        color: #fff;
        padding: 0.6rem 1.2rem;
        border-radius: 30px;
        cursor: pointer;
        margin-top: 1rem;
      }
      button:hover { background: #5931db; }
      .hidden { display: none; }
      .chave {
        background: rgba(255,255,255,0.1);
        padding: 0.55rem 1rem;
        border-radius: 10px;
        margin: 1rem 0;
        cursor: pointer;
        display: inline-block;
        font-family: monospace;
      }
      img { width: 260px; height: 260px; margin: 1rem 0; border-radius: 12px; object-fit: contain; }
      @media (max-width:420px) { img{ width:220px;height:220px } }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>${produto}</h2>
      <p>Valor: R$${preco}</p>

      <!-- Etapa 1 -->
      <div id="form-section">
        <input type="email" id="email" placeholder="Digite seu email" required />
        <input type="text" id="discord" placeholder="Digite seu Discord (opcional)" />
        <button id="confirmar">Confirmar</button>
      </div>

      <!-- Etapa 2 -->
      <div id="pagamento-section" class="hidden">
        <div class="chave" id="chave">${chaveAleatoria}</div>
        <img src="${qrCodeUrl}" alt="QR Code" />
        <br/>
        <button onclick="window.close()">Fechar</button>
      </div>
    </div>

    <script>
      (function(){
        const confirmar = document.getElementById('confirmar');
        confirmar.addEventListener('click', () => {
          const email = document.getElementById('email').value;
          if (!email) { alert('Por favor, insira seu email!'); return; }
          // opcional: pega discord e envia para console (simulação)
          const discord = document.getElementById('discord').value || '';
          console.log('Compra - produto: "${produto}", valor: ${preco}, email:', email, 'discord:', discord);
          document.getElementById('form-section').style.display = 'none';
          document.getElementById('pagamento-section').style.display = 'block';
        });

        const chaveEl = document.getElementById('chave');
        chaveEl.addEventListener('click', () => {
          navigator.clipboard.writeText(chaveEl.textContent);
          alert('Chave copiada!');
        });
      })();
    </script>
  </body>
  </html>
  `;

  const paymentWindow = window.open('', '_blank', 'width=460,height=700');
  paymentWindow.document.write(html);
  paymentWindow.document.close();
}


// Extra handler: allow any link with data-tab to switch tabs (including cart help link)
document.querySelectorAll('a[data-tab]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const tabId = link.getAttribute('data-tab');
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');

    // Update nav active if applicable
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    const navLink = document.querySelector('nav a[data-tab="' + tabId + '"]');
    if (navLink) navLink.classList.add('active');

    // Close cart sidebar if opened
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) sidebar.classList.remove('active');
  });
});
