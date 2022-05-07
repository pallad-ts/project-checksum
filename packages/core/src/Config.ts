import {Algorithm} from "./Algorithm";

export interface Config {
	readonly algorithm: Algorithm;
	readonly paths?: string[]
	readonly external?: Config.External[];
}

export namespace Config {
	export type External = string | { loader: string, options: unknown };

	export namespace External {
		export interface LoaderConfig {
			loader: string,
			options: unknown
		}

		export function toLoaderConfig(data: External): External.LoaderConfig {
			if (typeof data === 'string') {
				const [loader, options] = data.split(':');
				return {loader, options}
			}
			return data;
		}
	}
}
