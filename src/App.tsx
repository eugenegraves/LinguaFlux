import { useEffect, useRef, useState, ChangeEvent } from 'react'
import { gsap } from 'gsap'
import debounce from 'lodash/debounce'
import Globe from './components/Globe'
import './styles/global.css'
import './App.css'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const swapButtonRef = useRef<HTMLButtonElement>(null)
  const copiedTooltipRef = useRef<HTMLDivElement>(null)
  const translatedCopiedTooltipRef = useRef<HTMLDivElement>(null)
  const [translatingText, setTranslatingText] = useState('Hello, how are you')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('fr')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { 
          opacity: 0, 
          scale: 0.8 
        },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 1,
          ease: "power3.out"
        }
      )
    }
  }, [])
  
  // Load speech synthesis voices
  useEffect(() => {
    // Initialize voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      if (availableVoices.length > 0) {
        setVoices(availableVoices)
      }
    }
    
    // Load voices initially
    loadVoices()
    
    // Chrome loads voices asynchronously, so we need to listen for the voiceschanged event
    window.speechSynthesis.onvoiceschanged = loadVoices
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const handleTranslate = async () => {
    if (!translatingText.trim()) return
    
    setIsLoading(true)
    setHasError(false)
    
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(translatingText)}&langpair=${sourceLang}|${targetLang}`
      )
      
      if (!response.ok) {
        throw new Error('Translation request failed')
      }
      
      const data = await response.json()
      
      if (data.responseStatus === 200 && data.responseData) {
        setTranslatedText(data.responseData.translatedText)
      } else {
        throw new Error(data.responseMessage || 'Translation failed')
      }
    } catch (error) {
      console.error('Translation error:', error)
      setHasError(true)
      setTranslatedText('Translation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Create a debounced version of the translation function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedTranslate = useRef(
    debounce(() => {
      handleTranslate()
    }, 500)
  ).current
  
  // Trigger translation when inputs change
  useEffect(() => {
    if (translatingText.trim()) {
      debouncedTranslate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translatingText, sourceLang, targetLang])
  
  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedTranslate.cancel()
    }
  }, [debouncedTranslate])
  
  const handleSourceLangChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSourceLang(e.target.value)
  }
  
  const handleTargetLangChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTargetLang(e.target.value)
  }
  
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTranslatingText(e.target.value)
  }
  
  const handleClear = () => {
    setTranslatingText('')
    setTranslatedText('')
    setHasError(false)
  }

  const handleSwapLanguages = () => {
    // Animate dropdown labels
    gsap.to('.language-label', {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        gsap.to('.language-label', {
          opacity: 1,
          duration: 0.3
        })
      }
    })
    
    // Animate button rotation
    if (swapButtonRef.current) {
      gsap.to(swapButtonRef.current, {
        rotation: 180,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(swapButtonRef.current, { rotation: 0 })
        }
      })
      
      // Add brief cultural pattern in background
      gsap.fromTo(
        '.swap-pattern',
        { 
          opacity: 0,
          scale: 0.5 
        },
        { 
          opacity: 0.5,
          scale: 1,
          duration: 0.3,
          onComplete: () => {
            gsap.to('.swap-pattern', {
              opacity: 0,
              duration: 0.3
            })
          }
        }
      )
    }
    
    // Swap languages
    const tempLang = sourceLang
    setSourceLang(targetLang)
    setTargetLang(tempLang)
    
    // If there's already a translation, swap the text too
    if (translatedText) {
      setTranslatingText(translatedText)
      setTranslatedText(translatingText)
    }
  }
  
  const speakText = (text: string, lang: string) => {
    if (!text) return
    
    const speech = new SpeechSynthesisUtterance(text)
    
    // Map language codes to appropriate voice language
    const langMap: {[key: string]: string} = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'es': 'es-ES',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'ar': 'ar-SA'
    }
    
    speech.lang = langMap[lang] || 'en-US'
    
    // Find a voice that matches the language if possible
    const voice = voices.find(v => v.lang.startsWith(speech.lang.split('-')[0]))
    if (voice) {
      speech.voice = voice
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    // Add visual feedback
    const button = document.querySelector(`.speak-button[data-lang="${lang}"]`)
    if (button) {
      gsap.to(button, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      })
    }
    
    window.speechSynthesis.speak(speech)
  }
  
  const copyText = (text: string, isTranslated: boolean) => {
    if (!text) return
    
    navigator.clipboard.writeText(text).then(() => {
      // Show tooltip animation
      const tooltipRef = isTranslated ? translatedCopiedTooltipRef : copiedTooltipRef
      
      if (tooltipRef.current) {
        gsap.fromTo(
          tooltipRef.current,
          { 
            opacity: 0,
            y: 10
          },
          { 
            opacity: 1,
            y: 0,
            duration: 0.3,
            onComplete: () => {
              gsap.to(tooltipRef.current, {
                opacity: 0,
                y: -10,
                delay: 1.5,
                duration: 0.3
              })
            }
          }
        )
      }
    }).catch(err => {
      console.error('Could not copy text: ', err)
    })
  }

  return (
    <>
      <Globe />
      <div className="container">
        <div className="app-container" ref={containerRef}>
          <header>
            <h1>LinguaFlux</h1>
            <p className="tagline">Bridging cultures through translation</p>
          </header>
          
          <div className="card">
            <div className="card-content">
              <h2>Translation App</h2>
              <div className="translation-area">
                <div className="input-group">
                  <label htmlFor="source-language" className="language-label">From:</label>
                  <select 
                    id="source-language" 
                    className="language-select"
                    value={sourceLang}
                    onChange={handleSourceLangChange}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="ru">Russian</option>
                    <option value="pt">Portuguese</option>
                    <option value="it">Italian</option>
                  </select>
                  <div className="textarea-container">
                    <textarea 
                      placeholder="Enter text to translate"
                      rows={4}
                      value={translatingText}
                      onChange={handleInputChange}
                    />
                    <div className="text-actions">
                      <button 
                        className="icon-button speak-button"
                        onClick={() => speakText(translatingText, sourceLang)}
                        title="Listen"
                        aria-label="Listen to the text"
                        data-lang={sourceLang}
                      >
                        <div className="mandala-frame">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                          </svg>
                        </div>
                      </button>
                      <div className="tooltip-container">
                        <button 
                          className="icon-button copy-button"
                          onClick={() => copyText(translatingText, false)}
                          title="Copy"
                          aria-label="Copy text"
                        >
                          <div className="woven-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </div>
                        </button>
                        <div className="tooltip" ref={copiedTooltipRef}>Copied!</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="language-swap-container">
                  <button 
                    className="swap-button"
                    onClick={handleSwapLanguages}
                    ref={swapButtonRef}
                    title="Swap languages"
                    aria-label="Swap languages"
                  >
                    <div className="swap-pattern"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 16V4m0 0L3 8m4-4l4 4"></path>
                      <path d="M17 8v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="input-group">
                  <label htmlFor="target-language" className="language-label">To:</label>
                  <select 
                    id="target-language" 
                    className="language-select"
                    value={targetLang}
                    onChange={handleTargetLangChange}
                  >
                    <option value="fr">French</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="ru">Russian</option>
                    <option value="pt">Portuguese</option>
                    <option value="it">Italian</option>
                  </select>
                  <div className="textarea-container">
                    <textarea 
                      placeholder="Translation will appear here"
                      rows={4}
                      readOnly
                      value={translatedText}
                      className={hasError ? 'error-text' : ''}
                    />
                    <div className="text-actions">
                      <button 
                        className="icon-button speak-button"
                        onClick={() => speakText(translatedText, targetLang)}
                        title="Listen"
                        aria-label="Listen to the translation"
                        disabled={!translatedText || hasError}
                        data-lang={targetLang}
                      >
                        <div className="mandala-frame">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                          </svg>
                        </div>
                      </button>
                      <div className="tooltip-container">
                        <button 
                          className="icon-button copy-button"
                          onClick={() => copyText(translatedText, true)}
                          title="Copy"
                          aria-label="Copy translation"
                          disabled={!translatedText || hasError}
                        >
                          <div className="woven-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                          </div>
                        </button>
                        <div className="tooltip" ref={translatedCopiedTooltipRef}>Copied!</div>
                      </div>
                    </div>
                  </div>
                  {isLoading && <div className="loading-indicator">Translating...</div>}
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="translate-button"
                  onClick={handleTranslate}
                  disabled={isLoading || !translatingText.trim()}
                >
                  {isLoading ? 'Translating...' : 'Translate'}
                </button>
                <button 
                  className="clear-button"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
          
          <footer>
            <p>© 2023 LinguaFlux - A cultural mosaic of global communication</p>
          </footer>
        </div>
      </div>
    </>
  )
}

export default App
