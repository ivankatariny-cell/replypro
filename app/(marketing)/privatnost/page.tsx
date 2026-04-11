import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pravila privatnosti | ReplyPro',
  description: 'Pravila privatnosti za ReplyPro — kako prikupljamo, koristimo i štitimo vaše podatke.',
}

export default function PrivatnostPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold font-heading mb-2">Pravila privatnosti</h1>
          <p className="text-sm text-muted-foreground mb-2">
            Zadnje ažuriranje: 11. travnja 2026.
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            <Link href="/privacy" className="text-primary hover:underline">Read in English →</Link>
          </p>

          <p className="text-muted-foreground leading-relaxed mb-8">
            <strong>ReplyPro d.o.o.</strong> (&quot;mi&quot;, &quot;nas&quot;, &quot;naš&quot;) upravlja uslugom ReplyPro na{' '}
            <a href="https://replypro.hr" className="text-primary hover:underline">replypro.hr</a>.
            Ova Pravila privatnosti objašnjavaju kako prikupljamo, koristimo i štitimo vaše osobne
            podatke u skladu s Općom uredbom o zaštiti podataka (GDPR) i primjenjivim hrvatskim zakonodavstvom.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. Podaci koje prikupljamo</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Prikupljamo sljedeće kategorije osobnih podataka:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li><strong>Podaci o računu:</strong> adresa e-pošte, lozinka (hashirana), ime i naziv agencije uneseni pri registraciji.</li>
              <li><strong>Podaci o korištenju:</strong> ulazni i izlazni podaci AI generiranja, podaci o klijentima i nekretninama koje unosite, povijest generiranja.</li>
              <li><strong>Podaci o naplati:</strong> status pretplate i povijest naplate (podaci o platnoj kartici isključivo obrađuje Stripe i nikada ih mi ne pohranjujemo).</li>
              <li><strong>Tehnički podaci:</strong> IP adresa, vrsta preglednika, informacije o uređaju i zapisnici korištenja u svrhu sigurnosti i performansi.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. Kako koristimo vaše podatke</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Vaše podatke koristimo za:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Pružanje, upravljanje i poboljšanje usluge ReplyPro.</li>
              <li>Obradu plaćanja i upravljanje vašom pretplatom.</li>
              <li>Slanje transakcijskih e-poruka (potvrda računa, reset lozinke, računi za naplatu).</li>
              <li>Otkrivanje i sprječavanje prijevara, zlouporabe i sigurnosnih incidenata.</li>
              <li>Ispunjavanje zakonskih obveza.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Ne prodajemo vaše osobne podatke trećim stranama. Ne koristimo vaše podatke u
              reklamne svrhe.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. Pohrana podataka</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vaši podaci pohranjeni su putem <strong>Supabase</strong>, platforme za baze podataka
              koja se nalazi na infrastrukturi unutar Europske unije. Svi podaci su šifrirani u
              mirovanju i prijenosu. Poduzimamo odgovarajuće tehničke i organizacijske mjere za
              zaštitu vaših osobnih podataka od neovlaštenog pristupa, gubitka ili uništenja.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Usluge trećih strana</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Za rad Usluge koristimo sljedeće procesore trećih strana:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Stripe</strong> — Obrada plaćanja. Stripe obrađuje vaše podatke o plaćanju
                prema vlastitim pravilima privatnosti. Mi primamo samo status pretplate i metapodatke
                o naplati.
              </li>
              <li>
                <strong>Groq</strong> — Pružatelj AI usluga koji se koristi za generiranje prijedloga
                odgovora. Vaš ulazni tekst šalje se Groq API-ju radi generiranja AI izlaza. Groq
                obrađuje te podatke prema vlastitim pravilima privatnosti.
              </li>
              <li>
                <strong>Resend</strong> — Dostava transakcijskih e-poruka (potvrda računa, reset
                lozinke). Vaša adresa e-pošte dijeli se s Resendom isključivo u tu svrhu.
              </li>
              <li>
                <strong>Supabase</strong> — Infrastruktura baze podataka i autentifikacije smještena
                unutar EU.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Svaki od ovih procesora vezan je ugovorima o obradi podataka i primjenjivim zakonima
              o zaštiti podataka.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Čuvanje podataka</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vaše osobne podatke čuvamo dok je vaš račun aktivan ili koliko je potrebno za pružanje
              Usluge. Ako izbrišete račun, izbrisat ćemo ili anonimizirati vaše osobne podatke u roku
              od 30 dana, osim ako smo obvezni zadržati ih zbog zakonskih ili regulatornih obveza
              (npr. evidencija naplate u porezne svrhe, koja se može čuvati do 7 godina prema
              hrvatskom zakonu).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Vaša prava (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Kao ispitanik prema GDPR-u, imate sljedeća prava:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Pravo pristupa:</strong> Zatražite kopiju osobnih podataka koje o vama čuvamo.</li>
              <li><strong>Pravo na ispravak:</strong> Zatražite ispravak netočnih ili nepotpunih podataka.</li>
              <li><strong>Pravo na brisanje:</strong> Zatražite brisanje vaših osobnih podataka (&quot;pravo na zaborav&quot;), uz zakonske zahtjeve za čuvanjem.</li>
              <li><strong>Pravo na prenosivost podataka:</strong> Primite svoje podatke u strukturiranom, strojno čitljivom formatu.</li>
              <li><strong>Pravo na ograničenje:</strong> Zatražite da ograničimo obradu vaših podataka u određenim okolnostima.</li>
              <li><strong>Pravo na prigovor:</strong> Prigovorite obradi temeljenoj na legitimnim interesima.</li>
              <li><strong>Pravo na povlačenje pristanka:</strong> Gdje se obrada temelji na pristanku, povucite ga u bilo kojem trenutku.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Za ostvarivanje bilo kojeg od ovih prava kontaktirajte nas na{' '}
              <a href="mailto:privacy@replypro.hr" className="text-primary hover:underline">privacy@replypro.hr</a>.
              Odgovorit ćemo u roku od 30 dana. Također imate pravo podnijeti pritužbu Agenciji za
              zaštitu osobnih podataka (AZOP) na{' '}
              <a href="https://azop.hr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">azop.hr</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Kolačići</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Koristimo neophodne kolačiće potrebne za autentifikaciju i upravljanje sesijom. Ti
              kolačići su strogo neophodni za funkcioniranje Usluge i ne mogu se onemogućiti.
              Ne koristimo kolačiće za praćenje, oglašavanje ili analitiku. Korištenjem Usluge
              pristajete na korištenje ovih neophodnih kolačića.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Konkretno, postavljamo sljedeći autentifikacijski kolačić:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
              <li>
                <strong>sb-[project-ref]-auth-token</strong> — Postavlja ga Supabase radi održavanja
                vaše autentificirane sesije. Ovaj kolačić pohranjuje šifrirani token sesije i potreban
                je da ostanete prijavljeni. Istječe kada se odjavite ili nakon razdoblja neaktivnosti.
                U samom kolačiću ne pohranjuju se osobni podaci; on upućuje na sesiju na strani
                poslužitelja.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">8. Izmjene ove politike</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ova Pravila privatnosti možemo s vremena na vrijeme ažurirati. O materijalnim
              promjenama obavijestit ćemo vas e-poštom ili putem obavijesti u Usluzi najmanje
              14 dana prije stupanja promjena na snagu. Nastavak korištenja Usluge nakon datuma
              stupanja na snagu znači prihvaćanje ažurirane politike.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">9. Kontakt informacije</h2>
            <p className="text-muted-foreground leading-relaxed">
              Za upite vezane uz privatnost ili ostvarivanje vaših prava, kontaktirajte našeg
              voditelja obrade podataka:
            </p>
            <address className="not-italic mt-3 text-muted-foreground space-y-1">
              <p><strong>ReplyPro d.o.o.</strong></p>
              <p>Ilica 1, 10000 Zagreb</p>
              <p>Hrvatska</p>
              <p>
                E-pošta:{' '}
                <a href="mailto:privacy@replypro.hr" className="text-primary hover:underline">
                  privacy@replypro.hr
                </a>
              </p>
            </address>
          </section>
        </article>
      </div>
    </main>
  )
}
