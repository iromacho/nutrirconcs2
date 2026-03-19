(function () {
  'use strict';

  // Sistema reutilizable de puntuación, récord, tiempo jugado y leaderboard.
  // Se activa automáticamente en cualquier página que tenga el atributo: data-score-system

  const STORAGE_KEYS = {
    playerName: 'nc2PlayerName',
    leaderboard: 'nc2LeaderboardV2',
    sessions: 'nc2PlaySessionsV2'
  };

  const COOKIE_KEYS = {
    playerName: 'nc2_player_name'
  };

  const DEFAULTS = {
    gameId: 'global',
    scoreKeyPrefix: 'nc2Score',
    highScoreKeyPrefix: 'nc2HighScore',
    leaderboardLimit: 10,
    promptForName: true,
    tickMs: 60000,
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

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const prefix = `${name}=`;
    const found = document.cookie
      .split(';')
      .map(function (part) { return part.trim(); })
      .find(function (part) { return part.indexOf(prefix) === 0; });
    return found ? decodeURIComponent(found.slice(prefix.length)) : '';
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
    return localStorage.getItem(STORAGE_KEYS.playerName) || getCookie(COOKIE_KEYS.playerName) || '';
  }

  function savePlayerName(name) {
    const cleanName = String(name || '').trim();
    if (cleanName) {
      localStorage.setItem(STORAGE_KEYS.playerName, cleanName);
      setCookie(COOKIE_KEYS.playerName, cleanName, 365);
    }
    return cleanName;
  }

  function registerKnownUsers() {
    const store = getLeaderboardStore();
    const users = safeParse(localStorage.getItem('users'), []);

    users.forEach(function (user) {
      if (!user || !user.username) return;
      if (!store.players[user.username]) {
        store.players[user.username] = {
          name: user.username,
          email: user.email || '',
          totalSeconds: 0,
          source: 'login'
        };
      }
    });

    saveLeaderboardStore(store);
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
    registerKnownUsers();
    const store = getLeaderboardStore();
    return Object.values(store.players || {})
      .sort(function (a, b) {
        return clampNumber(b.totalSeconds) - clampNumber(a.totalSeconds);
      })
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

    registerKnownUsers();

    const state = {
      playerName: ensurePlayerName(options.promptForName),
      score: clampNumber(localStorage.getItem(storageKeys.score)),
      highScore: clampNumber(localStorage.getItem(storageKeys.highScore)),
      totalSeconds: 0,
      sessionStartedAt: Date.now(),
      timerId: null,
      lastRenderedMinute: -1
    };

    function persistScore() {
      localStorage.setItem(storageKeys.score, String(state.score));
      localStorage.setItem(storageKeys.highScore, String(state.highScore));
    }

    function getPlayerEntry() {
      const leaderboard = getLeaderboardStore();
      const currentUser = safeParse(localStorage.getItem('currentUser'), null);
      const existing = leaderboard.players[state.playerName] || {
        name: state.playerName,
        email: currentUser && currentUser.email ? currentUser.email : '',
        totalSeconds: 0,
        source: currentUser ? 'login' : 'cookie'
      };

      existing.name = state.playerName;
      if (currentUser && currentUser.email) {
        existing.email = currentUser.email;
        existing.source = 'login';
      }

      leaderboard.players[state.playerName] = existing;
      return { leaderboard: leaderboard, playerEntry: existing };
    }

    function updatePlayerTime(forceSave) {
      if (!state.playerName) return false;

      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - state.sessionStartedAt) / 1000));
      const reachedFullMinute = elapsedSeconds >= 60;

      if (!forceSave && !reachedFullMinute) {
        return false;
      }

      if (!elapsedSeconds) {
        return false;
      }

      const result = getPlayerEntry();
      result.playerEntry.totalSeconds = clampNumber(result.playerEntry.totalSeconds) + elapsedSeconds;
      saveLeaderboardStore(result.leaderboard);

      const sessions = getSessionStore();
      sessions[options.gameId] = {
        playerName: state.playerName,
        lastSavedAt: now,
        lastElapsedSeconds: elapsedSeconds
      };
      saveSessionStore(sessions);

      state.totalSeconds = result.playerEntry.totalSeconds;
      state.sessionStartedAt = now;
      return true;
    }

    function syncTimeFromStorage() {
      if (!state.playerName) {
        state.totalSeconds = 0;
        return;
      }

      registerKnownUsers();
      const leaderboard = getLeaderboardStore();
      const playerEntry = leaderboard.players[state.playerName] || { totalSeconds: 0 };
      state.totalSeconds = clampNumber(playerEntry.totalSeconds);
    }

    function render(force) {
      const currentMinute = Math.floor(state.totalSeconds / 60);
      if (!force && currentMinute === state.lastRenderedMinute && !elements.scoreCurrent && !elements.scoreHigh) {
        return;
      }

      if (elements.scoreCurrent) elements.scoreCurrent.textContent = String(state.score);
      if (elements.scoreHigh) elements.scoreHigh.textContent = String(state.highScore);
      if (elements.timeCurrent) elements.timeCurrent.textContent = formatDuration(state.totalSeconds);
      if (elements.playerName) elements.playerName.textContent = state.playerName || 'Invitado';
      renderLeaderboard(elements, options.leaderboardLimit);
      state.lastRenderedMinute = currentMinute;
    }

    // API pública reutilizable: suma puntos y actualiza el récord si corresponde.
    function addScore(points) {
      state.score += clampNumber(points);
      if (state.score > state.highScore) {
        state.highScore = state.score;
      }
      persistScore();
      render(true);
      return state.score;
    }

    // API pública reutilizable: reinicia la puntuación actual sin borrar el high score.
    function resetScore() {
      state.score = 0;
      persistScore();
      render(true);
      return state.score;
    }

    function setPlayerName(name) {
      const cleanName = savePlayerName(name);
      if (!cleanName) return state.playerName;

      state.playerName = cleanName;
      syncTimeFromStorage();
      render(true);
      return state.playerName;
    }

    // El tiempo jugado se persiste en localStorage y se refresca visualmente por minuto.
    function tick() {
      const changed = updatePlayerTime(false);
      if (changed) {
        syncTimeFromStorage();
        render(true);
      }
    }

    function start() {
      syncTimeFromStorage();
      state.sessionStartedAt = Date.now();
      render(true);
      if (!state.timerId) {
        state.timerId = window.setInterval(tick, options.tickMs);
      }
    }

    function stop() {
      const changed = updatePlayerTime(true);
      if (changed) {
        syncTimeFromStorage();
      }
      render(true);
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
