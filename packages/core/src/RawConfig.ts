import {Algorithm} from "./Algorithm";
import {Validator} from "jsonschema";


export interface RawConfig {
	readonly algorithm: Algorithm;
	readonly paths?: string[]
}

export namespace RawConfig {
	export interface Enchanted extends RawConfig {
		readonly directory: string;
	}
}
