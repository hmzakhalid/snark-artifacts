import type { Project } from '../projects'
import type { Version } from './types'

const BASE_URL = 'https://snark-artifacts.pse.dev'
const NOIR_BASE_URL = 'https://hashcloak.github.io/noir-artifacts-host'

export const getBaseUrl = (project: Project, version: Version) => `${BASE_URL}/${project}/${version}/${project}`

export const getNoirArtifactUrl = (filename: string): string => `${NOIR_BASE_URL}/${filename}`
