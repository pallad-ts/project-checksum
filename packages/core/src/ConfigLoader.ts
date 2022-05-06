import {Validation, ValidatorError, ViolationsList} from "alpha-validator";
import {ERRORS} from "./errors";
import {RawConfig} from "./RawConfig";
import {Validator} from "jsonschema";
import {cosmiconfig} from "cosmiconfig";
import * as path from "path";

const validator = new Validator();
const schema = require('../config-schema.json');

export class ConfigLoader {
	private explorer = cosmiconfig('@pallad/project-checksum', {
		searchPlaces:
			[
				'@pallad/project-checksum',
				'pallad-project-checksum',
				'pallad-project-checksum.config',
				'project-checksum'
			]
				.reduce((result, name) => {
					return result.concat([
						`${name}.json`,
						`${name}.yaml`,
						`${name}.yml`,
						`${name}.js`,
					])
				}, [] as string[])
	});

	validate(data: any): Validation<ViolationsList, RawConfig> {
		const result = validator.validate(data, schema);

		if (result.valid) {
			return Validation.Success(result.instance);
		}

		const list = ViolationsList.create();
		for (const error of result.errors) {
			list.addViolation(error.message, error.path.map(String));
		}
		return Validation.Fail(list);
	}

	async loadFile(filePath: string, rootDir?: string) {
		const result = await this.explorer.load(filePath);

		if (!result) {
			throw ERRORS.NO_CONFIG_FILE_FOUND.format(filePath);
		}
		const directory = rootDir ?? path.dirname(filePath);
		return this.validateAndEnchantResult(result.config, directory);
	}

	private validateAndEnchantResult(config: any, directory: string) {
		const validationResult = this.validate(config);
		if (validationResult.isFail()) {
			throw new ValidatorError(validationResult.fail(), 'Invalid config');
		}

		return {...validationResult.success(), directory};
	}

	async loadDirectory(directory: string): Promise<RawConfig.Enchanted> {
		const result = await this.explorer.search(directory);
		if (!result) {
			throw ERRORS.NO_CONFIG_FOUND.format(directory);
		}

		return this.validateAndEnchantResult(result.config, directory);
	}
}
