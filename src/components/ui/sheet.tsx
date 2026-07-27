"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

/** Panneau latéral (droite) construit sur le Dialog base-ui. */

function Sheet(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetContent({
  className,
  children,
  showClose = true,
  ...props
}: DialogPrimitive.Popup.Props & { showClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] transition-all data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-border bg-card p-5 shadow-xl outline-none duration-200 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right sm:p-6",
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            aria-label="Fermer"
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1 pr-8", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
