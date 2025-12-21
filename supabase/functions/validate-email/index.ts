import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Trusted email providers (non-exhaustive - we accept most domains)
const TRUSTED_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'yahoo.fr', 'yahoo.co.uk', 'ymail.com', 'rocketmail.com',
  'protonmail.com', 'proton.me', 'pm.me', 'tutanota.com', 'tuta.io',
  'icloud.com', 'me.com', 'mac.com', 'zoho.com', 'zohomail.com',
  'aol.com', 'gmx.com', 'gmx.de', 'gmx.fr', 'mail.com', 'email.com',
  'yandex.com', 'yandex.ru', 'mail.ru', 'inbox.ru', 'list.ru', 'bk.ru',
  'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'bbox.fr',
  't-online.de', 'web.de', 'posteo.de', 'mailbox.org',
  'bluewin.ch', 'sunrise.ch', 'hispeed.ch',
  'libero.it', 'virgilio.it', 'alice.it', 'tin.it',
  'fastmail.com', 'fastmail.fm', 'runbox.com', 'mailfence.com',
  'hushmail.com', 'startmail.com', 'countermail.com',
  'qq.com', '163.com', '126.com', 'sina.com', 'sohu.com', 'aliyun.com',
  'naver.com', 'daum.net', 'hanmail.net',
  'cox.net', 'verizon.net', 'att.net', 'sbcglobal.net', 'comcast.net',
  'btinternet.com', 'sky.com', 'talktalk.net', 'ntlworld.com',
]);

