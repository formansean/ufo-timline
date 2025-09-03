# Data Structure Comparison

## Overview

This document provides a comprehensive comparison between the original WordPress/PHP data structure and the current React/Next.js implementation. Understanding these differences is crucial for data migration, feature parity, and system optimization.

## High-Level Architecture Comparison

### Original WordPress System
- **Storage**: MySQL via WordPress database
- **Content Management**: WordPress admin with Advanced Custom Fields
- **Field Types**: ACF field types (text, select, repeater, etc.)
- **Data Access**: WordPress API functions (`get_field()`, `get_post_meta()`)
- **JSON Output**: PHP processing to JavaScript variables

### Current React System  
- **Storage**: PostgreSQL via Prisma ORM
- **Content Management**: Custom admin interface
- **Field Types**: TypeScript interfaces with validation
- **Data Access**: REST API with Next.js route handlers
- **JSON Output**: Structured API responses

## Core Event Data Structure

### Field-by-Field Comparison

| Field | Original WordPress | Current React | Notes |
|-------|-------------------|---------------|-------|
| **Basic Info** |||
| `id` | `get_the_ID()` | `string (cuid)` | WordPress uses auto-increment, React uses CUID |
| `title` | `get_the_title()` | `string` | Direct match |
| `category` | `get_field('category')` | `EventCategory` | Enum type in React for validation |
| `date` | `get_field('date')` | `string` | Both use "November 17, 1986" format |
| `time` | `get_field('time')` | `string?` | Optional in both systems |
| **Location** |||
| `location` | `get_field('location')` | `string?` | General location field |
| `city` | `get_field('city')` | `string?` | City name |
| `state` | `get_field('state')` | `string?` | State/province |
| `country` | `get_field('country')` | `string?` | Country name |
| `latitude` | `get_field('latitude')` | `string?` | Coordinate as string |
| `longitude` | `get_field('longitude')` | `string?` | Coordinate as string |
| **Craft Characteristics** |||
| `craft_type` | `handle_array_field(get_field('craft_type'))` | `string?` | Array → CSV conversion in original |
| `craft_size` | `handle_array_field(get_field('craft_size'))` | `string?` | Same conversion pattern |
| `craft_behavior` | `handle_array_field(get_field('craft_behavior'))` | `string?` | Array handling |
| `color` | `handle_array_field(get_field('color'))` | `string?` | Color descriptions |
| `sound_or_noise` | `handle_array_field(get_field('sound_or_noise'))` | `string?` | Audio characteristics |
| `light_characteristics` | `handle_array_field(get_field('light_characteristics'))` | `string?` | Light patterns |
| **Evidence & Witnesses** |||
| `witnesses` | `get_field('witnesses')` | `string?` | Witness names/count |
| `eyewitness` | `handle_array_field(get_field('eyewitness'))` | `string?` | Eyewitness status |
| `duration` | `get_field('duration')` | `string?` | Event duration |
| `weather` | `handle_array_field(get_field('weather'))` | `string?` | Weather conditions |
| `photo` | `get_field('photo')` | `string?` | Photo evidence |
| `video` | `get_field('video')` | `string?` | Video evidence |
| `radar` | `get_field('radar')` | `string?` | Radar confirmation |
| **Investigation** |||
| `credibility` | `get_field('credibility')` | `string?` | Credibility score 0-100 |
| `notoriety` | `get_field('notoriety')` | `string?` | Notoriety level |
| `government_involvement` | `handle_array_field(get_field('government_involvement'))` | `string?` | Official response |
| **Rich Content** |||
| `detailed_summary` | `get_field('detailed_summary')` | `string?` | Long-form description |
| `media_link` | `handle_link_field(get_field('media_link'))` | `string?` | External links |
| `deep_dive_content` | `handle_deep_dive_content(get_field('deep_dive_content'))` | `DeepDiveContent?` | Complex multimedia |
| **User Interaction** |||
| `likes` | `get_post_meta(get_the_ID(), 'event_likes', true)` | `number` | Like count |
| `dislikes` | `get_post_meta(get_the_ID(), 'event_dislikes', true)` | `number` | Dislike count |

