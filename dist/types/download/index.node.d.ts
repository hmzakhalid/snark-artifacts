import { CompiledCircuit } from '@noir-lang/noir_js';
import { Project } from '../projects';
import _maybeGetSnarkArtifacts from './index.browser';
import type { SnarkArtifacts } from './types';
/**
 * Downloads SNARK artifacts (`wasm` and `zkey`) files if not already present in OS tmp folder.
 * @example
 * ```ts
 * {
 *   wasm: "/tmp/@zk-kit/semaphore-artifacts@latest/semaphore-3.wasm",
 *   zkey: "/tmp/@zk-kit/semaphore-artifacts@latest/semaphore-3.zkey" .
 * }
 * ```
 * @returns {@link SnarkArtifacts}
 */
export default function maybeGetSnarkArtifacts(...pars: Parameters<typeof _maybeGetSnarkArtifacts>): Promise<SnarkArtifacts>;
/**
 * Download the compiled Noir circuit file, if it isn't already present in the OS tmp folder
 * @param project The project type, this should be Semaphore Noir
 * @param merkleTreeDepth The merkleTreeDepth for wich the circuit should be returned
 * @returns the compiled Noir circuit
 */
export declare function maybeGetCompiledNoirCircuit(project: Project, merkleTreeDepth: number): Promise<CompiledCircuit>;
export declare function getCompiledNoirCircuitWithPath(project: Project, merkleTreeDepth: number): Promise<{
    path: string;
    circuit: CompiledCircuit;
}>;
export declare enum BatchingCircuitType {
    Leaves = "batch_2_leaves",
    Nodes = "batch_2_nodes"
}
export declare function getCompiledBatchCircuitWithPath(project: Project, circuitType: BatchingCircuitType): Promise<{
    path: string;
    circuit: CompiledCircuit;
}>;
export declare function maybeGetNoirVk(project: Project, merkleTreeDepth: number): Promise<Buffer>;
export declare function maybeGetBatchVkPath(project: Project, keccak?: boolean): Promise<string>;
export declare function maybeGetBatchSemaphoreVk(project: Project, merkleTreeDepth: number): Promise<string[]>;
