import {byJsonSchema} from "alpha-validator-bridge-jsonschema";
import {cosmiconfig} from "cosmiconfig";
import {Config} from "./Config";
import {StateManager} from "./StateManager";
import {ERRORS} from "./errors";
import * as path from "path";
import {StateGenerator} from "./StateGenerator";
import {ConfigLoader} from "@pallad/project-checksum-core";

const schema = require('../config-schema.json');

const validator = byJsonSchema<Config>(schema);

export class StateConfigLoader {
	private explorer = cosmiconfig('@pallad/project-checksum-state', {
		searchPlaces:
			[
				'@pallad/project-checksum-state',
				'pallad-project-checksum-state',
				'pallad-project-checksum-state.config',
				'project-checksum-state'
			]
				.reduce((result, name) => {
					return result.concat([
						`${name}.json`,
						`${name}.yaml`,
						`${name}.yml`,
						`${name}.js`,
					])
				}, [] as string[]),
	});

	constructor(private configLoader: ConfigLoader) {
	}

	async loadFromFile(fileRef: StateConfigLoader.FileRef): Promise<StateManager> {
		const fullPath = path.join(fileRef.directory, fileRef.file)
		const result = await this.explorer.load(fullPath);

		if (!result) {
			throw ERRORS.CONFIG_FILE_NOT_FOUND.format(fileRef.directory);
		}
		const validationResult = this.validate(result.config);

		const generator = new StateGenerator(
			new Map(Object.entries(validationResult.success().projects)),
			this.configLoader
		);
		return new StateManager(
			path.join(fileRef.directory, validationResult.success().stateFile),
			generator
		);
	}

	async loadFromDirectory(directory: string): Promise<StateManager> {
		const result = await this.explorer.search(directory);

		if (!result) {
			throw ERRORS.NO_CONFIG_FOUND.format(directory);
		}

		return this.loadFromFile({
			file: path.relative(directory, result.filepath),
			directory: directory
		})
	}

	validate(data: any) {
		return validator(data);
	}
}

export namespace StateConfigLoader {
	export interface FileRef {
		file: string;
		directory: string;
	}
}
