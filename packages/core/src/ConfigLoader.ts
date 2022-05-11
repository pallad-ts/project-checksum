import {SchemaValidation, Validation, ValidatorError, ViolationsList} from "alpha-validator";
import {ERRORS} from "./errors";
import {Config} from "./Config";
import {cosmiconfig} from "cosmiconfig";
import * as path from "path";
import {byJsonSchema} from "alpha-validator-bridge-jsonschema";
import {LoadersLoader} from "./LoadersLoader";
import {Project} from "./Project";
import {Dependency, FilesPatternsDependency} from "./Dependency";

const validation = SchemaValidation.toValidationFunction(
	'none', byJsonSchema<Config>(require('../config-schema.json'))
);

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
				}, [] as string[]),
	});

	constructor(private loadersLoader: LoadersLoader) {
	}

	async validate(data: any): Promise<Validation<ViolationsList, Config>> {
		return (await validation(data))
			.chain(config => {
				const hasPaths = Array.isArray(config.paths) && config.paths.length > 0;
				const external = Array.isArray(config.external) && config.external.length > 0;
				if (!hasPaths && !external) {
					return Validation.Fail(
						ViolationsList.create()
							.addViolation('Project configuration needs at least one path or external defined'),
					);
				}
				return Validation.Success(config);
			});
	}

	async loadProjectFromFile(file: ConfigLoader.ConfigFile, context?: ConfigLoader.Context): Promise<Project> {
		const fullFilePath = path.join(file.rootDir, file.filePath);

		if (context && context.loadedFiles.includes(fullFilePath)) {
			throw ERRORS.CIRCULAR_DEPENDENCY.format(
				context.loadedFiles.concat([fullFilePath]).join(' > ')
			);
		}

		const result = await this.explorer.load(fullFilePath);
		if (!result) {
			throw ERRORS.NO_CONFIG_FILE_FOUND.format(file.filePath, file.rootDir);
		}

		const config = await this.validateConfigOrFail(result.config);
		const finalContext: ConfigLoader.Context = context ?? {loadedFiles: [fullFilePath]};
		return this.createProjectFromConfig(config, file, finalContext);
	}

	private async createProjectFromConfig(config: Config, file: ConfigLoader.ConfigFile, context: ConfigLoader.Context) {
		const dependencies = [] as Dependency[];
		if (config.paths && config.paths.length > 0) {
			dependencies.push(new FilesPatternsDependency(config.paths, file.rootDir));
		}

		if (config.external) {
			for (const external of config.external) {
				const {loader: loaderName, options: loaderOptions} = Config.External.toLoaderConfig(external);
				const loader = this.loadersLoader.getLoader(loaderName);

				const loadingResult = await loader.load({
					configLoader: this,
					loadedFiles: context.loadedFiles,
					directory: file.rootDir
				}, loaderOptions);

				if (loadingResult) {
					dependencies.push(
						...(Array.isArray(loadingResult) ? loadingResult : [loadingResult])
					);
				}
			}
		}

		return new Project({
			algorithm: config.algorithm,
			dependencies,
			rootDirectory: file.rootDir
		});
	}

	private async validateConfigOrFail(config: unknown) {
		const validationResult = await this.validate(config);
		if (validationResult.isFail()) {
			throw new ValidatorError(validationResult.fail(), 'Invalid config');
		}
		return validationResult.success();
	}

	async loadProjectFromDirectory(directory: string): Promise<Project> {
		const result = await this.explorer.search(directory);
		if (!result) {
			throw ERRORS.NO_CONFIG_FOUND.format(directory);
		}

		return this.loadProjectFromFile({
			filePath: path.relative(directory, result.filepath),
			rootDir: directory
		});
	}
}

export namespace ConfigLoader {
	export interface Context {
		loadedFiles: string[];

	}

	export interface ConfigFile {
		filePath: string;
		rootDir: string;
	}
}
