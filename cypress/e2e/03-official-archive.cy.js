describe('Official archive and network failures', () => {
  beforeEach(() => cy.visit('/#updates'));

  it('retains saved guidance and its timestamp when a later download fails', () => {
    // Control the server response: this test never relies on live GOV.UK pages.
    cy.intercept('GET', '/data/updates.json', {
      fixture: 'official-archive.json',
    }).as('archiveDownload');
    cy.get('[data-action="refresh"]').first().click();
    cy.wait('@archiveDownload').its('response.statusCode').should('eq', 200);
    cy.contains('h2', '1 sources saved').should('be.visible');
    cy.contains('h2', 'Test fixture: household guidance').should('be.visible');

    cy.get('.vault-status p').invoke('text').then(savedTimestamp => {
      // A second intercept replaces the first one for subsequent requests.
      cy.intercept('GET', '/data/updates.json', {
        forceNetworkError: true,
      }).as('failedDownload');
      cy.get('[data-action="refresh"]').first().click();
      cy.wait('@failedDownload');
      cy.get('#toast').should('contain.text', 'previously saved guidance is still available');
      cy.get('.vault-status p').should('have.text', savedTimestamp);
      cy.contains('h2', 'Test fixture: household guidance').should('be.visible');
      cy.reload();
      cy.contains('h2', 'Test fixture: household guidance').should('be.visible');
    });
  });

  it('keeps the last valid archive when a new response has an invalid schema', () => {
    cy.intercept('GET', '/data/updates.json', {
      fixture: 'official-archive.json',
    }).as('validArchive');
    cy.get('[data-action="refresh"]').first().click();
    cy.wait('@validArchive');
    cy.contains('h2', 'Test fixture: household guidance').should('be.visible');
    cy.intercept('GET', '/data/updates.json', {
      statusCode: 200, body: { schemaVersion: 999, sources: [] },
    }).as('invalidArchive');
    cy.get('[data-action="refresh"]').first().click();
    cy.wait('@invalidArchive');
    cy.get('#toast').should('contain.text', 'Could not download updates');
    cy.contains('h2', 'Test fixture: household guidance').should('be.visible');
  });
});
