(function bootstrapKeycloakSettings(win) {
  if (win.KEYCLOAK_SETTINGS) {
    return;
  }

  win.KEYCLOAK_SETTINGS = {
    // Frontend points to the Keycloak issuer host
    url: 'https://auth.axeldevlab.com/',
    realm: 'axel-dev-lab',
    clients: {
      user: {
        clientId: 'user-portal',
        redirectPath: '/logins/user-portal.html',
      },
      admin: {
        clientId: 'admin-portal',
        redirectPath: '/logins/admin-portal.html',
      },
      partner: {
        clientId: 'partner-portal',
        redirectPath: '/logins/partner-portal.html',
      },
    },
    demo: {
      adminUsername: 'admin',
      adminPassword: 'admin',
    },
  };
})(window);
