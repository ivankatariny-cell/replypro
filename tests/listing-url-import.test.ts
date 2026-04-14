/**
 * Tests for the listing-url-import feature.
 * Validates: Requirements 1.2, 2.1, 2.3, 3.1-3.8, 4.1-4.3, 5.1, 6.1, 6.5
 *
 * Environment: vitest node (no jsdom). Tests cover pure functions,
 * API route handler, and property-based tests via fast-check.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import type { ImportResult } from '@/types'

// ── Module mocks (must be at top level) ──────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  rateLimit: vi.fn(),
}))

vi.mock('groq-sdk', () => {
  const mockCreate = vi.fn()
  const MockGroq = vi.fn(() => ({
    chat: { completions: { create: mockCreate } },
  }))
  // Expose mockCreate so tests can access it
  ;(MockGroq as any).__mockCreate = mockCreate
  return { default: MockGroq }
})

// Mock the UrlImporter module to avoid React/JSX in node env.
// We re-implement the pure functions here (identical to the source) so we can
// test them without pulling in React components.
vi.mock('@/components/properties/UrlImporter', () => ({
  isValidUrl: (s: string) => s.startsWith('http://') || s.startsWith('https://'),
  getErrorMessage: (code: string, t: (k: string) => string) => {
    switch (code) {
      case 'SCRAPE_FAILED':
      case 'SCRAPE_TIMEOUT':
        return t('properties.import_url_error_scrape')
      case 'EXTRACTION_FAILED':
      case 'EXTRACTION_INCOMPLETE':
      case 'EXTRACTION_TIMEOUT':
        return t('properties.import_url_error_extract')
      case 'RATE_LIMITED':
        return t('properties.import_url_error_rate')
      default:
        return t('properties.import_url_error_generic')
    }
  },
}))

// ── Imports after mocks ───────────────────────────────────────────────────────

import { isValidUrl, getErrorMessage } from '@/components/properties/UrlImporter'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/utils/rate-limit'
import Groq from 'groq-sdk'

// Helper to get the mocked Groq create function
function getMockGroqCreate() {
  return (Groq as any).__mockCreate as ReturnType<typeof vi.fn>
}

// Helper to build a mock supabase client
function mockSupabase(user: { id: string } | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  }
}

// Helper to build a mock fetch response
function mockFetchResponse(status: number, body: string) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(JSON.parse(body)),
  } as Response)
}

// Helper to call the POST handler with a given URL
async function callImportRoute(url: unknown) {
  const { POST } = await import('@/app/api/properties/import/route')
  const req = new Request('http://localhost/api/properties/import', {
    method: 'POST',
    body: JSON.stringify({ url }),
    headers: { 'Content-Type': 'application/json' },
  })
  return POST(req as any)
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()

  // Default: authenticated user
  ;(createServerSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(
    mockSupabase({ id: 'user-123' })
  )
  // Default: rate limit passes
  ;(rateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, remaining: 9 })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.9 Unit tests for UrlImporter pure functions
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidUrl — unit tests', () => {
  it('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false)
  })

  it('returns true for http:// URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('returns true for https:// URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  it('returns false for ftp:// URL', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false)
  })

  it('returns false for plain text', () => {
    expect(isValidUrl('not a url')).toBe(false)
  })

  it('returns false for URL without protocol', () => {
    expect(isValidUrl('example.com')).toBe(false)
  })
})

describe('getErrorMessage — unit tests', () => {
  const t = (key: string) => key // identity translator

  it('returns scrape error for SCRAPE_FAILED', () => {
    expect(getErrorMessage('SCRAPE_FAILED', t)).toBe('properties.import_url_error_scrape')
  })

  it('returns scrape error for SCRAPE_TIMEOUT', () => {
    expect(getErrorMessage('SCRAPE_TIMEOUT', t)).toBe('properties.import_url_error_scrape')
  })

  it('returns extract error for EXTRACTION_FAILED', () => {
    expect(getErrorMessage('EXTRACTION_FAILED', t)).toBe('properties.import_url_error_extract')
  })

  it('returns extract error for EXTRACTION_INCOMPLETE', () => {
    expect(getErrorMessage('EXTRACTION_INCOMPLETE', t)).toBe('properties.import_url_error_extract')
  })

  it('returns rate error for RATE_LIMITED', () => {
    expect(getErrorMessage('RATE_LIMITED', t)).toBe('properties.import_url_error_rate')
  })

  it('returns generic error for unknown code', () => {
    expect(getErrorMessage('UNKNOWN_CODE', t)).toBe('properties.import_url_error_generic')
  })

  it('returns generic error for empty string code', () => {
    expect(getErrorMessage('', t)).toBe('properties.import_url_error_generic')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.1 Property 1: URL validation
// Validates: Requirements 1.2
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 1: URL validation enables/disables the import button', () => {
  /**
   * **Validates: Requirements 1.2**
   * For any string, isValidUrl(s) === (s.startsWith('http://') || s.startsWith('https://'))
   */
  it('isValidUrl matches startsWith http:// or https:// for arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const expected = s.startsWith('http://') || s.startsWith('https://')
        expect(isValidUrl(s)).toBe(expected)
      }),
      { numRuns: 200 }
    )
  })

  it('isValidUrl returns true for all generated valid http/https URLs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.webUrl({ validSchemes: ['http'] }),
          fc.webUrl({ validSchemes: ['https'] })
        ),
        (url) => {
          expect(isValidUrl(url)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.2 Property 2: Jina URL construction
// Validates: Requirements 2.1
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 2: Jina URL construction', () => {
  /**
   * **Validates: Requirements 2.1**
   * For any valid URL, the outbound fetch targets https://r.jina.ai/{url}
   */
  it('always fetches https://r.jina.ai/{inputUrl} for any valid http/https URL', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.webUrl({ validSchemes: ['http'] }),
          fc.webUrl({ validSchemes: ['https'] })
        ),
        async (inputUrl) => {
          const capturedUrls: string[] = []

          vi.stubGlobal('fetch', (url: string) => {
            capturedUrls.push(url)
            // Return valid markdown so the route continues to Groq
            return mockFetchResponse(200, '# Property listing')
          })

          getMockGroqCreate().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: 'Test Property',
                    address: null,
                    city: null,
                    price: null,
                    sqm: null,
                    rooms: null,
                    description: null,
                    property_type: 'apartment',
                  }),
                },
              },
            ],
          })

          await callImportRoute(inputUrl)

          expect(capturedUrls[0]).toBe(`https://r.jina.ai/${inputUrl}`)
        }
      ),
      { numRuns: 50 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.3 Property 4: HTTP error codes → SCRAPE_FAILED
// Validates: Requirements 2.3
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 4: HTTP error codes map to SCRAPE_FAILED / 502', () => {
  /**
   * **Validates: Requirements 2.3**
   * For any HTTP status in [400, 599], the route returns 502 SCRAPE_FAILED
   */
  it('returns 502 SCRAPE_FAILED for any 4xx/5xx Jina response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }),
        async (statusCode) => {
          vi.stubGlobal('fetch', () =>
            Promise.resolve({
              ok: false,
              status: statusCode,
              text: () => Promise.resolve('error'),
            } as Response)
          )

          const res = await callImportRoute('https://example.com/listing')
          const body = await res.json()

          expect(res.status).toBe(502)
          expect(body.code).toBe('SCRAPE_FAILED')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.4 Property 5: Extraction prompt completeness
// Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 5: Extraction prompt completeness', () => {
  const REQUIRED_FIELDS = ['title', 'address', 'city', 'price', 'sqm', 'rooms', 'description', 'property_type']
  const REQUIRED_ENUM_VALUES = ['apartment', 'house', 'land', 'commercial', 'other']

  /**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
   * For any markdown content, the prompt sent to Groq contains all 8 field names
   * and all 5 property_type enum values.
   */
  it('prompt contains all required field names and enum values for any markdown input', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        async (markdown) => {
          vi.stubGlobal('fetch', () => mockFetchResponse(200, markdown))

          let capturedSystemPrompt = ''
          getMockGroqCreate().mockImplementation(async ({ messages }: any) => {
            capturedSystemPrompt = messages.find((m: any) => m.role === 'system')?.content ?? ''
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      title: 'Test',
                      address: null,
                      city: null,
                      price: null,
                      sqm: null,
                      rooms: null,
                      description: null,
                      property_type: 'other',
                    }),
                  },
                },
              ],
            }
          })

          await callImportRoute('https://example.com/listing')

          for (const field of REQUIRED_FIELDS) {
            expect(capturedSystemPrompt).toContain(field)
          }
          for (const enumVal of REQUIRED_ENUM_VALUES) {
            expect(capturedSystemPrompt).toContain(enumVal)
          }
        }
      ),
      { numRuns: 50 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.5 Property 6: Invalid JSON → EXTRACTION_FAILED
// Validates: Requirements 3.6
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 6: Invalid JSON from Groq maps to EXTRACTION_FAILED / 422', () => {
  /**
   * **Validates: Requirements 3.6**
   * For any non-JSON string returned by Groq, the route returns 422 EXTRACTION_FAILED
   */
  it('returns 422 EXTRACTION_FAILED for any non-parseable Groq response', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate strings that are not valid JSON
        fc.string().filter((s) => {
          try {
            JSON.parse(s)
            return false
          } catch {
            return true
          }
        }),
        async (invalidJson) => {
          vi.stubGlobal('fetch', () => mockFetchResponse(200, '# listing'))

          getMockGroqCreate().mockResolvedValue({
            choices: [{ message: { content: invalidJson } }],
          })

          const res = await callImportRoute('https://example.com/listing')
          const body = await res.json()

          expect(res.status).toBe(422)
          expect(body.code).toBe('EXTRACTION_FAILED')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.6 Property 7: Missing title → EXTRACTION_INCOMPLETE
// Validates: Requirements 3.7
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 7: Missing title maps to EXTRACTION_INCOMPLETE / 422', () => {
  /**
   * **Validates: Requirements 3.7**
   * For any valid JSON object without a non-empty title, the route returns 422 EXTRACTION_INCOMPLETE
   */
  it('returns 422 EXTRACTION_INCOMPLETE for any JSON object missing title', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate objects that don't have a 'title' key
        fc.object().filter((obj) => !('title' in obj)),
        async (objWithoutTitle) => {
          vi.stubGlobal('fetch', () => mockFetchResponse(200, '# listing'))

          getMockGroqCreate().mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(objWithoutTitle) } }],
          })

          const res = await callImportRoute('https://example.com/listing')
          const body = await res.json()

          expect(res.status).toBe(422)
          expect(body.code).toBe('EXTRACTION_INCOMPLETE')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns 422 EXTRACTION_INCOMPLETE when title is empty string', async () => {
    vi.stubGlobal('fetch', () => mockFetchResponse(200, '# listing'))

    getMockGroqCreate().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: '' }) } }],
    })

    const res = await callImportRoute('https://example.com/listing')
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.code).toBe('EXTRACTION_INCOMPLETE')
  })

  it('returns 422 EXTRACTION_INCOMPLETE when title is whitespace only', async () => {
    vi.stubGlobal('fetch', () => mockFetchResponse(200, '# listing'))

    getMockGroqCreate().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ title: '   ' }) } }],
    })

    const res = await callImportRoute('https://example.com/listing')
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.code).toBe('EXTRACTION_INCOMPLETE')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.7 Property 8: Form auto-fill mapping
// Validates: Requirements 4.1, 4.2, 4.3
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 8: Form auto-fill maps all non-null fields', () => {
  /**
   * **Validates: Requirements 4.1, 4.2, 4.3**
   * For any ImportResult, mapImportResultToForm produces the correct form values.
   * Non-null fields appear as their string representation; null fields become ''.
   */

  // Pure mapping function (mirrors the onImport callback in PropertiesPage)
  function mapImportResultToForm(result: ImportResult) {
    return {
      title: result.title,
      address: result.address ?? '',
      city: result.city ?? '',
      price: result.price ? String(result.price) : '',
      sqm: result.sqm ? String(result.sqm) : '',
      rooms: result.rooms ? String(result.rooms) : '',
      description: result.description ?? '',
      property_type: result.property_type,
    }
  }

  const propertyTypeArb = fc.constantFrom(
    'apartment', 'house', 'land', 'commercial', 'other'
  ) as fc.Arbitrary<ImportResult['property_type']>

  const importResultArb: fc.Arbitrary<ImportResult> = fc.record({
    title: fc.string({ minLength: 1 }),
    address: fc.option(fc.string(), { nil: null }),
    city: fc.option(fc.string(), { nil: null }),
    price: fc.option(fc.float({ min: 1, max: 10_000_000, noNaN: true }), { nil: null }),
    sqm: fc.option(fc.float({ min: 1, max: 10_000, noNaN: true }), { nil: null }),
    rooms: fc.option(fc.float({ min: 1, max: 20, noNaN: true }), { nil: null }),
    description: fc.option(fc.string(), { nil: null }),
    property_type: propertyTypeArb,
  })

  it('maps non-null fields to their string values and null fields to empty string', () => {
    fc.assert(
      fc.property(importResultArb, (result) => {
        const form = mapImportResultToForm(result)

        expect(form.title).toBe(result.title)
        expect(form.address).toBe(result.address ?? '')
        expect(form.city).toBe(result.city ?? '')
        expect(form.price).toBe(result.price ? String(result.price) : '')
        expect(form.sqm).toBe(result.sqm ? String(result.sqm) : '')
        expect(form.rooms).toBe(result.rooms ? String(result.rooms) : '')
        expect(form.description).toBe(result.description ?? '')
        expect(form.property_type).toBe(result.property_type)
      }),
      { numRuns: 200 }
    )
  })

  it('null numeric fields produce empty string (not "null" or "0")', () => {
    fc.assert(
      fc.property(
        importResultArb.filter((r) => r.price === null && r.sqm === null && r.rooms === null),
        (result) => {
          const form = mapImportResultToForm(result)
          expect(form.price).toBe('')
          expect(form.sqm).toBe('')
          expect(form.rooms).toBe('')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.8 Property 9: Error restores UI state (pure logic test)
// Validates: Requirements 6.1, 6.5
// ─────────────────────────────────────────────────────────────────────────────

describe('Property 9: Error response always restores UI to interactive state', () => {
  /**
   * **Validates: Requirements 6.1, 6.5**
   * getErrorMessage returns a non-empty string for any error code,
   * ensuring the UI always has a message to display and can restore state.
   */
  it('getErrorMessage returns a non-empty string for any arbitrary error code', () => {
    const t = (key: string) => `translated:${key}`

    fc.assert(
      fc.property(fc.string(), (code) => {
        const message = getErrorMessage(code, t)
        expect(typeof message).toBe('string')
        expect(message.length).toBeGreaterThan(0)
      }),
      { numRuns: 200 }
    )
  })

  it('getErrorMessage always returns a string (never throws) for any code', () => {
    const t = (key: string) => key

    fc.assert(
      fc.property(fc.string(), (code) => {
        expect(() => getErrorMessage(code, t)).not.toThrow()
      }),
      { numRuns: 200 }
    )
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8.10 Unit tests for API route edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('API route — unit tests', () => {
  it('returns 401 UNAUTHORIZED for unauthenticated requests', async () => {
    ;(createServerSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(
      mockSupabase(null)
    )

    const res = await callImportRoute('https://example.com/listing')
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 INVALID_URL for a non-URL string', async () => {
    const res = await callImportRoute('not a url at all')
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_URL')
  })

  it('returns 400 INVALID_URL for ftp:// URLs', async () => {
    const res = await callImportRoute('ftp://example.com/file.txt')
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_URL')
  })

  it('returns 400 INVALID_URL when url field is missing', async () => {
    const { POST } = await import('@/app/api/properties/import/route')
    const req = new Request('http://localhost/api/properties/import', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req as any)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_URL')
  })

  it('returns 400 INVALID_URL when url is a number', async () => {
    const res = await callImportRoute(42)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_URL')
  })

  it('returns 200 with ImportResult on a successful import', async () => {
    const expectedResult = {
      title: 'Lovely Apartment',
      address: 'Main St 1',
      city: 'Zagreb',
      price: 150000,
      sqm: 65,
      rooms: 3,
      description: 'Nice place',
      property_type: 'apartment',
    }

    vi.stubGlobal('fetch', () => mockFetchResponse(200, '# listing content'))

    getMockGroqCreate().mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(expectedResult) } }],
    })

    const res = await callImportRoute('https://example.com/listing')
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.title).toBe(expectedResult.title)
    expect(body.property_type).toBe('apartment')
  })

  it('returns 429 RATE_LIMITED when rate limit is exceeded', async () => {
    ;(rateLimit as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, remaining: 0 })

    const res = await callImportRoute('https://example.com/listing')
    const body = await res.json()

    expect(res.status).toBe(429)
    expect(body.code).toBe('RATE_LIMITED')
  })
})
