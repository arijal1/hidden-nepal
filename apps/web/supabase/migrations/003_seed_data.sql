-- ═══════════════════════════════════════════════════════════════
-- Hidden Nepal — Seed Data
-- Migration: 003_seed_data
-- ═══════════════════════════════════════════════════════════════

-- ─── Destinations ─────────────────────────────────────────────

INSERT INTO destinations (
  slug, name, name_nepali, tagline, description, province,
  category, is_hidden_gem, is_featured, is_published,
  coordinates, elevation_m, best_season, avg_rating, cover_image_url, tags,
  seo_title, seo_description
) VALUES

-- Rara Lake
(
  'rara-lake',
  'Rara Lake',
  'रारा ताल',
  'Nepal''s largest and most pristine lake at 2,990m',
  'Rara Lake is Nepal''s largest lake and one of its most stunning natural wonders. Situated in the remote Karnali Province at an altitude of 2,990 meters, the lake is renowned for its crystal-clear turquoise waters and dramatic mountain backdrop. Surrounded by Rara National Park, the region is home to red pandas, Himalayan black bears, and over 200 species of birds. The remoteness of Rara makes it one of Nepal''s greatest hidden gems — few tourists make the journey, ensuring a pristine and authentic experience.',
  'Karnali',
  'lake',
  TRUE, TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(82.0889, 29.5266), 4326),
  2990,
  ARRAY['Spring', 'Autumn', 'Winter'],
  4.9,
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85',
  ARRAY['lake', 'hidden gem', 'Karnali', 'national park', 'wildlife', 'pristine'],
  'Rara Lake Nepal — The Hidden Jewel of Karnali | Hidden Nepal',
  'Discover Rara Lake, Nepal''s largest lake at 2,990m. Travel guide, how to reach, best time to visit, permits, and trekking routes in Rara National Park.'
),

-- Annapurna Base Camp
(
  'annapurna-base-camp',
  'Annapurna Base Camp',
  'अन्नपूर्ण बेस क्याम्प',
  'The amphitheatre of giants at 4,130m',
  'Annapurna Base Camp sits at the heart of the Annapurna Sanctuary, a natural amphitheatre surrounded by some of the world''s highest peaks. At 4,130 meters, you''re encircled by Annapurna I (8,091m), Hiunchuli, Machhapuchhre (Fishtail), and Gangapurna. The trek through rhododendron forests, traditional Gurung villages, and ancient hot springs makes this one of Nepal''s most rewarding journeys.',
  'Gandaki',
  'trek',
  FALSE, TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(83.8780, 28.5308), 4326),
  4130,
  ARRAY['Spring', 'Autumn'],
  4.8,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
  ARRAY['trek', 'Annapurna', 'base camp', 'Gandaki', 'Himalaya'],
  'Annapurna Base Camp Trek Guide | Hidden Nepal',
  'Complete guide to Annapurna Base Camp trek. 10-13 day itinerary, permits, best season, accommodation, and insider tips.'
),

-- Phoksundo Lake
(
  'phoksundo-lake',
  'Phoksundo Lake',
  'फोक्सुण्डो ताल',
  'The sapphire gem of Dolpa',
  'Phoksundo Lake in Dolpa is arguably Nepal''s most beautiful lake. Its extraordinary turquoise-blue color (caused by high mineral content) is unlike any other lake in the Himalayas. The lake sits at 3,611 meters in Shey Phoksundo National Park, Nepal''s largest national park. Ancient Bon Buddhist monasteries, snow leopard habitat, and the mystical upper Dolpa region make this one of the world''s most extraordinary journeys.',
  'Karnali',
  'lake',
  TRUE, TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(82.9423, 29.1178), 4326),
  3611,
  ARRAY['Spring', 'Autumn', 'Summer'],
  4.9,
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
  ARRAY['lake', 'Dolpa', 'hidden gem', 'national park', 'snow leopard', 'Bon'],
  'Phoksundo Lake Dolpa — Nepal''s Most Beautiful Lake | Hidden Nepal',
  'Discover Phoksundo Lake in Dolpa, Nepal. Turquoise waters, snow leopards, and ancient monasteries. Travel guide, permits, and how to reach.'
),

