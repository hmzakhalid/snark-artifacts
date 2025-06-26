import type { Project } from '../projects';
import type { Version } from './types';
export declare const getBaseUrl: (project: Project, version: Version) => string;
export declare const getNoirArtifactUrl: (filename: string) => string;
