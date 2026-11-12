/**
 * Arrow Bloom - Legal & Google Play Approval Modal
 * Includes Privacy Policy, Terms of Service, Ads Policy & Data Safety,
 * Developer Contact Details (devops.maheshbabu@gmail.com), and app-ads.txt.
 */
import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Mail,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../audio.ts';

export type LegalTab = 'privacy' | 'terms' | 'datasafety' | 'contact' | 'appads';

interface LegalPagesModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const [copiedAppAds, setCopiedAppAds] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const developerEmail = 'devops.maheshbabu@gmail.com';
  const appAdsSnippet = `google.com, pub-7294819284729104, DIRECT, f08c47fec0942fa0`;

  const copyAppAds = () => {
    navigator.clipboard.writeText(appAdsSnippet);
    soundManager.playPop(1);
    setCopiedAppAds(true);
    setTimeout(() => setCopiedAppAds(false), 2500);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    soundManager.playPop(1);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-white/20 p-5 shadow-2xl text-white flex flex-col gap-3 max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close legal modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-black uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Legal, Ads &amp; Support</span>
          </div>
          <h2 className="text-xl font-black mt-1">Compliance &amp; Contact</h2>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-1 p-1 rounded-2xl bg-slate-950/80 border border-white/10 text-[11px] font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('privacy');
            }}
            className={`py-1.5 px-2.5 rounded-xl text-center whitespace-nowrap transition-all ${
              activeTab === 'privacy'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Privacy
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('terms');
            }}
            className={`py-1.5 px-2.5 rounded-xl text-center whitespace-nowrap transition-all ${
              activeTab === 'terms'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Terms
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('datasafety');
            }}
            className={`py-1.5 px-2.5 rounded-xl text-center whitespace-nowrap transition-all ${
              activeTab === 'datasafety'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Ads &amp; Safety
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('contact');
            }}
            className={`py-1.5 px-2.5 rounded-xl text-center whitespace-nowrap transition-all ${
              activeTab === 'contact'
                ? 'bg-pink-500 text-white font-black shadow-sm'
                : 'text-pink-300/80 hover:text-pink-200'
            }`}
          >
            Contact Dev
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('appads');
            }}
            className={`py-1.5 px-2.5 rounded-xl text-center whitespace-nowrap transition-all ${
              activeTab === 'appads'
                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            app-ads.txt
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs text-white/80 space-y-3 leading-relaxed">
          {/* Privacy Policy */}
          {activeTab === 'privacy' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm">Privacy Policy</h3>
                <span className="text-[10px] text-white/50">Updated: May 2026</span>
              </div>
              <p>
                <strong>Arrow Bloom</strong> respects your privacy and is designed as a relaxing, offline-friendly logic puzzle. This policy outlines our transparent data practices across mobile devices.
              </p>
              <h4 className="font-bold text-white">1. Zero Personal Data Collected</h4>
              <p>
                We do NOT collect, harvest, sell, or rent your personal data (name, email, phone number, address, or photos). Gameplay progress, stars, high scores, and sound preferences are stored 100% locally on your device.
              </p>
              <h4 className="font-bold text-white">2. Google AdMob &amp; Advertising</h4>
              <p>
                To provide free access to all 300 levels, we use Google AdMob to serve non-intrusive advertisements (banners and rewarded video ads). Google AdMob may process device identifiers (such as Android Advertising ID - GAID) and IP addresses to serve ads, prevent ad fraud, and provide analytics according to Google&apos;s Privacy Policy.
              </p>
              <h4 className="font-bold text-white">3. Children&apos;s Privacy (COPPA &amp; GDPR-K)</h4>
              <p>
                Arrow Bloom is family-friendly. Where child users or families are detected, non-personalized advertising is strictly enforced and behavioral tracking is blocked.
              </p>
              <h4 className="font-bold text-white">4. Data Deletion &amp; Reset</h4>
              <p>
                You have the right to reset or purge all local data anytime via the &ldquo;Reset Game Progress&rdquo; option in Settings.
              </p>
              <h4 className="font-bold text-white">5. Developer Contact</h4>
              <p>
                For privacy inquiries, contact the developer at: <strong>{developerEmail}</strong>.
              </p>
            </div>
          )}

          {/* Terms and Conditions */}
          {activeTab === 'terms' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm">Terms and Conditions</h3>
                <span className="text-[10px] text-white/50">Version 1.0</span>
              </div>
              <p>
                By downloading, accessing, or playing Arrow Bloom, you agree to these Terms and Conditions.
              </p>
              <h4 className="font-bold text-white">1. In-App Purchases &amp; VIP Pass</h4>
              <p>
                The &ldquo;Lifetime Ad-Free Pass&rdquo; (₹99 / $1.19) and Hint Bundles are processed securely through Google Play In-App Billing. All purchases are tied to your Google account and governed by Google Play Store terms.
              </p>
              <h4 className="font-bold text-white">2. Rewarded Ads &amp; Free Hits</h4>
              <p>
                Optional 5-second video ads provide free in-game rewards (such as solution hints and free revives). Rewarded perks are granted upon complete playback of the ad.
              </p>
              <h4 className="font-bold text-white">3. Intellectual Property</h4>
              <p>
                All artwork, custom algorithms, sound effects, and level layouts are proprietary to Arrow Bloom. Unauthorized redistribution or commercial duplication is prohibited.
              </p>
              <h4 className="font-bold text-white">4. Support &amp; Disputes</h4>
              <p>
                Reach developer support at <strong>{developerEmail}</strong> for purchase issues or game queries.
              </p>
            </div>
          )}

          {/* Ads Policy & Data Safety */}
          {activeTab === 'datasafety' && (
            <div className="space-y-2.5">
              <h3 className="font-extrabold text-white text-sm">
                Ads Policy &amp; Google Play Data Safety
              </h3>
              <p className="text-[11px] text-cyan-300">
                Official disclosures matching Google Play Console Data Safety requirements:
              </p>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ad Delivery:</strong> We display banner ads and rewarded video ads via Google AdMob SDK.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Transit Encryption:</strong> All network traffic to AdMob is encrypted over HTTPS (TLS 1.3).
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Ad-Free Option:</strong> Players can permanently disable all ads with the ₹99 Lifetime Pass.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Data Types Collected:</strong> Device Advertising IDs (used solely for AdMob ad delivery &amp; fraud prevention).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Details */}
          {activeTab === 'contact' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-indigo-500/20 border border-pink-400/40 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center text-white shadow-lg">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Developer Support</h3>
                  <p className="text-[11px] text-white/70">
                    Questions, feedback, purchase recovery, or bug reports
                  </p>
                </div>

                {/* Email Box */}
                <div className="w-full mt-1 p-2.5 rounded-xl bg-slate-950 border border-white/15 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-pink-300 font-bold truncate">
                    {developerEmail}
                  </span>
                  <button
                    onClick={copyEmail}
                    className="px-2.5 py-1 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-black text-[11px] active:scale-95 transition-all flex items-center gap-1 shrink-0"
                  >
                    {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Email Direct Link */}
                <a
                  href={`mailto:${developerEmail}?subject=Arrow%20Bloom%20Support`}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-slate-900 font-black text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 mt-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-pink-500" />
                  <span>Email Developer Directly</span>
                </a>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-[11px] text-white/70">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Support Commitments:</span>
                </div>
                <p>• Responses typically sent within 24–48 hours.</p>
                <p>• Instant help for Google Play purchase restorations.</p>
                <p>• Bug reports &amp; player feature requests are directly reviewed by the engineering team.</p>
              </div>
            </div>
          )}

          {/* app-ads.txt Setup */}
          {activeTab === 'appads' && (
            <div className="space-y-2.5">
              <h3 className="font-extrabold text-white text-sm">
                app-ads.txt (AdMob Revenue Authorization)
              </h3>
              <p>
                Place this line in your domain&apos;s root <code>app-ads.txt</code> to protect your ad revenue and enable full AdMob fill rates:
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/15 font-mono text-[10px] text-amber-300 break-all flex items-center justify-between gap-2">
                <code>{appAdsSnippet}</code>
                <button
                  onClick={copyAppAds}
                  className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans font-bold flex items-center gap-1 shrink-0 active:scale-95"
                >
                  {copiedAppAds ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAppAds ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-white/60">
                Contact: <strong>{developerEmail}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>Compliant with Google Play &amp; AdMob 2026 Policies</span>
          <button onClick={onClose} className="text-cyan-400 font-bold hover:underline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
