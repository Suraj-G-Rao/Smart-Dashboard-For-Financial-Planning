# Smart Dashboard for Financial Planning 🚀

A comprehensive, AI-powered personal finance management platform built with Next.js 14, featuring advanced financial tools, intelligent insights, and a beautiful modern interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green)

## ✨ Features

### 🧮 Advanced EMI Calculator + Savings Planner
- **Advanced Loan Calculator** with amortization schedule
- **Two Modes**: Home Loan & Other Loans with tailored strategies
- **Savings Strategies**:
  - Extra EMIs per year
  - Annual EMI step-up (%)
  - One-time prepayment
  - Customizable start month
- **Results**: Shows exact interest saved & months reduced
- **AI Explanations**: Powered by Gemini for insights
- **Export**: CSV/XLSX/PDF amortization schedules

### 💳 Credit Card Optimizer
- Visual card tiles with masked digits, limits, due dates
- **AI Recommender**: Suggests best card for transactions
- Reward multiplier engine with cap tracking
- Estimated savings calculator

### 📈 Investment Tracker
- Holdings & trades management
- **P/L Tracking**: Unrealized & realized gains
- **XIRR Calculation**: Portfolio-level returns
- **Mini Technical Analysis**: SMA, EMA, RSI with AI insights
- Support for stocks, mutual funds, ETFs, bonds

### 🎯 Goals & Budgets
- Set financial goals with target dates
- **SIP Calculator**: Recommended monthly investment
- Progress tracking with visual indicators
- Priority-based goal management

### 📊 Comprehensive Dashboard
- Net worth & KPIs at a glance
- Income vs Expense charts (Recharts)
- **Financial Health Score** (0-100) with 4 metrics:
  - Savings Rate (30% weight)
  - Emergency Fund (25% weight)
  - Debt Management (25% weight)
  - Diversification (20% weight)

### 📝 Transactions & Receipts
- Import via CSV, manual entry, API
- **OCR Receipt Upload**: AI extracts amount, date, merchant
- **Auto-categorization**: Heuristic rules + Gemini AI
- Recurring transaction rules with auto-expansion

### 📄 Reports & Exports
- Generate monthly, tax, custom reports
- Download as CSV, XLSX, PDF
- **Automated Monthly Emails**: Via Supabase Edge Functions
- Stored in Supabase Storage with signed URLs

### 🤖 AI Integration
- **Gemini**: Reasoning & detailed explanations
- **Groq**: Fast responses (Mixtral-8x7B)
- **PII Redaction**: All user data sanitized before AI calls
- Educational disclaimers on all AI outputs

### 🔐 Security & Vault
- AES-256-GCM encryption for sensitive data
- Per-user key derivation (PBKDF2)
- Document storage (PDF/JPG/PNG, 5MB max)
- Password/note encryption
- Auto-lock after 10 minutes

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Next.js 14 (App Router, TypeScript)
- TailwindCSS + shadcn/ui components
- Lucide React icons (replacing Hugeicons for compatibility)
- Motion One for animations
- Recharts for data visualization
- React Query for state management

**Backend**
- Next.js API Routes (Route Handlers)
- Supabase JS Client (server-side)

**Database & Services**
- **Supabase**:
  - Postgres with Row-Level Security (RLS)
  - Auth (Email OTP + OAuth)
  - Storage (receipts, reports)
  - Edge Functions (Deno runtime)
  - Scheduled jobs via pg_cron

**AI Services**
- Google Gemini API (generative AI)
- Groq API (fast inference)

**DevOps**
- Docker + docker-compose
- Vitest (unit tests)
- Playwright (E2E tests)
- ESLint + Prettier + Husky

### Database Schema

```
users (id, name, phone, email)
accounts (id, user_id, type, name, balance)
transactions (id, user_id, date, amount, direction, category_id, is_recurring, source)
categories (id, name, type, parent_id)
goals (id, user_id, title, target_amount, current_amount, target_date)
loans (id, user_id, principal, rate_apr, term_months, type, extra_plan)
securities (id, symbol, name, type)
holdings (id, user_id, security_id, quantity, avg_price)
trades (id, user_id, security_id, side, quantity, price, date)
nav_history (id, security_id, date, nav_or_price)
credit_cards (id, user_id, issuer, card_name, credit_limit)
reward_rules (id, credit_card_id, merchant_regex, category_id, multiplier, cap_per_cycle)
card_bills (id, credit_card_id, cycle_start, cycle_end, statement_balance)
receipts (id, user_id, file_path, ocr_text, status)
reports (id, user_id, type, period_start, period_end, file_path)
vault_items (id, user_id, type, encrypted_data, file_path)
insights (id, user_id, type, content, created_at)
salary_history (id, user_id, year, ctc, role, city)
insurance_policies (id, user_id, type, provider, coverage, premium)
subscriptions (id, user_id, name, amount, billing_cycle)
bills (id, user_id, name, amount, due_date, is_paid)
budget_limits (id, user_id, category_id, monthly_limit)
```

