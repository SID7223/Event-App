-- Seed data for chillingz events app
-- Run with: wrangler d1 execute chillingz-db --file=scripts/seed-data.sql

-- ==============================
-- VENUES (physical locations)
-- ==============================
INSERT OR IGNORE INTO venues (id, name, type, bio, address, neighborhood, website, rating, follower_count, event_count, tags, city) VALUES
  ('ven-001', 'GBK', 'venue', 'Gelora Bung Karno - Indonesia''s premier sports and entertainment complex', 'Jl. Pintu Satu Senayan, Jakarta', 'Senayan', 'https://gbk.id', 4.7, 25000, 45, '["Sports", "Concert", "Stadium", "Large Venue"]', 'jakarta'),
  ('ven-002', 'Balai Kartini', 'venue', 'Heritage event venue in the heart of Jakarta', 'Jl. Gatot Subroto Kav. 37, Jakarta', 'Kuningan', 'https://balaikartini.com', 4.5, 12000, 28, '["Exhibition", "Concert", "Conference", "Indoor"]', 'jakarta'),
  ('ven-003', 'Ancol Beach City', 'venue', 'Waterfront entertainment district in Jakarta Bay', 'Jl. Lodan Timur No. 7, Jakarta', 'Ancol', 'https://ancol.com', 4.3, 18000, 35, '["Beach", "Outdoor", "Festival", "Family"]', 'jakarta'),
  ('ven-004', 'JCC Senayan', 'venue', 'Jakarta Convention Center - Indonesia''s premier convention venue', 'Jl. Jend. Gatot Subroto, Jakarta', 'Senayan', 'https://jccsenayan.com', 4.6, 15000, 40, '["Convention", "Exhibition", "Conference", "Indoor"]', 'jakarta');

-- ==============================
-- ORGANIZERS
-- ==============================
INSERT OR IGNORE INTO venues (id, name, type, bio, website, instagram, rating, follower_count, event_count, tags, city) VALUES
  ('org-001', 'Live Nation Indonesia', 'organizer', 'World''s leading live entertainment company bringing global acts to Indonesia', 'https://livenation.co.id', '@livenationid', 4.8, 78000, 120, '["Concerts", "Live Music", "International", "Tours"]', 'jakarta'),
  ('org-002', 'Laugh Factory Asia', 'organizer', 'Asia''s premier comedy network bringing the best stand-up comedians', 'https://laughfactory.asia', '@laughfactoryasia', 4.4, 34000, 85, '["Comedy", "Stand-up", "Live Show", "Entertainment"]', 'jakarta'),
  ('org-003', 'Indonesian Chef Association', 'organizer', 'Celebrating Indonesia''s culinary talent through events and competitions', 'https://icachef.id', '@indonesianchefs', 4.6, 22000, 60, '["Food", "Culinary", "Competition", "Workshop"]', 'jakarta'),
  ('org-004', 'TechSummit Global', 'organizer', 'Connecting innovators, leaders and entrepreneurs across Asia', 'https://techsummit.global', '@techsummitglobal', 4.5, 45000, 30, '["Tech", "Startup", "Innovation", "Networking"]', 'jakarta');

