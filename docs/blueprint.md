# **App Name**: HireSwipe

## Core Features:

- User Authentication and Roles: Secure user authentication with Firebase Auth, managing roles (student, graduate, experienced, recruiter, admin) via Firestore.
- Job Seeker Profiles with Verification: Enable job seekers to create profiles, upload resumes, and undergo verification (college email, ID, work email, etc.) to gain trust badges. Admins will use a verification subcollection to streamline the approval/rejection flow of verification submissions.
- Job Posting and Management: Allow recruiters to post jobs, manage applications, and view candidate profiles, filtering and shortlisting candidates based on match scores. Add the ability to review/approve or reject student uploaded document.
- Intelligent Swipe Feed: Develop a Tinder-style swipe feed presenting job seekers with relevant job cards based on AI-driven match scores, continuously learning preferences, and ensuring only unseen/unapplied-for jobs are displayed.
- Screening Questions and Application Flow: After a right swipe, present screening questions (global and job-specific), record answers, generate applications, compute a comprehensive match score, and notify recruiters. A background Cloud Function refines the matchScore and uses it as a tool, incorporating additional contextual information about the job.
- Real-time Chat System: When recruiter accepts, the platform generates conversation channels where candidates and recruiter can communicate further for interview/hiring processes. Make these real time and trigger mobile push notifications.
- Reporting and Moderation System: Incorporate reporting tools for fake jobs/abuse, admin dashboards for manual review, and safety warning text to prevent fraud and abuse, maintaining a safe platform.

## Style Guidelines:

- Primary color: Deep sky blue (#437FC7). Sky blue evokes trust and professionalism, complementing the recruitment app's purpose, while still remaining inviting and not too corporate.
- Background color: Very light blue (#F0F4F9). It maintains a consistent theme while preventing the interface from being too visually taxing.
- Accent color: Moderate blue (#60A3EA). The use of analogous colors aims for a calming feel, in keeping with a platform that values trust.
- Headline font: 'Poppins', a geometric sans-serif font for headlines to maintain a contemporary and precise look.
- Body font: 'PT Sans', a humanist sans-serif font to give body texts a modern yet warm feel.
- Simple line icons for navigation and actions, ensuring clarity and ease of use. verification badges should have easily understandable, high-contrast icons.
- A clean, card-based layout for job listings and profiles, promoting easy scanning and interaction. Responsive design to support mobile and desktop use.
- Subtle animations on card swipes and transitions to provide a smooth, engaging user experience without being distracting.