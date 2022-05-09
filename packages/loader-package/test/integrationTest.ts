import {Loader} from "@src/Loader";
import {ConfigLoader, LoadersLoader, ProjectDependency} from "@pallad/project-checksum-core";
import * as sinon from 'sinon';

describe('integration', () => {
	let loader: Loader;
	let configLoader: ConfigLoader;
	beforeEach(() => {
		loader = new Loader();

		const loadersLoader = sinon.createStubInstance(LoadersLoader);
		loadersLoader.getLoader
			.withArgs('package')
			.returns(loader);
		configLoader = new ConfigLoader(loadersLoader as unknown as LoadersLoader);
		loader = new Loader();
	});

	it('main', async () => {
		const dep = await loader.load({
			configLoader,
			directory: __dirname,
			loadedFiles: []
		}, 'main');

		expect(dep)
			.toBeInstanceOf(ProjectDependency);

		expect(dep.project.config.algorithm).toMatchInlineSnapshot(`"sha256"`);
	});

	it('non-existing-package', () => {
		const result = loader.load({
			configLoader,
			directory: __dirname,
			loadedFiles: []
		}, 'non-existing');

		return expect(result)
			.rejects
			.toThrowError(/module not found/);
	});
});
