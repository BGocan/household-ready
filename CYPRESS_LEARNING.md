# Learn Cypress with Household Ready

You already know the QA work: choose a risk, prepare test data, act as a user and check the outcome. Cypress lets you express that sequence as code and replay it in a real browser.

## 1. Run the app and watch one test

On your Windows computer, install Node.js 24 LTS and Git if needed. Open a terminal in the folder where you keep projects:

```powershell
git clone https://github.com/BGocan/household-ready.git
cd household-ready
npm ci
npm run test:e2e:open
```

If you already cloned this repository, use `git pull` in it instead of cloning again. Keep the working tree clean or commit your own edits first.

`npm ci` installs the exact dependency versions from `package-lock.json`, including Cypress and its browser runner. It can take a while on the first run. If a managed computer blocks the executable download, use an approved machine or ask your IT team; do not disable security protections.

The `test:e2e:open` script starts our app on port 4174, waits for it to respond, then opens Cypress. Choose E2E Testing and a supported browser if prompted. Open `01-household-and-stock.cy.js`. Watch the first test and use the command log to inspect its steps. Close the Cypress application when finished; the script stops the test server.

For a run without the interactive window:

```powershell
npm run test:e2e
```

To run just the first spec:

```powershell
npm run test:e2e -- --spec cypress/e2e/01-household-and-stock.cy.js
```

To run with an installed Chrome browser:

```powershell
npm run test:e2e -- --browser chrome
```

These commands target a local copy. Your real household data on Vercel is not used. No Cypress Cloud account, recording key or AI subscription is required for this setup.

## 2. Translate your manual test into code

**Risk:** a user records water but the dashboard displays the wrong number of days.

**Given:** three people and the default three-day plan.

**When:** the user records 18 litres of drinking water.

**Then:** the dashboard shows two days, and retains the quantity after reload.

Here is the core journey, with fewer comments than the actual spec:

```javascript
it('shows two days of water for three people with 18 litres', () => {
  cy.visit('/#overview');
  cy.get('[data-page="settings"]').click();
  cy.get('[data-counter="people"][data-delta="1"]').click();
  cy.get('[data-counter="people"][data-delta="1"]').click();

  cy.get('[data-page="supplies"]').click();
  cy.get('[data-quantity="water"]').clear().type('18');
  cy.get('[data-page="overview"]').click();

  cy.get('[data-cy="water-card"]').should('contain.text', '2.0');
  cy.get('[data-cy="water-card"] progress')
    .should('have.attr', 'value', '2');
});
```

### What each part means

| Code | Meaning in your QA work |
| --- | --- |
| `describe('...', () => { ... })` | Groups related tests, like a test-suite folder. |
| `it('...', () => { ... })` | One test case with a clear expected outcome. |
| `beforeEach(() => { ... })` | Shared setup that runs before every test in that group. |
| `cy.visit('/#overview')` | Open the page relative to the configured local base URL. |
| `cy.get('[data-quantity="water"]')` | Find an element using its HTML attribute. |
| `.clear().type('18')` | Replace its current value with test input. |
| `.click()` | Act on the element Cypress found. |
| `.should('contain.text', '2.0')` | Assert that the user-visible result includes this text. |
| `.should('have.value', '3')` | Check an input's value, rather than its text content. |

A selector is simply how the test identifies the control. `[data-quantity="water"]` means “the element whose `data-quantity` attribute is `water`”. Dedicated attributes survive visual restyling better than selectors such as `.card:nth-child(3)`.

The `data-cy` attributes on the water and food cards exist specifically as stable test hooks. Other tests reuse existing `data-*` control identifiers. We check visible text when the wording itself is part of the requirement.

## 3. Understand the Cypress command queue

Cypress queues commands and runs them in sequence. Its commands are not ordinary promises to `await`.

```javascript
// Avoid this: .get() returns a Cypress chain, not the element's value.
const people = cy.get('[data-setting="people"]');
// expect(people).to.equal('3'); // Wrong kind of object.

// Prefer an assertion Cypress can retry.
cy.get('[data-setting="people"]').should('have.value', '3');
```

Queries and assertions retry until they pass or time out. Actions such as clicking and typing are performed once when the element is actionable. This is why we usually do not need `cy.wait(2000)`.

A `.then()` callback is useful when you need a value, such as text or a downloaded JSON object. Its ordinary assertions do not automatically retry like a query followed by `.should()`.

When our application re-renders, it replaces elements. Start a fresh `cy.get(...)` after an action that changes the page. Do not keep using an old element reference.

## 4. Your first exercise

Spend about 20 minutes on this before reading the worked solution.

