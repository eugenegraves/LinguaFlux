import { useEffect, useRef, useState, ChangeEvent } from 'react'
import { gsap } from 'gsap'
import debounce from 'lodash/debounce'
import Globe from './components/Globe'
import './styles/global.css'
import './App.css'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [translatingText, setTranslatingText] = useState('Hello, how are you')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('fr')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

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
                  <label htmlFor="source-language">From:</label>
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
                  <textarea 
                    placeholder="Enter text to translate"
                    rows={4}
                    value={translatingText}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="target-language">To:</label>
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
                  <textarea 
                    placeholder="Translation will appear here"
                    rows={4}
                    readOnly
                    value={translatedText}
                    className={hasError ? 'error-text' : ''}
                  />
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
