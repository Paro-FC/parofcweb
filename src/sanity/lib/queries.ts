// YouTube homepage carousel
export const YOUTUBE_VIDEOS_QUERY = `*[_type == "youtubeVideo"] | order(coalesce(publishedAt, _createdAt) desc) [0...5] {
  _id,
  title,
  youtubeUrl,
  publishedAt
}`;

// News queries
export const NEWS_QUERY = `*[_type == "news"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  image,
  publishedAt,
  description,
  externalUrl
}`;

// Single news article query
export const NEWS_ARTICLE_QUERY = `*[_type == "news" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  image,
  publishedAt,
  description,
  externalUrl,
  body[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  },
  author,
  readTime
}`;

// Related news query
export const RELATED_NEWS_QUERY = `*[_type == "news" && slug.current != $slug] | order(publishedAt desc) [0...4] {
  _id,
  title,
  "slug": slug.current,
  image,
  publishedAt,
  description,
  externalUrl
}`;

// Blog queries
export const BLOG_QUERY = `*[_type == "blog"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  image,
  badge,
  publishedAt,
  description
}`;

export const BLOG_ARTICLE_QUERY = `*[_type == "blog" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  image,
  badge,
  publishedAt,
  description,
  body[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  },
  author,
  readTime
}`;

export const RELATED_BLOG_QUERY = `*[_type == "blog" && slug.current != $slug] | order(publishedAt desc) [0...4] {
  _id,
  title,
  "slug": slug.current,
  image,
  badge,
  publishedAt,
  description
}`;

// Players queries
export const PLAYERS_QUERY = `*[_type == "player"] | order(number asc) {
  _id,
  firstName,
  lastName,
  number,
  position,
  team,
  image,
  stats,
  "slug": slug.current
}`;

// Players query filtered by team
export const PLAYERS_BY_TEAM_QUERY = `*[_type == "player" && team == $team] | order(number asc) {
  _id,
  firstName,
  lastName,
  number,
  position,
  team,
  image,
  stats,
  "slug": slug.current
}`;

// Single player query (handles both slug and _id)
export const PLAYER_QUERY = `*[_type == "player" && (slug.current == $slug || _id == $slug)][0] {
  _id,
  firstName,
  lastName,
  number,
  position,
  team,
  image,
  stats,
  "slug": slug.current,
  bio[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  },
  placeOfBirth,
  dateOfBirth,
  height,
  weight,
  honours
}`;

// Related players query (same position, excluding current player)
export const RELATED_PLAYERS_QUERY = `*[_type == "player" && (slug.current != $slug && _id != $slug) && position == $position] | order(number asc) [0...4] {
  _id,
  firstName,
  lastName,
  number,
  position,
  image,
  "slug": slug.current
}`;

// Coaching staff query
export const COACHING_STAFF_QUERY = `*[_type == "coachingStaff" && (team == $team || team == "both")] | order(order asc, name asc) {
  _id,
  name,
  role,
  "category": category->{ _id, title, order },
  image
}`;

// Next match ticket URL — for footer Buy Tickets button
export const NEXT_MATCH_TICKET_QUERY = `*[_type == "match" && date >= now() && hideMatch != true && competition->team == "men"] | order(date asc) [0] {
  ticketUrl
}`;

// Matches queries — only upcoming/live men's matches (date >= now)
export const MATCHES_QUERY = `*[_type == "match" && date >= now() && hideMatch != true && competition->team == "men"] | order(date asc) [0...3] {
  _id,
  homeTeam,
  awayTeam,
  "homeCrest": homeCrest.asset->url,
  "awayCrest": awayCrest.asset->url,
  "competition": competition->name,
  date,
  event,
  venue,
  matchUrl,
  showMatchLink,
  ticketUrl
}`;

