const croatianWords = [
  'je', 'i', 'da', 'u', 'na', 'za', 'se', 'su', 'od', 'sa',
  'sam', 'ste', 'smo', 'što', 'kako', 'koji', 'koja', 'koje',
  'mogu', 'može', 'imam', 'imate', 'trebam', 'trebate', 'želim',
  'želite', 'hvala', 'molim', 'pozdrav', 'dobar', 'dobro',
  'stan', 'kuća', 'nekretnina', 'cijena', 'kvadrat', 'kat',
  'soba', 'prodaja', 'najam', 'lokacija', 'zgrada'
]

export function detectLanguage(text: string): 'hr' | 'en' {
  const words = text.toLowerCase().split(/\s+/)
  const croatianCount = words.filter(w => croatianWords.includes(w)).length
  const ratio = croatianCount / words.length
  return ratio > 0.1 ? 'hr' : 'en'
}
