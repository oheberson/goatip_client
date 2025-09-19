"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  X,
  ArrowLeft,
  Crown,
  ArrowRight,
  Star,
  BarChart3,
  Flag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function SubscribePage() {
  const {
    user,
    isSubscribed,
    isFreeTrial,
    trialInfo,
    signInWithMagicLink,
    signOut,
    loading,
    startFreeTrial,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const { error } = await signInWithMagicLink(email);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Confira em seu email o link de login!");
    }

    setIsLoading(false);
  };

  const handleStartFreeTrial = async () => {
    if (!user) {
      setMessage("Faça login para começar seu Teste Grátis");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await startFreeTrial(user.email);

      if (result.success) {
        setMessage(
          `🎉 Teste Grátis começou! Você tem ${result.data.daysRemaining} dias para explorar todas as funcionalidades.`
        );
      } else {
        setMessage(
          result.error || "Falha ao iniciar teste grátis. Tente novamente."
        );
      }
    } catch (error) {
      console.error("Erro iniciando teste grátis:", error);
      setMessage("Falha ao iniciar teste grátis. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      setMessage("Please log in first to subscribe");
      return;
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        const data = await response.json();

        const checkoutUrl = `/checkout`;

        window.location.href = checkoutUrl;
      } else {
        const errorData = await response.json();
        console.error("❌ API error response:", errorData);
        setMessage("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      setMessage("Error creating checkout session. Please try again.");
    }
  };

  const features = [
    {
      name: "Análise automatizada de times fantasy",
      description:
        "Compare variações e tenha insights sobre diferentes formações.",
      icon: <Flag className="w-6 h-6" />,
    },
    {
      name: "Análise avançada de jogadores",
      description:
        "Descubra insights por jogador de acordo com performance e comparação em toda a liga.",
      icon: <BarChart3 className="w-6 h-6" />,
    },
    {
      name: "Tips de valor",
      description:
        "Reduza a exposição a riscos desnecessários com uma curadoria de ofertas em diferentes mercados.",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      name: "Suporte ao desenvolvimento",
      description:
        "Dê sugestões de melhorias contínua e receba melhorias continuamente.",
      icon: <Star className="w-6 h-6" />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  G
                </span>
              </div>
              <h1 className="text-xl font-bold">GOATIP</h1>
            </div>
            {user && (
              <Button variant="outline" size="sm" onClick={signOut}>
                Sair
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8">
        {user && !isSubscribed && (
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        )}
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Melhore suas Análises</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Tenha acesso a todas as funcionalidades e potencialize o valor de
              suas escolhas seja como jogador fantasy ou punter.
            </p>

            {!user && (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Insira seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
                      required
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Enviando..." : "Entrar"}
                    </Button>
                  </div>
                  {message && (
                    <p
                      className={`text-sm ${
                        message.includes("Confira em seu")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </form>
                <p className="text-sm text-muted-foreground mt-2">
                  Não é necessário senha, autentique-se através do link enviado
                  no seu email.
                </p>
              </div>
            )}
          </div>

          {user && !isSubscribed && (
            <div className="space-y-4 text-center mb-8">
              <p className="text-muted-foreground">
                Você está logado! Se inscreva agora para ter acesso a todas as
                funcionalidades.
              </p>
              <div className="flex flex-col gap-3 justify-center items-center">
                <Button
                  size="lg"
                  onClick={handleStartFreeTrial}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                  disabled={isLoading}
                >
                  Começar Teste Grátis (7 dias)
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubscribe}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Inscreva-se agora
                </Button>
              </div>
            </div>
          )}

          {/* Free Trial Status */}
          {user && isFreeTrial && (
            <div className="space-y-4 text-center mb-8">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    Teste Grátis Ativo
                  </h3>
                </div>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  Você tem{" "}
                  <strong>
                    {trialInfo?.daysRemaining || 0} dias restantes
                  </strong>{" "}
                  para explorar todas as funcionalidades!
                </p>
                <Button
                  size="lg"
                  onClick={handleSubscribe}
                  className="bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Inscreva-se Agora
                </Button>
              </div>
            </div>
          )}

          {/* Pricing Section */}
          <div className="text-center mb-12">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-4xl mx-auto">
              {/* Premium Plan */}
              <Card className="border-2 border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Crown className="w-6 h-6 text-primary" />
                    Acesso Premium
                  </CardTitle>
                  <CardDescription className="flex justify-start">
                    Acesso completo à todas as funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Features Grid */}
                  <div className="flex flex-col gap-6 mb-12">
                    {features.map((feature, index) => (
                      <Card
                        key={index}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                              {feature.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-left text-lg mb-2">
                                {feature.name}
                              </h3>
                              <p className="text-left text-muted-foreground">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          {user ? (
            <div className="text-center">
              {isSubscribed ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600">
                    Tudo pronto!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Você tem acesso completo na plataforma. Aproveite!
                  </p>
                  <Link href="/">
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 mt-6"
                    >
                      Ir para o App
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Pronto para o upgrade?</h3>
                  <p className="text-muted-foreground mb-6">
                    Você está logado! Se inscreva agora para ter acesso a todas
                    as funcionalidades.
                  </p>
                  <Button
                    size="lg"
                    onClick={handleSubscribe}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Inscreva-se agora
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
              <p className="text-muted-foreground mb-6">
                Insira o seu e-mail para acessar e se inscreva para as
                funcionalidades exclusivas.
              </p>
              <div className="max-w-md mx-auto">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Insira seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
                      required
                    />
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Enviando..." : "Entrar"}
                    </Button>
                  </div>
                  {message && (
                    <p
                      className={`text-sm ${
                        message.includes("Confira em seu")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {message}
                    </p>
                  )}
                </form>
                <p className="text-sm text-muted-foreground mt-2">
                  Não é necessário senha, autentique-se através do link enviado
                  no seu email.
                </p>
              </div>
            </div>
          )}

          {/* Security Note */}
          <div className="mt-12 text-center">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Pagamento Seguro
                </h4>
                <p className="text-sm text-justify text-blue-700 dark:text-blue-300">
                  Todas as transações são processadas pela plataforma Stripe de
                  modo seguro. As seguintes moedas são suportadas: (USD, EUR,
                  BRL) de acordo com sua localidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
