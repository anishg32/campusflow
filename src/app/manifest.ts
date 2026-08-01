import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Arunachala Hitech Engineering College',
    short_name: 'AHEC App',
    description: 'Teacher-led attendance management system for Arunachala Hitech Engineering College',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