## Type System Evolution

### Original WordPress Types

```php
// Basic field access
$title = get_field('title');
$category = get_field('category');

// Array field processing
function handle_array_field($field) {
    if (is_array($field)) {
        return implode(', ', array_filter($field));
    }
    return $field ? $field : '';
}

// Link field processing  
function handle_link_field($field) {
    if (is_array($field) && isset($field['url'])) {
        return str_replace('http://', 'https://', $field['url']);
    }
    return $field ? str_replace('http://', 'https://', $field) : '';
}
```

### Current React Types

```typescript
export interface UFOEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  
  // Craft characteristics
  craft_type?: string;
  craft_size?: string;
  craft_behavior?: string;
  color?: string;
  sound_or_noise?: string;
  light_characteristics?: string;
  
  // Evidence and witnesses
  witnesses?: string;
  eyewitness?: string;
  duration?: string;
  weather?: string;
  photo?: string;
  video?: string;
  radar?: string;
  
  // Investigation
  credibility?: string;
  notoriety?: string;
  government_involvement?: string;
  
  // Rich content
  detailed_summary?: string;
  media_link?: string;
  deep_dive_content?: DeepDiveContent;
  
  // User interactions
  likes: number;
  dislikes: number;
}

export type EventCategory = 
  | "Major Events"
  | "Tech" 
  | "Military Contact"
  | "Abduction"
  | "Beings"
  | "Interaction"
  | "Sighting"
  | "Mass Sighting"
  | "High Strangeness"
  | "Community";
```

## Deep Dive Content Structure

### Original WordPress Processing

```php
function handle_deep_dive_content($deep_dive_content) {
    $processed_deep_dive_content = array(
        'Videos' => array(),
        'Images' => array(),
        'Reports' => array(),
        'News Coverage' => array()
    );

    if ($deep_dive_content && is_array($deep_dive_content)) {
        foreach ($deep_dive_content as $item) {
            $tab_content = $item['tab_content'];

            switch ($tab_content) {
                case 'Images':
                    if (!empty($item['images'])) {
                        $processed_deep_dive_content['Images'][] = [
                            'type' => 'slider',
                            'content' => array_map(function($image) {
                                return str_replace('http://', 'https://', $image['url']);
                            }, $item['images'])
                        ];
                    }
                    break;

                case 'Video':
                    if (!empty($item['video'])) {
                        foreach ($item['video'] as $video) {
                            $processed_deep_dive_content['Videos'][] = [
                                'type' => 'video',
                                'content' => [
                                    'video' => [
                                        [
                                            'video_link' => $video['video_link']
                                        ]
                                    ]
                                ]
                            ];
                        }
                    }
                    break;

                case 'Reports':
                    if (!empty($item['reports'])) {
                        foreach ($item['reports'] as $report) {
                            if ($report['type_of_content'] == 'Pdf') {
                                $processed_deep_dive_content['Reports'][] = [
                                    'type' => 'report',
                                    'content' => [
                                        'url' => str_replace('http://', 'https://', $report['report_pdf']['url']),
                                        'title' => $report['pdf_title'],
                                        'thumbnail' => str_replace('http://', 'https://', $report['pdf_thumbnail']['url'])
                                    ]
                                ];
                            }
                        }
                    }
                    break;

                case 'News Coverage':
                    // Similar processing for news items
                    break;
            }
        }
    }

    return $processed_deep_dive_content;
}
```

### Current React Structure

```typescript
export interface DeepDiveContent {
  Videos?: DeepDiveVideo[];
  Images?: DeepDiveImage[];
  Reports?: DeepDiveReport[];
  "News Coverage"?: DeepDiveNews[];
}

export interface DeepDiveVideo {
  type: "video";
  content: {
    video: Array<{
      video_link: string;
    }>;
  };
}

export interface DeepDiveImage {
  type: "slider";
  content: string[];
}

export interface DeepDiveReport {
  type: "report";
  content: {
    url: string;
    title: string;
    thumbnail: string;
  };
}

export interface DeepDiveNews {
  type: "news";
  content: {
    url: string;
    title: string;
    source?: string;
  };
}
```

