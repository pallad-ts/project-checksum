import {Domain, generators} from "alpha-errors";
import {ChecksumError} from "@pallad/project-checksum-core";

export const ERRORS = Domain.create({
	errorClass: ChecksumError,
	codeGenerator: generators.formatCode('E_PROJECT_CHECKSUM_STATE_%d')
})
	.createErrors(create => {
		return {
			NO_PROJECT_FOUND: create('No checksum project "%s" found'),
			STATE_FILE_NOT_FOUND: create('No state file "%s" found')
		}
	});
