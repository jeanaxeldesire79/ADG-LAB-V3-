(function initPortalAuth(win) {
  'use strict';

  var settings = win.KEYCLOAK_SETTINGS || {};

  function assertConfig() {
    if (!settings.url || !settings.realm || !settings.clients) {
      throw new Error('Missing KEYCLOAK_SETTINGS. Please review logins/keycloak-settings.js.');
    }
  }

  function normalizeBase(url) {
    return url.replace(/\/$/, '');
  }

  function toAbsolute(pathname) {
    try {
      return new URL(pathname, win.location.origin).href;
    } catch (err) {
      return pathname;
    }
  }

  function getClientConfig(target) {
    var cfg = (settings.clients || {})[target];
    if (!cfg) {
      throw new Error('Unknown Keycloak client target: ' + target);
    }
    return cfg;
  }

  function buildRedirectUri(target) {
    return toAbsolute(getClientConfig(target).redirectPath);
  }

  function createClient(target, overrideUrl) {
    assertConfig();
    var cfg = getClientConfig(target);
    var client = new Keycloak({
      url: normalizeBase(overrideUrl || settings.url || (window.location && window.location.origin) || ''),
      realm: settings.realm,
      clientId: cfg.clientId,
    });
    client.__portalTarget = target;
    return client;
  }

  function ensureRefresh(client) {
    var refreshTimer = setInterval(function refreshLoop() {
      client.updateToken(60).catch(function handleExpired() {
        clearInterval(refreshTimer);
        client.login({ redirectUri: buildRedirectUri(client.__portalTarget) });
      });
    }, 20000);
  }

  function hasRole(client, role) {
    var token = client.tokenParsed || {};
    var realmRoles = (token.realm_access && token.realm_access.roles) || [];
    if (realmRoles.indexOf(role) !== -1) {
      return true;
    }
    var resourceAccess = token.resource_access || {};
    var clientId = getClientConfig(client.__portalTarget || 'user').clientId;
    var clientRoles = (resourceAccess[clientId] && resourceAccess[clientId].roles) || [];
    return clientRoles.indexOf(role) !== -1;
  }

  function initWithOptions(client, opts) {
    return client.init(opts);
  }

  function initPortal(target, requiredRoles, hooks) {
    var primaryBase = settings.url;
    var client = createClient(target, primaryBase);

    // Prefer PKCE when supported, but gracefully fall back if the server/client
    // is not configured for PKCE based on the user's current setup.
    var preferred = {
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      redirectUri: buildRedirectUri(target),
    };
    var fallback = {
      onLoad: 'login-required',
      checkLoginIframe: false,
      redirectUri: buildRedirectUri(target),
    };

    function continueAuth() {
      ensureRefresh(client);
      var authorized = true;
      if (requiredRoles && requiredRoles.length) {
        authorized = requiredRoles.some(function verifyRole(role) {
          return hasRole(client, role);
        });
      }
      if (!authorized) {
        if (hooks && typeof hooks.onUnauthorized === 'function') {
          hooks.onUnauthorized(client);
        } else {
          alert('You are signed in but lack the required role.');
          logout(client);
        }
        return { client: client, authorized: false };
      }
      if (hooks && typeof hooks.onReady === 'function') {
        hooks.onReady(client);
      }
      return { client: client, authorized: true };
    }

    return initWithOptions(client, preferred)
      .then(continueAuth)
      .catch(function tryFallback(err) {
        console.warn('Keycloak init with PKCE failed, retrying without PKCE...', err && err.message ? err.message : err);
        return initWithOptions(client, fallback).then(continueAuth);
      })
      .catch(function initError(error) {
        console.error('Keycloak initialization failed (no PKCE and PKCE)', error);
        if (hooks && typeof hooks.onError === 'function') {
          hooks.onError(error);
        }
        throw error;
      });
  }

  function login(target) {
    var client = createClient(target);
    client.login({ redirectUri: buildRedirectUri(target) });
  }

  function logout(clientOrTarget) {
    if (clientOrTarget && typeof clientOrTarget.logout === 'function') {
      clientOrTarget.logout({ redirectUri: toAbsolute('/logins/index.html') });
      return;
    }
    var target = typeof clientOrTarget === 'string' ? clientOrTarget : 'user';
    var client = createClient(target);
    client.logout({ redirectUri: toAbsolute('/logins/index.html') });
  }

  win.PortalAuth = {
    initPortal: initPortal,
    login: login,
    logout: logout,
    createClient: createClient,
    hasRole: hasRole,
    buildRedirectUri: buildRedirectUri,
  };
})(window);
