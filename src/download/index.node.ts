import { CompiledCircuit } from '@noir-lang/noir_js'
import fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { Project } from '../projects'
import { maybeDownload } from './download'
import _maybeGetSnarkArtifacts from './index.browser'
import { maybeGetCompiledNoirCircuit as _maybeGetCompiledNoirCircuit } from './index.browser'
import type { SnarkArtifacts } from './types'
import { getNoirArtifactUrl } from './urls'

const extractEndPath = (url: string) => url.split('pse.dev/')[1]

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
export default async function maybeGetSnarkArtifacts(
  ...pars: Parameters<typeof _maybeGetSnarkArtifacts>
): Promise<SnarkArtifacts> {
  const urls = await _maybeGetSnarkArtifacts(...pars)

  const outputPath = `${tmpdir()}/snark-artifacts/${extractEndPath(urls.wasm)}`

  const [wasm, zkey] = await Promise.all([
    maybeDownload(urls.wasm, outputPath),
    maybeDownload(urls.zkey, outputPath.replace(/.wasm$/, '.zkey')),
  ])

  return {
    wasm,
    zkey,
  }
}

/**
 * Download the compiled Noir circuit file, if it isn't already present in the OS tmp folder
 * @param project The project type, this should be Semaphore Noir
 * @param merkleTreeDepth The merkleTreeDepth for wich the circuit should be returned
 * @returns the compiled Noir circuit
 */
export async function maybeGetCompiledNoirCircuit(
  project: Project,
  merkleTreeDepth: number,
): Promise<CompiledCircuit> {
  if (project !== Project.SEMAPHORE_NOIR)
    throw new Error(`Unsupported project '${project}'`)

  const url = getNoirArtifactUrl(`semaphore-noir-${merkleTreeDepth}.json`)
  const outputPath = `${tmpdir()}/snark-artifacts/semaphore-noir-${merkleTreeDepth}.json`
  await maybeDownload(url, outputPath)

  const json = await fs.readFile(outputPath, 'utf-8')
  return JSON.parse(json) as CompiledCircuit
}

export async function getCompiledNoirCircuitWithPath(
  project: Project,
  merkleTreeDepth: number,
): Promise<{ path: string; circuit: CompiledCircuit }> {
  if (project !== Project.SEMAPHORE_NOIR)
    throw new Error(`Unsupported project '${project}'`)

  const url = getNoirArtifactUrl(`semaphore-noir-${merkleTreeDepth}.json`)
  const outputPath = `${tmpdir()}/snark-artifacts/semaphore-noir-${merkleTreeDepth}.json`
  await maybeDownload(url, outputPath)

  const json = await fs.readFile(outputPath, 'utf-8')
  return {
    path: outputPath,
    circuit: JSON.parse(json) as CompiledCircuit,
  }
}

export enum BatchingCircuitType {
  Leaves = 'batch_2_leaves',
  Nodes = 'batch_2_nodes',
}

export async function getCompiledBatchCircuitWithPath(
  project: Project,
  circuitType: BatchingCircuitType,
): Promise<{ path: string; circuit: CompiledCircuit }> {
  if (project !== Project.SEMAPHORE_NOIR)
    throw new Error(`Unsupported project '${project}'`)

  const url = getNoirArtifactUrl(`/batching/${circuitType}.json`)
  const outputPath = `${tmpdir()}/snark-artifacts/batching/circuit_${circuitType}.json`
  await maybeDownload(url, outputPath)

  const json = await fs.readFile(outputPath, 'utf-8')
  return {
    path: outputPath,
    circuit: JSON.parse(json) as CompiledCircuit,
  }
}

export async function maybeGetNoirVk(
  project: Project,
  merkleTreeDepth: number,
): Promise<Buffer> {
  if (project !== Project.SEMAPHORE_NOIR)
    throw new Error(`Unsupported project '${project}'`)

  const url = getNoirArtifactUrl(`semaphore-vks/semaphore-vk-${merkleTreeDepth}`)
  const outputPath = `${tmpdir()}/snark-artifacts/semaphore-vks/semaphore-vk-${merkleTreeDepth}`
  await maybeDownload(url, outputPath)
  const vk = await fs.readFile(outputPath)

  return vk
}

export async function maybeGetBatchVkPath(
  project: Project,
  keccak?: boolean,
): Promise<string> {
  if (project !== Project.SEMAPHORE_NOIR)
    throw new Error(`Unsupported project '${project}'`)

  const suffix = keccak ? '-keccak' : ''
  const url = getNoirArtifactUrl(`/batching/vk${suffix}`)
  const outputPath = `${tmpdir()}/snark-artifacts/batching/vk${suffix}`

  await maybeDownload(url, outputPath)

  return outputPath
}

export async function maybeGetBatchSemaphoreVk(
  project: Project,
  merkleTreeDepth: number,
): Promise<string[]> {
  if (project !== Project.SEMAPHORE_NOIR)
    throw new Error(`Unsupported project '${project}'`)

  const url = getNoirArtifactUrl(`/batching/semaphore-vks-fields/semaphore-vk-${merkleTreeDepth}.json`)
  const outputPath = `${tmpdir()}/snark-artifacts/batching/semaphore-vk-${merkleTreeDepth}.json`
  await maybeDownload(url, outputPath)
  const json = await fs.readFile(outputPath, 'utf-8')

  return JSON.parse(json)
}
