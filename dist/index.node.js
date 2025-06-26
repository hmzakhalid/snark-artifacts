/**
 * @module @zk-kit/artifacts
 * @version 2.0.1
 * @file Utilities for downloading snark artifacts
 * @copyright Ethereum Foundation 2025
 * @license MIT
 * @see [Github]{@link https://github.com/privacy-scaling-explorations/snark-artifacts/tree/main/packages/artifacts}
*/
import { createWriteStream, existsSync } from 'node:fs';
import fs, { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { tmpdir } from 'node:os';

async function download(url, outputPath) {
    const { body, ok, statusText } = await fetch(url);
    if (!ok)
        throw new Error(`Failed to fetch ${url}: ${statusText}`);
    if (!body)
        throw new Error('Failed to get response body');
    const dir = dirname(outputPath);
    await mkdir(dir, { recursive: true });
    const fileStream = createWriteStream(outputPath);
    const reader = body.getReader();
    try {
        const pump = async () => {
            const { done, value } = await reader.read();
            if (done) {
                fileStream.end();
                return;
            }
            fileStream.write(Buffer.from(value));
            await pump();
        };
        await pump();
    }
    catch (error) {
        fileStream.close();
        throw error;
    }
}
async function maybeDownload(url, outputPath) {
    if (!existsSync(outputPath))
        await download(url, outputPath);
    return outputPath;
}

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

async function maybeGetSnarkArtifacts$1(project, options = {}) {
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

const extractEndPath = (url) => url.split('pse.dev/')[1];
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
async function maybeGetSnarkArtifacts(...pars) {
    const urls = await maybeGetSnarkArtifacts$1(...pars);
    const outputPath = `${tmpdir()}/snark-artifacts/${extractEndPath(urls.wasm)}`;
    const [wasm, zkey] = await Promise.all([
        maybeDownload(urls.wasm, outputPath),
        maybeDownload(urls.zkey, outputPath.replace(/.wasm$/, '.zkey')),
    ]);
    return {
        wasm,
        zkey,
    };
}
/**
 * Download the compiled Noir circuit file, if it isn't already present in the OS tmp folder
 * @param project The project type, this should be Semaphore Noir
 * @param merkleTreeDepth The merkleTreeDepth for wich the circuit should be returned
 * @returns the compiled Noir circuit
 */
async function maybeGetCompiledNoirCircuit(project, merkleTreeDepth) {
    if (project !== Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`semaphore-noir-${merkleTreeDepth}.json`);
    const outputPath = `${tmpdir()}/snark-artifacts/semaphore-noir-${merkleTreeDepth}.json`;
    await maybeDownload(url, outputPath);
    const json = await fs.readFile(outputPath, 'utf-8');
    return JSON.parse(json);
}
async function getCompiledNoirCircuitWithPath(project, merkleTreeDepth) {
    if (project !== Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`semaphore-noir-${merkleTreeDepth}.json`);
    const outputPath = `${tmpdir()}/snark-artifacts/semaphore-noir-${merkleTreeDepth}.json`;
    await maybeDownload(url, outputPath);
    const json = await fs.readFile(outputPath, 'utf-8');
    return {
        path: outputPath,
        circuit: JSON.parse(json),
    };
}
var BatchingCircuitType;
(function (BatchingCircuitType) {
    BatchingCircuitType["Leaves"] = "batch_2_leaves";
    BatchingCircuitType["Nodes"] = "batch_2_nodes";
})(BatchingCircuitType || (BatchingCircuitType = {}));
async function getCompiledBatchCircuitWithPath(project, circuitType) {
    if (project !== Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`/batching/${circuitType}.json`);
    const outputPath = `${tmpdir()}/snark-artifacts/batching/circuit_${circuitType}.json`;
    await maybeDownload(url, outputPath);
    const json = await fs.readFile(outputPath, 'utf-8');
    return {
        path: outputPath,
        circuit: JSON.parse(json),
    };
}
async function maybeGetNoirVk(project, merkleTreeDepth) {
    if (project !== Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`semaphore-vks/semaphore-vk-${merkleTreeDepth}`);
    const outputPath = `${tmpdir()}/snark-artifacts/semaphore-vks/semaphore-vk-${merkleTreeDepth}`;
    await maybeDownload(url, outputPath);
    const vk = await fs.readFile(outputPath);
    return vk;
}
async function maybeGetBatchVkPath(project, keccak) {
    if (project !== Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const suffix = keccak ? '-keccak' : '';
    const url = getNoirArtifactUrl(`/batching/vk${suffix}`);
    const outputPath = `${tmpdir()}/snark-artifacts/batching/vk${suffix}`;
    await maybeDownload(url, outputPath);
    return outputPath;
}
async function maybeGetBatchSemaphoreVk(project, merkleTreeDepth) {
    if (project !== Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`/batching/semaphore-vks-fields/semaphore-vk-${merkleTreeDepth}.json`);
    const outputPath = `${tmpdir()}/snark-artifacts/batching/semaphore-vk-${merkleTreeDepth}.json`;
    await maybeDownload(url, outputPath);
    const json = await fs.readFile(outputPath, 'utf-8');
    return JSON.parse(json);
}

export { BatchingCircuitType, Project, download, getCompiledBatchCircuitWithPath, getCompiledNoirCircuitWithPath, maybeDownload, maybeGetBatchSemaphoreVk, maybeGetBatchVkPath, maybeGetCompiledNoirCircuit, maybeGetNoirVk, maybeGetSnarkArtifacts, projects };
