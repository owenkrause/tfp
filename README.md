# 🦷 Minty: Digital Tooth Fairy

A playful financial education app that gamifies the tooth fairy tradition, teaching kids about money through interactive tooth brushing and payment experiences.

## 🌟 Overview

Minty gamifies dental hygiene by letting kids increase the value of their teeth through consistent brushing. Using real-time AI-verified brushing via camera, children watch their tooth portfolio grow daily. Parents set custom increment rates through the parent dashboard, controlling how much each verified brush increases tooth value. When a tooth finally falls out, parents pay out based on the 'stock price' the child built through good habits, teaching kids that consistency and healthy routines literally pay off while introducing foundational concepts of investment and compound growth.

## ✨ Features

### 👨‍👩‍👧‍👦 Parent Dashboard
- **Family Management**: Create and manage family accounts with unique demo codes
- **Child Oversight**: Monitor children's brushing habits and tooth collections
- **Payment Approval**: Review and approve tooth payments with secure transactions
- **Progress Tracking**: View detailed statistics and brushing history
- **Settings Management**: Configure brushing goals, tooth values, and family preferences

### 🦷 Child Interface
- **Teeth Collection**: View all 20 baby teeth with individual values and payment status
- **Interactive Login**: Simple name and family code authentication
- **Brushing Sessions**: Submit photos of brushing for AI verification
- **Balance Tracking**: Monitor earned money from tooth payments
- **Gamified Experience**: Watch tooth values increase with consistent brushing

### 🤖 AI-Powered Verification
- **Photo Analysis**: AI verifies brushing photos for authenticity
- **Automatic Validation**: Reduces manual parent oversight
- **Progress Tracking**: Maintains brushing streak records

### 💳 Payment Integration
- **Stripe Integration**: Secure payment processing (test mode)
- **Mock Transactions**: Safe environment for learning about money
- **Transaction History**: Complete record of all payments

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.6 with React 19.1.0
- **Styling**: Tailwind CSS 4 with custom components
- **Database**: PostgreSQL with Prisma ORM 6.17.1
- **Authentication**: Simple family code system
- **Payments**: Stripe (test mode)
- **AI**: Google Gemini for photo verification
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)
- Google AI API key (for photo verification)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/owenkrause/tfp.git
   cd tfp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/tfp"
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   GOOGLE_AI_API_KEY="your-google-ai-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### For Parents

1. **Create a Family Account**
   - Visit the parent setup page
   - Enter family name and parent name
   - Receive a unique family demo code

2. **Add Children**
   - Use the parent dashboard to add children
   - Set brushing goals and tooth values
   - Configure payment preferences

3. **Monitor Progress**
   - View children's brushing sessions
   - Approve tooth payments
   - Track financial education progress

### For Children

1. **Login**
   - Enter your name and family code
   - Access your personal teeth collection

2. **Brush and Submit**
   - Take photos of your brushing sessions
   - Submit for AI verification
   - Watch your tooth values increase

3. **Earn Money**
   - When teeth "fall out," parents can approve payments
   - Track your balance and transaction history
   - Learn about saving and spending

## 🗄️ Database Schema

The application uses the following main entities:

- **Family**: Family accounts with demo codes
- **Child**: Individual children with brushing goals and balances
- **Tooth**: Individual teeth with values and payment status
- **BrushSession**: Brushing sessions with photo verification
- **Transaction**: Payment records and financial history

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🌐 API Endpoints

- `GET/POST /api/family` - Family management
- `GET/POST/PATCH /api/children` - Child management
- `GET /api/child` - Individual child data
- `POST /api/brush` - Submit brushing sessions
- `POST /api/verify-brush` - AI photo verification
- `POST /api/purchase` - Process tooth payments
- `GET/POST /api/goals` - Manage brushing goals

## 🎨 UI Components

The application uses a custom component library built on Radix UI:

- **Cards**: Information display and organization
- **Forms**: Input validation and user interaction
- **Buttons**: Action triggers and navigation
- **Tooltips**: Helpful information overlays
- **Badges**: Status indicators and labels

## 🔒 Security & Privacy

- **Test Mode**: All payments use Stripe test mode
- **Family Codes**: Simple authentication system
- **Photo Storage**: Secure handling of brushing photos
- **Data Privacy**: No personal information stored beyond necessary data

## 🚧 Development Status

Current features include:

- ✅ Basic family and child management
- ✅ Teeth collection interface
- ✅ Brushing session tracking
- ✅ AI photo verification
- ✅ Payment processing (test mode)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ to teach kids about money through the magic of the tooth fairy!** 🦷✨
