'use strict';

// Funções de interface
function enableSidebarToggle() {
  const sidebar = document.querySelector('[data-sidebar]');
  const sidebarBtn = document.querySelector('[data-sidebar-btn]');
  
  if (sidebar && sidebarBtn) {
    sidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
}

function enableTestimonialsModal() {
  const testimonialsItems = document.querySelectorAll('[data-testimonials-item]');
  const modalContainer = document.querySelector('[data-modal-container]');
  const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
  const overlay = document.querySelector('[data-overlay]');

  const modalImg = document.querySelector('[data-modal-img]');
  const modalTitle = document.querySelector('[data-modal-title]');
  const modalText = document.querySelector('[data-modal-text]');

  const toggleModal = () => {
    modalContainer.classList.toggle('active');
    overlay.classList.toggle('active');
  };

  testimonialsItems.forEach(item => {
    item.addEventListener('click', () => {
      const avatar = item.querySelector('[data-testimonials-avatar]');
      const title = item.querySelector('[data-testimonials-title]');
      const text = item.querySelector('[data-testimonials-text]');
      
      if (avatar) modalImg.src = avatar.src;
      if (title) modalTitle.textContent = title.textContent;
      if (text) modalText.textContent = text.textContent;
      
      toggleModal();
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', toggleModal);
  if (overlay) overlay.addEventListener('click', toggleModal);
}

function enableFilter() {
  const filterSelect = document.querySelector('[data-select]');
  const selectItems = document.querySelectorAll('[data-select-item]');
  const selectValue = document.querySelector('[data-select-value]');
  const filterButtons = document.querySelectorAll('[data-filter-btn]');
  const filterItems = document.querySelectorAll('[data-filter-item]');

  if (filterSelect) {
    filterSelect.addEventListener('click', () => {
      filterSelect.classList.toggle('active');
    });
  }

  selectItems.forEach(item => {
    item.addEventListener('click', () => {
      const value = item.textContent.toLowerCase();
      selectValue.textContent = item.textContent;
      applyFilter(value);
      filterSelect.classList.remove('active');
    });
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent.toLowerCase();
      selectValue.textContent = btn.textContent;
      applyFilter(value);
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function applyFilter(filterValue) {
    filterItems.forEach(item => {
      const category = item.dataset.category;
      item.classList.toggle('active', filterValue === 'all' || filterValue === category);
    });
  }
}

function enablePageNavigation() {
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const pages = document.querySelectorAll('[data-page]');

  navLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
      pages.forEach(page => page.classList.remove('active'));
      navLinks.forEach(lnk => lnk.classList.remove('active'));
      
      pages[index].classList.add('active');
      link.classList.add('active');
      window.scrollTo(0, 0);
    });
  });
}

// Sistema de Comentários ATUALIZADO com nome do usuário
function setupCommentSystem() {
  const API_URL = '/api/comentarios';

  const commentButton = document.getElementById('enviarComentario');
  const commentInput = document.getElementById('commentInput');
  const userNameInput = document.getElementById('userName'); // Novo campo
  const commentsContainer = document.getElementById('commentsContainer');

  async function loadComments() {
    try {
      commentsContainer.innerHTML = '<p class="loading">Carregando comentários...</p>';
      const response = await fetch(API_URL);
      
      if (!response.ok) throw new Error('Erro ao carregar comentários');
      
      const comments = await response.json();
      const reversedComments = [...comments].reverse();
      
      renderComments(reversedComments);
      
    } catch (error) {
      console.error('Erro:', error);
      commentsContainer.innerHTML = '<p class="error">Erro ao carregar comentários</p>';
    }
  }

  function renderComments(comments) {
    commentsContainer.innerHTML = comments
      .map(comment => `
        <div class="comment">
          <p class="comment-author">${comment.autor || 'Anônimo'}</p>
          <p class="comment-text">${comment.texto}</p>
          <span class="comment-date">
            ${new Date(comment.data).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      `).join('');
  }

  async function postComment(autor, texto) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autor, texto })
      });

      if (!response.ok) throw new Error('Erro ao enviar comentário');
      return await response.json();
      
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  }
  
  if (commentButton && commentInput && userNameInput && commentsContainer) {
    commentButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      commentButton.disabled = true;
      commentButton.textContent = 'Enviando...';
      
      const autor = userNameInput.value.trim();
      const texto = commentInput.value.trim();
      
      if (!autor || !texto) {
        alert('Por favor, preencha seu nome e o comentário!');
        return;
      }

      try {
        commentButton.disabled = true;
        commentButton.textContent = 'Enviando...';
        
        const newComment = await postComment(autor, texto);
        
        userNameInput.value = '';
        commentInput.value = '';
        
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
          <p class="comment-author">${newComment.autor}</p>
          <p class="comment-text">${newComment.texto}</p>
          <span class="comment-date">
            ${new Date(newComment.data).toLocaleString('pt-BR')}
          </span>
        `;
        commentsContainer.prepend(commentDiv);
        
        await loadComments();
  
      } catch (error) {
        console.error('Erro no envio:', error);
        alert(error.message);
      } finally {
        commentButton.disabled = false;
        commentButton.textContent = 'Enviar';
      }
    });

    loadComments();
  }
}




const MP_PUBLIC_KEY = 'APP_USR-ab78e2ce-2cc4-413d-8764-79e9db32162e'; // Substitua pela sua chave
let mercadopago;

// Carrega o SDK do Mercado Pago
function loadMercadoPagoSDK() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      mercadopago = new MercadoPago(MP_PUBLIC_KEY);
      resolve();
    };
    document.body.appendChild(script);
  });
}

// Função para criar pagamento PIX
async function createPixPayment(amount) {
  try {
    const response = await fetch('https://neu-folder-1.onrender.com/create-pix-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: "Apoio ao criador",
        payment_method_id: "pix"
      })
    });

    if (!response.ok) throw new Error('Erro ao criar pagamento');
    return await response.json();
  } catch (error) {
    console.error("Erro:", error);
    throw error;
  }
}

// Configura o sistema de pagamento
function setupPaymentSystem() {
  const comprarBtn = document.getElementById('comprar');
  const paymentForm = document.getElementById('paymentForm');
  const pagarPixBtn = document.getElementById('pagarPix');
  const valorApoio = document.getElementById('valorApoio');
  const qrCodeContainer = document.getElementById('qrCodeContainer');

  comprarBtn.addEventListener('click', () => {
    paymentForm.style.display = paymentForm.style.display === 'none' ? 'block' : 'none';
  });

  pagarPixBtn.addEventListener('click', async () => {
    const amount = parseFloat(valorApoio.value);
    
    if (!amount || amount < 5) {
      alert('O valor mínimo de apoio é R$ 5,00');
      return;
    }

    try {
      pagarPixBtn.disabled = true;
      pagarPixBtn.textContent = 'Processando...';
      
      const payment = await createPixPayment(amount);
      
      qrCodeContainer.innerHTML = `
      <p style="font-weight: bold;">Escaneie o QR Code ou copie o código:</p>
      <img src="data:image/png;base64,${payment.point_of_interaction.transaction_data.qr_code_base64}" alt="QR Code PIX">
      <p>Código PIX (copie e cole):</p>
      <input type="text" value="${payment.point_of_interaction.transaction_data.qr_code}" readonly style="width: 100%; padding: 8px; margin-top: 5px;">
      <p>Valor: R$ ${amount.toFixed(2)}</p>
      <p>Expira em: ${new Date(payment.date_of_expiration).toLocaleString('pt-BR')}</p>
    `;
    
      
    } catch (error) {
      alert('Erro ao processar pagamento: ' + error.message);
    } finally {
      pagarPixBtn.disabled = false;
      pagarPixBtn.textContent = 'Pagar com PIX';
    }
  });
}

// No final da inicialização, adicione:
document.addEventListener('DOMContentLoaded', async () => {
  enableSidebarToggle();
  enableTestimonialsModal();
  enableFilter();
  enablePageNavigation();
  setupCommentSystem();
  
  await loadMercadoPagoSDK();
  setupPaymentSystem();
});