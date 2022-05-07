import {Algorithm} from "./Algorithm";

export interface RawConfig {
	readonly algorithm: Algorithm;
	readonly paths?: string[]
	readonly external?: RawConfig.External[];
}

export namespace RawConfig {
	export type External = string | { loader: string, options: unknown };

	export interface Enchanted extends RawConfig {
		readonly directory: string;
	}
}
