'use client'

import { GridList } from '@/components/core/v2/grid-layout'
import { items, renderCell as RenderCell } from './render-items'

export default function GridListPage() {
  return <GridList items={items} renderCell={(props) => <RenderCell {...props} />} />
}
