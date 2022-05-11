import {ProjectConfig} from "./types";

export interface Config {
	readonly stateFile: string;
	readonly projects: Record<string, ProjectConfig>;
}
