import { CompiledCircuit } from '@noir-lang/noir_js';
import { Project } from '../projects';
import type { SnarkArtifacts, Version } from './types';
export default function maybeGetSnarkArtifacts(project: Project, options?: {
    parameters?: (bigint | number | string)[];
    version?: Version;
}): Promise<SnarkArtifacts>;
/**
 * Download the compiled Noir circuit file.
 * @param project The project type, this should be Semaphore Noir
 * @param merkleTreeDepth The merkleTreeDepth for wich the circuit should be returned
 * @returns the compiled Noir circuit
 */
export declare function maybeGetCompiledNoirCircuit(project: Project, merkleTreeDepth: number): Promise<CompiledCircuit>;
export declare function maybeGetNoirVk(project: Project, merkleTreeDepth: number): Promise<Buffer>;