-- Mustang
(
  'upper-mustang',
  'Upper Mustang',
  'मुस्ताङ',
  'The forbidden kingdom of Lo Manthang',
  'Upper Mustang, once a restricted and forbidden kingdom, is one of the last places on earth where ancient Tibetan culture remains virtually unchanged. The walled city of Lo Manthang, at 3,840 meters, has been ruled by the same royal family for over 600 years. Cave monasteries, ancient cave dwellings carved into dramatic cliffs, and a landscape resembling the Tibetan plateau make Upper Mustang utterly unique in all of Nepal.',
  'Gandaki',
  'cultural',
  TRUE, TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(83.9500, 29.1833), 4326),
  3840,
  ARRAY['Spring', 'Summer', 'Autumn'],
  4.9,
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=85',
  ARRAY['mustang', 'forbidden kingdom', 'Tibetan culture', 'cave monasteries', 'Gandaki'],
  'Upper Mustang Travel Guide — The Forbidden Kingdom | Hidden Nepal',
  'Discover Upper Mustang, Nepal''s forbidden kingdom. Lo Manthang walled city, cave monasteries, permits, and the complete trekking guide.'
),

-- Tilicho Lake
(
  'tilicho-lake',
  'Tilicho Lake',
  'तिलिचो ताल',
  'World''s highest lake at 4,919m',
  'Tilicho Lake, situated at a breathtaking 4,919 meters above sea level, holds the record as the world''s highest lake. The intense blue of its glacial waters against the snow-capped peaks of the Annapurna range creates a scene of raw, otherworldly beauty. Accessible from the Annapurna Circuit, the side trip to Tilicho involves crossing a challenging trail carved into sheer cliffs — making it all the more rewarding.',
  'Gandaki',
  'lake',
  TRUE, FALSE, TRUE,
  ST_SetSRID(ST_MakePoint(83.8478, 28.6900), 4326),
  4919,
  ARRAY['Spring', 'Autumn'],
  4.8,
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=85',
  ARRAY['tilicho', 'highest lake', 'world record', 'Annapurna', 'Gandaki', 'hidden gem'],
  'Tilicho Lake — World''s Highest Lake in Nepal | Hidden Nepal',
  'Tilicho Lake at 4,919m is the world''s highest lake. Trek guide, difficulty level, best season, and how to reach from the Annapurna Circuit.'
),

-- Langtang Valley
(
  'langtang-valley',
  'Langtang Valley',
  'लाङटाङ उपत्यका',
  'The valley of glaciers, closest to Kathmandu',
  'Langtang Valley is often called the "valley of glaciers" and is Nepal''s closest major trekking destination to Kathmandu. The valley runs north toward the Tibetan border, flanked by Langtang Lirung (7,227m) and a parade of glaciated peaks. The region is home to the Tamang people, whose culture, monasteries, and cheese factories (a legacy of Swiss development projects) add rich cultural texture to dramatic mountain scenery.',
  'Bagmati',
  'valley',
  FALSE, TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(85.5143, 28.1857), 4326),
  3430,
  ARRAY['Spring', 'Autumn'],
  4.6,
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85',
  ARRAY['langtang', 'valley', 'glaciers', 'Tamang', 'Bagmati'],
  'Langtang Valley Trek Guide — Nepal | Hidden Nepal',
  'Complete guide to Langtang Valley trek from Kathmandu. 7-10 days, Tamang culture, yak cheese, and Himalayan glaciers.'
),

