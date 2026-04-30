# pg·client

A minimalist, web-based PostgreSQL client for local development. Runs entirely in your browser at `localhost:3000` — no Electron, no cloud, no external services.

<img width="800" height="400" alt="Screenshot 2026-04-30 at 3 06 22 PM" src="https://github.com/user-attachments/assets/0f515f31-eb9b-4182-b9ec-f69c8f6ca5dc" />

## Features

- **Connection manager** — save multiple local PostgreSQL connections (stored in `data/connections.json`)
- **Schema browser** — lazy-loaded tree: databases → schemas → tables → columns with row counts
- **SQL editor** — CodeMirror 6 with syntax highlighting, autocomplete, and `Ctrl+Enter` to run
- **Multi-tab editing** — independent editor state per tab, persisted across reloads
- **Virtualized results grid** — handles 100k+ rows without breaking a sweat (TanStack Virtual)
- **Query history** — last 500 queries with timing, row count, and one-click restore
- **CSV export** — download any result set instantly
- **Dark theme** — easy on the eyes during long debugging sessions

## Stack

| Layer | Library |
|-------|---------|
| Framework | Next.js 16 (App Router) |
| Database driver | pg (node-postgres) |
| SQL editor | CodeMirror 6 |
| Virtual grid | TanStack Virtual 3 |
| State | Zustand 5 |
| Styles | Tailwind CSS 4 |
| Icons | Lucide React |

## Getting Started

**Prerequisites:** Node.js 18+ and at least one local PostgreSQL instance.

```bash
# Clone
git clone https://github.com/linder3hs/pg-client.git
cd pg-client

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), add your first connection, and start querying.

## How it works

- API routes run server-side inside the Next.js process — the `pg` driver connects directly to your local Postgres, so there's no CORS or proxy needed.
- Connection credentials are stored in `data/connections.json` (gitignored). This is a **local dev tool** — do not expose it to the internet.
- A connection pool (`Map<connectionId::database, Pool>`) is kept alive across requests in the same process for fast response times.
- Query history is persisted to `localStorage` via Zustand's persist middleware.

## Project structure

```
src/
├── app/
│   ├── connections/          # Connection manager page
│   ├── workspace/[id]/       # Main editor workspace
│   └── api/                  # Server-side API routes
│       ├── connections/      # CRUD + test
│       ├── query/            # SQL execution
│       └── schema/           # Schema tree endpoints
├── components/
│   ├── browser/              # Schema tree
│   ├── connections/          # Connection form + list
│   ├── editor/               # SQL editor + tabs + toolbar
│   └── results/              # Results grid + history panel
└── lib/
    ├── db/                   # Pool management + queries
    └── store/                # Zustand stores
```

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

## License

MIT © [Linder Hassinger](https://github.com/linder3hs)
