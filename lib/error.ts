export class RatelimitError extends Error {
  constructor() {
    super();
    this.name = 'RatelimitError';
    this.message = 'Rate limit exceeded';
  }
}