## Database Schema Evolution

### Original WordPress Schema

```sql
-- WordPress posts table (simplified)
wp_posts:
- ID (auto_increment)
- post_title
- post_content  
- post_date
- post_status
- post_type

-- WordPress postmeta for custom fields
wp_postmeta:
- meta_id (auto_increment)
- post_id (foreign key to wp_posts.ID)
- meta_key (field name)
- meta_value (field value)

-- User ratings stored as post meta
meta_key: 'event_likes' / 'event_dislikes'
meta_value: count (integer)

-- User preferences stored as user meta
wp_usermeta:
- meta_key: 'event_ratings'
- meta_value: serialized array of user ratings
```

### Current Prisma Schema

```prisma
model Event {
  id                     String   @id @default(cuid())
  title                  String
  category               String
  date                   String
  time                   String?
  location               String?
  city                   String?
  state                  String?
  country                String?
  latitude               String?
  longitude              String?
  
  // Craft characteristics
  craftType              String?   @map("craft_type")
  craftSize              String?   @map("craft_size")
  craftBehavior          String?   @map("craft_behavior")
  color                  String?
  soundOrNoise           String?   @map("sound_or_noise")
  lightCharacteristics   String?   @map("light_characteristics")
  
  // Evidence and witnesses
  witnesses              String?
  eyewitness             String?
  duration               String?
  weather                String?
  photo                  String?
  video                  String?
  radar                  String?
  
  // Investigation
  credibility            String?
  notoriety              String?
  governmentInvolvement  String?   @map("government_involvement")
  
  // Rich content
  detailedSummary        String?   @map("detailed_summary") @db.Text
  mediaLink              String?   @map("media_link")
  deepDiveContent        Json?     @map("deep_dive_content")
  
  // User interactions
  likes                  Int       @default(0)
  dislikes               Int       @default(0)
  
  // Metadata
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  
  // Relations
  eventRatings           EventRating[]
  favorites              Favorite[]
  
  @@map("events")
}

model EventRating {
  id       String     @id @default(cuid())
  userId   String     @map("user_id")
  eventId  String     @map("event_id")
  rating   RatingType
  
  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  event    Event      @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([userId, eventId])
  @@map("event_ratings")
}

model Favorite {
  id       String        @id @default(cuid())
  userId   String        @map("user_id")
  eventId  String        @map("event_id")
  color    FavoriteColor
  
  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  event    Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([userId, eventId])
  @@map("favorites")
}
```

## Data Processing Patterns

### Original WordPress Processing

1. **Query Events**
   ```php
   $query = new WP_Query($args);
   while ($query->have_posts()) : $query->the_post();
   ```

2. **Process Fields**
   ```php
   $events[] = array(
       "id" => get_the_ID(),
       "title" => get_the_title(),
       "craft_type" => handle_array_field(get_field('craft_type')),
   );
   ```

3. **JavaScript Output**
   ```php
   echo 'var ufo_events = ' . js_encode($events) . ';';
   ```

### Current React Processing

1. **API Request**
   ```typescript
   const response = await eventsApi.getAll();
   ```

2. **Type Validation**
   ```typescript
   const events: UFOEvent[] = response.events;
   ```

3. **State Management**
   ```typescript
   const [events, setEvents] = useState<UFOEvent[]>([]);
   ```

## Array Field Handling

### Original System
WordPress stores array fields as serialized PHP arrays. The `handle_array_field()` function converts these to comma-separated strings for JavaScript consumption:

```php
function handle_array_field($field) {
    if (is_array($field)) {
        return implode(', ', array_filter($field));
    }
    return $field ? $field : '';
}

// Example transformation:
// PHP Array: ['Saucer', 'Triangle', 'Orb']
// JavaScript String: "Saucer, Triangle, Orb"
```

### Current System
The React system maintains the comma-separated string format for compatibility while adding TypeScript enums for validation:

