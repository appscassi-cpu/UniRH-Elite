# **App Name**: Gestão de Servidores

## Core Features:

- Secure User Authentication: Users log in with Firebase Authentication (email/password) to access system functionality, ensuring only authorized personnel can view or modify data.
- Staff Management (CRUD): Create, read, update, and delete staff records (name, registration, role, contact, admission date, observations) stored in Firestore.
- Occurrence Recording: Record various types of staff occurrences (e.g., absences, medical leave, holidays, official leave) linked to specific staff members within Firestore.
- Occurrence History: View a chronological history of all recorded occurrences for each staff member on their profile, including attached documents.
- Dashboard Overview: Display a dashboard with key statistics like total staff cadastred, monthly absences, and staff currently on leave or holidays.
- Document Attachment: Upload and attach image files (e.g., medical certificates) to occurrences. These documents are stored using Firebase Storage.
- Staff Search & Filtering: Efficiently search for staff members by name and view filtered lists, facilitating quick access to staff profiles.

## Style Guidelines:

- The app's purpose is administrative control, emphasizing organization and clarity. Therefore, a light color scheme will be used to promote focus and readability.
- Primary color: A deep, professional blue (#2D60B2), evoking trust and stability suitable for an HR management application. This color provides strong contrast on a light background.
- Background color: A very light, desaturated blue (#F1F4F8), providing a clean and understated base that is gentle on the eyes and promotes legibility.
- Accent color: A muted violet (#7164B2) will be used for interactive elements like buttons and highlights, offering a subtle yet distinct contrast with the primary blue and background without being overly vibrant or distracting.
- The primary typeface will be 'Inter', a modern sans-serif. Its clean lines and excellent readability make it ideal for an administrative application, suitable for both headlines and detailed body text in forms and lists.
- Use a set of clear, concise, and modern icons that align with administrative tasks and concepts (e.g., add user, calendar, document, search). Icons should be easily discernible even at smaller sizes.
- A clean and uncluttered layout with ample white space will be employed, reminiscent of modern administrative dashboards. Forms will feature clear labels and large, easy-to-tap buttons to enhance mobile usability.
- Subtle and fluid transitions for navigation and data loading, designed to enhance responsiveness and user feedback without creating visual clutter or slowdowns, especially on mobile devices.