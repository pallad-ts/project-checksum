import * as path from "path";
import {FilesPatternsDependency} from "@src/Dependency/FilesPatternsDependency";

describe('FilesPatternsDependency', () => {
	const CWD = path.resolve(__dirname, '../fixtures/files');

	async function getGeneratorContent(generator: AsyncGenerator | Generator) {
		const buffers: Buffer[] = [];
		for await (const content of generator) {
			if (Buffer.isBuffer(content)) {
				buffers.push(content);
			}
		}
		return Buffer.concat(buffers).toString('utf8');
	}

	it('single file', () => {
		const dependency = new FilesPatternsDependency(['directory/simple.txt'], CWD);

		return expect(getGeneratorContent(dependency.getContent()))
			.resolves
			.toMatchSnapshot('te')
	});

	it('only specific files', async () => {
		const dependency = new FilesPatternsDependency(['directory/**.txt'], CWD);

		return expect(getGeneratorContent(dependency.getContent()))
			.resolves
			.toMatchSnapshot()
	});

	it('returns nothing if files not found', async () => {
		const dependency = new FilesPatternsDependency(['dsdfasd'], CWD);
		const content = await getGeneratorContent(dependency.getContent());
		expect(content)
			.toBe('');
	});
});
