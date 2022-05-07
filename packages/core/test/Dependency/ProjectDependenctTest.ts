import * as sinon from 'sinon';
import {Project} from "@src/Project";
import {ProjectDependency} from "@src/Dependency";

describe('ProjectDependency', () => {
	it('returns checksum of project instances', () => {
		const project = sinon.createStubInstance(Project);
		const HASH = 'somehash';
		project.computeChecksum.resolves(HASH);

		const dependency = new ProjectDependency(project);

		expect(dependency.getContent())
			.resolves
			.toEqual([HASH, 'hex']);
	});
});
