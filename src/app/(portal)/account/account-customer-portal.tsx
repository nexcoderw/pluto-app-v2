"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CustomerDashboardPage } from "@/components/account/dashboard/customer-dashboard-page";
import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import type { UserAuthProfile } from "@/services/api/auth";
import { RegistrationSuccessDialog } from "./registration-success-dialog";

export function AccountCustomerPortal() {
  return (
    <Suspense fallback={null}>
      <AccountCustomerPortalContent />
    </Suspense>
  );
}
function AccountCustomerPortalContent() {
  const searchParams = useSearchParams();
  const showRegistrationDialog = searchParams.get("registered") === "success";

  return (
    <PortalAccessBoundary allowedRole="CUSTOMER">
      {(user) => (
        <CustomerPortalContent
          user={user}
          showRegistrationDialog={showRegistrationDialog}
        />
      )}
    </PortalAccessBoundary>
  );
}

function CustomerPortalContent({
  user,
  showRegistrationDialog,
}: {
  user: UserAuthProfile;
  showRegistrationDialog: boolean;
}) {
  return (
    <>
      <CustomerPortalShell user={user}>
        <CustomerDashboardPage user={user} />
      </CustomerPortalShell>

      <RegistrationSuccessDialog open={showRegistrationDialog} user={user} />
    </>
  );
}