-- Kathmandu
(
  'kathmandu',
  'Kathmandu',
  'काठमाडौं',
  'Where ancient temples meet mountain horizons',
  'Kathmandu, Nepal''s capital, is one of the world''s most spiritually dense cities. Seven UNESCO World Heritage Sites sit within the valley — Pashupatinath, Boudhanath, Swayambhunath, Patan Durbar Square, Bhaktapur Durbar Square, Kathmandu Durbar Square, and Changu Narayan. The chaotic streets, incense-laden temples, and the distant white gleam of the Himalayas create a sensory experience like nowhere else.',
  'Bagmati',
  'city',
  FALSE, TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(85.3240, 27.7172), 4326),
  1400,
  ARRAY['Spring', 'Autumn', 'Winter'],
  4.5,
  'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200&q=85',
  ARRAY['Kathmandu', 'UNESCO', 'temples', 'heritage', 'capital', 'Bagmati'],
  'Kathmandu Travel Guide — Ancient City, Modern Spirit | Hidden Nepal',
  'Explore Kathmandu — 7 UNESCO World Heritage Sites, ancient temples, vibrant streets, and your gateway to the Himalayas.'
),

-- Pokhara
(
  'pokhara',
  'Pokhara',
  'पोखरा',
  'The gateway to Annapurna, beside a mirror lake',
  'Pokhara is Nepal''s adventure capital — a city of extraordinary natural beauty set on the shores of Phewa Lake with the Annapurna and Machhapuchhre massifs reflected in its still waters at dawn. From extreme paragliding over the lake to sunrise views from Sarangkot, and the gateway to the Annapurna Circuit and ABC treks, Pokhara offers a perfect combination of relaxation and adventure.',
  'Gandaki',
  'city',
  FALSE, TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(83.9856, 28.2096), 4326),
  827,
  ARRAY['Spring', 'Autumn', 'Winter'],
  4.7,
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=85',
  ARRAY['Pokhara', 'Phewa Lake', 'paragliding', 'Annapurna', 'gateway', 'Gandaki'],
  'Pokhara Travel Guide — Nepal''s Adventure Capital | Hidden Nepal',
  'Discover Pokhara — paragliding, Phewa Lake, mountain reflections, and the gateway to Annapurna trekking. Complete travel guide.'
);

-- ─── Transport Routes ─────────────────────────────────────────

-- How to reach Rara Lake
INSERT INTO transport_routes (destination_id, from_location, transport_type, duration_hours, cost_min_npr, cost_max_npr, description, road_condition, is_recommended) VALUES
(
  (SELECT id FROM destinations WHERE slug = 'rara-lake'),
  'Kathmandu (Tribhuvan Airport)',
  'flight',
  1.5,
  25000, 45000,
  'Fly Kathmandu to Talcha Airport (Mugu). Flights by Tara Air or Summit Air. Limited seats — book well in advance. From Talcha, 2–3 hour trek to Rara Lake.',
  'excellent',
  TRUE
),
(
  (SELECT id FROM destinations WHERE slug = 'rara-lake'),
  'Kathmandu',
  'bus',
  36, 1200, 2500,
  'Long overland route via Surkhet or Jumla. Takes 2–3 days depending on route. Only recommended for adventurous budget travelers.',
  'poor',
  FALSE
);

-- How to reach Phoksundo Lake
INSERT INTO transport_routes (destination_id, from_location, transport_type, duration_hours, cost_min_npr, cost_max_npr, description, road_condition, is_recommended) VALUES
(
  (SELECT id FROM destinations WHERE slug = 'phoksundo-lake'),
  'Nepalgunj Airport',
  'flight',
  1.0,
  20000, 35000,
  'Fly Nepalgunj to Juphal Airport (Dolpa). Then 2-day trek to Phoksundo Lake via Dunai.',
  'excellent',
  TRUE
),
(
  (SELECT id FROM destinations WHERE slug = 'phoksundo-lake'),
  'Kathmandu',
  'flight',
  1.5,
  30000, 55000,
  'Fly Kathmandu to Nepalgunj, then connect to Juphal. Full day of travel.',
  'excellent',
  FALSE
);

