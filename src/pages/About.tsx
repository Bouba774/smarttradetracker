import React from 'react';
import { ArrowLeft, TrendingUp, Target, Eye, Sparkles, Shield, Heart, Rocket, BarChart3, Brain, Video, BookOpen, Trophy, Calculator, Bot, Globe, Palette, Zap, Lock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppVersionFooter } from '@/components/AppVersionFooter';
import { useLanguage } from '@/contexts/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    { icon: BarChart3, title: t('featureDashboard'), description: t('featureDashboardDesc') },
    { icon: TrendingUp, title: t('featureTradeEntry'), description: t('featureTradeEntryDesc') },
    { icon: Sparkles, title: t('featureReports'), description: t('featureReportsDesc') },
    { icon: Brain, title: t('featureEmotional'), description: t('featureEmotionalDesc') },
    { icon: Target, title: t('featurePsychology'), description: t('featurePsychologyDesc') },
    { icon: Video, title: t('featureVideoJournal'), description: t('featureVideoJournalDesc') },
    { icon: BookOpen, title: t('featureLessons'), description: t('featureLessonsDesc') },
    { icon: Trophy, title: t('featureChallenges'), description: t('featureChallengesDesc') },
    { icon: Calculator, title: t('featureCalculator'), description: t('featureCalculatorDesc') },
    { icon: Bot, title: t('featureAI'), description: t('featureAIDesc') },
  ];

  const uniqueFeatures = [
    { icon: Zap, title: t('allInOneSystem'), description: t('allInOneDesc') },
    { icon: Globe, title: t('autoCurrencyConversion'), description: t('autoCurrencyDesc') },
    { icon: Palette, title: t('cleanUX'), description: t('cleanUXDesc') },
    { icon: Brain, title: t('deepPsychology'), description: t('deepPsychologyDesc') },
    { icon: Target, title: t('builtForDiscipline'), description: t('builtForDisciplineDesc') },
  ];

  const problems = [
    { title: t('emotionalTrading'), desc: t('emotionalTradingDesc') },
    { title: t('inconsistency'), desc: t('inconsistencyDesc') },
    { title: t('overtrading'), desc: t('overtradingDesc') },
    { title: t('lackOfData'), desc: t('lackOfDataDesc') },
    { title: t('confusion'), desc: t('confusionDesc') },
  ];

  const commitments = [
    { icon: Lock, title: t('privacyProtection'), desc: t('privacyProtectionDesc') },
    { icon: Shield, title: t('noDataSale'), desc: t('noDataSaleDesc') },
    { icon: Eye, title: t('fullTransparency'), desc: t('fullTransparencyDesc') },
    { icon: Zap, title: t('secureDataHandling'), desc: t('secureDataHandlingDesc') },
  ];

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
            <TrendingUp className="w-5 h-5 text-profit" />
            <span className="font-display font-semibold text-foreground">{t('aboutSmartTradeTracker')}</span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-screen">
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 space-y-8">
          
          {/* Mission Statement */}
          <section className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('missionStatement')}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t('missionDesc')}
            </p>
          </section>

          {/* What is Smart Trade Tracker */}
          <section className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-profit/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-profit" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('whatIs')}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('whatIsDesc')}
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-profit mt-1">•</span>
                  <span><strong className="text-foreground">{problem.title}</strong> — {problem.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Our Vision */}
          <section className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('ourVision')}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t('visionDesc')}
            </p>
          </section>

          {/* Key Features */}
          <section className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('keyFeatures')}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                  <feature.icon className="w-5 h-5 text-profit shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What Makes Us Unique */}
          <section className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-profit/20 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-profit" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('whatMakesUnique')}</h2>
            </div>
            <div className="space-y-4">
              {uniqueFeatures.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <feature.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Our Commitment */}
          <section className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('ourCommitment')}</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              {commitments.map((commitment, index) => (
                <li key={index} className="flex items-start gap-3">
                  <commitment.icon className="w-4 h-4 text-profit shrink-0 mt-1" />
                  <span><strong className="text-foreground">{commitment.title}</strong> — {commitment.desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Call to Action */}
          <section className="glass-card p-6 sm:p-8 text-center bg-gradient-to-br from-primary/10 to-profit/10">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-neon">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">{t('callToAction')}</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {t('callToActionDesc')}
            </p>
            <p className="text-profit font-display font-semibold mb-4">
              {t('disciplineQuote')}
            </p>
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                {t('contactUs')}: <a href="mailto:alphafx@outlook.fr" className="text-profit hover:underline font-medium">alphafx@outlook.fr</a>
              </p>
            </div>
          </section>

          {/* Legal Information */}
          <section className="glass-card p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('legalInformation')}</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/privacy-policy" className="flex-1">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Shield className="w-4 h-4 text-profit" />
                  {t('privacyPolicy')}
                </Button>
              </Link>
              <Link to="/terms-of-use" className="flex-1">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4 text-profit" />
                  {t('termsOfService')}
                </Button>
              </Link>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('slogan')}
            </p>
            <AppVersionFooter />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default About;