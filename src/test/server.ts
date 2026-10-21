import { setupServer } from 'msw/node';

// Network mock for every test: each test declares the responses it needs
// with server.use(), and any other request fails the test
export const server = setupServer();
