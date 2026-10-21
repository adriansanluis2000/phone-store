import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Network mock for every test: it serves the fixtures by default, each test
// can override responses with server.use(), and any other request fails
export const server = setupServer(...handlers);
