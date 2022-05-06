import {Domain, generators} from "alpha-errors";
import {ChecksumError} from "./ChecksumError";

export const ERRORS = Domain.create({
	errorClass: ChecksumError,
	codeGenerator: generators.formatCode('E_PROJECT_CHECKSUM_%d')
})
	.createErrors(create => {
		return {
			NO_CONFIG_FOUND: create('No @pallad/project-checksum configuration found in directory: %s'),
			NO_CONFIG_FILE_FOUND: create('No config file "%s" for @pallad/project-checksum found'),
			NO_LOADER_FOUND: create('No loader "%s" found'),
			NO_LOADER_EXPORTED: create('No loader exported in "%s" package')
		}
	})
