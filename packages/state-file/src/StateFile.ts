import {byJsonSchema} from "alpha-validator-bridge-jsonschema";
import * as fs from 'fs/promises';
import * as YAML from 'yaml';
import {ValidatorError} from "alpha-validator";
import {State} from "./types";
import {just, Maybe, none} from "@sweet-monads/maybe";

const schema = require('../state-schema.json');

const validator = byJsonSchema<Record<string, string>>(schema);

export namespace StateFile {
	export async function load(file: string): Promise<Maybe<State>> {
		const isFileExist = await fs.access(file).then(() => true, () => false);
		if (!isFileExist) {
			return none();
		}
		const content = await fs.readFile(file, 'utf-8');

		const data = YAML.parse(content);
		const state = validate(data);

		if (state.isLeft()) {
			throw new ValidatorError(state.value, 'Invalid state file structure');
		}

		return just(state.value);
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
