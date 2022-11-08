import {Loader as BaseLoader, ProjectDependency} from '@pallad/project-checksum-core';
import {SchemaValidation, ValidatorError, ViolationsList} from "alpha-validator";
import {byJsonSchema} from "alpha-validator-bridge-jsonschema";
import {getInstalledPath} from "get-installed-path";
import {getModulesPathsForDirectory} from "./getModulesPathForDirectory";
import {Either, left, right} from "@sweet-monads/either";

const validator = SchemaValidation.toValidationFunction(
	'none', byJsonSchema<Loader.Options.FromUser>(require('../options-schema.json'))
);

export class Loader implements BaseLoader<Loader.Options> {
	async load(context: BaseLoader.Context, options: Loader.Options.FromUser) {
		const validationResult = await this.validateOptions(options);
		if (validationResult.isLeft()) {
			throw new ValidatorError(validationResult.value, 'Invalid options for @pallad/project-checksum-loader-package');
		}

		const packageName = validationResult.value.name;
		const packageLocation = await getInstalledPath(packageName, {
			paths: getModulesPathsForDirectory(context.directory)
		}).then(right, left);

		if (packageLocation.isLeft()) {
			throw packageLocation.value;
		}

		return new ProjectDependency(
			await context.configLoader.loadProjectFromDirectory(
				packageLocation.value
			)
		)
	}

	async validateOptions(options: Loader.Options.FromUser): Promise<Either<ViolationsList, Loader.Options>> {
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

