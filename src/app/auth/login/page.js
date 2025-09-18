"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithMagicLink } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await signInWithMagicLink(email);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Confira no seu e-mail o link de login!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/subscribe"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to subscribe
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-xl">
                G
              </span>
            </div>
            <CardTitle className="text-2xl">GOATIP</CardTitle>
            <CardDescription>
              Insira seu e-mail para receber o link para autenticação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">e-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Link"}
              </Button>
            </form>

            {message && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  message.includes("Confira no seu e-mail")
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
