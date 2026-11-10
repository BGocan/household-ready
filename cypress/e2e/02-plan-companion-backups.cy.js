describe('Household plan, companion and backups', () => {
  beforeEach(() => cy.visit('/#overview'));

  it('saves a plan answer while moving between topics and after reloading', () => {
    cy.get('[data-page="plan"]').click();
    cy.get('[data-plan-step="0"]').first().click();
    cy.get('[data-plan="contacts"]').type('Synthetic test contact, not a real person.');
    cy.contains('button', 'Next topic').click();
    cy.contains('button', 'Back').click();
    cy.get('[data-plan="contacts"]').should('have.value', 'Synthetic test contact, not a real person.');
    cy.reload();
    cy.get('#plan-preview-contacts').should('contain.text', 'Synthetic test contact');
  });

  it('requires confirmation before a companion proposal changes the inventory', () => {
    cy.get('[data-page="assistant"]').click();
    cy.get('#guide-question').type('I bought 6 bottles of 2 litres');
    cy.get('#guide-form').submit();
    cy.get('[data-action="confirm-stock"]').should('be.visible');
    cy.get('[data-page="supplies"]').click();
    cy.get('[data-quantity="water"]').should('have.value', '0');
    cy.get('[data-page="assistant"]').click();
    cy.get('[data-action="confirm-stock"]').click();
    cy.get('[role="log"]').should('contain.text', 'Saved. Drinking water is now 12 litres.');
    cy.get('[data-page="supplies"]').click();
    cy.get('[data-quantity="water"]').should('have.value', '12');
  });

  it('exports a real backup and restores its settings, supplies and notes', () => {
    cy.get('[data-page="supplies"]').click();
    cy.get('[data-quantity="water"]').clear().type('18');
    cy.get('[data-target="protein"]').clear().type('9');
    cy.get('[data-page="plan"]').click();
    cy.get('[data-plan-step="1"]').first().click();
    cy.get('[data-plan="meeting"]').type('Synthetic test meeting point.');
    cy.get('[data-page="settings"]').click();
    cy.get('[data-counter="people"][data-delta="1"]').click();
    cy.get('[data-action="export"]').click();

    // readFile retries until the browser has actually written the download.
    const backupPath = `${Cypress.config('downloadsFolder')}/household-ready-backup.json`;
    cy.readFile(backupPath).then(backup => {
      expect(backup.people).to.equal(2);
      expect(backup.quantities.water).to.equal(18);
      expect(backup.plan.meeting).to.equal('Synthetic test meeting point.');
      cy.clearLocalStorage();
      cy.reload();
      cy.get('[data-setting="people"]').should('have.value', '1');
      cy.on('window:confirm', () => true);
      // The native file input is intentionally hidden behind a styled button.
      cy.get('#import-file').selectFile(backupPath, { force: true });
      cy.get('[data-setting="people"]').should('have.value', '2');
      cy.get('[data-page="supplies"]').click();
      cy.get('[data-quantity="water"]').should('have.value', '18');
      cy.get('[data-target="protein"]').should('have.value', '9');
      cy.get('[data-page="plan"]').click();
      cy.get('#plan-preview-meeting').should('contain.text', 'Synthetic test meeting point.');
    });
  });

  it('rejects an invalid backup without overwriting existing stock', () => {
    cy.get('[data-page="supplies"]').click();
    cy.get('[data-quantity="water"]').clear().type('9');
    cy.get('#import-file').selectFile({
      contents: Cypress.Buffer.from('{"version":999}'),
      fileName: 'invalid-backup.json',
      mimeType: 'application/json',
    }, { force: true });
    cy.get('#toast').should('contain.text', 'not a supported household backup');
    cy.get('[data-quantity="water"]').should('have.value', '9');
  });
});
