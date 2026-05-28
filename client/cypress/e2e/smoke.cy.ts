describe('Smoke E2E — stack full-stack', () => {
  it('home page risponde con 200 e titolo PWA', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  it('healthcheck Redis del backend risponde 200', () => {
    cy.request(`${Cypress.env('apiBaseUrl')}/health/redis`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.status).to.eq('ok');
    });
  });

  it('login con utente seedato → accessToken in localStorage', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(Cypress.env('testUserEmail'));
    cy.get('input[type="password"]').type(Cypress.env('testUserPassword'));
    cy.get('button[type="submit"]').click();

    cy.location('pathname', { timeout: 15000 }).should('not.eq', '/login');
    cy.window().its('localStorage.accessToken').should('be.a', 'string');
  });

  it('login via API helper imposta token correttamente', () => {
    cy.visit('/');
    cy.loginByApi();
    cy.window().its('localStorage.accessToken').should('be.a', 'string');
  });
});
