// Practice file, not part of CI. Copy it into cypress/e2e/practice.cy.js.
// Goal: 18 litres should cover three people for two days.
describe('My first Household Ready test', () => {
  it('shows the right drinking-water coverage', () => {
    cy.visit('/#overview');
    // 1. Open household settings using [data-page="settings"].
    // 2. Click the people + button twice.
    //    Selector: [data-counter="people"][data-delta="1"]
    // 3. Open supplies using [data-page="supplies"].
    // 4. Record 18 using [data-quantity="water"].
    // 5. Return using [data-page="overview"].
    // 6. Assert the water card contains 2.0 days.
    //    Selector: [data-cy="water-card"]
    // Add a meaningful assertion before treating this test as complete.
  });
});
