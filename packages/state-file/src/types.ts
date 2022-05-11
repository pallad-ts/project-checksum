export type State = Map<string, string>;

export interface ProjectConfig {
	directory: string;
	configFile?: string;
}

export type LoadingStrategy = 'only-state' | 'only-compute' | 'state-and-compute';
