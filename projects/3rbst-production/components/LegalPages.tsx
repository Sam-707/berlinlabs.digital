
import React from 'react';

type LegalPageType = 'impressum' | 'privacy' | 'terms';

interface LegalPagesProps {
  page: LegalPageType;
  onBack: () => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, onBack }) => {
  const renderContent = () => {
    switch (page) {
      case 'impressum':
        return (
          <div className="space-y-6 text-left" dir="ltr">
            <h1 className="text-3xl font-bold mb-6">Impressum</h1>
            <section>
              <h2 className="text-xl font-semibold mb-2">Angaben gemäß § 5 DDG</h2>
              <p className="text-gray-700">
                <strong>BridgeLab Digital</strong><br />
                (Betreiber des Dienstes "3rbst")<br />
                <br />
                [YOUR NAME / LEGAL ENTITY TYPE]<br />
                Musterstraße 12<br />
                10115 Berlin<br />
                Germany
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Kontakt</h2>
              <p>
                Telefon: +49 151 00000000<br />
                E-Mail: hello@bridgelab.digital<br />
                Website: www.bridgelab.digital
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
              <p>
                Karim El-Masri (BridgeLab Digital)<br />
                Musterstraße 12<br />
                10115 Berlin
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">Streitschlichtung</h2>
              <p className="text-sm text-gray-600">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr.<br />
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6 text-left" dir="ltr">
            <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung</h1>
            <p>Stand: {new Date().getFullYear()}</p>

            <section>
              <h2 className="text-xl font-semibold mb-2">1. Datenschutz auf einen Blick</h2>
              <p>
                <strong>Verantwortlicher:</strong> Verantwortlich für die Datenverarbeitung auf dieser Website ist <strong>BridgeLab Digital</strong>.
              </p>
              <p className="mt-2">
                <strong>Allgemeine Hinweise:</strong> Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website (3rbst) besuchen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Hosting und Content Delivery Networks (CDN)</h2>
              <p>
                Wir hosten unsere Website bei <strong>Vercel Inc.</strong>. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Datenerfassung auf unserer Website</h2>
              <p>
                <strong>Verarbeitung von Bildern und Texten (AI Analyse):</strong><br />
                Wenn Sie uns Dokumente zur Analyse übermitteln (via Upload oder WhatsApp), werden diese Daten an unseren AI-Provider (Google Gemini API) zur Verarbeitung weitergeleitet. Diese Daten werden ausschließlich zur Erbringung der Dienstleistung genutzt. Wir speichern keine Dokumente dauerhaft auf unseren Servern, es sei denn, dies ist zur Fehlerbehebung notwendig.
              </p>
              <p className="mt-2">
                <strong>Zahlungsabwicklung (PayPal):</strong><br />
                Bei der Bezahlung via PayPal werden Ihre Zahlungsdaten an PayPal (Europe) S.à.r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg weitergeleitet.
              </p>
            </section>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6 text-left" dir="ltr">
            <h1 className="text-3xl font-bold mb-6">Allgemeine Geschäftsbedingungen (AGB)</h1>
            
            <section className="bg-yellow-50 p-4 border-l-4 border-yellow-400">
              <h2 className="text-xl font-bold mb-2">WICHTIGER HINWEIS: Keine Rechtsberatung</h2>
              <p>
                Der Dienst "3rbst" (betrieben von BridgeLab Digital) bietet ausschließlich automatisierte Übersetzungs- und Verständnishilfen mittels künstlicher Intelligenz. 
                <strong>Wir erbringen keine Rechtsberatung.</strong> Die Analysen ersetzen keinesfalls die Beratung durch einen Anwalt oder Steuerberater. 
                Für Entscheidungen, die auf Basis der KI-Analyse getroffen werden, übernehmen wir keine Haftung.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">1. Geltungsbereich</h2>
              <p>
                Für die Geschäftsbeziehung zwischen <strong>BridgeLab Digital</strong> (nachfolgend "Anbieter") und dem Kunden (nachfolgend "Kunde") gelten ausschließlich die nachfolgenden Allgemeinen Geschäftsbedingungen in ihrer zum Zeitpunkt der Bestellung gültigen Fassung.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Leistungsgegenstand</h2>
              <p>
                Der Anbieter stellt dem Kunden über die Marke "3rbst" eine Softwarelösung zur Verfügung, die deutsche Dokumente mittels KI analysiert und zusammenfasst.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Preise und Zahlung</h2>
              <p>
                Es gelten die zum Zeitpunkt der Bestellung angegebenen Preise. Die Zahlung erfolgt über den Dienstleister PayPal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Widerrufsrecht</h2>
              <p>
                Verbraucher haben ein vierzehntägiges Widerrufsrecht. Das Widerrufsrecht erlischt jedoch vorzeitig, wenn wir mit der Ausführung des Vertrags begonnen haben (z.B. sofortige Freischaltung der Credits), nachdem Sie ausdrücklich zugestimmt haben.
              </p>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center text-brand-600 font-bold hover:underline gap-2"
          dir="rtl"
        >
          <span>←</span>
          <span>العودة للرئيسية</span>
        </button>
        
        <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-200">
           {renderContent()}
        </div>
      </div>
    </div>
  );
};