// Known disposable email domains (comprehensive list)
const DISPOSABLE_DOMAINS = new Set([
  // Major disposable services
  'tempmail.com', 'temp-mail.org', 'tempmail.net', 'temp-mail.io',
  'guerrillamail.com', 'guerrillamail.org', 'guerrillamail.net', 'guerrillamailblock.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.info', 'pokemail.net', 'spam4.me',
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailinator2.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minemail.com',
  'throwaway.email', 'throwawaymail.com', 'throam.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
  'nada.email', 'dispostable.com', 'maildrop.cc', 'mailnesia.com',
  'getairmail.com', 'getnada.com', 'tempail.com', 'tempr.email', 'discard.email',
  'fakeinbox.com', 'fakemailgenerator.com', 'emailondeck.com',
  'mohmal.com', 'mailcatch.com', 'mytemp.email', 'tempmailaddress.com',
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'trash-mail.com',
  'spam.la', 'spamgourmet.com', 'spamex.com', 'spamfree24.org',
  'bugmenot.com', 'mailexpire.com', 'tempinbox.com', 'incognitomail.com',
  'anonymbox.com', 'emailtemporaire.fr', 'emailtemporaire.com',
  'mintemail.com', 'mt2009.com', 'mt2014.com', 'thankyou2010.com',
  'putthisinyourspamdatabase.com', 'sendspamhere.com', 'spamherelots.com',
  'binkmail.com', 'safetymail.info', 'veryrealemail.com',
  'mailnull.com', 'e4ward.com', 'spambox.us', 'spambox.info',
  'spamobox.com', 'kasmail.com', 'spamday.com', 'spamify.com',
  'imgof.com', 'imstations.com', 'bofthew.com', 'maboard.com',
  'sofimail.com', 'soisz.com', 'sute.jp', 'wegwerfmail.de', 'wegwerfmail.net',
  'byom.de', 'trashmail.de', 'spambog.com', 'spambog.de', 'spambog.ru',
  'hulapla.de', 'teleworm.us', 'superrito.com', 'armyspy.com',
  'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com',
  'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
  'disbox.net', 'disbox.org', 'dropmail.me', 'emailfake.com', 'emkei.cz',
  'fakemail.fr', 'filzmail.com', 'gishpuppy.com', 'haltospam.com',
  'imgv.de', 'jetable.com', 'jetable.net', 'jetable.org',
  'klassmaster.com', 'klassmaster.net', 'klzlv.com', 'koszmail.pl',
  'kulturbetrieb.info', 'kurzepost.de', 'lhsdv.com', 'lifebyfood.com',
  'link2mail.net', 'litedrop.com', 'lol.ovpn.to', 'lookugly.com',
  'mailbucket.org', 'mailcatch.com', 'mailde.de', 'mailde.info', 'maildu.de',
  'mailforspam.com', 'mailin8r.com', 'mailismagic.com', 'mailmoat.com',
  'mailnator.com', 'mailsac.com', 'mailscrap.com', 'mailseal.de',
  'mailshell.com', 'mailsiphon.com', 'mailslite.com', 'mailtemp.info',
  'mailtothis.com', 'mailzilla.com', 'mailzilla.org', 'mbx.cc',
  'mega.zik.dj', 'meltmail.com', 'mierdamail.com', 'mintemail.com',
  'mjukgansen.nu', 'mobi.web.id', 'mobileninja.co.uk', 'moburl.com',
  'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf', 'msa.minsmail.com',
  'mypartyclip.de', 'myphantomemail.com', 'mysamp.de', 'myspaceinc.com',
  'myspaceinc.net', 'myspacepimpedup.com', 'mytrashmail.com', 'neomailbox.com',
  'nervmich.net', 'nervtmansen.de', 'netmails.com', 'netmails.net',
  'netzidiot.de', 'neverbox.com', 'no-spam.ws', 'nobulk.com',
  'noclickemail.com', 'nogmailspam.info', 'nomail.xl.cx', 'nomail2me.com',
  'nomorespamemails.com', 'nospam.ze.tc', 'nospam4.us', 'nospamfor.us',
  'nospammail.net', 'nospamthanks.info', 'notmailinator.com', 'nowhere.org',
  'nowmymail.com', 'ntlhelp.net', 'nullbox.info', 'objectmail.com',
  'obobbo.com', 'odnorazovoe.ru', 'ohaaa.de', 'omail.pro',
  'oneoffemail.com', 'onewaymail.com', 'onlatedotcom.info', 'online.ms',
  'oopi.org', 'opayq.com', 'ordinaryamerican.net', 'otherinbox.com',
  'ourklips.com', 'outlawspam.com', 'ovpn.to', 'owlpic.com',
  'pancakemail.com', 'pjjkp.com', 'plexolan.de', 'poczta.onet.pl',
  'politikerclub.de', 'poofy.org', 'pookmail.com', 'privacy.net',
  'privatdemail.net', 'proxymail.eu', 'prtnx.com', 'punkass.com',
  'putthisinyourspamdatabase.com', 'pwrby.com', 'qisdo.com', 'qisoa.com',
  'quickinbox.com', 'quickmail.nl', 'rcpt.at', 'reallymymail.com',
  'realtyalerts.ca', 'recode.me', 'recursor.net', 'recyclemail.dk',
  'regbypass.com', 'regbypass.comsafe-mail.net', 'rejectmail.com',
  'reliable-mail.com', 'remail.cf', 'remail.ga', 'rhyta.com',
  'rklips.com', 'rmqkr.net', 'rppkn.com', 'rtrtr.com', 's0ny.net',
  'safe-mail.net', 'safersignup.de', 'safetymail.info', 'safetypost.de',
  'sandelf.de', 'saynotospams.com', 'schafmail.de', 'schrott-email.de',
  'secretemail.de', 'secure-mail.biz', 'senseless-entertainment.com',
  'services391.com', 'sharklasers.com', 'shieldemail.com', 'shiftmail.com',
  'shitmail.me', 'shortmail.net', 'shut.name', 'shut.ws', 'sibmail.com',
  'sinnlos-mail.de', 'siteposter.net', 'skeefmail.com', 'slaskpost.se',
  'slopsbox.com', 'smashmail.de', 'smellfear.com', 'snakemail.com',
  'sneakemail.com', 'sneakmail.de', 'snkmail.com', 'sofimail.com',
  'sofort-mail.de', 'sogetthis.com', 'soodonims.com', 'spam.la',
  'spam.su', 'spam4.me', 'spamail.de', 'spamarrest.com', 'spamavert.com',
  'spambob.com', 'spambob.net', 'spambob.org', 'spambog.com', 'spambog.de',
  'spambog.net', 'spambog.ru', 'spambox.info', 'spambox.irishspringrealty.com',
  'spambox.us', 'spamcannon.com', 'spamcannon.net', 'spamcero.com',
  'spamcon.org', 'spamcorptastic.com', 'spamcowboy.com', 'spamcowboy.net',
  'spamcowboy.org', 'spamday.com', 'spamex.com', 'spamfree.eu', 'spamfree24.com',
  'spamfree24.de', 'spamfree24.eu', 'spamfree24.info', 'spamfree24.net',
  'spamfree24.org', 'spamgoes.in', 'spamgourmet.com', 'spamgourmet.net',
  'spamgourmet.org', 'spamherelots.com', 'spamhereplease.com', 'spamhole.com',
  'spamify.com', 'spaminator.de', 'spamkill.info', 'spaml.com', 'spaml.de',
  'spammotel.com', 'spamobox.com', 'spamoff.de', 'spamsalad.in',
  'spamslicer.com', 'spamspot.com', 'spamstack.net', 'spamthis.co.uk',
  'spamthisplease.com', 'spamtrail.com', 'spamtroll.net', 'speed.1s.fr',
  'spoofmail.de', 'squizzy.de', 'ssoia.com', 'startkeys.com', 'stexsy.com',
  'stinkefinger.net', 'stop-my-spam.cf', 'stop-my-spam.com', 'stop-my-spam.ga',
  'stop-my-spam.ml', 'stop-my-spam.tk', 'streetwisemail.com', 'stuffmail.de',
  'supergreatmail.com', 'supermailer.jp', 'superrito.com', 'superstachel.de',
  'suremail.info', 'svk.jp', 'sweetxxx.de', 'tafmail.com', 'tagyourself.com',
  'techemail.com', 'techgroup.me', 'teleosaurs.xyz', 'teleworm.com',
  'teleworm.us', 'temp.emeraldwebmail.com', 'temp15qm.com', 'tempail.com',
  'tempalias.com', 'tempe-mail.com', 'tempemail.biz', 'tempemail.com',
  'tempemail.net', 'tempinbox.co.uk', 'tempinbox.com', 'tempmail.co',
  'tempmail.de', 'tempmail.eu', 'tempmail.it', 'tempmail.net', 'tempmail.org',
  'tempmail.us', 'tempmail2.com', 'tempmaildemo.com', 'tempmailer.com',
  'tempmailer.de', 'tempomail.fr', 'temporarily.de', 'temporarioemail.com.br',
  'temporaryemail.net', 'temporaryemail.us', 'temporaryforwarding.com',
  'temporaryinbox.com', 'temporarymailaddress.com', 'tempthe.net', 'temptmail.com',
  'thanksnospam.info', 'thankyou2010.com', 'thecloudindex.com', 'thelimestones.com',
  'thisisnotmyrealemail.com', 'thismail.net', 'thismail.ru', 'throam.com',
  'throwawayemailaddress.com', 'throwawaymail.com', 'tilien.com', 'tittbit.in',
  'tmailinator.com', 'tmail.ws', 'tmpeml.info', 'toiea.com', 'tokenmail.de',
  'toomail.biz', 'topranklist.de', 'tradermail.info', 'trash-amil.com',
  'trash-mail.at', 'trash-mail.com', 'trash-mail.de', 'trash2009.com',
  'trash2010.com', 'trash2011.com', 'trashbox.eu', 'trashdevil.com',
  'trashdevil.de', 'trashemail.de', 'trashmail.at', 'trashmail.com',
  'trashmail.de', 'trashmail.me', 'trashmail.net', 'trashmail.org',
  'trashmail.ws', 'trashmailer.com', 'trashymail.com', 'trashymail.net',
  'trbvm.com', 'trickmail.net', 'trillianpro.com', 'trimix.cn', 'trollbot.org',
  'trungtamtoeic.com', 'tryalert.com', 'ttszuo.xyz', 'tualias.com',
  'turual.com', 'twinmail.de', 'twoweirdtricks.com', 'tyldd.com', 'ubismail.net',
  'uggsrock.com', 'umail.net', 'unlimit.com', 'unmail.ru', 'upliftnow.com',
  'uplipht.com', 'uroid.com', 'us.af', 'username.e4ward.com', 'valemail.net',
  'venompen.com', 'veryrealemail.com', 'viditag.com', 'viralplays.com',
  'vkcode.ru', 'vomoto.com', 'vpn.st', 'vsimcard.com', 'vubby.com',
  'walala.org', 'walkmail.net', 'webemail.me', 'webm4il.info', 'webuser.in',
  'wee.my', 'weg-werf-email.de', 'wegwerf-email-addressen.de', 'wegwerf-email-adressen.de',
  'wegwerf-email.at', 'wegwerf-email.de', 'wegwerf-email.net', 'wegwerf-emails.de',
  'wegwerfadresse.de', 'wegwerfemail.com', 'wegwerfemail.de', 'wegwerfmail.de',
  'wegwerfmail.info', 'wegwerfmail.net', 'wegwerfmail.org', 'wetrainbayarea.com',
  'wetrainbayarea.org', 'wh4f.org', 'whatiaas.com', 'whatpaas.com', 'whopy.com',
  'whtjddn.33mail.com', 'whyspam.me', 'wilemail.com', 'willhackforfood.biz',
  'willselfdestruct.com', 'winemaven.info', 'wolfsmail.tk', 'wollan.info',
  'worldspace.link', 'wronghead.com', 'wuzup.net', 'wuzupmail.net', 'wwwnew.eu',
  'x.ip6.li', 'xagloo.co', 'xagloo.com', 'xemaps.com', 'xents.com', 'xmaily.com',
  'xoxy.net', 'xww.ro', 'yapped.net', 'yeah.net', 'yep.it', 'yogamaven.com',
  'yopmail.fr', 'yopmail.net', 'you-spam.com', 'yourdomain.com', 'ypmail.webarnak.fr.eu.org',
  'yuurok.com', 'z1p.biz', 'za.com', 'zehnminuten.de', 'zehnminutenmail.de',
  'zetmail.com', 'zippymail.info', 'zoaxe.com', 'zoemail.com', 'zoemail.net',
  'zoemail.org', 'zombie-hive.com', 'zomg.info', 'zxcv.com', 'zxcvbnm.com', 'zzz.com',
]);

