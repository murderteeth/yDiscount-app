import { useEffect, useState } from 'react'

export function useMonth() {
  const [month, setMonth] = useState<number | undefined>(undefined)

  useEffect(() => {
    fetch('/api/month').then(res => {
      res.json().then(json => {
        setMonth(json.month)
      })
    })
  }, [setMonth])

  return { month }
}