-- ==============================
-- EVENTS (15 total)
-- ==============================
INSERT OR IGNORE INTO events (id, title, description, category_id, price, location, date, time, organizer_id, venue_id, attendees, rating, is_featured, neighborhood, city, booking_type, data_source) VALUES
  ('evt-001', 'Jakarta Music Festival 2026', 'The biggest music festival in Jakarta featuring top international and local artists across multiple stages. Experience three days of non-stop music, food, and art installations.', 'cat_music', 250, 'GBK, Jakarta', '2026-08-15', '14:00', 'org-001', 'ven-001', 15000, 4.8, 1, 'Senayan', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-002', 'Bali Art Biennale', 'A celebration of contemporary art from across the archipelago. Featuring installations, performances, and workshops by Indonesia''s most exciting artists.', 'cat_art', 45, 'Museum MACAN, Bali', '2026-09-01', '10:00', 'org-002', 'ven-002', 3200, 4.5, 1, 'Senayan', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-003', 'Comedy Night Live Jakarta', 'A night of laughter with the biggest names in Indonesian comedy. Featuring stand-up, improv, and sketch comedy.', 'cat_comedy', 75, 'Balai Kartini, Jakarta', '2026-08-20', '19:00', 'org-002', 'ven-002', 1800, 4.3, 0, 'Kuningan', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-004', 'Jakarta Food Festival', 'Indonesia''s largest culinary event featuring 200+ vendors, cooking demonstrations, and competitions. A paradise for food lovers.', 'cat_restaurant', 35, 'Ancol, Jakarta', '2026-08-25', '11:00', 'org-003', 'ven-003', 25000, 4.6, 1, 'Ancol', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-005', 'Bandung Electronic Music Festival', 'Three days of electronic music in the cool hills of Bandung. International DJs, art installations, and a stunning mountain backdrop.', 'cat_music', 180, 'Dago Pakar, Bandung', '2026-09-10', '16:00', 'org-001', NULL, 8500, 4.7, 1, 'Dago', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-006', 'Nusa Penida Beach Party', 'The ultimate beach party experience on the stunning island of Nusa Penida. Live DJs, fire shows, and ocean views.', 'cat_festival', 120, 'Nusa Penida, Bali', '2026-09-15', '13:00', 'org-001', NULL, 5000, 4.4, 1, 'Nusa Penida', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-007', 'Indonesian Indie Film Festival', 'Showcasing the best independent cinema from Indonesia and Southeast Asia. Screenings, Q&As, and networking events.', 'cat_festival', 55, 'CGV, Jakarta', '2026-08-28', '09:00', 'org-002', NULL, 1200, 4.2, 0, 'Senayan', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-008', 'Bandung Jazz Festival', 'A celebration of jazz music set against the beautiful backdrop of Bandung. Featuring local and international jazz artists.', 'cat_music', 95, 'Gedung Sate, Bandung', '2026-10-05', '15:00', 'org-001', NULL, 6000, 4.6, 0, 'Gedung Sate', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-009', 'TechSummit Asia 2026', 'Asia''s premier technology conference featuring keynote speakers, workshops, and networking opportunities with industry leaders.', 'cat_tech', 350, 'JCC, Jakarta', '2026-11-20', '08:00', 'org-004', 'ven-004', 8000, 4.9, 1, 'Senayan', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-010', 'Digital Marketing Summit', 'Learn from the best in digital marketing. SEO, social media, content strategy, and paid advertising masterclasses.', 'cat_business', 150, 'Ritz-Carlton, Jakarta', '2026-09-25', '09:00', 'org-004', NULL, 1500, 4.3, 0, 'Kuningan', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-011', 'Startup Weekend Jakarta', '54 hours of building startups. Pitch ideas, form teams, and launch a minimum viable product in one weekend.', 'cat_tech', 25, 'GoWork, Jakarta', '2026-10-12', '17:00', 'org-004', NULL, 400, 4.5, 0, 'Sudirman', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-012', 'CEO Summit Bali 2026', 'An exclusive gathering of CEOs and business leaders from across Southeast Asia. High-level networking and strategy sessions.', 'cat_business', 299, 'The Mulia, Bali', '2026-12-01', '08:00', 'org-004', NULL, 500, 4.7, 1, 'Nusa Dua', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-013', 'AI & ML Workshop', 'Hands-on workshop covering machine learning fundamentals, neural networks, and practical AI applications.', 'cat_tech', 75, 'Universitas Indonesia', '2026-10-20', '09:00', 'org-004', NULL, 200, 4.4, 0, 'Depok', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-014', 'Photography Workshop', 'Learn professional photography techniques from award-winning photographers. Covers composition, lighting, and post-processing.', 'cat_art', 45, 'Taman Ismail Marzuki', '2026-09-05', '10:00', 'org-002', NULL, 150, 4.2, 0, 'Cikini', 'jakarta', 'in_app', 'manual_entry'),
  ('evt-015', 'Badminton Tournament', 'Annual community badminton tournament open to all skill levels. Singles, doubles, and mixed doubles categories.', 'cat_sports', 15, 'GBK Arena, Jakarta', '2026-08-30', '08:00', 'org-002', 'ven-001', 350, 4.1, 0, 'Senayan', 'jakarta', 'in_app', 'manual_entry');

-- ==============================
-- MOVIES (9)
-- ==============================
INSERT OR IGNORE INTO movies (id, title, genre, duration, rating, release_date, synopsis, director, cast, age_rating, city) VALUES
  ('mov-001', 'Dune: Part Three', '["Sci-Fi", "Adventure", "Epic"]', 148, 4.8, '2026-11-15', 'The epic conclusion to the Dune saga as Paul Atreides faces his final destiny on Arrakis.', 'Denis Villeneuve', '["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Josh Brolin"]', 'PG-13', 'jakarta'),
  ('mov-002', 'The Last Autumn', '["Drama", "Romance", "Historical"]', 112, 4.5, '2026-10-01', 'A sweeping romance set against the backdrop of a changing world in 1920s Southeast Asia.', 'Kamila Andini', '["Nicholas Saputra", "Diane Sastrowardoyo", "Reza Rahadian"]', 'PG', 'jakarta'),
  ('mov-003', 'Shadow Protocol', '["Action", "Thriller", "Spy"]', 135, 4.3, '2026-09-20', 'An elite operative uncovers a global conspiracy that threatens to destabilize world governments.', 'Timur Bekmambetov', '["Iko Uwais", "Joe Taslim", "Julie Estelle"]', 'R', 'jakarta'),
  ('mov-004', 'Laugh Track', '["Comedy", "Drama"]', 98, 4.1, '2026-08-25', 'A struggling comedian gets one last chance to make it big in the Jakarta stand-up scene.', 'Ernest Prakasa', '["Ernest Prakasa", "Gading Marten", "Tora Sudiro"]', 'PG-13', 'jakarta'),
  ('mov-005', 'Voices of the Archipelago', '["Documentary", "Music"]', 125, 4.7, '2026-12-05', 'A breathtaking journey through Indonesia''s diverse musical traditions from Sabang to Merauke.', 'Garin Nugroho', '["Various Artists"]', 'G', 'jakarta'),
  ('mov-006', 'Crimson Horizon', '["Thriller", "Mystery", "Noir"]', 118, 4.4, '2026-10-15', 'A detective races against time to solve a series of mysterious disappearances in Old Jakarta.', 'Edwin', '["Ladya Cheryl", "Ario Bayu", "Happy Salma"]', 'R', 'jakarta'),
  ('mov-007', 'The Wandering Star', '["Fantasy", "Adventure", "Animation"]', 142, 4.6, '2026-11-01', 'A young girl embarks on a magical journey across enchanted islands to find a legendary star.', 'Adi Panuntun', '["Dian Sastrowardoyo", "Indro Warkop"]', 'G', 'jakarta'),
  ('mov-008', 'Midnight in Monsoon', '["Horror", "Supernatural"]', 105, 4.0, '2026-10-31', 'A family moves into a remote villa during monsoon season, only to discover they are not alone.', 'Joko Anwar', '["Tara Basro", "Alexendra Gottardo", "Marthino Lio"]', 'R', 'jakarta'),
  ('mov-009', 'Neon Dreams', '["Sci-Fi", "Romance"]', 130, 4.2, '2026-12-20', 'In a neon-drenched future Jakarta, two lovers from different worlds fight to stay together.', 'Timothy Gunawan', '["Chicco Jerikho", "Nadya Arina"]', 'PG-13', 'jakarta');

-- ==============================
-- CINEMAS (4)
-- ==============================
INSERT OR IGNORE INTO cinemas (id, name, address, neighborhood, city) VALUES
  ('cine-001', 'CGV Grand Indonesia', 'Grand Indonesia Mall, Jl. MH Thamrin No. 1', 'Menteng', 'jakarta'),
  ('cine-002', 'XXI Plaza Senayan', 'Plaza Senayan, Jl. Asia Afrika No. 8', 'Senayan', 'jakarta'),
  ('cine-003', 'Cinemaxx Central Park', 'Central Park Mall, Jl. Letjen S. Parman', 'Tanjung Duren', 'jakarta'),
  ('cine-004', 'CGV Pondok Indah', 'Pondok Indah Mall 2, Jl. Metro Pondok Indah', 'Pondok Indah', 'jakarta');

-- ==============================
-- SHOWTIMES (27)
-- ==============================
INSERT OR IGNORE INTO showtimes (id, movie_id, cinema_id, date, time, format, price, available_seats, city) VALUES
  -- Dune at CGV Grand Indonesia
  ('st-001', 'mov-001', 'cine-001', '2026-07-15', '14:30', 'IMAX', 85000, 120, 'jakarta'),
  ('st-002', 'mov-001', 'cine-001', '2026-07-15', '19:00', 'IMAX', 95000, 85, 'jakarta'),
  ('st-003', 'mov-001', 'cine-001', '2026-07-15', '21:30', '3D', 75000, 200, 'jakarta'),
  -- Dune at XXI Plaza Senayan
  ('st-004', 'mov-001', 'cine-002', '2026-07-15', '15:00', '2D', 55000, 180, 'jakarta'),
  ('st-005', 'mov-001', 'cine-002', '2026-07-15', '18:30', '2D', 55000, 150, 'jakarta'),
  -- The Last Autumn at multiple cinemas
  ('st-006', 'mov-002', 'cine-001', '2026-07-15', '16:00', '2D', 45000, 200, 'jakarta'),
  ('st-007', 'mov-002', 'cine-002', '2026-07-15', '14:00', '2D', 45000, 175, 'jakarta'),
  ('st-008', 'mov-002', 'cine-004', '2026-07-15', '17:30', '2D', 45000, 190, 'jakarta'),
  -- Shadow Protocol
  ('st-009', 'mov-003', 'cine-001', '2026-07-15', '20:00', '2D', 55000, 160, 'jakarta'),
  ('st-010', 'mov-003', 'cine-003', '2026-07-15', '19:30', '2D', 50000, 140, 'jakarta'),
  ('st-011', 'mov-003', 'cine-004', '2026-07-15', '21:00', '3D', 65000, 110, 'jakarta'),
  -- Laugh Track
  ('st-012', 'mov-004', 'cine-002', '2026-07-15', '16:30', '2D', 40000, 190, 'jakarta'),
  ('st-013', 'mov-004', 'cine-003', '2026-07-15', '20:30', '2D', 40000, 170, 'jakarta'),
  -- Voices of the Archipelago
  ('st-014', 'mov-005', 'cine-001', '2026-07-15', '11:00', '2D', 45000, 200, 'jakarta'),
  ('st-015', 'mov-005', 'cine-004', '2026-07-15', '13:30', '2D', 45000, 180, 'jakarta'),
  -- Crimson Horizon
  ('st-016', 'mov-006', 'cine-001', '2026-07-15', '22:00', '2D', 50000, 130, 'jakarta'),
  ('st-017', 'mov-006', 'cine-002', '2026-07-15', '21:00', '2D', 50000, 145, 'jakarta'),
  ('st-018', 'mov-006', 'cine-003', '2026-07-15', '22:30', '2D', 50000, 120, 'jakarta'),
  -- The Wandering Star
  ('st-019', 'mov-007', 'cine-001', '2026-07-15', '10:00', '2D', 45000, 220, 'jakarta'),
  ('st-020', 'mov-007', 'cine-002', '2026-07-15', '11:30', '2D', 45000, 200, 'jakarta'),
  ('st-021', 'mov-007', 'cine-004', '2026-07-15', '10:30', '2D', 45000, 210, 'jakarta'),
  -- Midnight in Monsoon
  ('st-022', 'mov-008', 'cine-003', '2026-07-15', '23:00', '2D', 55000, 100, 'jakarta'),
  ('st-023', 'mov-008', 'cine-004', '2026-07-15', '22:30', '2D', 55000, 115, 'jakarta'),
  -- Neon Dreams
  ('st-024', 'mov-009', 'cine-001', '2026-07-15', '17:30', '2D', 50000, 180, 'jakarta'),
  ('st-025', 'mov-009', 'cine-002', '2026-07-15', '20:00', '2D', 50000, 165, 'jakarta'),
  ('st-026', 'mov-009', 'cine-003', '2026-07-15', '18:00', '2D', 50000, 170, 'jakarta'),
  ('st-027', 'mov-009', 'cine-004', '2026-07-15', '19:30', '2D', 50000, 155, 'jakarta');

-- ==============================
-- RESTAURANTS (10)
-- ==============================
INSERT OR IGNORE INTO restaurants (id, name, cuisine, price_range, rating, review_count, address, neighborhood, phone, is_open, has_live_music, opening_hours, tags, featured, city) VALUES
  ('rest-001', 'Warung Betawi', 'Indonesian', '$', 4.3, 1200, 'Jl. KH Wahid Hasyim No. 15, Jakarta', 'Menteng', '+62213802789', 1, 0, '10:00 - 22:00', '["Traditional", "Local", "Budget Friendly"]', 0, 'jakarta'),
  ('rest-002', 'The Junction Bar', 'International', '$$$', 4.6, 850, 'Jl. Jend. Sudirman Kav. 52-53, Jakarta', 'Sudirman', '+62213047890', 1, 1, '17:00 - 02:00', '["Bar", "Live Music", "Premium", "Nightlife"]', 1, 'jakarta'),
  ('rest-003', 'Nasi Goreng Mafia', 'Modern Indonesian', '$$', 4.4, 2100, 'Jl. Gunawarman No. 42, Jakarta', 'Kemang', '+62213127890', 1, 0, '11:00 - 23:00', '["Fusion", "Trendy", "Instagrammable"]', 1, 'jakarta'),
  ('rest-004', 'Trattoria Milano', 'Italian', '$$$', 4.5, 950, 'Plaza Indonesia, Jl. MH Thamrin, Jakarta', 'Menteng', '+62213567890', 0, 0, '12:00 - 22:00', '["Italian", "Fine Dining", "Wine"]', 0, 'jakarta'),
  ('rest-005', 'Raja Sate', 'Indonesian Fine Dining', '$$$$', 4.8, 3200, 'Jl. Rasuna Said Kav. 8, Jakarta', 'Kuningan', '+62213957890', 1, 0, '12:00 - 22:30', '["Premium", "Traditional", "Award Winning"]', 1, 'jakarta'),
  ('rest-006', 'Kopi Toko Djakarta', 'Cafe', '$', 4.2, 1800, 'Jl. Malioboro No. 12, Kota Tua, Jakarta', 'Kota Tua', '+62213457890', 1, 0, '08:00 - 21:00', '["Coffee", "Vintage", "Heritage"]', 0, 'jakarta'),
  ('rest-007', 'Seafood 88', 'Seafood', '$$$', 4.4, 1500, 'Jl. Pantai Indah Kapuk No. 88, Jakarta', 'PIK', '+62214567890', 1, 0, '11:00 - 23:00', '["Seafood", "Chinese", "Family"]', 0, 'jakarta'),
  ('rest-008', 'Sakura Japanese', 'Japanese', '$$$', 4.5, 1100, 'Jl. Senopati No. 25, Jakarta', 'Senopati', '+62213767890', 1, 0, '12:00 - 22:30', '["Japanese", "Sushi", "Premium"]', 0, 'jakarta'),
  ('rest-009', 'Seoul Kitchen', 'Korean', '$$', 4.3, 900, 'Jl. Cipete Raya No. 42, Jakarta', 'Cipete', '+62214867890', 1, 1, '12:00 - 23:00', '["Korean", "BBQ", "Live Music"]', 0, 'jakarta'),
  ('rest-010', 'The Western Grill', 'Western', '$$$', 4.1, 600, 'Jl. TB Simatupang No. 18, Jakarta', 'TB Simatupang', '+62214967890', 0, 0, '11:00 - 21:00', '["Western", "Steak", "Grill", "Family"]', 0, 'jakarta');
