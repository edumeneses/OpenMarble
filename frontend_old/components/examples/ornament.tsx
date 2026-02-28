import { IconHistory, IconPhotoFilled } from '@tabler/icons-react'
import {
  Ornament,
  OrnamentContent,
  OrnamentContents,
  OrnamentTab,
  OrnamentTabs,
} from '../core/ornament'

export const OrnamentExample = () => {
  return (
    <div className="flex w-full flex-1 pl-[96px]">
      <Ornament defaultTab="memories">
        <OrnamentTabs>
          <OrnamentTab
            icon={<IconPhotoFilled data-slot="icon" />}
            label="Memories"
            value="memories"
          />
          <OrnamentTab icon={<IconHistory data-slot="icon" />} label="History" value="history" />
        </OrnamentTabs>
        <OrnamentContents contentClassName="h-[400px] min-w-64">
          <OrnamentContent value="memories" key="memories">
            <div className="h-[1000px] w-full pt-8">Scrollable content</div>
            <div className="pb-8 text-center">End</div>
          </OrnamentContent>
          <OrnamentContent value="history" key="history" scroll={false}>
            <div className="flex h-full flex-1 items-center justify-center pt-8">History</div>
          </OrnamentContent>
        </OrnamentContents>
      </Ornament>
    </div>
  )
}
