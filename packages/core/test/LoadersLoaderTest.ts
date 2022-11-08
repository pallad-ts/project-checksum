import {LoadersLoader} from "@src/LoadersLoader";
import {ERRORS} from "@src/errors";
import {Either, left, right} from "@sweet-monads/either";

// eslint-disable-next-line @typescript-eslint/naming-convention
function fromTry<L, R>(fn: () => R): Either<L, R> {
	try {
		return right(fn());
	} catch (e) {
		return left(e as L);
	}
}

describe('LoadersLoader', () => {
	let loader: LoadersLoader;

	beforeEach(() => {
		loader = new LoadersLoader()
	});

	it('fails to load loader that is not installed', () => {
		const result = fromTry(() => {
			loader.getLoader('not-installed');
		});

		expect(ERRORS.NO_LOADER_FOUND.is(result.value))
			.toBeTruthy();
	});
});
