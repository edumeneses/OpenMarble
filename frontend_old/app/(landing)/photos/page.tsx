import { ButtonGroup } from '@/components/core/button'
import { NavigationBar, NavigationBarTitle } from '@/components/core/navigation-bar'
import {
  Ornament,
  OrnamentContent,
  OrnamentContents,
  OrnamentTab,
  OrnamentTabs,
} from '@/components/core/ornament'
import { CollectionsIcon, PanoIcon, PhotosIcon, SearchIcon, SpacialIcon } from '@/components/icons'
import { HeroDropdownMenu } from '@/components/landing/hero-dropdown-menu'
import { defaultWindowProps } from '../constants'
import { MemoriesToolbar, MemoriesView } from './memories-view'

function PhotosPage() {
  return (
    <Ornament defaultTab="library">
      <OrnamentTabs>
        <OrnamentTab icon={<PhotosIcon data-slot="icon" />} label="Library" value="library" />
        <OrnamentTab
          icon={<CollectionsIcon data-slot="icon" />}
          label="Collections"
          value="collections"
        />
        <OrnamentTab icon={<SpacialIcon data-slot="icon" />} label="Spacial" value="spacial" />
        <OrnamentTab icon={<PanoIcon data-slot="icon" />} label="Panoramas" value="panoramas" />
        <OrnamentTab icon={<SearchIcon data-slot="icon" />} label="Search" value="search" />
      </OrnamentTabs>
      <OrnamentContents>
        <OrnamentContent
          {...defaultWindowProps}
          value="library"
          key="library"
          FooterComponent={MemoriesToolbar}
          rootClassName="[--window-controls-bottom:-80px]"
        >
          <MemoriesView />
        </OrnamentContent>
        <OrnamentContent value="collections" key="collections" {...defaultWindowProps}>
          <NavigationBar>
            <div />
            <NavigationBarTitle>Collections</NavigationBarTitle>
            <ButtonGroup>
              <HeroDropdownMenu />
            </ButtonGroup>
          </NavigationBar>
        </OrnamentContent>
        <OrnamentContent value="spacial" key="spacial" {...defaultWindowProps}>
          <NavigationBar>
            <div />
            <NavigationBarTitle>Spacial</NavigationBarTitle>
            <ButtonGroup>
              <HeroDropdownMenu />
            </ButtonGroup>
          </NavigationBar>
        </OrnamentContent>
        <OrnamentContent value="panoramas" key="panoramas" {...defaultWindowProps}>
          <NavigationBar>
            <div />
            <NavigationBarTitle>Panoramas</NavigationBarTitle>
            <ButtonGroup>
              <HeroDropdownMenu />
            </ButtonGroup>
          </NavigationBar>
        </OrnamentContent>
        <OrnamentContent value="search" key="search" {...defaultWindowProps}>
          <NavigationBar>
            <div />
            <NavigationBarTitle>Search</NavigationBarTitle>
          </NavigationBar>
        </OrnamentContent>
      </OrnamentContents>
    </Ornament>
  )
}

export default PhotosPage