// All matches query for calendar page (shows hidden matches too — hideMatch only affects the homepage widget)
export const ALL_MATCHES_QUERY = `*[_type == "match"] | order(date asc) {
  _id,
  homeTeam,
  awayTeam,
  homeCrest {
    asset-> {
      _id,
      url
    }
  },
  awayCrest {
    asset-> {
      _id,
      url
    }
  },
  "competition": competition->name,
  "competitionTeam": competition->team,
  date,
  event,
  venue,
  matchUrl,
  showMatchLink,
  ticketUrl,
  status,
  homeScore,
  awayScore
}`;

// Single match query
export const MATCH_QUERY = `*[_type == "match" && _id == $id][0] {
  _id,
  homeTeam,
  awayTeam,
  homeCrest {
    asset-> {
      _id,
      url
    }
  },
  awayCrest {
    asset-> {
      _id,
      url
    }
  },
  "competition": competition->name,
  date,
  event,
  venue,
  matchUrl,
  showMatchLink,
  status,
  minute,
  homeScore,
  awayScore
}`;

// Stories queries
export const STORIES_QUERY = `*[_type == "story"] | order(_createdAt desc) {
  _id,
  title,
  coverImage,
  isNew,
  media[] {
    _key,
    _type,
    caption,
    duration,
    "image": image.asset->url,
    "video": video.asset->url,
    "poster": poster.asset->url
  }
}`;

// Partners queries
export const PARTNERS_QUERY = `*[_type == "partner" && isActive == true] | order(order asc, name asc) {
  _id,
  name,
  "logo": logo.asset->url,
  url,
  category
}`;

// Main partners query (for homepage)
export const MAIN_PARTNERS_QUERY = `*[_type == "partner" && isActive == true && category == "main"] | order(order asc, name asc) {
  _id,
  name,
  "logo": logo.asset->url,
  url,
  category
}`;

// Sub partners query (for homepage)
export const SUB_PARTNERS_QUERY = `*[_type == "partner" && isActive == true && category == "sub"] | order(order asc, name asc) {
  _id,
  name,
  "logo": logo.asset->url,
  url,
  category
}`;

// Standings queries
export const STANDINGS_QUERY = `*[_type == "standing" && competition->slug.current == $competition && season == $season][0] {
  _id,
  season,
  "competition": competition->slug.current,
  "competitionName": competition->name,
  "competitionShort": competition->short,
  teams[] {
    position,
    teamName,
    "teamLogo": teamLogo.asset->url,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    points,
    form
  }
}`;

// Latest standings (full) for a competition
export const STANDINGS_LATEST_QUERY = `*[_type == "standing" && competition->slug.current == $competition] | order(_updatedAt desc)[0] {
  _id,
  season,
  "competition": competition->slug.current,
  "competitionName": competition->name,
  "competitionShort": competition->short,
  teams[] {
    position,
    teamName,
    "teamLogo": teamLogo.asset->url,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    points,
    form
  }
}`;

// Latest men's standings (homepage default)
export const STANDINGS_HOME_LATEST_QUERY = `*[_type == "standing" && competition->team == "men"] | order(_updatedAt desc)[0] {
  _id,
  season,
  "competition": competition->slug.current,
  "competitionName": competition->name,
  "competitionShort": competition->short,
  teams[] {
    position,
    teamName,
    "teamLogo": teamLogo.asset->url,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    points,
    form
  }
}`;

export const STANDINGS_SEASONS_QUERY = `*[_type == "standing" && competition->slug.current == $competition] | order(season desc) {
  season
}`;

// List competitions that have standings docs
export const STANDINGS_COMPETITIONS_QUERY = `*[_type == "standingsCompetition" && isActive == true] | order(order asc, name asc) {
  "id": slug.current,
  name,
  short,
  order,
  "logo": logo.asset->url
}`;

// Photos queries
export const PHOTOS_QUERY = `*[_type == "photo"] | order(date desc) {
  _id,
  title,
  "coverImage": image.asset->url,
  date,
  "slug": slug.current,
  galleryUrl
}`;

