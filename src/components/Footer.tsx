import { Github, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="container px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <img src="/AlterNumIA_light.webp" alt="AlterNumIA Logo" className="h-6 w-auto dark:hidden" />
            <img src="/AlterNumIA_Darkmode.webp" alt="AlterNumIA Logo" className="h-6 w-auto hidden dark:block" />
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                © {currentYear} Hub Sobriété Numérique
              </p>
              <p className="text-xs text-muted-foreground">
                Projet Open Source • Gratuit et accessible à tous
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/jeremylatorre/digital-sobriety-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Voir le projet sur GitHub"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="mailto:contact@alternumia.fr"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Nous contacter par email"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