### Security

- **Row-Level Security (RLS)**: All tables enforce `user_id = auth.uid()`
- **PII Redaction**: Emails, phones, card numbers masked before AI calls
- **Signed URLs**: For storage bucket access
- **Service Role**: Server-only operations bypass RLS safely
- **Auth**: Supabase Auth with JWT tokens
- **Encryption**: AES-256-GCM for vault data

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (or local instance)
- Gemini API key
- Groq API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Suraj-G-Rao/ai-finance-manager.git
cd ai-finance-manager
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_random_secret

# Vault Encryption
VAULT_MASTER_SECRET=generate_hex_secret
```

4. **Set up Supabase**

- Create a new Supabase project
- Run the migration: `database/migrations/001_initial_schema.sql` in the SQL Editor
- Create storage buckets: `receipts`, `reports` (disable public access)
- Deploy Edge Functions:
  ```bash
  supabase functions deploy recurring-expander
  supabase functions deploy monthly-email
  ```
- Set up cron jobs in Supabase dashboard:
  - `recurring-expander`: Daily at 2 AM
  - `monthly-email`: 1st of each month at 9 AM

5. **Seed the database (optional)**

```bash
npm run db:seed
```

6. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Build and run with Docker Compose

```bash
# Build the image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

The app will be available at `http://localhost:3000`

Mailpit (email testing) at `http://localhost:8025`

### Production Deployment

Update `next.config.js` to enable standalone output:

```js
module.exports = {
  output: 'standalone',
  // ... rest of config
}
```

Build and deploy to your preferred platform (Vercel, Railway, AWS, etc.)

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
# Start dev server first
npm run dev

# Run Playwright tests
npm run test:e2e
```

## 📚 API Routes

### Calculators
- `POST /api/calc/emi` - EMI calculation with savings strategies
- `POST /api/calc/sip` - SIP calculator

### AI
- `POST /api/ai/chat` - General AI chat (Gemini/Groq)
- `POST /api/ai/categorize` - Transaction categorization
- `POST /api/coach/analyze` - Financial coach analysis

### Credit Cards
- `GET /api/credit-cards/suggest` - Card recommendations

### Investments
- `GET /api/investments/pnl` - Portfolio P/L calculation

### Vault
- `POST /api/vault/upload` - Upload encrypted documents
- `POST /api/vault/secret` - Store encrypted secrets

### Receipts
- `POST /api/receipts/upload` - Get signed upload URL

## �️ Project Structure

```
Smart-Dashboard-For-Financial-Planning/
├── app/
│   ├── (marketing)/          # Public pages
│   │   ├── page.tsx          # Home page
│   │   └── about/page.tsx    # About
│   ├── (app)/                # Protected app pages
│   │   ├── layout.tsx        # App shell with sidebar
│   │   ├── dashboard/
│   │   ├── calculators/emi/
│   │   ├── credit-cards/
│   │   ├── investments/
│   │   ├── goals/
│   │   ├── transactions/
│   │   ├── reports/
│   │   ├── vault/
│   │   └── settings/
│   ├── api/                  # API routes
│   │   ├── calc/emi/
│   │   ├── ai/chat/
│   │   ├── ai/categorize/
│   │   └── coach/analyze/
│   ├── layout.tsx            # Root layout
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn components
│   └── providers.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── types.ts
│   ├── emi.ts                # EMI calculation logic
│   ├── ai.ts                 # AI utilities
│   ├── crypto.ts             # Encryption utilities
│   └── utils.ts              # Formatters, XIRR, TA
├── database/
│   ├── migrations/          # Database schema files
│   ├── setup/              # Feature setup scripts
│   ├── fixes/              # Database fixes
│   └── scripts/            # Utility scripts
├── supabase/
│   └── functions/
│       ├── recurring-expander/
│       └── monthly-email/
├── tests/
│   ├── lib/                  # Unit tests
│   └── e2e/                  # Playwright tests
├── scripts/
│   └── seed.ts
├── docs/                     # Additional documentation
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Setup

1. **Fork and clone repository**
   ```bash
   git clone https://github.com/Suraj-G-Rao/Smart-Dashboard-For-Financial-Planning.git
   cd Smart-Dashboard-For-Financial-Planning
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables (Supabase, AI keys, etc.)
   ```

