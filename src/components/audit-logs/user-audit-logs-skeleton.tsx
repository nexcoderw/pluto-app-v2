import styles from "./user-audit-logs-skeleton.module.css";

const AUDIT_LOG_SKELETON_ROWS = 12;
const AUDIT_TABLE_COLUMNS = [
  "Event",
  "Status",
  "Entity",
  "Request",
  "Context",
  "Time",
];

export function UserAuditLogsSkeleton() {
  return (
    <section
      className={styles.page}
      aria-label="Loading audit logs"
      aria-busy="true"
    >
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            <i />
            <b />
          </span>
          <span className={styles.title} />
          <span className={styles.description} />
        </div>
        <span className={styles.eventCount} />
      </header>

      <div className={styles.toolbar}>
        <span className={styles.searchInput} />
        <div className={styles.controls}>
          <span className={styles.selectControl}>
            <i />
            <b />
          </span>
          <span className={styles.selectControl}>
            <i />
            <b />
          </span>
          <span className={styles.primaryButton} />
          <span className={styles.secondaryButton} />
        </div>
      </div>

      <section className={styles.tablePanel}>
        <div className={styles.tableHeader}>
          {AUDIT_TABLE_COLUMNS.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>

        {Array.from({ length: AUDIT_LOG_SKELETON_ROWS }).map((_, index) => (
          <div key={index} className={styles.tableRow}>
            <span className={styles.eventCell}>
              <i />
              <b />
            </span>
            <span className={styles.badgeStack}>
              <i />
              <b />
            </span>
            <span className={styles.textCell}>
              <i />
              <b />
            </span>
            <span className={styles.requestCell}>
              <i />
              <b />
            </span>
            <span className={styles.textCell}>
              <i />
              <b />
            </span>
            <span className={styles.timeCell}>
              <i />
              <b />
            </span>
          </div>
        ))}
      </section>

      <nav className={styles.pagination} aria-hidden="true">
        <span className={styles.paginationButton} />
        <span className={styles.pageNumbers}>
          {Array.from({ length: 5 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className={styles.paginationButton} />
      </nav>
    </section>
  );
}
