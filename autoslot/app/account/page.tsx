import { AccountSettings } from '@/components/account/account-settings'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default function AccountPage() {
  return (
    <DashboardShell>
      <AccountSettings />
    </DashboardShell>
  )
}
