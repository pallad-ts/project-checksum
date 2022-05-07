import {Loader as BaseLoader} from '@pallad/project-checksum-core';
import {SchemaValidation, Validation, ValidatorError, ViolationsList} from "alpha-validator";
import {byJsonSchema} from "alpha-validator-bridge-jsonschema";

const validator = SchemaValidation.toValidationFunction(
	'none', byJsonSchema<Loader.Options.FromUser>(require('../options-schema.json'))
);

export class Loader implements BaseLoader<Loader.Options> {
	async load(context: BaseLoader.Context, options: Loader.Options.FromUser) {
		const validationResult = await this.validateOptions(options);
		if (validationResult.isFail()) {
			throw new ValidatorError(validationResult.fail(), 'Invalid options for @pallad/project-checksum-loader-package');
		}
	}

	async validateOptions(options: Loader.Options.FromUser): Promise<Validation<ViolationsList, Loader.Options>> {
		return (await validator(options))
			.map(x => {
				return typeof x === 'string' ? {name: x} : x;
			});
	}
}

export namespace Loader {
	export interface Options {
		name: string;
	}

	export namespace Options {
		export type FromUser = string | {
			name: string;
		}
	}
}