-- How to reach Tilicho Lake
INSERT INTO transport_routes (destination_id, from_location, transport_type, duration_hours, cost_min_npr, cost_max_npr, description, is_recommended) VALUES
(
  (SELECT id FROM destinations WHERE slug = 'tilicho-lake'),
  'Besisahar (Annapurna Circuit start)',
  'jeep',
  6.0,
  800, 1500,
  'Jeep from Besisahar to Manang via the Annapurna Circuit road. Then 2-day trek to Tilicho Base Camp and Lake.',
  TRUE
),
(
  (SELECT id FROM destinations WHERE slug = 'tilicho-lake'),
  'Pokhara',
  'bus',
  4.5,
  500, 900,
  'Tourist bus Pokhara to Besisahar. Then jeep or walk to Manang and Tilicho.',
  FALSE
);

-- ─── Trekking Routes ──────────────────────────────────────────

INSERT INTO treks (
  slug, name, description, difficulty, duration_days, max_elevation_m,
  start_point, end_point, distance_km, permit_required, permit_info, permit_cost_usd,
  best_season, emergency_contacts, elevation_profile, highlights, packing_list,
  is_published, cover_image_url
) VALUES
(
  'everest-base-camp',
  'Everest Base Camp Trek',
  'The classic pilgrimage to the foot of the world''s highest mountain. The EBC trek traverses ancient Sherpa villages, high-altitude monasteries, and dramatic glacier landscapes to reach the iconic 5,364m base camp. Passing through Namche Bazaar, Tengboche Monastery, and Dingboche, every day reveals more extraordinary mountain scenery.',
  'strenuous',
  14,
  5364,
  'Lukla',
  'Lukla',
  130.0,
  TRUE,
  'TIMS Card (Trekkers Information Management System) + Sagarmatha National Park entry permit required. Obtainable in Kathmandu at TAAN or at the park entry checkpost.',
  70,
  ARRAY['Spring', 'Autumn'],
  '[
    {"name": "Himalayan Rescue Association", "phone": "+977-1-4440066", "type": "rescue"},
    {"name": "Lukla Police Post", "phone": "+977-38-540012", "type": "police"},
    {"name": "Khunde Hospital", "phone": "+977-38-540046", "type": "hospital"}
  ]',
  '[
    {"distanceKm": 0, "elevationM": 2840, "label": "Lukla"},
    {"distanceKm": 19, "elevationM": 3440, "label": "Namche Bazaar"},
    {"distanceKm": 38, "elevationM": 3870, "label": "Tengboche"},
    {"distanceKm": 60, "elevationM": 4410, "label": "Dingboche"},
    {"distanceKm": 82, "elevationM": 4940, "label": "Lobuche"},
    {"distanceKm": 97, "elevationM": 5170, "label": "Gorak Shep"},
    {"distanceKm": 104, "elevationM": 5364, "label": "EBC Summit"}
  ]',
  ARRAY[
    'Sunrise from Kala Patthar (5,550m)',
    'Tengboche Monastery at 3,870m',
    'Namche Bazaar — the Sherpa capital',
    'Views of Lhotse, Nuptse, Ama Dablam',
    'Khumbu Glacier',
    'Everest View Hotel sunrise'
  ],
  ARRAY[
    'Down jacket (mandatory above 4,000m)',
    'Trekking poles',
    'Altitude sickness medication (Diamox)',
    'Waterproof layer',
    'Merino wool base layers (3 sets)',
    'Sleeping bag rated to -15°C',
    'Headlamp + spare batteries',
    'Water purification tablets',
    'First aid kit',
    'Sunscreen SPF 50+',
    'Sunglasses (UV400)',
    'Offline map downloaded'
  ],
  TRUE,
  'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200&q=85'
),

