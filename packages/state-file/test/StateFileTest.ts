import {StateFile} from "@src/StateFile";
import * as path from "path";
import {ERRORS} from "@src/errors";
import * as fs from 'fs';
import {left, right} from "@sweet-monads/either";
import {just} from "@sweet-monads/maybe";

describe('StateFile', () => {
	describe('validation', () => {
		it('success', () => {
			const result = StateFile.validate({
				this: 'isfine'
			});

			expect(result.unwrap())
				.toEqual(
					new Map([['this', 'isfine']])
				);
		});

		it('invalid data', () => {
			const result = StateFile.validate({
				this: {is: 'notok'}
			});

			expect(result.value)
				.toMatchSnapshot();
		});
	});

	describe('loading', () => {
		it('success', async () => {
			const data = await StateFile.load(path.join(__dirname, './fixtures/state-file.yml'))

			expect(data.value)
				.toBeInstanceOf(Map);
			expect(data.value)
				.toMatchSnapshot();
		});

		it('file does not exist', async () => {
			const result = await StateFile.load('non-existing-file.yml');

			expect(result.isNone())
				.toBeTruthy();
		});

		it('file has invalid structure', async () => {
			const data = await StateFile.load(path.join(__dirname, './fixtures/invalid-state-file.yml'))
				.then(right, left);

			expect(data.value)
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
				.toEqual(just(result));
		})
	});
});
