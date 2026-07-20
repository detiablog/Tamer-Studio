import * as React from "react"
import { PageContainer } from "./PageContainer"
import { PageHeader } from "./PageHeader"
import { Breadcrumb } from "./Breadcrumb"

export function PageLayout({ title, description, breadcrumb, actions, children }: { title: React.ReactNode; description?: React.ReactNode; breadcrumb?: { label: string; href?: string }[]; actions?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <PageContainer>
      {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
      <PageHeader title={title} description={description} actions={actions} />
      <div className="transition-all duration-200">{children}</div>
    </PageContainer>
  )
}
