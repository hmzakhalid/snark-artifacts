export * from './index.shared'
import maybeGetSnarkArtifacts from './download/index.browser'
import { maybeGetCompiledNoirCircuit, maybeGetNoirVk } from './download/index.browser'
export { maybeGetCompiledNoirCircuit, maybeGetNoirVk, maybeGetSnarkArtifacts }
