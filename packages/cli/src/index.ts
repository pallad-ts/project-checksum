/* eslint-disable no-console */
import {Command, Flags} from "@oclif/core";
import {ChecksumError, ConfigLoader, LoadersLoader} from "@pallad/project-checksum-core";
import * as path from "path";
import {ValidatorError} from "alpha-validator";
import * as fs from 'fs/promises';

class ProjectChecksum extends Command {
	static description = "Computes project checksum"

	static flags = {
		config: Flags.string({
			description: 'Path to configuration file',
			char: 'c'
		})
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	static args = [{
		name: 'projectDirectory',
		required: false,
		description: 'path to project directory'
	}];

	// eslint-disable-next-line @typescript-eslint/naming-convention
	static strict = true;

	async run() {
		const {args, flags} = await this.parse(ProjectChecksum);

		const configLoader = new ConfigLoader(
			new LoadersLoader()
		);

		const directory = await this.getDirectory(args.projectDirectory);
		const configFile = flags.config;

		try {
			const project = configFile ? await configLoader.loadProjectFromFile({
				filePath: configFile,
				rootDir: directory
			}) : await configLoader.loadProjectFromDirectory(directory);

			const checksum = await project.computeChecksum();
			console.log(checksum);
		} catch (e: unknown) {
			if (e instanceof ValidatorError) {
				console.error(`Validation error: ${e.message}`);
				for (const violation of e.violations.getViolations()) {
					console.error('Message:', violation.message);
					if (violation.path) {
						console.error('Path:', violation.path)
					}
				}

			} else if (e instanceof ChecksumError) {
				console.error(e.message);
			} else if (e instanceof Error) {
				console.error('Fatal error', e.message)
			}

			process.exit(1);
		}
	}

	private async getDirectory(projectDirectoryArgument: string) {
		if (!projectDirectoryArgument) {
			return process.cwd();
		}

		if (path.isAbsolute(projectDirectoryArgument)) {
			return projectDirectoryArgument;
		}
		return fs.realpath(projectDirectoryArgument);
	}
}

export = ProjectChecksum;
