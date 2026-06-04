import { Skeleton } from "@/components/ui/skeleton";
import portalStyles from "@/components/portal/portal-shell.module.css";
import styles from "./account-profile-page.module.css";

export function AccountProfileSkeleton() {
  return (
    <main className={portalStyles.portalPage} data-variant="customer">
      <section
        className={portalStyles.portalFrame}
        aria-label="Loading profile"
      >
        <aside className={portalStyles.sidebar}>
          <Skeleton className={portalStyles.skeletonBrand} />
          <Skeleton className={portalStyles.skeletonNav} />
        </aside>

        <div className={portalStyles.portalShell}>
          <Skeleton className={portalStyles.skeletonTopbar} />

          <section className={styles.profileLayout}>
            <aside className={styles.tabsSidebar} aria-label="Loading settings">
              <section className={styles.skeletonImagePanel}>
                <div className={styles.skeletonAvatarWrap}>
                  <Skeleton className={styles.skeletonProfileAvatar} />
                  <Skeleton className={styles.skeletonCameraBadge} />
                </div>
                <Skeleton className={styles.skeletonEyebrow} />
                <Skeleton className={styles.skeletonName} />
                <Skeleton className={styles.skeletonCopy} />
                <Skeleton className={styles.skeletonUploadButton} />
                <div className={styles.skeletonRules}>
                  <Skeleton />
                  <Skeleton />
                </div>
              </section>

              <div className={styles.skeletonTabs}>
                <Skeleton />
                <Skeleton />
              </div>
            </aside>

            <section className={styles.detailsPanel}>
              <div className={styles.skeletonHeader}>
                <Skeleton className={styles.skeletonEyebrow} />
                <Skeleton className={styles.skeletonTitle} />
                <Skeleton className={styles.skeletonDescription} />
              </div>

              <div className={styles.formGrid}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className={styles.skeletonField}>
                    <Skeleton className={styles.skeletonLabel} />
                    <Skeleton className={styles.skeletonInput} />
                  </div>
                ))}
              </div>

              <div className={styles.skeletonFooter}>
                <Skeleton className={styles.skeletonFooterCopy} />
                <Skeleton className={styles.skeletonSaveButton} />
              </div>
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}
