-- Tropicalia HOME V2 Database Schema

-- Users Table (Roles: admin, kitchen, staff, customer)
CREATE TYPE user_role AS ENUM ('admin', 'kitchen', 'staff', 'customer');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'customer',
    referred_by_phone VARCHAR(20), -- For referral system
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Management (3-Week Cycle)
CREATE TABLE menu_weeks (
    id SERIAL PRIMARY KEY,
    week_number INT NOT NULL, -- 1, 2, or 3
    start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');

CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    week_id INT REFERENCES menu_weeks(id),
    day day_of_week NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    allergens VARCHAR(200), -- Comma separated or JSON
    image_url VARCHAR(500)
);

-- Extras / Upselling (Drinks)
CREATE TABLE extras (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., 'Pony Malta'
    price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

-- Orders
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE delivery_method AS ENUM ('pickup', 'delivery');
CREATE TYPE payment_method AS ENUM ('auto', 'payid');

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    week_id INT REFERENCES menu_weeks(id),
    status order_status DEFAULT 'pending',
    delivery_method delivery_method NOT NULL,
    delivery_address TEXT, -- Required if method is delivery
    payment_method payment_method NOT NULL,
    payment_proof_url VARCHAR(500), -- For PayID screenshots
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0, -- For referral rewards
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Details
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    menu_item_id INT REFERENCES menu_items(id),
    quantity INT DEFAULT 1,
    notes TEXT -- Special requests
);

CREATE TABLE order_extras (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    extra_id INT REFERENCES extras(id),
    quantity INT DEFAULT 1
);

-- Referral Rewards
CREATE TABLE referral_rewards (
    id SERIAL PRIMARY KEY,
    referrer_user_id INT REFERENCES users(id),
    referred_user_id INT REFERENCES users(id),
    is_redeemed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
