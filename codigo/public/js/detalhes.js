/* =============================================================
   detalhes.js — InfraBH
   -------------------------------------------------------------
   Funcionalidades adicionadas aos botões da página detalhes.html:

     1. "Marcar como lido"
        - Ao clicar: texto muda para "✓ Lido", botão fica esmaecido
          e desabilitado (evita cliques duplos).
        - Estado { lido: true } salvo em localStorage.
        - Ao recarregar a página, o estado é restaurado automaticamente.

     2. "Mudar prioridade"  (renomeado de "Aumentar prioridade")
        - Ao clicar: abre dropdown com 4 opções — Baixa, Média, Alta, Urgente.
        - Ao escolher uma opção: badge de prioridade na tabela é atualizado
          (texto + classe CSS) e a escolha é salva em localStorage.
        - Clicar fora do dropdown ou escolher uma opção o fecha.
        - Ao recarregar a página, a prioridade salva é restaurada.
        - Se não houver nada salvo, a prioridade exibida no HTML é usada.
        - A opção atualmente ativa fica destacada no dropdown.

   REGRAS SEGUIDAS:
     - Nenhum código HTML, CSS ou JS existente foi removido.
     - O botão "Encaminhar para equipe" não foi alterado.
     - O wireframe e o layout permanecem intactos.
   ============================================================= */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Configuração
     ---------------------------------------------------------- */

  /** Chave de persistência no localStorage para esta ocorrência */
  const STORAGE_KEY = 'codetech:ocorrencia_1023';

  /** Mapeamento de prioridade → classe CSS do badge */
  const CLASSE_BADGE = {
    'Baixa':   'badge-baixa',
    'Média':   'badge-media',
    'Alta':    'badge-alta'
  };

  /* ----------------------------------------------------------
     Inicialização
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    restaurarEstadoLido();
    restaurarPrioridade();
    configurarBotaoMarcarLido();
    configurarDropdownPrioridade();
    configurarConfirmacoes();
  });

  /* =============================================================
     FUNCIONALIDADE 1 — Marcar como lido
     =============================================================
     Elementos usados:
       #btn-marcar-lido  → botão vermelho inferior
  */

  function configurarBotaoMarcarLido() {
    var btn = document.getElementById('btn-marcar-lido');
    if (!btn) return;
    btn.addEventListener('click', marcarComoLido);
  }

  function marcarComoLido() {
    var btn = document.getElementById('btn-marcar-lido');
    if (!btn || btn.disabled) return; // evita duplo acionamento

    /* Atualiza o visual do botão */
    btn.textContent = '✓ Lido';
    btn.classList.add('btn-mongodb-lido');
    btn.disabled = true;

    /* Persiste no localStorage */
    var estado = lerEstado();
    estado.lido = true;
    salvarEstado(estado);
  }

  /** Restaura o estado "lido" ao recarregar a página */
  function restaurarEstadoLido() {
    var estado = lerEstado();
    if (!estado.lido) return;

    var btn = document.getElementById('btn-marcar-lido');
    if (!btn) return;

    btn.textContent = '✓ Lido';
    btn.classList.add('btn-mongodb-lido');
    btn.disabled = true;
  }

  /* =============================================================
     FUNCIONALIDADE 2 — Mudar prioridade (dropdown)
     =============================================================
     Elementos usados:
       #btn-mudar-prioridade  → botão que abre/fecha o dropdown
       #priority-chevron      → ícone de seta que gira ao abrir
       #priority-dropdown     → container do dropdown
       #badge-prioridade      → badge na tabela de detalhes
       .priority-option       → cada opção dentro do dropdown
  */

  function configurarDropdownPrioridade() {
    var btn      = document.getElementById('btn-mudar-prioridade');
    var dropdown = document.getElementById('priority-dropdown');
    if (!btn || !dropdown) return;

    /* Abre / fecha o dropdown ao clicar no botão */
    btn.addEventListener('click', function (e) {
      e.stopPropagation(); // impede que o clique chegue ao document e feche imediatamente
      alternarDropdown();
    });

    /* Cada opção do dropdown aplica a prioridade escolhida */
    var opcoes = dropdown.querySelectorAll('.priority-option');
    opcoes.forEach(function (opcao) {
      opcao.addEventListener('click', function (e) {
        e.stopPropagation();
        var prioridade = opcao.getAttribute('data-prioridade');
        aplicarPrioridade(prioridade);
        fecharDropdown();
      });
    });

    /* Fechar o dropdown ao clicar em qualquer lugar fora dele */
    document.addEventListener('click', function () {
      fecharDropdown();
    });

    /* Fechar com tecla Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fecharDropdown();
    });

    /* Marca a opção ativa com base na prioridade atual ao carregar */
    marcarOpcaoAtiva(lerPrioridadeAtual());
  }

  /** Abre o dropdown se estiver fechado; fecha se estiver aberto */
  function alternarDropdown() {
    var dropdown = document.getElementById('priority-dropdown');
    var chevron  = document.getElementById('priority-chevron');
    if (!dropdown) return;

    var estaAberto = dropdown.classList.contains('open');

    if (estaAberto) {
      dropdown.classList.remove('open');
      if (chevron) {
        chevron.classList.remove('bi-chevron-down');
        chevron.classList.add('bi-chevron-up');
      }
    } else {
      dropdown.classList.add('open');
      if (chevron) {
        chevron.classList.remove('bi-chevron-up');
        chevron.classList.add('bi-chevron-down');
      }
    }
  }

  /** Fecha o dropdown (sem toggle) */
  function fecharDropdown() {
    var dropdown = document.getElementById('priority-dropdown');
    var chevron  = document.getElementById('priority-chevron');
    if (!dropdown) return;

    dropdown.classList.remove('open');
    if (chevron) {
      chevron.classList.remove('bi-chevron-down');
      chevron.classList.add('bi-chevron-up');
    }
  }

  /**
   * Aplica a prioridade escolhida:
   * - Atualiza o texto e a classe CSS do badge na tabela
   * - Salva a escolha no localStorage
   * - Atualiza a opção ativa no dropdown
   */
  function aplicarPrioridade(novaPrioridade) {
    var badge = document.getElementById('badge-prioridade');
    if (!badge) return;

    /* Remove todas as classes de prioridade e adiciona a nova */
    badge.classList.remove('badge-baixa', 'badge-media', 'badge-alta', 'badge-urgente');
    badge.textContent = novaPrioridade;

    var classeNova = CLASSE_BADGE[novaPrioridade];
    if (classeNova) badge.classList.add(classeNova);

    /* Persiste a escolha */
    var estado = lerEstado();
    estado.prioridade = novaPrioridade;
    salvarEstado(estado);

    /* Atualiza o indicador visual da opção ativa no dropdown */
    marcarOpcaoAtiva(novaPrioridade);
  }

  /** Destaca no dropdown a opção correspondente à prioridade atual */
  function marcarOpcaoAtiva(prioridade) {
    var opcoes = document.querySelectorAll('.priority-option');
    opcoes.forEach(function (opcao) {
      if (opcao.getAttribute('data-prioridade') === prioridade) {
        opcao.classList.add('active');
      } else {
        opcao.classList.remove('active');
      }
    });
  }

  /** Lê a prioridade atual exibida no badge (ou 'Baixa' como fallback) */
  function lerPrioridadeAtual() {
    var badge = document.getElementById('badge-prioridade');
    if (badge && badge.textContent.trim()) return badge.textContent.trim();
    return 'Baixa';
  }

  /** Restaura a prioridade salva no localStorage ao recarregar a página */
  function restaurarPrioridade() {
    var estado = lerEstado();
    if (!estado.prioridade) return;
    aplicarPrioridade(estado.prioridade);
  }

  /* =============================================================
     FUNCIONALIDADE 3 — Confirmar ocorrência (upvote)
     =============================================================
     Elementos usados:
       #btn-confirmar        → botão "Confirmar"
       #confirmacoes-count   → número exibido
  */

  function configurarConfirmacoes() {
    var btn   = document.getElementById('btn-confirmar');
    var count = document.getElementById('confirmacoes-count');
    if (!btn || !count) return;

    var estado = lerEstado();
    var total  = estado.confirmacoes !== undefined ? estado.confirmacoes : 3;
    count.textContent = total;

    if (estado.confirmado) {
      _marcarConfirmado(btn);
    }

    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      total += 1;
      count.textContent = total;
      var e = lerEstado();
      e.confirmacoes = total;
      e.confirmado   = true;
      salvarEstado(e);
      _marcarConfirmado(btn);
    });
  }

  function _marcarConfirmado(btn) {
    btn.disabled = true;
    btn.style.background     = 'var(--silver-teal)';
    btn.style.color          = 'var(--forest-black)';
    btn.style.borderColor    = 'var(--silver-teal)';
    btn.innerHTML            = '<i class="bi bi-hand-thumbs-up-fill"></i> Confirmado';
  }

  /* =============================================================
     Helpers — localStorage
     ============================================================= */

  /** Lê o objeto de estado persistido no localStorage */
  function lerEstado() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      console.error('[detalhes] Erro ao ler localStorage:', e);
      return {};
    }
  }

  /** Salva o objeto de estado no localStorage */
  function salvarEstado(estado) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch (e) {
      console.error('[detalhes] Erro ao salvar localStorage:', e);
    }
  }

})();