4. **Set up database**
   ```bash
   # Run database migrations
   # Use files from database/migrations/ directory
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

### Code Standards

- **TypeScript**: All new code must be strongly typed
- **ESLint**: Run `npm run lint` before committing
- **Prettier**: Run `npm run format` before committing
- **Tests**: Add unit tests for utilities, E2E tests for features
- **Security**: Follow security best practices for financial data

### Commit Guidelines

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `chore:` Maintenance
- `security:` Security fixes

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes with tests**
   - Add unit tests for new utilities
   - Add E2E tests for new features
   - Update documentation if needed

3. **Run quality checks**
   ```bash
   npm run lint
   npm run test
   npm run type-check
   ```

4. **Push and create a PR**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **PR Description**
   - Clear description of changes
   - Link to any related issues
   - Include screenshots for UI changes

### Areas to Contribute

#### 🚀 Features
- New financial calculators
- AI-powered insights
- Dashboard improvements
- Mobile responsiveness

#### 🐛 Bug Fixes
- Transaction categorization
- Investment calculations
- UI/UX issues

#### 📚 Documentation
- API documentation
- User guides
- Developer setup

#### 🧪 Testing
- Unit test coverage
- E2E test scenarios
- Performance testing

### Security Considerations

- Never commit API keys or secrets
- Follow OWASP guidelines
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication

### Code Review Process

1. **Automated checks** must pass
2. **At least one approval** from maintainers
3. **Security review** for sensitive changes
4. **Documentation** updated if needed

### Questions?

- Open an issue for bugs or feature requests
- Start a discussion for general questions
- Check existing issues before creating new ones

### License

By contributing, you agree that your contributions will be licensed under MIT License.

## � Deployment

### 🐳 Docker Production

#### Build and Run
```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

#### Production Configuration
Update `next.config.js` to enable standalone output:
```js
module.exports = {
  output: 'standalone',
  // ... rest of config
}
```

### ☁️ Vercel Deployment

#### Automated Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

#### Manual Steps
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure custom domain (optional)
4. Enable automatic deployments

### 🌐 Other Deployment Options

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### AWS (using Amplify)
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize and deploy
amplify init
amplify add hosting
amplify publish
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build command: `npm run build`
3. Set run command: `npm start`
4. Add environment variables
5. Deploy

### 🔧 Supabase Setup

#### Edge Functions
```bash
# Deploy edge functions
supabase functions deploy recurring-expander
supabase functions deploy monthly-email
```

#### Cron Jobs
Set up in Supabase dashboard SQL editor:

```sql
-- Daily recurring transaction expansion (2 AM)
SELECT cron.schedule('recurring-expander', '0 2 * * *', 'https://your-project.supabase.co/functions/v1/recurring-expander');

-- Monthly email on 1st of month (9 AM)
SELECT cron.schedule('monthly-email', '0 9 1 * *', 'https://your-project.supabase.co/functions/v1/monthly-email');
```

#### Database Setup
```bash
# Run migrations in order
1. database/migrations/001_initial_schema.sql
2. database/migrations/002_budget_presets.sql
3. database/migrations/COMPLETE_DATABASE_SCHEMA.sql

# Setup features
4. database/setup/STORAGE_SETUP.sql
5. database/setup/REPORTS_SETUP.sql
6. database/setup/GOALS_SETUP.sql
```

### 🔒 Environment Variables

#### Required for Production
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret

# Vault Encryption
VAULT_MASTER_SECRET=your_vault_master_secret
```

#### Optional Variables
```env
# Development
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Analytics (optional)
GOOGLE_ANALYTICS_ID=your_ga_id
```

### 📊 Monitoring and Health Checks

#### Production Checklist
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Storage buckets created
- [ ] Edge functions deployed
- [ ] Cron jobs scheduled
- [ ] SSL certificates configured
- [ ] Custom domain pointing correctly
- [ ] Monitoring and alerts set up

#### Testing Production
```bash
# Test API endpoints
curl https://your-domain.com/api/health

# Test authentication
curl https://your-domain.com/api/auth/session

# Test database connection
# Check Supabase dashboard for active connections
```

### 🚨 Troubleshooting

#### Common Issues
1. **Database Connection**
   - Verify `DATABASE_URL` format
   - Check Supabase project status
   - Ensure IP whitelisting if enabled

2. **Edge Functions**
   - Check function logs in Supabase
   - Verify environment variables
   - Test locally with `supabase functions serve`

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Review build logs for specific errors

4. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check callback URLs in OAuth providers
   - Ensure JWT tokens are properly configured

## 🔐 Security Notes

- Never commit environment variables to git
- Use strong secrets and passwords
- Enable SSL/TLS everywhere
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement rate limiting in production

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Google Gemini](https://ai.google.dev/)
- [Groq](https://groq.com/)

## 📧 Contact

For questions, collaborations, or technical inquiries:

- GitHub: [@Suraj-G-Rao](https://github.com/Suraj-G-Rao)

---

**Built with ❤️ using Next.js 14, Supabase, and AI**


