/**
 * @module @zk-kit/artifacts
 * @version 2.0.1
 * @file Utilities for downloading snark artifacts
 * @copyright Ethereum Foundation 2025
 * @license MIT
 * @see [Github]{@link https://github.com/privacy-scaling-explorations/snark-artifacts/tree/main/packages/artifacts}
*/
'use strict';

var node_fs = require('node:fs');
var fs = require('node:fs/promises');
var node_path = require('node:path');
var node_os = require('node:os');

async function download(url, outputPath) {
    const { body, ok, statusText } = await fetch(url);
    if (!ok)
        throw new Error(`Failed to fetch ${url}: ${statusText}`);
    if (!body)
        throw new Error('Failed to get response body');
    const dir = node_path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    const fileStream = node_fs.createWriteStream(outputPath);
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
    if (!node_fs.existsSync(outputPath))
        await download(url, outputPath);
    return outputPath;
}

exports.Project = void 0;
(function (Project) {
    Project["POSEIDON"] = "poseidon";
    // RLN = 'rln',
    Project["SEMAPHORE"] = "semaphore";
    Project["SEMAPHORE_IDENTITY"] = "semaphore-identity";
    Project["SEMAPHORE_NOIR"] = "semaphore-noir";
})(exports.Project || (exports.Project = {}));
const projects = Object.values(exports.Project).sort();

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
    const outputPath = `${node_os.tmpdir()}/snark-artifacts/${extractEndPath(urls.wasm)}`;
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
    if (project !== exports.Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`semaphore-noir-${merkleTreeDepth}.json`);
    const outputPath = `${node_os.tmpdir()}/snark-artifacts/semaphore-noir-${merkleTreeDepth}.json`;
    await maybeDownload(url, outputPath);
    const json = await fs.readFile(outputPath, 'utf-8');
    return JSON.parse(json);
}
async function getCompiledNoirCircuitWithPath(project, merkleTreeDepth) {
    if (project !== exports.Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`semaphore-noir-${merkleTreeDepth}.json`);
    const outputPath = `${node_os.tmpdir()}/snark-artifacts/semaphore-noir-${merkleTreeDepth}.json`;
    await maybeDownload(url, outputPath);
    const json = await fs.readFile(outputPath, 'utf-8');
    return {
        path: outputPath,
        circuit: JSON.parse(json),
    };
}
exports.BatchingCircuitType = void 0;
(function (BatchingCircuitType) {
    BatchingCircuitType["Leaves"] = "batch_2_leaves";
    BatchingCircuitType["Nodes"] = "batch_2_nodes";
})(exports.BatchingCircuitType || (exports.BatchingCircuitType = {}));
async function getCompiledBatchCircuitWithPath(project, circuitType) {
    if (project !== exports.Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`/batching/${circuitType}.json`);
    const outputPath = `${node_os.tmpdir()}/snark-artifacts/batching/circuit_${circuitType}.json`;
    await maybeDownload(url, outputPath);
    const json = await fs.readFile(outputPath, 'utf-8');
    return {
        path: outputPath,
        circuit: JSON.parse(json),
    };
}
async function maybeGetNoirVk(project, merkleTreeDepth) {
    if (project !== exports.Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`semaphore-vks/semaphore-vk-${merkleTreeDepth}`);
    const outputPath = `${node_os.tmpdir()}/snark-artifacts/semaphore-vks/semaphore-vk-${merkleTreeDepth}`;
    await maybeDownload(url, outputPath);
    const vk = await fs.readFile(outputPath);
    return vk;
}
async function maybeGetBatchVkPath(project, keccak) {
    if (project !== exports.Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const suffix = keccak ? '-keccak' : '';
    const url = getNoirArtifactUrl(`/batching/vk${suffix}`);
    const outputPath = `${node_os.tmpdir()}/snark-artifacts/batching/vk${suffix}`;
    await maybeDownload(url, outputPath);
    return outputPath;
}
async function maybeGetBatchSemaphoreVk(project, merkleTreeDepth) {
    if (project !== exports.Project.SEMAPHORE_NOIR)
        throw new Error(`Unsupported project '${project}'`);
    const url = getNoirArtifactUrl(`/batching/semaphore-vks-fields/semaphore-vk-${merkleTreeDepth}.json`);
    const outputPath = `${node_os.tmpdir()}/snark-artifacts/batching/semaphore-vk-${merkleTreeDepth}.json`;
    await maybeDownload(url, outputPath);
    const json = await fs.readFile(outputPath, 'utf-8');
    return JSON.parse(json);
}

exports.download = download;
exports.getCompiledBatchCircuitWithPath = getCompiledBatchCircuitWithPath;
exports.getCompiledNoirCircuitWithPath = getCompiledNoirCircuitWithPath;
exports.maybeDownload = maybeDownload;
exports.maybeGetBatchSemaphoreVk = maybeGetBatchSemaphoreVk;
exports.maybeGetBatchVkPath = maybeGetBatchVkPath;
exports.maybeGetCompiledNoirCircuit = maybeGetCompiledNoirCircuit;
exports.maybeGetNoirVk = maybeGetNoirVk;
exports.maybeGetSnarkArtifacts = maybeGetSnarkArtifacts;
exports.projects = projects;
