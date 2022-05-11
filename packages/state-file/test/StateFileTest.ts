import {StateFile} from "@src/StateFile";
import * as path from "path";
import {Either} from "monet";
import {ERRORS} from "@src/errors";
import * as fs from 'fs';

describe('StateFile', () => {
	describe('validation', () => {
		it('success', () => {
			const result = StateFile.validate({
				this: 'isfine'
			});

			expect(result.success())
				.toEqual(
					new Map([['this', 'isfine']])
				);
		});

		it('invalid data', () => {
			const result = StateFile.validate({
				this: {is: 'notok'}
			});

			expect(result.fail())
				.toMatchSnapshot();
		});
	});

	describe('loading', () => {
		it('success', async () => {
			const data = await StateFile.load(path.join(__dirname, './fixtures/state-file.yml'));

			expect(data)
				.toBeInstanceOf(Map);
			expect(data)
				.toMatchSnapshot();
		});

		it('file does not exist', async () => {
			const result = await Either.fromPromise(StateFile.load('non-existing-file.yml'));

			expect(ERRORS.STATE_FILE_NOT_FOUND.is(result.left()))
				.toBeTruthy();
		});

		it('file has invalid structure', async () => {
			const data = await Either.fromPromise(
				StateFile.load(path.join(__dirname, './fixtures/invalid-state-file.yml'))
			);

			expect(data.left())
				.toMatchSnapshot();
		})
	});

	describe('saving', () => {
		const STATE_FILE_PATH = path.join(__dirname, 'state-file-test.yml');
		afterEach(() => {
			if (fs.existsSync(STATE_FILE_PATH)) {
				fs.unlinkSync(STATE_FILE_PATH);
			}
		});

		it('success', async () => {
			const result = new Map([
				['someproject', 'checksum']
			]);

			await StateFile.save(STATE_FILE_PATH, result);
			const loaded = await StateFile.load(STATE_FILE_PATH);

			expect(loaded)
				.toEqual(result);
		})
	});
});
