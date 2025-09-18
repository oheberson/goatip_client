"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import EmbeddedCheckoutWrapper from "@/components/EmbeddedCheckoutWrapper";

function CheckoutContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/subscribe"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete sua inscrição</CardTitle>
            <CardDescription className="flex flex-col space-y-2">
              <span>Pagamento seguro | Powered by Stripe</span>
              <span className="text-xs italic">
                O e-mail utilizado aqui é o mesmo para login na plataforma.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmbeddedCheckoutWrapper />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
