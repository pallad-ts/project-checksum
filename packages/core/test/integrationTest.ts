import {ConfigLoader} from "@src/ConfigLoader";
import {LoadersLoader} from "@src/LoadersLoader";
import * as path from "path";

describe('integration', () => {
	const configLoader = new ConfigLoader(new LoadersLoader());

	it('simple project that loads config automatically from given directory', async () => {
		const project = await configLoader.loadProjectFromDirectory(
			path.resolve(__dirname, './fixtures/projects/test-yml')
		);

		return expect(project.computeChecksum()).resolves.toMatchInlineSnapshot(`"fefec24adc976b7220cd0935824b828b35eb9d6282b730830f2b6809522d248e"`)
	});

	it('project with different config file', async () => {
		const project = await configLoader.loadProjectFromFile({
			rootDir: path.resolve(__dirname, './fixtures/projects/test-yml'),
			filePath: 'custom-config.yml'
		});

		return expect(project.computeChecksum()).resolves.toMatchInlineSnapshot(`"71dbea7f4290ce1e296127c7830ba81c"`)
	});
})
