import styles from "./customer-favorites-skeleton.module.css";

const FAVORITE_SKELETON_CARDS = 9;

export function CustomerFavoritesSkeleton() {
  return (
    <section
      className={styles.page}
      aria-label="Loading favorite listings"
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
        <span className={styles.savedCount} />
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
          <span className={styles.filterButton} />
          <span className={styles.resetButton} />
        </div>
      </div>

      <div className={styles.grid}>
        {Array.from({ length: FAVORITE_SKELETON_CARDS }).map((_, index) => (
          <article key={index} className={styles.card} aria-hidden="true">
            <div className={styles.favoriteMediaFrame}>
              <div className={styles.media}>
                <span className={styles.image} />
                <span className={styles.categoryPill} />
                <span className={styles.removeButton} />
                <div className={styles.imageCaption}>
                  <span>
                    <i />
                    <b />
                  </span>
                  <em />
                </div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardMeta}>
                <span>
                  <i />
                  <b />
                </span>
                <span>
                  <i />
                  <b />
                </span>
                <span>
                  <i />
                  <b />
                </span>
              </div>
              <div className={styles.savedPanel}>
                <i />
                <span>
                  <b />
                  <em />
                </span>
                <strong />
              </div>
            </div>
          </article>
        ))}
      </div>

      <nav className={styles.pagination} aria-hidden="true">
        <span className={styles.paginationArrow} />
        <span className={styles.pageNumbers}>
          {Array.from({ length: 5 }).map((_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className={styles.paginationArrow} />
      </nav>
    </section>
  );
}
