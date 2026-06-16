import type { CSSProperties } from "react";
import styles from "./customer-dashboard-skeleton.module.css";

export function CustomerDashboardSkeleton() {
  return (
    <section className={styles.page} aria-label="Loading customer dashboard">
      <div className={styles.hero}>
        <div>
          <span className={styles.pill} />
          <span className={styles.title} />
          <span className={styles.copy} />
        </div>
        <div className={styles.toolbar}>
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainPanel}>
          <div className={styles.panelHeader}>
            <span />
            <span />
          </div>
          <div className={styles.chart}>
            {Array.from({ length: 8 }, (_, index) => (
              <i
                key={index}
                style={
                  {
                    "--height": `${36 + index * 6}%`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>

        <div className={styles.metricStack}>
          {Array.from({ length: 4 }, (_, index) => (
            <article key={index} className={styles.metricCard}>
              <span />
              <strong />
              <small />
            </article>
          ))}
        </div>

        <div className={styles.wideCard}>
          <span />
          <div>
            {Array.from({ length: 4 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>

        <div className={styles.sideCard}>
          <span />
          {Array.from({ length: 3 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
