
export type IllustrationType = 
  | 'welcome' 
  | 'search' 
  | 'compare' 
  | 'alerts' 
  | 'agents'
  | 'locations' 
  | 'property-types' 
  | 'budget'

export interface IllustrationMetadata {
  id: IllustrationType
  title: string
  description: string
  alt: string
  dimensions: { width: number; height: number }
}
