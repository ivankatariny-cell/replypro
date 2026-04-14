'use client'

import { useState } from 'react'
import { Loader2, Link } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import type { ImportResult } from '@/types'

export function isValidUrl(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://')
}

export function getErrorMessage(code: string, t: (k: string) => string): string {
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
}

interface UrlImporterProps {
  onImport: (result: ImportResult) => void
  formSubmitting?: boolean
  onExpandForm?: () => void
}

export function UrlImporter({ onImport, formSubmitting, onExpandForm }: UrlImporterProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const valid = isValidUrl(url)
  const showInvalid = url.length > 0 && !valid
  const disabled = !valid || loading || !!formSubmitting

  const handleImport = async () => {
    if (disabled) return

    setLoading(true)
    try {
      const res = await fetch('/api/properties/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (res.ok) {
        const result: ImportResult = await res.json()
        onImport(result)
        onExpandForm?.()
        toast(t('properties.import_url_success'), 'success')
      } else {
        const body = await res.json().catch(() => ({ code: 'UNKNOWN' }))
        toast(getErrorMessage(body.code ?? 'UNKNOWN', t), 'error')
      }
    } catch {
      toast(getErrorMessage('UNKNOWN', t), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border bg-background p-4 space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="import-url">{t('properties.import_url_label')}</Label>
        <div className="flex gap-2">
          <Input
            id="import-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('properties.import_url_placeholder')}
            disabled={loading}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !disabled) handleImport()
            }}
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('properties.import_url_importing')}
              </>
            ) : (
              <>
                <Link className="h-4 w-4" />
                {t('properties.import_url_btn')}
              </>
            )}
          </button>
        </div>
        {showInvalid && (
          <p className="text-xs text-destructive">{t('properties.import_url_invalid')}</p>
        )}
      </div>
    </div>
  )
}
