import {Loader as BaseLoader, ProjectDependency} from '@pallad/project-checksum-core';
import {SchemaValidation, Validation, ValidatorError, ViolationsList} from "alpha-validator";
import {byJsonSchema} from "alpha-validator-bridge-jsonschema";
import {getInstalledPath} from "get-installed-path";
import {getModulesPathsForDirectory} from "./getModulesPathForDirectory";
import {Either} from "monet";

const validator = SchemaValidation.toValidationFunction(
	'none', byJsonSchema<Loader.Options.FromUser>(require('../options-schema.json'))
);

export class Loader implements BaseLoader<Loader.Options> {
	async load(context: BaseLoader.Context, options: Loader.Options.FromUser) {
		const validationResult = await this.validateOptions(options);
		if (validationResult.isFail()) {
			throw new ValidatorError(validationResult.fail(), 'Invalid options for @pallad/project-checksum-loader-package');
		}

		const packageName = validationResult.success().name;
		const packageLocation = await Either.fromPromise(
			getInstalledPath(packageName, {
				paths: getModulesPathsForDirectory(context.directory)
			})
		);

		if (packageLocation.isLeft()) {
			throw packageLocation.left();
		}

		return new ProjectDependency(
			await context.configLoader.loadProjectFromDirectory(
				packageLocation.right()
			)
		)
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

