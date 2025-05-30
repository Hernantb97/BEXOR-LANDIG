import { Avatar } from "@/components/ui/avatar"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  initials?: string
  colorCategory?: "default" | "important" | "urgent" | "completed"
  size?: "sm" | "md" | "lg"
  className?: string
  showUserIcon?: boolean
  isBotActive?: boolean
}

export function UserAvatar({
  initials,
  colorCategory = "default",
  size = "md",
  className,
  showUserIcon = false,
  isBotActive = false,
}: UserAvatarProps) {
  // Color backgrounds based on category
  const categoryColors = {
    important: "bg-[#2188f3] text-white dark:bg-[#2188f3] dark:text-white",
    urgent: "bg-red-500 text-white dark:bg-red-600 dark:text-white",
    completed: "bg-green-500 text-white dark:bg-green-600 dark:text-white",
    default: "bg-[#f2e8df] text-[#2e3c53] dark:bg-[#4e6b95] dark:text-white",
  };

  // Define sizes
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  // Define icon sizes
  const iconSizeMap = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  }

  return (
    <Avatar className={cn(sizeMap[size], categoryColors[colorCategory], "flex items-center justify-center", className)}>
      {showUserIcon ? (
        isBotActive ? (
          <Bot className={cn(iconSizeMap[size], "flex-shrink-0")} />
        ) : (
          <User className={cn(iconSizeMap[size], "flex-shrink-0")} />
        )
      ) : initials ? (
        <span className="font-semibold text-base">{initials}</span>
      ) : (
        <User className={cn(iconSizeMap[size], "flex-shrink-0")} />
      )}
    </Avatar>
  )
}

