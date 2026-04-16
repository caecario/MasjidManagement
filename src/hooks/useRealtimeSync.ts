'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type TableName = 'events' | 'donations' | 'finances' | 'announcements' | 'hadiths' | 'prayer_times' | 'mosque_config'

/**
 * Subscribe to realtime changes on specified tables.
 * Calls onUpdate when any change occurs.
 */
export function useRealtimeSync(
  tables: TableName[],
  onUpdate: (table: TableName) => void
) {
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('tv-realtime')

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          onUpdate(table)
        }
      )
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
