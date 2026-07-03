-- Seeds 12 trending, simple-to-film Instagram video ideas into the Idea
-- Pool. Based on July 2026 trend research: AI pet transformations, "roast
-- me" caricatures, ChatGPT's new image-editing, rain+neon aesthetic edits,
-- and satisfying quick-hack formats. Safe to run any time — only touches
-- the base columns every version of the schema has, so it works whether
-- or not you've run the later migrations yet.

insert into ideas (submitted_by, title, description, format) values
('Coyot AI', 'Turn your pet into a chibi action figure with AI', 'Upload a photo of your pet, ask AI to turn it into a cute chibi action-figure-in-a-box render. Huge trend right now — fast, visual, very shareable.', 'ai-can-do-this'),
('Coyot AI', 'I gave AI a photo of my dog and asked it to make him human', 'Pet-to-human AI transformation trend. Upload a pet photo, generate the "human version," react on camera. Payoff is the reveal.', '60-sec-challenge'),
('Coyot AI', 'The rain + neon AI photo trend everyone''s doing right now', 'Show a plain selfie, then the AI-edited cinematic rain+neon dark-aesthetic version. Strong before/after hook.', 'ai-can-do-this'),
('Coyot AI', 'I asked AI to roast my Instagram selfie', 'Feed AI your most-liked selfie and ask it to roast you honestly. Funny, relatable, easy one-take format.', '60-sec-challenge'),
('Coyot AI', 'ChatGPT can edit your photos now with just a text prompt — proof', 'Demo ChatGPT''s built-in image editing: change background, outfit, or style with one sentence, no other app needed.', 'ai-can-do-this'),
('Coyot AI', '3 ChatGPT prompts that save you an hour this week', 'Quick practical tips: summarize a long email thread, draft a week of captions, turn messy notes into a to-do list.', '60-seconds'),
('Coyot AI', 'AI vs human: who writes a better caption in 30 seconds', 'Same photo, two captions — one from AI, one from you. Audience votes in comments which is which/which is better.', 'ai-vs-human'),
('Coyot AI', 'Myth busted: AI image generators still can''t get text right — wait, can they now?', 'Test current AI tools on rendering readable text in an image. Show the myth used to be true, now often isn''t.', 'myth-bust'),
('Coyot AI', 'I gave AI 60 seconds to redesign my Instagram bio', 'Paste your current bio, give AI 60 seconds to rewrite it, react to the result live.', '60-sec-challenge'),
('Coyot AI', 'Turn any boring photo into a cinematic dark-aesthetic edit with AI', 'Take a flat, everyday photo and transform it into a moody cinematic edit using one AI prompt.', 'ai-can-do-this'),
('Coyot AI', 'Myth busted: you need an expensive app for viral AI pet photos', 'Show the trendy pet transformation look is achievable with free/cheap tools, not paid premium apps.', 'myth-bust'),
('Coyot AI', 'I gave AI 60 seconds to plan my entire week', 'Give AI your rough week (work, gym, errands) and 60 seconds to build a realistic schedule. React to whether it''s actually usable.', '60-sec-challenge');
