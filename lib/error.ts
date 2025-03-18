export class RatelimitError extends Error {
  constructor() {
    this.name = 'RatelimitError';
    this.message = 'Rate limit exceeded';
  }
}
