export declare enum Project {
    POSEIDON = "poseidon",
    SEMAPHORE = "semaphore",
    SEMAPHORE_IDENTITY = "semaphore-identity",
    SEMAPHORE_NOIR = "semaphore-noir"
}
export declare const projects: Project[];
export declare function getAvailableVersions(project: Project): Promise<string[]>;
