/* eslint-disable no-console */
import {Command as BaseCommand, Flags} from "@oclif/core";
import {StateConfigLoader} from "./StateConfigLoader";
import {ChecksumError, ConfigLoader, LoadersLoader} from "@pallad/project-checksum-core";
import {LoadingStrategy, State} from "./types";
import {ValidatorError} from "alpha-validator";

export class Command extends BaseCommand {
	static description = "Computes project checksum"

	static flags = {
		config: Flags.string({
			description: 'Path to configuration file',
			char: 'c'
		}),
		onlyValues: Flags.boolean({
			char: 'v',
			description: 'Display only values',
		}),
		noStateFile: Flags.boolean({
			char: 'n',
			description: 'Do not use state file'
		}),
		onlyStateFile: Flags.boolean({
			char: 'o',
			description: 'Use only state file'
		})
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	static args = [{
		name: 'projectName',
		required: false,
		description: 'project name',
	}];

	static strict = false;

	async run() {
		try {
			await this.internal()
			process.exit(0);
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
				console.error(`Code: ${(e as any).code}`);
			} else if (e instanceof Error) {
				console.error('Fatal error', e.message);
			}
			process.exit(1);
		}
	}

	private async internal() {
		const {flags, argv} = await this.parse(Command);
		const manager = await this.getManager(flags.config);

		if (argv.length === 0 && !flags.onlyStateFile && !flags.noStateFile) {
			console.error('Generating state file');
			const state = await manager.generateFile();
			this.displayState(state, flags.onlyValues);
			return;
		}

		const loadingStrategy = this.getLoadingStrategyFromFlags(flags);

		const projectNames = argv.length === 0 ? undefined : argv;
		const state = await manager.getChecksums(loadingStrategy, projectNames);
		this.displayState(state, flags.onlyValues);
	}

	private getLoadingStrategyFromFlags(flags: { noStateFile?: boolean, onlyStateFile?: boolean }): LoadingStrategy {
		if (flags.noStateFile && flags.onlyStateFile) {
			throw new ChecksumError(`--noStateFile and --onlyStateFile are mutually exclusive`);
		}

		if (flags.noStateFile) {
			return 'only-compute';
		}

		if (flags.onlyStateFile) {
			return 'only-state';
		}

		return 'state-and-compute';
	}

	private getManager(configFile?: string) {
		const configLoader = new ConfigLoader(new LoadersLoader());
		const stateConfigLoader = new StateConfigLoader(configLoader);
		if (configFile) {
			return stateConfigLoader.loadFromFile({
				directory: process.cwd(),
				file: configFile
			})
		}

		return stateConfigLoader.loadFromDirectory(process.cwd());
	}

	private displayState(state: State, onlyValues: boolean) {
		for (const [projectName, checksum] of state.entries()) {
			console.log(onlyValues ? checksum : `${projectName}: ${checksum}`);
		}
	}
}
