import { Skeleton } from "@/components/ui/skeleton";
import shellStyles from "@/components/account/customer-portal-shell.module.css";
import styles from "./account-profile-page.module.css";

export function AccountProfileSkeleton() {
  return (
    <main className={shellStyles.page}>
      <section className={shellStyles.frame} aria-label="Loading profile">
        <aside className={shellStyles.sidebar}>
          <Skeleton className={styles.skeletonShellBrand} />
          <Skeleton className={styles.skeletonShellNav} />
        </aside>

        <div className={shellStyles.workspace}>
          <Skeleton className={styles.skeletonShellTopbar} />

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
