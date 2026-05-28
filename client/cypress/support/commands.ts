declare global {
  namespace Cypress {
    interface Chainable {
      loginByApi(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginByApi', (email, password) => {
  const apiBaseUrl = Cypress.env('apiBaseUrl');
  const finalEmail = email ?? Cypress.env('testUserEmail');
  const finalPassword = password ?? Cypress.env('testUserPassword');

  cy.request('POST', `${apiBaseUrl}/auth/login`, {
    email: finalEmail,
    password: finalPassword,
  }).then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body.accessToken).to.be.a('string');
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', res.body.accessToken);
      if (res.body.refreshToken) {
        win.localStorage.setItem('refreshToken', res.body.refreshToken);
      }
    });
  });
});

export {};
