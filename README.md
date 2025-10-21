Level 4 Revision Game

What this is

## Deploying to GitHub Pages

1. Create a new repository on GitHub named `Unit-4-Revision-Game`
2. Push this code to your repository:
  ```bash
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/Unit-4-Revision-Game.git
  git push -u origin main
  ```
3. Go to your repository's Settings > Pages
4. Under "Source", select:
  - Branch: main
  - Folder: / (root)
5. Click Save
6. Your site will be available at: https://YOUR_USERNAME.github.io/Unit-4-Revision-Game/

Files added
- `styles.css` — styling
- `app.js` — frontend logic
- `data/level4.json` — structured lessons and vocabulary extracted from the provided documents

How to open
- Open `index.html` in a modern browser (Chrome, Edge, Firefox). No server required; just double-click the file.
- For full functionality (fetching `data/level4.json`) some browsers may restrict fetch from file://. If you see errors, run a simple local server:

  In PowerShell (Windows):

```powershell
# from inside the project folder
python -m http.server 8000; Start-Process http://localhost:8000/index.html
```

Teacher tips
- Use Lessons to review grammar points before practice.
- Flashcards are great for quick warm-ups; students can mark words they know.
- Use Quiz for formative assessment; use Ctrl+L to add a name to the local leaderboard.
- Timed Challenge adds urgency and rewards quick recall.

Extending the app
- Add audio for vocabulary pronunciation.
- Add images for pictorial flashcards.
- Sync progress to a remote server or classroom LMS for group leaderboards.

Notes
- Progress is stored locally in the browser's Local Storage (no external data is sent).
- If you want me to package this as a deployable static site or add more features, tell me which features to prioritise.
