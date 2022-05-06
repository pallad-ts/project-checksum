import {RawConfig} from "@src/RawConfig";
import * as path from "path";
import {ERRORS} from "@src/errors";
import {ConfigLoader} from "@src/ConfigLoader";
import {Either} from "monet";

describe('ConfigLoader', () => {
	const DATA: RawConfig = {
		algorithm: 'md5',
		paths: ['some-file-path']
	};

	const loader = new ConfigLoader();

	describe('validation', () => {
		it('valid', () => {

		});

		describe('invalid', () => {
			it('algorithm', () => {
				const result = loader.validate({
					...DATA,
					algorithm: 'test'
				});
				expect(result.fail())
					.toMatchSnapshot()
			});

			it('algorithm type', () => {
				const result = loader.validate({
					...DATA,
					algorithm: 4
				});
				expect(result.fail())
					.toMatchSnapshot();
			})
		})
	});

	describe('loading config', () => {
		it('from yml file', async () => {
			const directory = path.resolve(__dirname, './node_modules/test-yml');
			const config = await loader.loadDirectory(directory);
			expect(config).toMatchSnapshot();
		});

		it('fails if no config was found', async () => {
			const directory = path.resolve(__dirname, './node_modules/no-config');
			const config = await Either.fromPromise(loader.loadDirectory(directory));
			expect(ERRORS.NO_CONFIG_FOUND.is(config.left()))
				.toBeTruthy();
		});
	});
});