(
  'annapurna-circuit',
  'Annapurna Circuit Trek',
  'One of the world''s greatest trekking routes, circumnavigating the entire Annapurna massif. The circuit crosses the Thorong La pass at 5,416m — one of the world''s highest motorable passes — and traverses dramatically diverse landscapes from subtropical lowlands through pine forests, alpine meadows, and the high-altitude Mustang desert.',
  'strenuous',
  18,
  5416,
  'Besisahar',
  'Nayapul',
  160.0,
  TRUE,
  'ACAP (Annapurna Conservation Area Permit) $30 USD + TIMS Card $20 USD. Both obtainable in Kathmandu or Pokhara.',
  50,
  ARRAY['Spring', 'Autumn'],
  '[
    {"name": "ACAP Office Chame", "phone": "+977-64-440047", "type": "rescue"},
    {"name": "Manang Hospital", "phone": "+977-66-400014", "type": "hospital"}
  ]',
  '[
    {"distanceKm": 0, "elevationM": 760, "label": "Besisahar"},
    {"distanceKm": 40, "elevationM": 2670, "label": "Chame"},
    {"distanceKm": 75, "elevationM": 3500, "label": "Manang"},
    {"distanceKm": 95, "elevationM": 4450, "label": "High Camp"},
    {"distanceKm": 108, "elevationM": 5416, "label": "Thorong La"},
    {"distanceKm": 120, "elevationM": 3800, "label": "Muktinath"},
    {"distanceKm": 160, "elevationM": 1070, "label": "Nayapul"}
  ]',
  ARRAY[
    'Thorong La Pass at 5,416m',
    'Muktinath Temple — sacred Hindu and Buddhist site',
    'Tilicho Lake side trip',
    'Pisang and Braga villages',
    'Kali Gandaki gorge — world''s deepest',
    'Poon Hill sunrise (optional extension)'
  ],
  ARRAY[
    'Altitude medication',
    'Trekking poles (mandatory for Thorong La)',
    'Crampons if crossing Thorong La in early morning ice',
    'Waterproof jacket',
    'Warm sleeping bag',
    'Offline Annapurna Circuit map'
  ],
  TRUE,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85'
),

(
  'manaslu-circuit',
  'Manaslu Circuit Trek',
  'The Manaslu Circuit is Nepal''s best-kept trekking secret — offering scenery as dramatic as Everest and Annapurna with far fewer crowds. Circumnavigating the world''s eighth-highest mountain (8,163m), the route crosses the challenging Larkya La pass at 5,160m through remote villages of the Nubri and Tsum valleys.',
  'strenuous',
  16,
  5160,
  'Arughat',
  'Dharapani',
  177.0,
  TRUE,
  'Restricted Area Permit ($100 USD for 7 days, $15/day after) + MCAP (Manaslu Conservation Area Permit) + TIMS. Must trek with a registered guide — independent trekking not permitted.',
  130,
  ARRAY['Spring', 'Autumn'],
  '[{"name": "Samagaon Health Post", "phone": "emergency", "type": "hospital"}]',
  '[
    {"distanceKm": 0, "elevationM": 640, "label": "Arughat"},
    {"distanceKm": 60, "elevationM": 2169, "label": "Deng"},
    {"distanceKm": 100, "elevationM": 3520, "label": "Samagaon"},
    {"distanceKm": 120, "elevationM": 3720, "label": "Samdo"},
    {"distanceKm": 135, "elevationM": 4460, "label": "Larkya Base Camp"},
    {"distanceKm": 145, "elevationM": 5160, "label": "Larkya La"},
    {"distanceKm": 177, "elevationM": 1860, "label": "Dharapani"}
  ]',
  ARRAY[
    'Larkya La pass at 5,160m',
    'Birendra Glacier and glacial lakes',
    'Ancient Tibetan Buddhist monasteries',
    'Remote Nubri village culture',
    'Manaslu mountain views',
    'Far fewer crowds than Everest and Annapurna'
  ],
  ARRAY[
    'Requires guide — factor into budget',
    'Restricted area permit must be arranged in Kathmandu',
    'Full cold weather gear mandatory',
    'Minimum 2 trekkers required for permit'
  ],
  TRUE,
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=85'
);

-- ─── Hidden Gems ──────────────────────────────────────────────

