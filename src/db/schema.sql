-- Create users table (for the blogger)
CREATE TABLE users (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table (including drafts)
CREATE TABLE posts (
    "id" SERIAL PRIMARY KEY,
    "author_id" INTEGER REFERENCES users(id),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    "published_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_prices (
    "id" SERIAL PRIMARY KEY,
    "product_id" INTEGER REFERENCES products(id) ON DELETE CASCADE,
    "price" NUMERIC(10, 2) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_partners (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "partner_id" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_product_thresholds (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "product_id" INTEGER REFERENCES products(id) ON DELETE CASCADE,
    "upper_threshold" NUMERIC(10, 2) NOT NULL,
    "lower_threshold" NUMERIC(10, 2) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_owned_products (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES users(id) ON DELETE CASCADE,
    "product_id" INTEGER REFERENCES products(id) ON DELETE CASCADE,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "purchase_price" NUMERIC(10, 2),
    "purchase_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create tags table for categorizing posts
CREATE TABLE tags (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL
);

-- Create post_tags junction table for many-to-many relationship
CREATE TABLE post_tags (
    "post_id" INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    "tag_id" INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published_at ON posts(published_at);


-- Insert SkipLabs team members
INSERT INTO users (username, email, password_hash) VALUES
    ('ada_lovelace', 'countess@analytical-engine.dev', 'analyticalEngine101!'),
    ('alan_turing', 'enigma@bletchley-park.ai', 'works_onMy_machine!'),
    ('grace_hopper', 'admiral@cobol.navy', 'ActualBugFound!'),
    ('linus_torvalds', 'just@merge.it', 'iH8Windows!'),
    ('tim_berners_lee', 'sir@w3c.www', 'www.password.com'),
    ('margaret_hamilton', 'director@apollo-guidance.space', 'ToTheMoon!'),
    ('steve_jobs', 'ceo@one-more-thing.apple', 'OneMoreThing2007'),
    ('bill_gates', 'windows@blue-screen.ms', 'BSODinDemoFTW!$'),
    ('vint_cerf', 'father@internet.protocol', 'TCPIPurHeart!'),
    ('barbara_liskov', 'professor@substitution.mit', 'SubstitutionPrinciple!');

-- Insert sample tags
INSERT INTO tags (name) VALUES
    ('Technology'),
    ('Programming'),
    ('Web Development');

-- Insert sample posts
INSERT INTO posts (author_id, title, content, status, published_at) VALUES
    (1, 'Why Programming Should Be More Poetic', 'As the first programmer, I must say these modern languages lack a certain artistic flair. Where are the punch cards? Where is the poetry in your syntax? Back in my day, we had to write algorithms with STYLE...', 'published', '1843-12-10'::TIMESTAMP), -- Publication of her notes on the Analytical Engine
    
    (2, 'Debug or Not Debug: That is the Question', 'I propose a new test: if your code can fix itself, it might be sentient. Speaking of which, has anyone seen my chess algorithm? It keeps beating me and then deleting itself...', 'published', '1950-10-01'::TIMESTAMP), -- Publication of "Computing Machinery and Intelligence" introducing the Turing Test
    
    (3, 'Found Another Bug! 🪲', 'LITERALLY found another bug in the system today. Unlike that moth from 1947, this one was just a spider. Sadly, my colleagues won''t let me tape it into the logbook. Standards have really declined...', 'published', '1947-09-09'::TIMESTAMP), -- The date the first actual computer bug was found
    
    (4, 'Just a Friendly Kernel Update', 'Dear Windows users: Your OS is like a bowl of spaghetti code. Love, Linus. P.S. Yes, I''m still taking anger management classes.', 'published', '1991-08-25'::TIMESTAMP), -- First Linux announcement
    
    (5, 'HTTP 418: I''m a Teapot', 'Looking back, maybe I shouldn''t have included that status code. But in my defense, I was really into British tea culture when designing HTTP protocols...', 'published', '1989-03-12'::TIMESTAMP), -- Proposal for the World Wide Web
    
    (6, 'Space: The Final Software Frontier', 'When NASA said they needed code that wouldn''t crash, I didn''t realize they meant it LITERALLY wouldn''t crash. Still proud we landed on the moon with less memory than a modern calculator!', 'published', '1969-07-20'::TIMESTAMP), -- Apollo 11 moon landing
    
    (7, 'Think Different About Turtlenecks', 'Just dropped my new fashion line: it''s exactly one black turtleneck. That''s it. That''s the line. Available for only $999.', 'draft', NULL),
    
    (8, 'Blue Screen of Success', 'Exciting news: We''ve made the blue screen of death more user-friendly! Now it shows emoji before crashing. 🙃', 'published', '1995-08-24'::TIMESTAMP), -- Windows 95 release date
    
    (9, 'RFC 2549: IP over Avian Carriers', 'My latest protocol proposal involves strapping tiny routers to pigeons. Latency is terrible but bandwidth is surprising! P.S. Don''t ask about packet loss...', 'published', '1974-05-01'::TIMESTAMP), -- TCP protocol development
    
    (10, 'The Substitution Principle of Coffee', 'Any coffee can be substituted with a stronger coffee without breaking the programmer. This is my contribution to computer science today.', 'published', '1987-01-01'::TIMESTAMP); -- Around when she developed the Liskov Substitution Principle

-- Link posts to tags
INSERT INTO post_tags (post_id, tag_id) VALUES
    (1, 2), (1, 1),  -- Ada's post: Programming, Technology
    (2, 2), (2, 1),  -- Turing's post: Programming, Technology
    (3, 2), (3, 1),  -- Grace's post: Programming, Technology
    (4, 2), (4, 1),  -- Linus's post: Programming, Technology
    (5, 3), (5, 1),  -- Tim's post: Web Development, Technology
    (6, 1), (6, 2),  -- Margaret's post: Technology, Programming
    (7, 1),          -- Steve's draft: Technology
    (8, 1), (8, 2),  -- Bill's post: Technology, Programming
    (9, 1), (9, 3),  -- Vint's post: Technology, Web Development
    (10, 2), (10, 1); -- Barbara's post: Programming, Technology

INSERT INTO products (name, description) VALUES
    ('SuperWidget', 'The ultimate widget for all your widget needs.'),
    ('MegaGadget', 'A gadget so mega, it''s practically a small moon.'),
    ('HyperTool', 'For when you need a tool that goes beyond hyper.'),
    ('QuantumDevice', 'A device that operates on quantum principles.'),
    ('NanoGizmo', 'A gizmo so small, you might need a microscope to see it.');

INSERT INTO product_prices (product_id, price) VALUES
    (1, 19.99),
    (2, 299.99),
    (3, 49.99),
    (4, 999.99),
    (5, 0.99);

INSERT INTO user_partners (user_id, partner_id) VALUES
    (1, 2),  -- Ada partners with Alan
    (1, 3),  -- Ada partners with Grace
    (2, 4),  -- Alan partners with Linus
    (3, 5),  -- Grace partners with Tim
    (4, 6),  -- Linus partners with Margaret
    (5, 7),  -- Tim partners with Steve
    (6, 8),  -- Margaret partners with Bill
    (7, 9),  -- Steve partners with Vint
    (8, 10), -- Bill partners with Barbara
    (9, 1),  -- Vint partners with Ada
    (10, 2), -- Barbara partners with Alan
    (1, 4),  -- Ada partners with Linus
    (2, 5),  -- Alan partners with Tim
    (3, 6),  -- Grace partners with Margaret
    (4, 7),  -- Linus partners with Steve
    (5, 8),  -- Tim partners with Bill
    (2, 3),  -- Alan partners with Grace
    (3, 4),  -- Grace partners with Linus
    (4, 5),  -- Linus partners with Tim
    (5, 6),  -- Tim partners with Margaret
    (6, 7),  -- Margaret partners with Steve
    (7, 8),  -- Steve partners with Bill
    (8, 9),  -- Bill partners with Vint
    (9, 10); -- Vint partners with Barbara

INSERT INTO user_product_thresholds (user_id, product_id, upper_threshold, lower_threshold) VALUES
    (1, 1, 100.00, 10.00),  -- Ada's thresholds for SuperWidget
    (2, 2, 500.00, 50.00),  -- Alan's thresholds for MegaGadget
    (3, 3, 200.00, 20.00),  -- Grace's thresholds for HyperTool
    (4, 4, 1000.00, 100.00), -- Linus's thresholds for QuantumDevice
    (5, 5, 10.00, 1.00);     -- Tim's thresholds for NanoGizmo

INSERT INTO user_owned_products (user_id, product_id, quantity, purchase_price, purchase_date) VALUES
    (1, 1, 3, 19.99, '2024-01-15 10:30:00'),  -- Ada owns 3 SuperWidgets
    (1, 3, 1, 45.00, '2024-01-20 14:15:00'),  -- Ada owns 1 HyperTool
    (2, 2, 2, 250.00, '2024-01-18 09:45:00'), -- Alan owns 2 MegaGadgets
    (3, 1, 5, 18.50, '2024-01-22 16:30:00'),  -- Grace owns 5 SuperWidgets (bought at different price)
    (3, 4, 1, 899.99, '2024-01-25 11:00:00'), -- Grace owns 1 QuantumDevice
    (4, 3, 2, 49.99, '2024-01-19 13:20:00'),  -- Linus owns 2 HyperTools
    (5, 5, 10, 0.95, '2024-01-21 08:45:00'),  -- Tim owns 10 NanoGizmos
    (6, 2, 1, 299.99, '2024-01-23 15:30:00'), -- Margaret owns 1 MegaGadget
    (7, 4, 1, 999.99, '2024-01-24 12:15:00'), -- Steve owns 1 QuantumDevice
    (8, 1, 2, 19.99, '2024-01-26 10:00:00');  -- Bill owns 2 SuperWidgets