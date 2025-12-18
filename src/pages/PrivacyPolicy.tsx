import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const PrivacyPolicy: React.FC = () => {
  const { language } = useLanguage();

  const contentFR = (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-2">RÈGLES DE CONFIDENTIALITÉ (Politique de Confidentialité) — RGPD</h1>
      <p className="text-muted-foreground mb-6">Dernière mise à jour : 18/12/2025</p>
      
      <p className="mb-6">
        La présente Politique de Confidentialité explique comment Smart Trade Tracker (« l'Application », « nous ») collecte, utilise, protège et traite les données personnelles de ses utilisateurs (« vous »). Nous nous engageons à respecter le Règlement Général sur la Protection des Données (RGPD) et toutes les lois applicables.
      </p>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Données collectées</h2>
      <p className="mb-4">Nous collectons uniquement les données nécessaires au fonctionnement de l'application.</p>

      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.1 Données fournies par l'utilisateur</h3>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Pseudo, email, photo de profil optionnelle</li>
        <li>Informations liées au trading : trades, notes, journaux, statistiques, vidéos/audio, images</li>
        <li>Préférences : langue, devise (parmi 51), thème, paramètres d'affichage</li>
        <li>Paramètres de sécurité : code PIN (hashé), préférences biométriques, timeout de verrouillage</li>
        <li>Objectifs de trading : objectifs hebdomadaires et mensuels</li>
      </ul>

      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.2 Données de sécurité</h3>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Appareils connus (empreinte de l'appareil pour détection de nouveaux appareils)</li>
        <li>Historique des tentatives de connexion PIN</li>
        <li>Alertes de sécurité envoyées par email</li>
      </ul>

      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.3 Données techniques</h3>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Identifiant unique de l'app (non identifiable personnellement)</li>
        <li>Modèle de l'appareil, système d'exploitation</li>
        <li>Journaux d'erreur et données de performance</li>
      </ul>

      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.4 Aucune donnée sensible</h3>
      <p className="text-muted-foreground mb-4">Nous ne collectons pas de données liées à la santé, religion, localisation GPS ou informations bancaires.</p>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Finalités du traitement</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Fonctionnement de l'application et de toutes ses fonctionnalités</li>
        <li>Calcul de statistiques et analyses psychologiques</li>
        <li>Génération de résumés IA personnalisés</li>
        <li>Synchronisation des paramètres entre appareils</li>
        <li>Protection de votre compte (PIN, biométrie, alertes de sécurité)</li>
        <li>Amélioration continue et correction de bugs</li>
        <li>Aucune revente ou partage de données personnelles</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Base légale</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Exécution du service demandé</li>
        <li>Consentement explicite lors de l'inscription</li>
        <li>Intérêt légitime pour la sécurité et l'amélioration du service</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Stockage et sécurité</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Données cryptées en transit et au repos</li>
        <li>Serveurs sécurisés avec restrictions d'accès</li>
        <li>Code PIN stocké sous forme hashée (jamais en clair)</li>
        <li>Synchronisation sécurisée entre appareils</li>
        <li>Alertes automatiques en cas de connexion suspecte</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Durée de conservation</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Données conservées tant que le compte existe</li>
        <li>Suppression possible à tout moment via les paramètres</li>
        <li>Option de suppression complète de toutes les données</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">6. Partage des données</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Aucune vente de données personnelles</li>
        <li>Données techniques anonymisées uniquement pour amélioration du service</li>
        <li>Aucun partage avec des tiers à des fins publicitaires</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">7. Vos droits (RGPD)</h2>
      <p className="text-muted-foreground mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Droit d'accès à vos données</li>
        <li>Droit de rectification</li>
        <li>Droit d'opposition au traitement</li>
        <li>Droit à l'effacement (suppression du compte)</li>
        <li>Droit à la portabilité (export PDF)</li>
        <li>Droit à la limitation du traitement</li>
      </ul>
      <p className="text-muted-foreground mb-4">
        Pour exercer ces droits : <a href="mailto:alphafx@outlook.fr" className="text-profit hover:underline">alphafx@outlook.fr</a>
      </p>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">8. Cookies et stockage local</h2>
      <p className="mb-4">Notre application utilise uniquement des cookies fonctionnels essentiels et le stockage local :</p>
      
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Préférences utilisateur (langue, thème, devise)</li>
        <li>État de connexion et authentification</li>
        <li>Consentement aux cookies</li>
        <li>Données temporaires de verrouillage PIN (locales uniquement)</li>
        <li>Cache de données pour performance</li>
      </ul>

      <p className="text-muted-foreground mb-4">
        <strong>Aucun cookie publicitaire ou de suivi tiers n'est utilisé.</strong> Nous respectons votre vie privée.
      </p>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">9. Contact</h2>
      <p className="text-muted-foreground mb-4">
        Pour toute question concernant cette politique : <a href="mailto:alphafx@outlook.fr" className="text-profit hover:underline">alphafx@outlook.fr</a>
      </p>
    </>
  );

  const contentEN = (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-2">PRIVACY POLICY — GDPR COMPLIANT</h1>
      <p className="text-muted-foreground mb-6">Last updated: 18/12/2025</p>
      
      <p className="mb-6">
        This Privacy Policy explains how Smart Trade Tracker ("the Application", "we") collects, uses, protects, and processes personal data of its users ("you"). We comply with the General Data Protection Regulation (GDPR) and applicable laws.
      </p>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Data collected</h2>
      <p className="mb-4">We only collect data necessary for the application to function properly.</p>

      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.1 User-provided data</h3>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Username, email, optional profile photo</li>
        <li>Trading information: trades, notes, journals, statistics, videos/audio, images</li>
        <li>Preferences: language, currency (among 51), theme, display settings</li>
        <li>Security settings: PIN code (hashed), biometric preferences, lock timeout</li>
        <li>Trading objectives: weekly and monthly goals</li>
      </ul>

      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.2 Security data</h3>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Known devices (device fingerprint for new device detection)</li>
        <li>PIN login attempt history</li>
        <li>Security alerts sent via email</li>
      </ul>

      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.3 Technical data</h3>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Unique app identifier (not personally identifiable)</li>
        <li>Device model, operating system</li>
        <li>Error logs and performance data</li>
      </ul>

      <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">1.4 No sensitive data</h3>
      <p className="text-muted-foreground mb-4">We do not collect health, religion, GPS location or banking information.</p>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Purpose of processing</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Application functionality and all features</li>
        <li>Statistics calculation and psychological analysis</li>
        <li>Personalized AI summary generation</li>
        <li>Settings synchronization across devices</li>
        <li>Account protection (PIN, biometrics, security alerts)</li>
        <li>Continuous improvement and bug fixes</li>
        <li>No selling or sharing of personal data</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Legal basis</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Performance of requested service</li>
        <li>Explicit consent during registration</li>
        <li>Legitimate interest for security and service improvement</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Storage and security</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Data encrypted in transit and at rest</li>
        <li>Secure servers with access restrictions</li>
        <li>PIN code stored as hash (never in plain text)</li>
        <li>Secure synchronization between devices</li>
        <li>Automatic alerts for suspicious login</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Retention period</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Data stored as long as account exists</li>
        <li>Deletion possible at any time via settings</li>
        <li>Option to completely delete all data</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">6. Data sharing</h2>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>No selling of personal data</li>
        <li>Anonymized technical data only for service improvement</li>
        <li>No sharing with third parties for advertising purposes</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">7. Your rights (GDPR)</h2>
      <p className="text-muted-foreground mb-4">Under GDPR, you have the following rights:</p>
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>Right of access to your data</li>
        <li>Right to rectification</li>
        <li>Right to object to processing</li>
        <li>Right to erasure (account deletion)</li>
        <li>Right to portability (PDF export)</li>
        <li>Right to restriction of processing</li>
      </ul>
      <p className="text-muted-foreground mb-4">
        To exercise these rights: <a href="mailto:alphafx@outlook.fr" className="text-profit hover:underline">alphafx@outlook.fr</a>
      </p>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">8. Cookies and local storage</h2>
      <p className="mb-4">Our application uses only essential functional cookies and local storage:</p>
      
      <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground">
        <li>User preferences (language, theme, currency)</li>
        <li>Login state and authentication</li>
        <li>Cookie consent status</li>
        <li>Temporary PIN lock data (local only)</li>
        <li>Data cache for performance</li>
      </ul>

      <p className="text-muted-foreground mb-4">
        <strong>No advertising or third-party tracking cookies are used.</strong> We respect your privacy.
      </p>

      <h2 className="text-xl font-bold text-foreground mt-8 mb-4">9. Contact</h2>
      <p className="text-muted-foreground mb-4">
        For any questions regarding this policy: <a href="mailto:alphafx@outlook.fr" className="text-profit hover:underline">alphafx@outlook.fr</a>
      </p>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-profit" />
            <span className="font-display font-semibold text-foreground">
              {language === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-screen">
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
          <div className="glass-card p-6 sm:p-8">
            {language === 'fr' ? contentFR : contentEN}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PrivacyPolicy;