INSERT INTO hidden_gems (
  title, story, region, province, is_verified, is_published,
  coordinates, cover_image_url, upvotes
) VALUES
(
  'Panch Pokhari',
  'Five sacred glacial lakes above 4,000 meters in Sindhupalchok district, barely 80km from Kathmandu. Each lake is considered sacred by both Hindus and Buddhists, and the area sees perhaps a few hundred visitors per year. The approach passes through high alpine meadows and ancient yak grazing grounds. Almost no tourist infrastructure exists — this is Nepal as it was 50 years ago.',
  'Sindhupalchok',
  'Bagmati',
  TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(85.8925, 27.9450), 4326),
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  342
),
(
  'Khopra Ridge',
  'An alternative Annapurna viewpoint that puts you face-to-face with Dhaulagiri, Annapurna South, and Nilgiri — with almost no one else around. While thousands crowd Poon Hill, a parallel trail leads to Khopra Ridge at 3,660m, where community homestays and a glacial lake (Khayer Lake, 4,500m) await. This is the anti-Poon Hill.',
  'Myagdi',
  'Gandaki',
  TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(83.6100, 28.5330), 4326),
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80',
  287
),
(
  'Sailung Hill',
  'Two hours from Kathmandu by road, Sailung Hill (3,147m) offers a full 360-degree Himalayan panorama from Ganesh Himal to Jugal range to Everest. Virtually no foreign tourists. Prayer flags, local teahouses, and rhododendron forests. The best sunrise view near Kathmandu that almost no one knows about.',
  'Dolakha',
  'Bagmati',
  TRUE, TRUE,
  ST_SetSRID(ST_MakePoint(85.9200, 27.5800), 4326),
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  198
);

-- ─── Safety Alerts (sample) ───────────────────────────────────

INSERT INTO safety_alerts (title, body, severity, province, is_active) VALUES
(
  'Monsoon Season Advisory',
  'Monsoon season (June–September) brings increased risk of landslides on mountain roads, particularly in Karnali and Gandaki provinces. Check road conditions before travel. Flights may be delayed or cancelled due to poor visibility.',
  'warning',
  NULL,
  FALSE  -- Inactive (off-season)
),
(
  'Thorong La Pass — Winter Closure',
  'Thorong La Pass on the Annapurna Circuit is typically closed from December to February due to heavy snowfall and avalanche risk. Do not attempt crossing without local guide confirmation of current conditions.',
  'warning',
  'Gandaki',
  FALSE
);

-- ─── Festivals ────────────────────────────────────────────────

INSERT INTO festivals (name, slug, name_nepali, description, cultural_significance, month_start, month_end, is_published, cover_image_url) VALUES
(
  'Dashain',
  'dashain',
  'दशैं',
  'Nepal''s most important and longest festival, lasting 15 days. Families reunite, receive blessings (tika) from elders, kite flying fills the skies, and goat and buffalo sacrifices are offered to Durga.',
  'Celebrates the victory of good over evil — specifically Goddess Durga''s triumph over the demon Mahishasura. The most auspicious time of year in Hindu Nepal.',
  10, 10,
  TRUE,
  'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&q=80'
),
(
  'Tihar',
  'tihar',
  'तिहार',
  'The festival of lights — a five-day celebration honoring crows, dogs, cows, oxen, and brothers. The third day, Laxmi Puja, sees homes illuminated with oil lamps and strings of lights.',
  'Honors Laxmi, goddess of wealth. Each of the five days has a different significance in the Hindu calendar. Equivalent in spirit to Diwali.',
  10, 11,
  TRUE,
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'
),
(
  'Holi',
  'holi',
  'होली',
  'The festival of colors — celebrated with powder and water across Nepal. Kathmandu''s streets become a riot of color as locals and tourists alike join the celebration.',
  'Marks the arrival of spring and the victory of good over evil (the story of Prahlad and Holika). One of the most photogenic festivals in Nepal.',
  3, 3,
  TRUE,
  NULL
),
(
  'Indra Jatra',
  'indra-jatra',
  'इन्द्र जात्रा',
  'An 8-day festival unique to Kathmandu Valley, featuring the Living Goddess (Kumari) chariot procession, masked dances (Lakhe), and the erection of a tall wooden pole (yosin) in Basantapur square.',
  'Celebrates Indra, the god of rain, and gives thanks for the monsoon harvest. The festival dates back to the 10th century and is one of Nepal''s most visually spectacular events.',
  9, 9,
  TRUE,
  NULL
);
