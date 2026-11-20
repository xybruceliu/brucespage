// The site has no light or dark mode of its own: it follows the visitor's
// clock. On the home page the page is a wall in a room with a window, and
// this works out what that wall looks like right now: its colour, the colour
// of the light coming through the window, and where that light comes from.
// It sets the page's colours to match, so the text stays readable on a wall
// that is pale at noon and nearly black at night. Every other page simply
// goes light by day and dark by night, turning when the home page's text
// would.
//
// `paintSky` is also inlined into the page as a script that runs before the
// first paint, so it must stay self-contained: no imports, nothing from
// outside its own body, no object spread.

export type RGB = [number, number, number]

export type Sky = {
  /** Which way the text goes: dark text on a light wall, or the reverse. */
  family: 'light' | 'dark'
  wall: RGB
  /** The wall where the light falls on it in full, at its soft edges. */
  lit: RGB
  /** The middle of the light, washed out nearly to white on a bright day. */
  core: RGB
  /** The light's own colour, for the glow it spreads around itself. */
  tint: RGB
  /** How strongly it glows, 0 to 1. */
  strength: number
  source: 'sun' | 'moon'
  /** Altitude of the sun in degrees; below 0 it has set. */
  altitude: number
  /** For projecting the window onto the wall, in radians. */
  elevation: number
  bearing: number
}

declare global {
  interface Window {
    /** Where the first-paint script placed the visitor (see place.ts) */
    __sunPlace?: [number, number]
  }
}

/** Where the visitor is, for `paintSky`'s `at` */
export const here = () =>
  typeof window === 'undefined' ? undefined : window.__sunPlace

/** `time` defaults to now; `home` is false on every page but the home page;
 * with `apply` false it only works the sky out and leaves the page alone.
 * `at` is where the visitor is, [latitude, longitude] from `place()`; without
 * it, the middle of their time zone at a temperate latitude. */
