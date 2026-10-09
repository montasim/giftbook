"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckmarkCircle02Icon, InformationCircleIcon, Alert02Icon, CancelCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} size={16} />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} size={16} />
        ),
        error: (
          <HugeiconsIcon icon={CancelCircleIcon} size={16} />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
