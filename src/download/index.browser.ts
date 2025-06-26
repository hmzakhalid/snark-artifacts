import { CompiledCircuit } from '@noir-lang/noir_js'
import { Project, projects } from '../projects'
import type { SnarkArtifacts, Version } from './types'
import { getBaseUrl, getNoirArtifactUrl } from './urls'

export default async function maybeGetSnarkArtifacts(
  project: Project,
  options: {
    parameters?: (bigint | number | string)[]
    version?: Version
  } = {},
): Promise<SnarkArtifacts> {
  if (!projects.includes(project)) throw new Error(`Project '${project}' is not supported`)

  options.version ??= 'latest'
  const url = getBaseUrl(project, options.version)
  const parameters = options.parameters ? `-${options.parameters.join('-')}` : ''

  return {
    wasm: `${url}${parameters}.wasm`,
    zkey: `${url}${parameters}.zkey`,
  }
}

/**
 * Download the compiled Noir circuit file.
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
  const response = await fetch(url)

  if (!response.ok)
    throw new Error(`Failed to fetch circuit: ${response.statusText}`)

  const circuit = await response.json()
  return circuit as CompiledCircuit
}

export async function maybeGetNoirVk(
  project: Project,
  merkleTreeDepth: number,
): Promise<Buffer> {
  if (project !== Project.SEMAPHORE_NOIR)
    throw new Error(`Unsupported project '${project}'`)

  const url = getNoirArtifactUrl(`semaphore-vks/semaphore-vk-${merkleTreeDepth}`)
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Failed to fetch circuit: ${response.statusText}`)
  const vk = await response.arrayBuffer()

  return Buffer.from(vk)
}
