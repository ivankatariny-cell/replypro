import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Uvjeti korištenja | ReplyPro',
  description: 'Uvjeti korištenja za ReplyPro — AI asistent za odgovore za agente nekretnina.',
}

export default function UvjetiPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold font-heading mb-2">Uvjeti korištenja</h1>
          <p className="text-sm text-muted-foreground mb-2">
            Zadnje ažuriranje: 11. travnja 2026.
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            <Link href="/terms" className="text-primary hover:underline">Read in English →</Link>
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">1. Opis usluge</h2>
            <p className="text-muted-foreground leading-relaxed">
              ReplyPro (&quot;Usluga&quot;) je B2B AI asistent za odgovore namijenjen agentima nekretnina.
              Uslugom upravlja <strong>ReplyPro d.o.o.</strong>, tvrtka registrirana u Hrvatskoj,
              sa sjedištem na adresi <strong>Ilica 1, 10000 Zagreb, Hrvatska</strong>. Pristupanjem
              ili korištenjem ReplyPro na{' '}
              <a href="https://replypro.hr" className="text-primary hover:underline">replypro.hr</a>,
              pristajete na ove Uvjete korištenja.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">2. Korisnički računi</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Za korištenje Usluge morate stvoriti račun. Odgovorni ste za:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Čuvanje povjerljivosti podataka za prijavu na vaš račun.</li>
              <li>Sve aktivnosti koje se odvijaju pod vašim računom.</li>
              <li>Pružanje točnih i ažurnih informacija pri registraciji.</li>
              <li>Trenutno obavještavanje nas o svakom neovlaštenom korištenju vašeg računa.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Morate imati najmanje 18 godina i biti registrirani poslovni subjekt ili profesionalac
              da biste koristili Uslugu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">3. Pretplata i naplata</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              ReplyPro nudi planove pretplate koji se naplaćuju na mjesečnoj ili godišnjoj osnovi.
              Pro plan trenutno je po cijeni od <strong>29,00 € mjesečno (PDV uključen gdje je primjenjivo)</strong>.
              Pretplatom:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Ovlašćujete nas da naplaćujemo vašu platnu metodu na ponavljajućoj osnovi.</li>
              <li>Pretplate se automatski obnavljaju osim ako se ne otkažu prije datuma obnove.</li>
              <li>Pretplatu možete otkazati u bilo kojem trenutku putem portala za naplatu.</li>
              <li>Povrati se ne daju za djelomična obračunska razdoblja osim ako to zakon zahtijeva.</li>
              <li>Zadržavamo pravo promjene cijena uz obavijest od 30 dana.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Obradu plaćanja obavlja Stripe. Pružanjem podataka o plaćanju također pristajete na
              Stripeove uvjete korištenja.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">4. Prihvatljivo korištenje</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Pristajete da nećete koristiti Uslugu za:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Generiranje neželjene pošte, obmanjujućeg ili lažnog sadržaja.</li>
              <li>Kršenje bilo kojih primjenjivih zakona ili propisa.</li>
              <li>Povredu prava intelektualnog vlasništva drugih.</li>
              <li>Pokušaj obrnute inženjerije, struganja ili ometanja Usluge.</li>
              <li>Dijeljenje podataka za prijavu na račun s neovlaštenim trećim stranama.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Zadržavamo pravo suspendiranja ili ukidanja računa koji krše ove uvjete.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">5. Intelektualno vlasništvo</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sav sadržaj, softver i tehnologija koji čine Uslugu u vlasništvu su{' '}
              <strong>ReplyPro d.o.o.</strong> ili njegovih davatelja licenci. Zadržavate vlasništvo
              nad svim sadržajem koji unosite u Uslugu. Korištenjem Usluge dajete nam ograničenu
              licencu za obradu vašeg unosa isključivo radi pružanja Usluge. AI generirani izlazi
              pružaju se za vašu upotrebu, ali ne dajemo nikakva jamstva u pogledu njihove točnosti
              ili prikladnosti za bilo koju određenu svrhu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">6. Ograničenje odgovornosti</h2>
            <p className="text-muted-foreground leading-relaxed">
              U najvećoj mjeri dopuštenoj primjenjivim zakonom, <strong>ReplyPro d.o.o.</strong>{' '}
              neće biti odgovoran za bilo kakvu neizravnu, slučajnu, posebnu, posljedičnu ili
              kaznenu štetu nastalu korištenjem Usluge. Naša ukupna odgovornost prema vama za
              bilo kakve zahtjeve koji proizlaze iz ovih Uvjeta neće premašiti iznos koji ste nam
              platili u tri mjeseca koja prethode zahtjevu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">7. Raskid</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bilo koja strana može raskinuti ovaj ugovor u bilo kojem trenutku. Možemo odmah
              suspendirati ili ukinuti vaš pristup ako prekršite ove Uvjete. Nakon raskida, vaše
              pravo korištenja Usluge prestaje. Vaše podatke možemo zadržati određeno razdoblje
              kako je opisano u našim Pravilima privatnosti prije brisanja.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">8. Mjerodavno pravo</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ovi Uvjeti uređeni su i tumače se u skladu sa zakonima Republike Hrvatske. Svi sporovi
              koji proizlaze iz ovih Uvjeta podliježu isključivoj nadležnosti nadležnih sudova u
              Hrvatskoj.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">9. Kontakt informacije</h2>
            <p className="text-muted-foreground leading-relaxed">
              Za pitanja o ovim Uvjetima, kontaktirajte nas:
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