export function paintSky(
  time?: number,
  home = true,
  apply = true,
  at?: [number, number],
): Sky {
  const RAD = Math.PI / 180

  const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x))
  const smooth = (a: number, b: number, x: number) => {
    const t = clamp((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)
  }
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const toSrgb = (l: number) => {
    const c = l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055
    return Math.round(clamp(c, 0, 1) * 255)
  }
  const rgb = (n: number): RGB => [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  // Light adds up in linear space, so colours are mixed there
  const mix = (a: RGB, b: RGB, t: number): RGB => [
    toSrgb(lerp(toLinear(a[0]), toLinear(b[0]), t)),
    toSrgb(lerp(toLinear(a[1]), toLinear(b[1]), t)),
    toSrgb(lerp(toLinear(a[2]), toLinear(b[2]), t)),
  ]
  const luminance = (c: RGB) =>
    0.2126 * toLinear(c[0]) + 0.7152 * toLinear(c[1]) + 0.0722 * toLinear(c[2])
  const css = (c: RGB) =>
    '#' + ((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1)

  // Keyframes along the altitude of the sun, in degrees
  type Stop = [number, number]
  const colourAt = (stops: Stop[], alt: number): RGB => {
    if (alt <= stops[0][0]) return rgb(stops[0][1])
    for (let i = 1; i < stops.length; i++)
      if (alt <= stops[i][0]) {
        const t = (alt - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])
        return mix(rgb(stops[i - 1][1]), rgb(stops[i][1]), smooth(0, 1, t))
      }
    return rgb(stops[stops.length - 1][1])
  }
  const valueAt = (stops: Stop[], alt: number) => {
    if (alt <= stops[0][0]) return stops[0][1]
    for (let i = 1; i < stops.length; i++)
      if (alt <= stops[i][0]) {
        const t = (alt - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])
        return lerp(stops[i - 1][1], stops[i][1], smooth(0, 1, t))
      }
    return stops[stops.length - 1][1]
  }

  // Where the sun is, or with `opposite` a full moon: where the sun was half
  // a day ago, on the other side of the equator
  const date = time === undefined ? new Date() : new Date(time)
  const year = date.getFullYear()
  const latitude = (at ? at[0] : 37.5) * RAD
  const longitude = at
    ? at[1]
    : -Math.max(
        new Date(year, 0, 1).getTimezoneOffset(),
        new Date(year, 6, 1).getTimezoneOffset(),
      ) / 4
  const position = (opposite: boolean) => {
    const day =
      (Date.UTC(year, date.getMonth(), date.getDate()) - Date.UTC(year, 0, 0)) /
      864e5
    let decl = -23.44 * RAD * Math.cos(((2 * Math.PI) / 365) * (day + 10))
    // The sun's own time where the visitor is: the clock in UTC, moved on
    // by their longitude, and by the equation of time (the sun runs up to a
    // quarter of an hour fast or slow over the year). Summer time drops out
    const b = (2 * Math.PI * (day - 81)) / 364
    const fast = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
    const hours =
      date.getUTCHours() +
      date.getUTCMinutes() / 60 +
      date.getUTCSeconds() / 3600 +
      longitude / 15 +
      fast / 60
    let hourAngle = (hours - 12) * 15 * RAD
    if (opposite) {
      decl = -decl
      hourAngle += Math.PI
    }
    // From -180° to 180°, noon at 0
    hourAngle =
      ((((hourAngle + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) %
        (2 * Math.PI)) -
      Math.PI
    const altitude = Math.asin(
      Math.sin(latitude) * Math.sin(decl) +
        Math.cos(latitude) * Math.cos(decl) * Math.cos(hourAngle),
    )
    // How far across the sky it has come today, 0 at rising and 1 at
    // setting, north or south of the equator alike
    const half = Math.acos(clamp(-Math.tan(latitude) * Math.tan(decl), -1, 1))
    const progress = clamp(
      (hourAngle + half) / (2 * Math.max(half, 0.01)),
      0,
      1,
    )
    return {
      altitude: altitude / RAD,
      // Morning light rakes deep into the room, evening light hugs the window
      bearing: lerp(32, 68, progress) * RAD,
      // Kept shallow so the light stays on the wall even in summer
      elevation: (4 + 0.55 * Math.max(0, altitude / RAD)) * RAD,
    }
  }

  const sun = position(false)
  const alt = sun.altitude

  // The wall without the sun on it: blue at night, warm at either end of the
  // day, and by day a pale, nearly neutral grey, lit mostly by the sky,
  // which is what makes the warm sunlight on it look bright
  const wall = colourAt(
    [
      [-14, 0x0e1117],
      [-8, 0x151a27],
      [-3, 0x262a3a],
      [0, 0x3b3240],
      [2.5, 0x55433b],
      // No text reads well on a middle grey, so the wall never stays on one:
      // it holds dark until the sun clears the horizon, then the light
      // comes in all at once, the way it floods a room at sunrise (about
      // forty seconds on the clock)
      [3.25, 0x5c4840],
      [3.35, 0xc0a88f],
      [7, 0xc9b198],
      [14, 0xded6cb],
      [25, 0xe7e5e1],
      [45, 0xeceae7],
    ],
    alt,
  )
  const wallY = luminance(wall)
  const family: Sky['family'] = wallY > 0.19 ? 'light' : 'dark'

  // How much the light can brighten the wall. Under light text it has to
  // stay dim, or the text would vanish into it; it only grows once the text
  // has turned dark, so nothing jumps when it does.
  const room =
    family === 'dark' ? 0.1 : lerp(0.1, 0.95, smooth(0.19, 0.35, wallY))
  // How far the light can wash out: not at all under light text, fully on a
  // bright day wall
  const bright = clamp((room - 0.1) / 0.85, 0, 1)
  let source: Sky['source'] = 'sun'
  let lit: RGB
  let core: RGB
  let tint: RGB
  let strength: number
  let elevation = sun.elevation
  let bearing = sun.bearing
  if (alt > -4) {
    const colour = colourAt(
      [
        [-4, 0xff5a30],
        [-1, 0xff6a3a],
        [2, 0xff8f4d],
        [6, 0xffb56a],
        [12, 0xffd496],
        [25, 0xffebc8],
        [45, 0xfff2dc],
      ],
      alt,
    )
    const gain = valueAt(
      [
        [-4, 0],
        [-1, 0.25],
        [2, 0.55],
        [6, 0.8],
        [12, 0.88],
        [25, 0.92],
        [45, 0.95],
      ],
      alt,
    )
    lit = mix(wall, colour, gain * room)
    // Sunlight on a wall is far brighter than anything around it, so where
    // it is strongest it washes out nearly to white; its colour shows at
    // the edges, where it thins out. A low sun is weaker and stays golden
    const hot = mix(colour, rgb(0xffffff), lerp(0.5, 0.86, smooth(6, 25, alt)))
    core = mix(lit, mix(wall, hot, Math.min(1, gain * 1.25)), bright)
    tint = colour
    strength = gain * bright
  } else {
    // Moonlight, once the sun is well down
    const moon = position(true)
    source = 'moon'
    elevation = moon.elevation
    bearing = moon.bearing
    const gain = 0.4 * smooth(-4, -9, alt) * smooth(2, 12, moon.altitude)
    tint = rgb(0xdfe7ff)
    lit = mix(wall, tint, gain * room)
    core = lit
    // No glow: under light text the wall has to stay dark
    strength = 0
  }

  // Text: as dark (or as light) as needed to read against the wall where it
  // is darkest (the room's shading takes up to a seventh off it) and where
  // the light is brightest, and no more: 7:1 for dark text, 5.2:1 for light
  // text. On the darker walls at either end of the day, 7:1 would make body
  // text as black as the links, so there it keeps a step lighter than them
  // (but never under 4.8:1)
  const fg = rgb(family === 'light' ? 0x1b1915 : 0xf2eee8)
  const fgY = luminance(fg)
  const litY = luminance(lit)
  const darkest = Math.min(wallY * 0.86, litY) + 0.05
  const target =
    family === 'light'
      ? Math.min(Math.max(darkest / 7, (fgY + 0.05) * 1.25), darkest / 4.8) -
        0.05
      : (Math.max(wallY, litY) + 0.05) * 5.2 - 0.05
  const muted = mix(fg, wall, clamp((target - fgY) / (wallY - fgY), 0, 0.72))
  const ink = family === 'light' ? '0, 0, 0' : '255, 255, 255'

  if (apply && typeof document !== 'undefined') {
    const root = document.documentElement
    root.classList.toggle('dark', family === 'dark')
    root.classList.toggle('light', family === 'light')
    root.style.colorScheme = family
    // Only the home page is a wall; other pages keep their usual colours
    const tokens: [string, string][] = [
      ['--background', css(wall)],
      ['--foreground', css(fg)],
      ['--muted-foreground', css(muted)],
      [
        '--secondary',
        family === 'light'
          ? 'rgba(255, 255, 255, 0.4)'
          : 'rgba(255, 255, 255, 0.08)',
      ],
      ['--secondary-foreground', css(fg)],
      ['--muted', 'rgba(' + ink + ', 0.07)'],
      ['--accent', 'rgba(' + ink + ', 0.07)'],
      ['--accent-foreground', css(fg)],
      ['--border', 'rgba(' + ink + ', 0.12)'],
      ['--ring', css(muted)],
      // Pictures hang on the same wall: a touch dimmer at night, so white
      // screenshots don't glare on a dark wall, and warmer at the ends of
      // the day
      [
        '--media-filter',
        'brightness(' +
          lerp(0.88, 1, smooth(0, 0.3, wallY)).toFixed(3) +
          ') saturate(' +
          lerp(0.94, 1, smooth(0, 0.3, wallY)).toFixed(3) +
          ') sepia(' +
          (0.14 * smooth(-2, 3, alt) * (1 - smooth(8, 22, alt))).toFixed(3) +
          ')',
      ],
    ]
    for (let i = 0; i < tokens.length; i++) {
      if (home) root.style.setProperty(tokens[i][0], tokens[i][1])
      else root.style.removeProperty(tokens[i][0])
    }
    const chrome = home ? css(wall) : family === 'dark' ? '#0a0a0a' : '#ffffff'
    const metas = document.querySelectorAll('meta[name="theme-color"]')
    for (let i = 0; i < metas.length; i++)
      metas[i].setAttribute('content', chrome)
  }

  return {
    family,
    wall,
    lit,
    core,
    tint,
    strength,
    source,
    altitude: alt,
    elevation,
    bearing,
  }
}
