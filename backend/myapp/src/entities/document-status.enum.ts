/** Lifecycle of a purchase or sale. Cancelled documents no longer affect stock or reports. */
export enum DocumentStatus {
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
