import {byJsonSchema} from "alpha-validator-bridge-jsonschema";
import * as fs from 'fs/promises';
import {ERRORS} from "./errors";
import * as YAML from 'yaml';
import {ValidatorError} from "alpha-validator";
import {State} from "./types";
import {Maybe} from "monet";

const schema = require('../state-schema.json');

const validator = byJsonSchema<Record<string, string>>(schema);

export namespace StateFile {
	export async function load(file: string): Promise<Maybe<State>> {
		const isFileExist = await fs.access(file).then(() => true, () => false);
		if (!isFileExist) {
			return Maybe.None();
		}
		const content = await fs.readFile(file, 'utf-8');

		const data = YAML.parse(content);
		const state = validate(data);

		if (state.isFail()) {
			throw new ValidatorError(state.fail(), 'Invalid state file structure');
		}

		return Maybe.Some(state.success());
	}

	export function validate(data: any) {
		return validator(data)
			.map((result: Record<string, string>) => {
				const map = new Map<string, string>();
				for (const [projectName, checksum] of Object.entries(result)) {
					map.set(projectName, checksum);
				}
				return map;
			});
	}

	export async function save(file: string, state: State) {
		const data = Object.fromEntries(state.entries());
		const content = YAML.stringify(data);
		await fs.writeFile(file, content);
	}
}
