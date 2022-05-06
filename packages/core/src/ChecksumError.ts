export class ChecksumError extends Error {
	constructor(message: string) {
		super();
		this.name = 'ChecksumError';
		this.message = message;
	}
}
