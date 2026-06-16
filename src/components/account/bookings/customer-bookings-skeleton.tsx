import styles from "./customer-bookings-skeleton.module.css";

const BOOKING_SKELETON_ROWS = 10;
const BOOKING_TABLE_COLUMNS = [
  "Booking",
  "Dates",
  "Total",
  "Status",
  "Payment",
  "Action",
];

export function CustomerBookingsSkeleton() {
  return (
    <section
      className={styles.page}
      aria-label="Loading customer bookings"
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
        <span className={styles.countBadge} />
      </header>

      <div className={styles.toolbar}>
        <span className={styles.searchInput} />
        <div className={styles.controls}>
          <span className={styles.selectControl} />
          <span className={styles.selectControl} />
          <span className={styles.selectControl} />
          <span className={styles.primaryButton} />
          <span className={styles.secondaryButton} />
        </div>
      </div>

      <section className={styles.tablePanel}>
        <table className={styles.table}>
          <thead>
            <tr>
              {BOOKING_TABLE_COLUMNS.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: BOOKING_SKELETON_ROWS }).map((_, index) => (
              <tr key={index}>
                <td>
                  <span className={styles.primaryLine} />
                  <span className={styles.secondaryLine} />
                </td>
                <td>
                  <span className={styles.dateLine} />
                  <span className={styles.shortLine} />
                </td>
                <td>
                  <span className={styles.amountLine} />
                  <span className={styles.secondaryLine} />
                </td>
                <td>
                  <span className={styles.statusPill} />
                </td>
                <td>
                  <span className={styles.paymentLine} />
                </td>
                <td>
                  <span className={styles.actionButton} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
