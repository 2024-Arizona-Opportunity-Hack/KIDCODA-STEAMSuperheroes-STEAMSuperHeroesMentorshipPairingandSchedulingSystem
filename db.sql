-- Create Users Table
CREATE TABLE Users (
    user_id UUID PRIMARY KEY,
    email VARCHAR,
    name VARCHAR,
    age_range VARCHAR,
    phone_number VARCHAR,
    location_city VARCHAR,
    location_state VARCHAR,
    ethnicity VARCHAR,
    ethnicity_preference VARCHAR,
    gender VARCHAR,
    gender_preference VARCHAR,
    mentoring_method VARCHAR,
    session_type_preference VARCHAR,
    role VARCHAR CHECK (role IN ('Mentor', 'Mentee')),
    is_available_for_matching BOOLEAN
);

-- Create MentorProfile Table
CREATE TABLE MentorProfile (
    mentor_id UUID PRIMARY KEY,
    steam_background VARCHAR CHECK (steam_background IN ('Professional', 'Student')),
    current_academic_level VARCHAR CHECK (current_academic_level IN (
        'High School Freshman', 
        'High School Sophomore', 
        'High School Junior', 
        'High School Senior', 
        'College Undergraduate', 
        'Graduate School', 
        'Graduated / Working Professional'
    )),
    profession VARCHAR,
    current_employer VARCHAR,
    reasons_for_mentoring VARCHAR,
    max_mentees INTEGER,
    FOREIGN KEY (mentor_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create MenteeProfile Table
CREATE TABLE MenteeProfile (
    mentee_id UUID PRIMARY KEY,
    grade VARCHAR CHECK (grade IN (
        '5th grade', 
        '6th grade', 
        '7th grade', 
        '8th grade', 
        '9th grade', 
        '10th grade', 
        '11th grade', 
        '12th grade', 
        'College Freshman', 
        'College Sophomore', 
        'College Junior', 
        'College Senior', 
        'Graduate Student'
    )),
    reasons_for_mentor VARCHAR,
    interests VARCHAR,
    FOREIGN KEY (mentee_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Availability Table
CREATE TABLE Availability (
    availability_id UUID PRIMARY KEY,
    user_id UUID,
    day_of_week VARCHAR CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    time_slots VARCHAR,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Pairings Table
CREATE TABLE Pairings (
    pairing_id UUID PRIMARY KEY,
    mentor_id UUID,
    mentee_id UUID,
    pairing_date TIMESTAMP,
    is_active BOOLEAN,
    notes TEXT,
    FOREIGN KEY (mentor_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Sessions Table
CREATE TABLE Sessions (
    session_id UUID PRIMARY KEY,
    pairing_id UUID,
    cadence VARCHAR CHECK (cadence IN ('monthly', 'weekly', 'biweekly')),
    session_startdate DATE,
    session_enddate DATE,
    session_type VARCHAR CHECK (session_type IN ('Homework Help', 'College Guidance', 'Career Guidance', 'Explore a Field', 'Exposure to STEAM', 'Other')),
    num_meetings INT,
    FOREIGN KEY (pairing_id) REFERENCES Pairings(pairing_id) ON DELETE CASCADE
);

-- Create Meetings Table
CREATE TABLE Meetings (
    meeting_id UUID PRIMARY KEY,
    session_id UUID,
    meeting_date DATE,
    meeting_time TIME,
    meeting_notes TEXT,
    completed BOOLEAN,
    FOREIGN KEY (session_id) REFERENCES Sessions(session_id) ON DELETE CASCADE
);

-- Grant privileges to the postgres user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- If you want to ensure future tables get the same privileges:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO postgres;
