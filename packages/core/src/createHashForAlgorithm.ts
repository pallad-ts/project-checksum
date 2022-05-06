import {Algorithm} from "./Algorithm";
import {createHash} from 'crypto';
export function createHashForAlgorithm(algorithm: Algorithm) {
	return createHash(algorithm);
}
