import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InstallButton } from '@/components/pwa/InstallButton';
import { Plane, MessageCircle, MapPin, Sparkles, Smartphone, Zap, Globe } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-ocean mb-6 animate-pulse-glow">
              <Plane className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-ocean bg-clip-text text-transparent animate-slide-in-left">
            Zaplanuj swoją wymarzoną podróż z pomocą AI
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-slide-in-right">
            Inteligentny asystent podróży, który pomoże Ci wybrać idealną lokalizację, 
            zaplanować atrakcje i stworzyć kompletny plan podróży dostosowany do Twoich preferencji.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-ocean hover:opacity-90 transition-opacity"
              onClick={() => navigate('/auth')}
            >
              <Sparkles className="w-5 h-5" />
              Rozpocznij planowanie
            </Button>
            <InstallButton variant="outline" size="lg" className="text-lg px-8 py-6" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-ocean bg-clip-text text-transparent">
            Jak to działa?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-elegant transition-all">
              <div className="w-16 h-16 rounded-2xl bg-gradient-ocean flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Opowiedz o preferencjach</h3>
              <p className="text-muted-foreground">
                Porozmawiaj z naszym AI asystentem o tym, czego szukasz w swojej podróży. 
                Odpowiedz na kilka prostych pytań o swoje preferencje.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-elegant transition-all">
              <div className="w-16 h-16 rounded-2xl bg-gradient-ocean flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Wybierz lokalizację</h3>
              <p className="text-muted-foreground">
                Otrzymaj spersonalizowane rekomendacje miejsc idealnie dopasowanych 
                do Twoich oczekiwań. Wybierz tę, która najbardziej Ci się podoba.
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-elegant transition-all">
              <div className="w-16 h-16 rounded-2xl bg-gradient-ocean flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Zaplanuj szczegóły</h3>
              <p className="text-muted-foreground">
                Oceń proponowane atrakcje, dostosuj plan do swoich potrzeb i otrzymaj 
                kompletne podsumowanie podróży z wszystkimi szczegółami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-ocean bg-clip-text text-transparent">
            Funkcje aplikacji
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <Sparkles className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Inteligentny AI</h3>
              <p className="text-muted-foreground text-sm">
                Zaawansowany asystent AI dostosowuje rekomendacje do Twoich preferencji
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <Globe className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Spersonalizowane</h3>
              <p className="text-muted-foreground text-sm">
                Każda podróż jest unikalna i dopasowana dokładnie do Twoich oczekiwań
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <Smartphone className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Dostępność offline</h3>
              <p className="text-muted-foreground text-sm">
                Zainstaluj aplikację i korzystaj z niej nawet bez połączenia z internetem
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Szybkie planowanie</h3>
              <p className="text-muted-foreground text-sm">
                Zaplanuj całą podróż w kilka minut dzięki inteligentnym sugestiom
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-ocean">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Gotowy na przygodę?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Zainstaluj aplikację lub rozpocznij planowanie już teraz
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              <Sparkles className="w-5 h-5" />
              Rozpocznij teraz
            </Button>
            <InstallButton variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 text-white border-white/20 hover:bg-white/20" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-card/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-ocean flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
              TravelAI
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 TravelAI. Inteligentny asystent podróży.
          </p>
        </div>
      </footer>
    </div>
  );
}
