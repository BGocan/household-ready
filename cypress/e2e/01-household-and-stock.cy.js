// Read this file first. Each test describes a user-visible outcome.
describe('Household setup and stock', () => {
  beforeEach(() => {
    // Each test starts from an empty browser storage state (testIsolation).
    cy.visit('/#overview');
  });

  it('shows two days of water when three people have 18 litres', () => {
    // ARRANGE: choose the household using the same controls as a visitor.
    cy.get('[data-page="settings"]').click();
    cy.get('[data-counter="people"][data-delta="1"]').click();
    cy.get('[data-counter="people"][data-delta="1"]').click();
    cy.get('[data-setting="people"]').should('have.value', '3');

    // ACT: record water. Start a new query after typing; the UI can re-render.
    cy.get('[data-page="supplies"]').click();
    cy.get('[data-quantity="water"]').clear().type('18');
    cy.get('[data-gap="water"]').should('contain.text', '9');
    cy.get('[data-page="overview"]').click();

    // ASSERT: verify what the visitor sees, not an internal function's result.
    cy.get('[data-cy="water-card"]').should('contain.text', '2.0');
    cy.get('[data-cy="water-card"] progress').should('have.attr', 'value', '2');
    cy.get('[data-cy="water-card"]').should('contain.text', '18 L stored');

    // Persistence is part of the user journey too.
    cy.reload();
    cy.get('[data-cy="water-card"]').should('contain.text', '18 L stored');
  });

  it('updates food progress from item quantities instead of a separate days field', () => {
    cy.get('[data-page="supplies"]').click();
    cy.get('[data-quantity="protein"]').clear().type('3');
    cy.get('[data-quantity="veg"]').clear().type('3');
    cy.get('[data-quantity="fruit"]').clear().type('1');
    cy.get('[data-quantity="carbs"]').clear().type('1');
    cy.get('[data-quantity="snacks"]').clear().type('2');
    cy.get('[data-page="overview"]').click();
    cy.get('[data-cy="food-card"] .metric').should('have.text', '100%');
  });

  it('keeps card and table quantities in sync and removes completed shopping gaps', () => {
    cy.get('[data-page="supplies"]').click();
    cy.get('[data-target="protein"]').clear().type('9');
    cy.get('[data-quantity="protein"]').clear().type('6');
    cy.get('[data-gap="protein"]').should('contain.text', '3');
    cy.get('[data-stock-view="table"]').click();
    cy.get('[data-quantity="protein"]').should('have.value', '6');
    cy.get('[data-quantity="protein"]').clear().type('9');
    cy.get('[data-gap="protein"]').should('contain.text', 'Met');
    cy.get('[data-action="shopping"]').click();
    cy.get('[data-stock-row="protein"]').should('not.exist');
    cy.get('[data-stock-row="water"]').should('exist');
  });

  it('makes supply controls usable at a mobile-sized viewport', () => {
    // Viewport testing is not a substitute for testing on a physical phone.
    cy.viewport(390, 844);
    cy.get('[data-page="supplies"]').click();
    cy.get('[data-quantity="water"]').should('be.visible').clear().type('9');
    cy.get('[data-gap="water"]').should('contain.text', 'Met');
    cy.document().then(doc => {
      expect(doc.documentElement.scrollWidth, 'page has no horizontal overflow')
        .to.be.at.most(doc.documentElement.clientWidth + 1);
    });
  });
});
