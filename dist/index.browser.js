/**
 * @module @zk-kit/artifacts
 * @version 2.0.1
 * @file Utilities for downloading snark artifacts
 * @copyright Ethereum Foundation 2025
 * @license MIT
 * @see [Github]{@link https://github.com/privacy-scaling-explorations/snark-artifacts/tree/main/packages/artifacts}
*/
var Project;
(function (Project) {
    Project["POSEIDON"] = "poseidon";
    // RLN = 'rln',
    Project["SEMAPHORE"] = "semaphore";
    Project["SEMAPHORE_IDENTITY"] = "semaphore-identity";
    Project["SEMAPHORE_NOIR"] = "semaphore-noir";
})(Project || (Project = {}));
const projects = Object.values(Project).sort();

const BASE_URL = 'https://snark-artifacts.pse.dev';
const NOIR_BASE_URL = 'https://hashcloak.github.io/noir-artifacts-host';
const getBaseUrl = (project, version) => `${BASE_URL}/${project}/${version}/${project}`;
const getNoirArtifactUrl = (filename) => `${NOIR_BASE_URL}/${filename}`;

async function maybeGetSnarkArtifacts(project, options = {}) {
    if (!projects.includes(project))
        throw new Error(`Project '${project}' is not supported`);
    options.version ??= 'latest';
    const url = getBaseUrl(project, options.version);
    const parameters = options.parameters ? `-${options.parameters.join('-')}` : '';
    return {
        wasm: `${url}${parameters}.wasm`,
        zkey: `${url}${parameters}.zkey`,
    };
}
/**
 * Download the compiled Noir circuit file.
 * @param project The project type, this should be Semaphore Noir
 * @param merkleTreeDepth The merkleTreeDepth for wich the circuit should be returned
 * @returns the compiled Noir circuit
 */
async function maybeGetCompiledNoirCircuit(project, merkleTreeDepth) {
    if (project !== Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`semaphore-noir-${merkleTreeDepth}.json`);
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Failed to fetch circuit: ${response.statusText}`);
    const circuit = await response.json();
    return circuit;
}
async function maybeGetNoirVk(project, merkleTreeDepth) {
    if (project !== Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`semaphore-vks/semaphore-vk-${merkleTreeDepth}`);
    const response = await fetch(url);
    if (!response.ok)
        throw new Error(`Failed to fetch circuit: ${response.statusText}`);
    const vk = await response.arrayBuffer();
    return Buffer.from(vk);
}

export { Project, maybeGetCompiledNoirCircuit, maybeGetNoirVk, maybeGetSnarkArtifacts, projects };
