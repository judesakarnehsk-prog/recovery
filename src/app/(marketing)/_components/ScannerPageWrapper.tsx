'use client'

import { useEffect, useState } from 'react'
import { scannerStore } from './scannerStore'
import type { ScannerResultsEvent } from './scannerStore'
import { ScanLoadingSection, ScanResultsSection, ScanErrorSection } from './RevenueScanner'

type ScanState = 'idle' | 'loading' | 'results' | 'error'

interface ScanResults {
  analysis: ScannerResultsEvent['analysis']
  mrr: number
  url: string
}

export function ScannerPageWrapper() {
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [scanResults, setScanResults] = useState<ScanResults | null>(null)
  const [loadingUrl, setLoadingUrl] = useState('')
  const [loadingStep, setLoadingStep] = useState(1)

  useEffect(() => {
    return scannerStore.subscribe((event) => {
      if (event.type === 'loading') {
        setLoadingUrl(event.displayUrl)
        setLoadingStep(event.step)
        setScanState('loading')
        if (event.step === 1) {
          setTimeout(() => {
            const el = document.getElementById('scan-results-section')
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 80
              window.scrollTo({ top, behavior: 'smooth' })
            }
          }, 120)
        }
      }

      if (event.type === 'results') {
        setScanResults({ analysis: event.analysis, mrr: event.mrr, url: event.url })
        setScanState('results')
        setTimeout(() => {
          const el = document.getElementById('scan-results-section')
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 80
            window.scrollTo({ top, behavior: 'smooth' })
          }
        }, 100)
      }

      if (event.type === 'error') setScanState('error')

      if (event.type === 'reset') {
        setScanState('idle')
        setScanResults(null)
      }
    })
  }, [])

  const handleReset = () => {
    scannerStore.emit({ type: 'reset' })
  }

  if (scanState === 'idle') return null

  return (
    <>
      {scanState === 'loading' && (
        <ScanLoadingSection displayUrl={loadingUrl} scanStep={loadingStep} />
      )}
      {scanState === 'results' && scanResults && (
        <ScanResultsSection
          analysis={scanResults.analysis}
          mrr={scanResults.mrr}
          url={scanResults.url}
          onReset={handleReset}
        />
      )}
      {scanState === 'error' && (
        <ScanErrorSection onReset={handleReset} />
      )}
    </>
  )
}