1. Copy `training/lesson-01-starter.js` to `cypress/e2e/practice.cy.js`.
2. Complete its six steps.
3. Run only your practice spec:

```powershell
npm run test:e2e -- --spec cypress/e2e/practice.cy.js
```

4. Deliberately change the expected coverage from `2.0` to `3.0`. Read the failure message. It should tell you the expected text was not found.
5. Restore the correct assertion.
6. Extend your test: reload the dashboard and check it still shows `18 L stored`.

**Worked solution:** the first test in [01-household-and-stock.cy.js](cypress/e2e/01-household-and-stock.cy.js). It includes the persistence check. Try your version first.

Do not leave the intentionally wrong assertion committed. A test without an assertion is also not a completed exercise.

## 5. Connect UI testing to your API experience

Our archive is a JSON file request, rather than an authenticated API. The same HTTP testing ideas apply.

```javascript
cy.intercept('GET', '/data/updates.json', {
  fixture: 'official-archive.json',
}).as('archiveDownload');

cy.get('[data-action="refresh"]').first().click();
cy.wait('@archiveDownload').its('response.statusCode').should('eq', 200);
cy.contains('h2', 'Test fixture: household guidance').should('be.visible');
```

- `intercept` controls the app's network response.
- A **fixture** is a saved example response. Ours is explicitly synthetic, not real emergency advice.
- `.as(...)` names the intercepted request.
- `wait('@archiveDownload')` waits for that request, rather than guessing how long it might take.
- The final UI assertion checks that the app actually used the response.

The next test simulates a failed download and checks that the old guidance and timestamp remain. `cy.request()` would make a request directly from the test; it would not by itself prove that clicking the app's button produces the right UI behaviour.

This network-failure test is not the same as switching the entire browser offline or proving the service worker works.

## 6. Read failures like a QA investigation

1. Read the test name: what behaviour was being checked?
2. Find the first failing command, not just the final error summary.
3. Inspect its screenshot and the command log.
4. Ask whether the product is wrong, the expected result is wrong, or the test could not find its intended control.
5. Fix the cause, then run the relevant spec again.

Common examples:

| Failure | First thing to investigate |
| --- | --- |
| “Expected to find element” | Is the correct section open? Did the selector change? |
| Element detached from DOM | Did the app re-render? Query the control again. |
| Water days wrong | Household size, stock entered and actual displayed result. |
| A test passes only after another test | Hidden shared state. Tests must prepare their own inputs. |
| Request alias times out | Was `intercept` registered before the button click? Is the URL right? |
| File download not found | Did export run? Is the filename/download directory correct? |

Do not “fix” a failure by adding arbitrary sleeps, suppressing exceptions or using `{ force: true }` on ordinary buttons. Our backup tests use `force: true` only for the intentionally hidden native file input.

## 7. What is covered, and what is not

| Spec | Journeys |
| --- | --- |
| `01-household-and-stock.cy.js` | Water coverage/persistence; food regression; card/table sync and shopping gaps; mobile-sized supply controls. |
| `02-plan-companion-backups.cy.js` | Plan navigation/persistence; confirmation before inventory updates; real export/restore; invalid-backup rejection. |
| `03-official-archive.cy.js` | Fixture download; failed download retention; invalid-schema retention. |

Unit tests remain in `tests/` and run with `npm test`. They check calculations directly. Cypress checks browser journeys through the actual app. GitHub Actions runs both on pushes and pull requests.

These tests do not constitute a full accessibility audit, real-device testing, full offline/service-worker testing or complete cross-browser coverage. They do not test a live AI model: the companion is still a structured offline guide. Screenshots are captured on browser-test failures; video and Cypress Cloud recording are off.

## 8. A short learning path

1. Understand and edit the water test.
2. Write a test that a target of 9 tins and current stock of 6 shows a shortage of 3.
3. Add a reload check to that inventory test.
4. Explain the archive fixture and network-failure test in your own words.
5. Write a cancellation test: cancelling a companion proposal must leave stock unchanged.
6. Add keyboard-navigation and accessibility checks as a separate next step.

Keep the code small enough that you can explain each line in an interview.

## Official references

- [Introduction and command queue](https://docs.cypress.io/app/core-concepts/introduction-to-cypress)
- [Retry-ability](https://docs.cypress.io/app/core-concepts/retry-ability)
- [Selectors and best practices](https://docs.cypress.io/app/core-concepts/best-practices)
- [Test isolation](https://docs.cypress.io/app/core-concepts/test-isolation)
- [Selecting files](https://docs.cypress.io/api/commands/selectfile)
- [Continuous integration](https://docs.cypress.io/app/continuous-integration/overview)
