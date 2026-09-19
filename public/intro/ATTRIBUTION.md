# Intro Earth textures

The local textures are derived from NASA's 2002 Blue Marble imagery. They are
historical global composites, not live weather or a single photograph.

## Source and credit

NASA Goddard Space Flight Center. Images by Reto Stöckli; enhancements by Robert
Simmon. Data support: MODIS Land, Atmosphere, Ocean, and Science Data Support
teams. Additional source data: USGS EROS Data Center, USGS Terrestrial Remote
Sensing Flagstaff Field Center, and NOAA AVHRR.

| Local files | NASA source record | Original download |
| --- | --- | --- |
| `earth-day.webp`, `earth-day-mobile.webp` | [The Blue Marble: Land Surface, Ocean Color and Sea Ice](https://visibleearth.nasa.gov/images/57730/the-blue-marble-land-surface-ocean-color-and-sea-ice) | [land_ocean_ice_2048.jpg](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg) |
| `earth-clouds.webp`, `earth-clouds-mobile.webp` | [Blue Marble: Clouds](https://visibleearth.nasa.gov/images/57747/blue-marble-clouds/77558l) | [cloud_combined_2048.jpg](https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg) |

The original image files were downloaded from NASA on September 19, 2026. The
legacy Visible Earth record pages may redirect during NASA's site migration;
the direct NASA-hosted image URLs above were available at download time.

## Usage terms

NASA-produced imagery is generally not subject to copyright in the United
States and may be used on personal informational web pages under the
[NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).
NASA is acknowledged as the imagery source. This portfolio and its animation
are not sponsored, reviewed, or endorsed by NASA. No NASA logo is included.

## Local processing

- Desktop maps retain the original 2048 × 1024 resolution; mobile maps are
  downsampled to 1024 × 512 using Lanczos resampling.
- Day maps are RGB WebP, quality 88.
- Cloud maps use the original grayscale luminance, white clouds on black,
  encoded as WebP at quality 72 (desktop) and 75 (mobile). The renderer uses
  luminance for a separate cloud shell's opacity.
- No terrain, clouds, colors, geographic features, lighting, or shadows were
  painted into the source imagery. Files are served locally, without runtime
  requests to NASA.
