import { ButtonGroup } from '@/components/core/button'
import { NavigationBar, NavigationBarTitle } from '@/components/core/navigation-bar'
import {
  OrnamentWindowed,
  OrnamentWindowedContent,
  OrnamentWindowedContents,
  OrnamentWindowedTab,
  OrnamentWindowedTabs,
} from '@/components/core/ornament-windowed'
import { CollectionsIcon, PanoIcon, PhotosIcon, SearchIcon, SpacialIcon } from '@/components/icons'
import { HeroDropdownMenu } from '@/components/landing/hero-dropdown-menu'
import { defaultWindowProps } from '../constants'
import { MemoriesToolbar, MemoriesView } from './memories-view'

function PhotosPage() {
  return (
    <OrnamentWindowed defaultTab="library">
      <OrnamentWindowedTabs>
        <OrnamentWindowedTab icon={<PhotosIcon data-slot="icon" />} label="Library" value="library" />
        <OrnamentWindowedTab
          icon={<CollectionsIcon data-slot="icon" />}
          label="Collections"
          value="collections"
        />
        <OrnamentWindowedTab icon={<SpacialIcon data-slot="icon" />} label="Spacial" value="spacial" />
        <OrnamentWindowedTab icon={<PanoIcon data-slot="icon" />} label="Panoramas" value="panoramas" />
        <OrnamentWindowedTab icon={<SearchIcon data-slot="icon" />} label="Search" value="search" />
      </OrnamentWindowedTabs>
      <OrnamentWindowedContents>
        <OrnamentWindowedContent
          {...defaultWindowProps}
          value="library"
          key="library"
          FooterComponent={MemoriesToolbar}
          rootClassName="[--window-controls-bottom:-80px]"
        >
          <MemoriesView />
        </OrnamentWindowedContent>
        <OrnamentWindowedContent value="collections" key="collections" {...defaultWindowProps}>
          <NavigationBar>
            <div />
            <NavigationBarTitle>Collections</NavigationBarTitle>
            <ButtonGroup>
              <HeroDropdownMenu />
            </ButtonGroup>
          </NavigationBar>
        </OrnamentWindowedContent>
        <OrnamentWindowedContent value="spacial" key="spacial" {...defaultWindowProps}>
          <NavigationBar>
            <div />
            <NavigationBarTitle>Spacial</NavigationBarTitle>
            <ButtonGroup>
              <HeroDropdownMenu />
            </ButtonGroup>
          </NavigationBar>
        </OrnamentWindowedContent>
        <OrnamentWindowedContent value="panoramas" key="panoramas" {...defaultWindowProps}>
          <NavigationBar>
            <div />
            <NavigationBarTitle>Panoramas</NavigationBarTitle>
            <ButtonGroup>
              <HeroDropdownMenu />
            </ButtonGroup>
          </NavigationBar>
        </OrnamentWindowedContent>
        <OrnamentWindowedContent value="search" key="search" {...defaultWindowProps}>
          <NavigationBar>
            <div />
            <NavigationBarTitle>Search</NavigationBarTitle>
          </NavigationBar>
        </OrnamentWindowedContent>
      </OrnamentWindowedContents>
    </OrnamentWindowed>
  )
}

export default PhotosPage
