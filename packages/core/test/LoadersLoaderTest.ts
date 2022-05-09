import {LoadersLoader} from "@src/LoadersLoader";
import {Either} from "monet";
import {ERRORS} from "@src/errors";

describe('LoadersLoader', () => {
	let loader: LoadersLoader;

	beforeEach(() => {
		loader = new LoadersLoader()
	});

	it('fails to load loader that is not installed', () => {
		const result = Either.fromTry(() => {
			loader.getLoader('not-installed');
		});

		expect(ERRORS.NO_LOADER_FOUND.is(result.left()))
			.toBeTruthy();
	});
});