export const PHOTO_QUERY = `*[_type == "photo" && slug.current == $slug][0] {
  _id,
  title,
  "coverImage": image.asset->url,
  date,
  "slug": slug.current,
  galleryUrl
}`;

// (tickets removed)

// Trophies queries
export const TROPHIES_QUERY = `*[_type == "trophy"] | order(name asc) {
  _id,
  name,
  total
}`;

// Search queries
export const SEARCH_NEWS_QUERY = `*[_type == "news" && (title match $searchTerm || description match $searchTerm)] | order(publishedAt desc) [0...5] {
  _id,
  title,
  "slug": slug.current,
  image,
  badge,
  publishedAt,
  description
}`;

export const SEARCH_PLAYERS_QUERY = `*[_type == "player" && (firstName match $searchTerm || lastName match $searchTerm)] | order(lastName asc) [0...5] {
  _id,
  firstName,
  lastName,
  number,
  position,
  image,
  "slug": slug.current
}`;

export const SEARCH_PHOTOS_QUERY = `*[_type == "photo" && title match $searchTerm] | order(date desc) [0...5] {
  _id,
  title,
  "coverImage": coverImage.asset->url,
  category,
  date,
  "slug": slug.current
}`;

// Players — Academy content (singleton-ish: first doc wins)
export const ACADEMY_PLAYERS_QUERY = `*[_type == "academy"] | order(_updatedAt desc)[0]{
  _id,
  title,
  subtitle,
  intro[],
  youth[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  },
  grassroot[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  }
}`

// Ebooks
export const EBOOKS_QUERY = `*[_type == "ebook"] | order(_createdAt desc) {
  _id,
  title,
  url,
  description
}`


// Top Scorer (highest goals first)
export const TOP_SCORER_QUERY = `*[_type == "topScorer"] | order(goals desc)[0] {
  _id,
  name,
  "image": image.asset->url,
  goals,
  club
}`

// Standings mini - top 8 teams for sidebar
export const STANDINGS_MINI_QUERY = `*[_type == "standing" && competition->slug.current == $competition] | order(season desc) [0] {
  _id,
  season,
  "competition": competition->slug.current,
  "competitionName": competition->name,
  "competitionShort": competition->short,
  teams[] {
    position,
    teamName,
    "teamLogo": teamLogo.asset->url,
    points
  }
}`;

// Categories query
export const CATEGORIES_QUERY = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  image
}`;

// Products queries
export const PRODUCTS_QUERY = `*[_type == "product"] {
  _id,
  name,
  "slug": slug.current,
  image,
  hoverImage,
  category-> {
    _id,
    title,
    "slug": slug.current,
    image
  },
  price,
  currency,
  salePrice,
  badge,
  sizes,
  inStock,
  _createdAt
}`;

export const PRODUCTS_BY_CATEGORY_QUERY = `*[_type == "product" && category._ref == $categoryId && inStock == true] {
  _id,
  name,
  "slug": slug.current,
  image,
  hoverImage,
  category-> {
    _id,
    title,
    "slug": slug.current,
    image
  },
  price,
  currency,
  salePrice,
  badge,
  sizes,
  inStock,
  _createdAt
}`;

export const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  image,
  hoverImage,
  category-> {
    _id,
    title,
    "slug": slug.current,
    image
  },
  price,
  currency,
  salePrice,
  badge,
  sizes,
  inStock,
  description,
  assemblyRequired,
  color,
  dimensions,
  featured,
  "images": images[] { _key, _type, asset, hotspot, crop },
  material,
  stock
}`;

export const ABOUT_PAGE_QUERY = `*[_type == "aboutPage" && _id == "singleton-about-page"][0] {
  _id,
  title,
  subtitle,
  heroImage {
    asset-> { _id, url },
    hotspot,
    crop
  },
  body[] {
    ...,
    _type == "image" => {
      ...,
      asset->
    }
  }
}`;