// Patterns that indicate datacenter/hosting ASN
const SUSPICIOUS_ASN_PATTERNS = [
  'amazon', 'aws', 'google cloud', 'azure', 'digitalocean', 'linode', 'vultr',
  'ovh', 'hetzner', 'datacenter', 'hosting', 'server', 'cloud', 'vps',
];

interface EmailValidationRequest {
  email: string;
  isAdminAttempt?: boolean;
  userAgent?: string;
}

interface EmailValidationResult {
  valid: boolean;
  score: number;
  status: 'accepted' | 'rejected' | 'pending_confirmation';
  reason?: string;
  details: {
    formatValid: boolean;
    domainExists: boolean;
    hasMxRecord: boolean;
    isDisposable: boolean;
    isTrustedProvider: boolean;
    domainAgeDays?: number;
    riskFactors: string[];
  };
}

// Simple hash function for GDPR compliance
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if domain has MX records using DNS lookup
async function checkMxRecord(domain: string): Promise<boolean> {
  try {
    // Use Google DNS over HTTPS for MX record lookup
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`, {
      headers: { 'Accept': 'application/dns-json' }
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.Answer && data.Answer.length > 0;
  } catch {
    // If DNS lookup fails, assume MX exists (don't block legitimate users)
    return true;
  }
}

// Check domain age using WHOIS-like services
async function checkDomainAge(domain: string): Promise<number | null> {
  try {
    // Use a simple approach - check if domain resolves and assume it's old enough
    // For production, you'd use a WHOIS API
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    if (response.ok) {
      const data = await response.json();
      // If domain resolves, we can't determine exact age but assume it's valid
      if (data.Answer && data.Answer.length > 0) {
        return 365; // Assume 1 year if domain resolves
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Check for disposable email patterns in domain
function hasDisposablePattern(domain: string): boolean {
  const lowerDomain = domain.toLowerCase();
  
  // Check exact match
  if (DISPOSABLE_DOMAINS.has(lowerDomain)) {
    return true;
  }
  
  // Check common patterns
  const disposablePatterns = [
    'temp', 'disposable', 'throwaway', 'fake', 'trash', 'spam',
    'guerrilla', 'mailinator', '10minute', 'yopmail', 'tempmail',
    'burner', 'getairmail', 'maildrop', 'mohmal', 'sharklasers',
  ];
  
  return disposablePatterns.some(pattern => lowerDomain.includes(pattern));
}

// Calculate email trust score
function calculateEmailScore(details: EmailValidationResult['details']): number {
  let score = 50; // Start neutral
  
  // Positive factors
  if (details.isTrustedProvider) score += 30;
  if (details.hasMxRecord) score += 10;
  if (details.domainAgeDays && details.domainAgeDays > 365) score += 10;
  if (details.domainAgeDays && details.domainAgeDays > 30) score += 5;
  
  // Negative factors
  if (details.isDisposable) score -= 80;
  if (!details.hasMxRecord) score -= 40;
  if (!details.domainExists) score -= 50;
  if (details.domainAgeDays && details.domainAgeDays < 30) score -= 20;
  
  // Risk factor penalties
  score -= details.riskFactors.length * 10;
  
  // Clamp score
  return Math.max(0, Math.min(100, score));
}

// Main validation function
async function validateEmail(email: string, isAdminAttempt: boolean = false): Promise<EmailValidationResult> {
  const riskFactors: string[] = [];
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const formatValid = emailRegex.test(email) && email.length <= 254;
  
  if (!formatValid) {
    return {
      valid: false,
      score: 0,
      status: 'rejected',
      reason: 'invalid_format',
      details: {
        formatValid: false,
        domainExists: false,
        hasMxRecord: false,
        isDisposable: false,
        isTrustedProvider: false,
        riskFactors: ['invalid_email_format'],
      }
    };
  }
  
  const domain = email.split('@')[1].toLowerCase();
  
  // Check if trusted provider
  const isTrustedProvider = TRUSTED_PROVIDERS.has(domain);
  
  // Check if disposable
  const isDisposable = hasDisposablePattern(domain);
  if (isDisposable) {
    riskFactors.push('disposable_email_detected');
  }
  
  // Check MX record
  const hasMxRecord = await checkMxRecord(domain);
  if (!hasMxRecord) {
    riskFactors.push('no_mx_record');
  }
  
  // Check domain age (simplified)
  const domainAgeDays = await checkDomainAge(domain);
  if (domainAgeDays !== null && domainAgeDays < 30) {
    riskFactors.push('domain_too_new');
  }
  
  // Domain exists if MX record exists or DNS resolves
  const domainExists = hasMxRecord || domainAgeDays !== null;
  
  const details: EmailValidationResult['details'] = {
    formatValid,
    domainExists,
    hasMxRecord,
    isDisposable,
    isTrustedProvider,
    domainAgeDays: domainAgeDays ?? undefined,
    riskFactors,
  };
  
  const score = calculateEmailScore(details);
  
  // Determine status
  let status: EmailValidationResult['status'];
  let valid = true;
  let reason: string | undefined;
  
  // Rejection criteria
  if (isDisposable) {
    status = 'rejected';
    valid = false;
    reason = 'disposable_email';
  } else if (!hasMxRecord) {
    status = 'rejected';
    valid = false;
    reason = 'no_mx_record';
  } else if (score < 20) {
    status = 'rejected';
    valid = false;
    reason = 'low_trust_score';
  } else if (score < 50) {
    // Medium score - require confirmation
    status = 'pending_confirmation';
  } else {
    status = 'accepted';
  }
  
  // Stricter rules for admin attempts
  if (isAdminAttempt) {
    if (isDisposable || score < 60) {
      status = 'rejected';
      valid = false;
      reason = reason || 'insufficient_trust_for_admin';
      riskFactors.push('admin_attempt_with_suspicious_email');
    }
  }
  
  return {
    valid,
    score,
    status,
    reason,
    details,
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, isAdminAttempt, userAgent }: EmailValidationRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Validating email: ${email.split('@')[1]} (domain only for privacy)`);
    
    // Perform validation
    const result = await validateEmail(email, isAdminAttempt);
    
    console.log(`Validation result: score=${result.score}, status=${result.status}, valid=${result.valid}`);
    
    // Log to database (GDPR compliant - hash email)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const emailHash = await hashEmail(email);
      const domain = email.split('@')[1].toLowerCase();
      
      // Get client IP from headers
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                       req.headers.get('cf-connecting-ip') || 
                       'unknown';
      
      await supabase.from('email_validation_logs').insert({
        email_hash: emailHash,
        domain: domain,
        validation_score: result.score,
        status: result.status,
        rejection_reason: result.reason,
        is_disposable: result.details.isDisposable,
        is_free_provider: result.details.isTrustedProvider,
        has_mx_record: result.details.hasMxRecord,
        domain_age_days: result.details.domainAgeDays,
        risk_factors: result.details.riskFactors,
        ip_address: clientIp,
        user_agent: userAgent,
      });
      
      console.log('Validation logged to database');
    } catch (dbError) {
      console.error('Failed to log validation:', dbError);
      // Don't fail the validation if logging fails
    }
    
    // Return result (don't expose internal details to client)
    return new Response(
      JSON.stringify({
        valid: result.valid,
        status: result.status,
        // Generic message for user
        message: result.valid 
          ? undefined 
          : 'Please use a valid personal or professional email address. Temporary email addresses are not allowed.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Email validation error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Validation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
