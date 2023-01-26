import { useEffect, useState } from 'react'


export const useScript = (url) => {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const script = document.createElement('script')
    script.src = url
    script.crossOrigin = ''
    script.onload = (() => {
      setLoading(false)
    })
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [url])
  return [loading]
}

export const useScripts = (urls) => {
  const [loading, setLoading] = useState(true)
  const urlString = urls.join('')
  useEffect(() => {
    const urlsToFetch = urls.slice()
    const scripts = []
    const loadScripts = async () => {
      const script = document.createElement('script')
      script.src = urlsToFetch.pop()
      script.crossOrigin = ''
      scripts.push(script)
      document.body.appendChild(script)
      script.onload = (() => {
        if (urlsToFetch.length > 0) loadScripts()
        else setLoading(false)
      })
    }
    loadScripts()
    return () => {
      scripts.forEach(script => document.body.removeChild(script))
    }
  }, [urlString])
  return [loading]
}

export const useLink = (url) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.crossOrigin = ''
    document.body.appendChild(link)
    link.onload = (() => {
      setLoading(false)
    })
    return () => {
      document.body.removeChild(link)
    }
  }, [url])
  return [loading]
}
