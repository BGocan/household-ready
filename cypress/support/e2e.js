// Test isolation clears cookies and browser storage between tests.
// Service-worker caches are different: keep the real worker running because
// offline support is part of this product. Archive requests bypass its cache.
// Do not suppress uncaught exceptions: they should fail a test.
