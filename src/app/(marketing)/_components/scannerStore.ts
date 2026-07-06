export interface ScannerResultsEvent {
  type: 'results'
  analysis: Analysis
  mrr: number
  url: string
}

interface Analysis {
  businessType: string
  whatWeDetected: string
  recoveryApproach: string
  emailToneRecommendation: string
  emailToneReason: string
  sampleSubject: string
  sampleOpener: string
  estimatedRecoveryRate: string
  keyInsight: string
}

export type ScannerEvent =
  | { type: 'loading'; displayUrl: string; step: number }
  | ScannerResultsEvent
  | { type: 'error' }
  | { type: 'reset' }

type ScannerListener = (event: ScannerEvent) => void

const listeners = new Set<ScannerListener>()

export const scannerStore = {
  emit(event: ScannerEvent) {
    listeners.forEach(l => l(event))
  },
  subscribe(listener: ScannerListener) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
