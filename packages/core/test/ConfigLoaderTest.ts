import {Config} from "@src/Config";
import * as path from "path";
import {ERRORS} from "@src/errors";
import {ConfigLoader} from "@src/ConfigLoader";
import {Either} from "monet";
import {LoadersLoader} from "@src/LoadersLoader";
import * as sinon from 'sinon';
import {Project} from "@src/Project";

describe('ConfigLoader', () => {
	const DATA: Config = {
		algorithm: 'md5',
		paths: ['some-file-path']
	};

	let configLoader: ConfigLoader;
	let loadersLoader: sinon.SinonStubbedInstance<LoadersLoader>;

	beforeEach(() => {
		loadersLoader = sinon.createStubInstance(LoadersLoader);
		configLoader = new ConfigLoader(loadersLoader as unknown as LoadersLoader);
	});

	describe('validation', () => {
		it('valid', () => {

		});

		describe('invalid', () => {
			it('algorithm', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const result = await configLoader.validate({
					...DATA,
					algorithm: 'test'
				});
				expect(result.fail())
					.toMatchSnapshot()
			});

			it('algorithm type', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const result = await configLoader.validate({
					...DATA,
					algorithm: 4
				});
				expect(result.fail())
					.toMatchSnapshot();
			});

			it('missing paths and external', async () => {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				const result = await configLoader.validate({
					...DATA,
					paths: [],
					external: []
				});
				expect(result.fail())
					.toMatchSnapshot();
			})
		})
	});

	describe('loading config', () => {
		it('from yml file', async () => {
			const directory = path.resolve(__dirname, './fixtures/projects/test-yml');
			const project = await configLoader.loadProjectFromDirectory(directory);

			expect(project)
				.toBeInstanceOf(Project);

			expect(project.config.dependencies)
				.toHaveLength(1);
		});

		it('fails if no config was found', async () => {
			const directory = path.resolve(__dirname, './fixtures/projects/no-config');
			const config = await Either.fromPromise(configLoader.loadProjectFromDirectory(directory));
			expect(ERRORS.NO_CONFIG_FOUND.is(config.left()))
				.toBeTruthy();
		});

		describe('fails', () => {
			it('when circular dependency detected', async () => {
				const result = await Either.fromPromise(
					configLoader.loadProjectFromFile({
						rootDir: 'a',
						filePath: 'file.yml'
					}, {
						loadedFiles: [
							'a/file.yml',
							'b.file.yml'
						]
					})
				);

				expect(ERRORS.CIRCULAR_DEPENDENCY.is(result.left()))
					.toBeTruthy();


				expect(result.left().message)
					.toMatchInlineSnapshot(`"Circular dependency detected. Projects path: a/file.yml > b.file.yml > a/file.yml"`);
			})
		})
	});
});
