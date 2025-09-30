-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Blogs policies
CREATE POLICY "Published blogs are viewable by everyone" ON public.blogs
    FOR SELECT USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Users can create their own blogs" ON public.blogs
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own blogs" ON public.blogs
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own blogs" ON public.blogs
    FOR DELETE USING (auth.uid() = author_id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (auth.uid() = organizer_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own likes" ON public.likes
    FOR ALL USING (auth.uid() = user_id);

-- Event registrations policies
CREATE POLICY "Event registrations are viewable by organizers and participants" ON public.event_registrations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE id = event_id AND organizer_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can register for events" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON public.event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own registrations" ON public.event_registrations
    FOR DELETE USING (auth.uid() = user_id);
