/**
 * Workflow types and interfaces
 */

/**
 * Meta data for DownloadEmail workflow process item
 *
 * @property stopWhenFoundExisting - If -1, stops when email already exists in DB.
 *                                   Otherwise, maximum number of emails in DB that should be recalculated.
 */
export interface DownloadEmailMeta {
	stopWhenFoundExisting: number;
}

/**
 * Union type for WorkflowProcessItem meta field
 */
export type WorkflowProcessItemMeta = DownloadEmailMeta;
