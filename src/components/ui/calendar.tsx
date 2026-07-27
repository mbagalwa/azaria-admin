"use client";

import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Calendrier stylé maison au-dessus de react-day-picker (v10), sans sa feuille
 * de style : tout passe par `classNames`. Gère le mode plage (range).
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("relative p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "space-y-3",
        nav: "absolute inset-x-3 top-3 z-10 flex items-center justify-between",
        button_previous:
          "flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
        button_next:
          "flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-semibold capitalize text-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-center text-xs font-medium capitalize text-muted-foreground",
        week: "mt-1 flex",
        day: "relative p-0 text-center",
        day_button:
          "flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none",
        today: "[&>button]:ring-1 [&>button]:ring-primary/50",
        outside: "[&>button]:text-muted-foreground/40",
        disabled: "[&>button]:opacity-30",
        hidden: "invisible",
        selected: "",
        range_start:
          "rounded-l-lg bg-primary/10 [&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary",
        range_middle:
          "rounded-none bg-primary/10 [&>button:hover]:bg-primary/20",
        range_end:
          "rounded-r-lg bg-primary/10 [&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-primary",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4" aria-hidden="true" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
