"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";
import { cn } from "@/lib/utils";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Votre email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@azaria.cd"
          defaultValue={state.email}
          required
          disabled={pending}
          className="h-11 font-medium"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <a
            href="#"
            className="text-xs font-medium text-muted-foreground underline-offset-4 transition-all hover:text-primary hover:underline hover:font-semibold duration-150"
          >
            Mot de passe oublié ?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            disabled={pending}
            className={cn("h-11 pr-11 ",showPassword ?'font-medium':'text-2xl font-semibold')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={
              showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="mt-2 h-12 w-full text-[0.95rem]"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Connexion…
          </>
        ) : (
          <>
            <LogIn className="size-4" aria-hidden="true" />
            Se connecter
          </>
        )}
      </Button>
    </form>
  );
}
