(function () {
  'use strict';

  // Sistema reutilizable de puntuación, récord, tiempo jugado y leaderboard.
  // Se activa automáticamente en cualquier página que tenga el atributo: data-score-system

  const STORAGE_KEYS = {
    playerName: 'nc2PlayerName',
    leaderboard: 'nc2LeaderboardV1',
    sessions: 'nc2PlaySessionsV1'
  };

  const DEFAULTS = {
    gameId: 'global',
    scoreKeyPrefix: 'nc2Score',
    highScoreKeyPrefix: 'nc2HighScore',
    leaderboardLimit: 5,
    promptForName: true,
    tickMs: 1000,
    autoRender: true
  };

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function clampNumber(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  // Convierte segundos acumulados al formato solicitado: Xh Ym.
  function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.floor(clampNumber(totalSeconds)));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  function createStorageKey(prefix, gameId) {
    return `${prefix}:${gameId}`;
  }

  function getSavedPlayerName() {
    return localStorage.getItem(STORAGE_KEYS.playerName) || '';
  }

  function savePlayerName(name) {
    const cleanName = String(name || '').trim();
    if (cleanName) {
      localStorage.setItem(STORAGE_KEYS.playerName, cleanName);
    }
    return cleanName;
  }

  function ensurePlayerName(shouldPrompt) {
    const currentUser = safeParse(localStorage.getItem('currentUser'), null);

    if (currentUser && currentUser.username) {
      return savePlayerName(currentUser.username);
    }

    const existingName = getSavedPlayerName();
    if (existingName || !shouldPrompt) {
      return existingName;
    }

    const promptedName = window.prompt('Introduce tu nombre para guardar tu tiempo jugado:', existingName || 'Jugador');
    return savePlayerName(promptedName || 'Jugador');
  }

  function getLeaderboardStore() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.leaderboard), { players: {} });
  }

  function saveLeaderboardStore(store) {
    localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(store));
  }

  function getSessionStore() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.sessions), {});
  }

  function saveSessionStore(store) {
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(store));
  }

  function getSortedLeaderboard(limit) {
    const store = getLeaderboardStore();
    return Object.values(store.players || {})
      .sort((a, b) => clampNumber(b.totalSeconds) - clampNumber(a.totalSeconds))
      .slice(0, limit);
  }

  function createDefaultElements() {
    return {
      scoreCurrent: document.querySelector('[data-score-current]'),
      scoreHigh: document.querySelector('[data-score-high]'),
      timeCurrent: document.querySelector('[data-playtime-current]'),
      playerName: document.querySelector('[data-player-name]'),
      leaderboardList: document.querySelector('[data-leaderboard-list]'),
      leaderboardEmpty: document.querySelector('[data-leaderboard-empty]'),
      leaderboardPanel: document.querySelector('[data-leaderboard-panel]')
    };
  }

  function renderLeaderboard(elements, limit) {
    if (!elements.leaderboardList) return;

    const entries = getSortedLeaderboard(limit);
    elements.leaderboardList.innerHTML = '';

    if (!entries.length) {
      if (elements.leaderboardEmpty) {
        elements.leaderboardEmpty.hidden = false;
      }
      return;
    }

    if (elements.leaderboardEmpty) {
      elements.leaderboardEmpty.hidden = true;
    }

    entries.forEach(function (entry, index) {
      const item = document.createElement('li');
      item.className = 'score-leaderboard-item';
      item.innerHTML = `
        <span class="score-rank">#${index + 1}</span>
        <span class="score-player">${entry.name}</span>
        <span class="score-hours">${formatDuration(entry.totalSeconds)}</span>
      `;
      elements.leaderboardList.appendChild(item);
    });

    if (elements.leaderboardPanel) {
      elements.leaderboardPanel.classList.remove('score-animate');
      void elements.leaderboardPanel.offsetWidth;
      elements.leaderboardPanel.classList.add('score-animate');
    }
  }

  // Crea una instancia aislada por juego/página sin interferir con el código existente.
  function createSystem(customOptions) {
    const options = Object.assign({}, DEFAULTS, customOptions || {});
    const elements = Object.assign(createDefaultElements(), options.elements || {});

    const storageKeys = {
      score: createStorageKey(options.scoreKeyPrefix, options.gameId),
      highScore: createStorageKey(options.highScoreKeyPrefix, options.gameId)
    };

    const state = {
      playerName: ensurePlayerName(options.promptForName),
      score: clampNumber(localStorage.getItem(storageKeys.score)),
      highScore: clampNumber(localStorage.getItem(storageKeys.highScore)),
      totalSeconds: 0,
      sessionStartedAt: Date.now(),
      timerId: null
    };

    function persistScore() {
      localStorage.setItem(storageKeys.score, String(state.score));
      localStorage.setItem(storageKeys.highScore, String(state.highScore));
    }

    function updatePlayerTime(flushOnly) {
      if (!state.playerName) return;

      const sessions = getSessionStore();
      const lastSavedAt = clampNumber(sessions[options.gameId]);
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - (lastSavedAt || state.sessionStartedAt)) / 1000));

      if (!elapsedSeconds && flushOnly) {
        return;
      }

      const leaderboard = getLeaderboardStore();
      const playerEntry = leaderboard.players[state.playerName] || { name: state.playerName, totalSeconds: 0 };

      playerEntry.name = state.playerName;
      playerEntry.totalSeconds = clampNumber(playerEntry.totalSeconds) + elapsedSeconds;
      leaderboard.players[state.playerName] = playerEntry;
      saveLeaderboardStore(leaderboard);

      sessions[options.gameId] = now;
      saveSessionStore(sessions);

      state.totalSeconds = playerEntry.totalSeconds;
    }

    function syncTimeFromStorage() {
      const leaderboard = getLeaderboardStore();
      const playerEntry = leaderboard.players[state.playerName] || { totalSeconds: 0 };
      state.totalSeconds = clampNumber(playerEntry.totalSeconds);
    }

    function render() {
      if (elements.scoreCurrent) elements.scoreCurrent.textContent = String(state.score);
      if (elements.scoreHigh) elements.scoreHigh.textContent = String(state.highScore);
      if (elements.timeCurrent) elements.timeCurrent.textContent = formatDuration(state.totalSeconds);
      if (elements.playerName) elements.playerName.textContent = state.playerName || 'Invitado';
      renderLeaderboard(elements, options.leaderboardLimit);
    }

    // API pública reutilizable: suma puntos y actualiza el récord si corresponde.
    function addScore(points) {
      state.score += clampNumber(points);
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
      persistScore();
      render();
      return state.score;
    }

    // API pública reutilizable: reinicia la puntuación actual sin borrar el high score.
    function resetScore() {
      state.score = 0;
      persistScore();
      render();
      return state.score;
    }

    function setPlayerName(name) {
      const cleanName = savePlayerName(name);
      if (!cleanName) return state.playerName;

      state.playerName = cleanName;
      syncTimeFromStorage();
      render();
      return state.playerName;
    }

    // El tiempo jugado se persiste en localStorage para sobrevivir recargas.
    function tick() {
      updatePlayerTime(false);
      render();
    }

    function start() {
      syncTimeFromStorage();
      const sessions = getSessionStore();
      sessions[options.gameId] = Date.now();
      saveSessionStore(sessions);
      render();
      if (!state.timerId) {
        state.timerId = window.setInterval(tick, options.tickMs);
      }
    }

    function stop() {
      updatePlayerTime(true);
      render();
      if (state.timerId) {
        window.clearInterval(state.timerId);
        state.timerId = null;
      }
    }

    const api = {
      addScore: addScore,
      resetScore: resetScore,
      setPlayerName: setPlayerName,
      getState: function () {
        return Object.assign({}, state, { formattedTime: formatDuration(state.totalSeconds) });
      },
      render: render,
      start: start,
      stop: stop,
      formatDuration: formatDuration
    };

    start();

    window.addEventListener('beforeunload', stop);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    return api;
  }

  window.GameScoreSystem = {
    create: createSystem,
    formatDuration: formatDuration,
    getLeaderboard: getSortedLeaderboard
  };

  document.addEventListener('DOMContentLoaded', function () {
    const autoRoot = document.querySelector('[data-score-system]');
    if (!autoRoot) return;

    const system = createSystem({
      gameId: autoRoot.getAttribute('data-game-id') || window.location.pathname,
      leaderboardLimit: clampNumber(autoRoot.getAttribute('data-leaderboard-limit')) || DEFAULTS.leaderboardLimit,
      promptForName: autoRoot.getAttribute('data-prompt-name') !== 'false'
    });

    window.gameScoreSystem = system;
    window.addScore = system.addScore;
    window.resetScore = system.resetScore;
  });
})();