```typescript
// Data stored as: "Saucer, Triangle, Orb"
// Processing for filters:
const craftTypes = event.craft_type?.split(', ') || [];
const hasActiveCraftType = craftTypes.some(type => activeCraftTypes.has(type));
```

## User Interaction Data

### Original WordPress Implementation

**Rating Storage:**
```php
// Post meta for counts
update_post_meta($event_id, 'event_likes', $new_count);
update_post_meta($event_id, 'event_dislikes', $new_count);

// User meta for tracking  
$user_ratings = get_user_meta($user_id, 'event_ratings', true) ?: array();
$user_ratings[$event_id] = $rating_type;
update_user_meta($user_id, 'event_ratings', $user_ratings);
```

**Favorites (Client-side only):**
```javascript
let favoriteEvents = {
    yellow: new Set(),
    orange: new Set(), 
    red: new Set()
};
// Stored in localStorage
```

### Current React Implementation

**Rating Storage:**
```prisma
model EventRating {
  userId   String
  eventId  String  
  rating   RatingType // LIKE | DISLIKE
  
  @@unique([userId, eventId])
}
```

**Favorites Storage:**
```prisma
model Favorite {
  userId   String
  eventId  String
  color    FavoriteColor // YELLOW | ORANGE | RED
  
  @@unique([userId, eventId])
}
```

## Date Processing

### Original System
```javascript
// Client-side date processing
ufo_events = ufo_events.map(event => {
    const [month, day, year] = event.date.split(' ');
    return {
        ...event,
        year: parseInt(year),
        month,
        day: parseInt(day),
        key: event.category
    };
});
```

### Current System
```typescript
// Utility function for date parsing
export const parseDateString = (dateString: string): Date | null => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// Usage in components
const processedEvents = events.map(event => ({
  ...event,
  parsedDate: parseDateString(event.date),
  year: parseDateString(event.date)?.getFullYear(),
}));
```

## API Response Format Evolution

### Original WordPress Output
```javascript
// Direct JavaScript variable assignment
var ufo_events = [
    {
        "id": 43,
        "title": "Japan Airlines",
        "category": "Sighting", 
        "date": "November 17, 1986",
        // ... all fields directly embedded
    }
];
```

### Current React API
```json
{
  "events": [
    {
      "id": "clxx1234567890",
      "title": "Japan Airlines",
      "category": "Sighting",
      "date": "November 17, 1986",
      // ... typed fields
    }
  ],
  "totalCount": 1245,
  "hasMore": false
}
```

## Migration Considerations

### Data Compatibility
- **Field Names**: Direct mapping possible for most fields
- **Data Types**: String compatibility maintained
- **Array Fields**: CSV format preserved
- **Deep Dive**: JSON structure translatable

### Schema Benefits
- **Relational Integrity**: Proper foreign keys and cascading
- **Type Safety**: Database-level validation
- **Performance**: Indexed fields and efficient queries
- **Scalability**: Normalized structure vs. meta tables

### Challenges
- **ID Format**: WordPress integer IDs vs. CUID strings  
- **Meta Data**: WordPress meta tables vs. JSON fields
- **User System**: WordPress users vs. custom auth
- **File Handling**: WordPress media library vs. custom uploads

## Recommendations

### Data Migration Strategy
1. **Field Mapping**: Use provided comparison table
2. **ID Handling**: Create mapping table for WordPress ID → CUID
3. **User Data**: Import ratings and favorites with user account linking
4. **Deep Dive**: Parse and restructure multimedia content
5. **Validation**: Implement data cleaning and validation during import

### System Integration  
1. **Headless WordPress**: Keep WordPress as content source
2. **API Bridge**: Build translation layer between systems
3. **Dual Operation**: Run both systems during transition
4. **Data Sync**: Implement synchronization mechanisms

### Future Enhancements
1. **Rich Types**: Leverage TypeScript for better validation
2. **Relational Queries**: Use Prisma for complex data relationships  
3. **Real-time Updates**: WebSocket integration for live data
4. **Advanced Search**: Full-text search with database features