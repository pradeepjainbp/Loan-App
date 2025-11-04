# Loan App - Personal Loan Tracking & Management

A comprehensive cross-platform application for tracking and managing personal loans between individuals. Built with React Native (Expo) for Web, Android, and iOS platforms.

## Features

### Core Functionality
- ✅ **Dashboard** - View summary metrics, upcoming loans, and overdue alerts
- ✅ **Loan Management** - Create, view, edit, and delete loans
- ✅ **Repayment Tracking** - Record and track partial or full repayments
- ✅ **Interest Calculations** - Support for simple and compound interest
- ✅ **Search & Filter** - Find loans by name, status, role, and more
- ✅ **Real-time Sync** - Data syncs across all devices in real-time
- ✅ **Cloud Backup** - All data automatically backed up to the cloud

### Authentication
- Google OAuth sign-in
- Phone number + OTP authentication
- Secure session management
- Multi-device access

### Data Features
- Automatic interest calculations (simple & compound)
- Repayment history tracking
- Loan status management (active, overdue, closed)
- Tags and categories for organization
- Notes and attachments support
- Export data (PDF, CSV, JSON)

## Tech Stack

### Frontend
- **React Native** with **Expo** - Cross-platform development
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **React Native Paper** - Material Design UI components
- **Zustand** - State management
- **date-fns** - Date manipulation

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication (Google OAuth, Phone OTP)
  - Row-level security
  - Cloud storage
  - Automatic backups

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account (free tier available at https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   cd loan-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   a. Create a new project at https://app.supabase.com
   
   b. Run the database schema:
      - Go to SQL Editor in your Supabase dashboard
      - Copy the contents of `supabase/schema.sql`
      - Execute the SQL to create all tables and policies
   
   c. Enable authentication providers:
      - Go to Authentication > Providers
      - Enable Google OAuth (configure with your Google Cloud credentials)
      - Enable Phone authentication (configure with your SMS provider)
   
   d. Get your project credentials:
      - Go to Settings > API
      - Copy your Project URL and anon/public key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

### Running on Different Platforms

- **Web**: Press `w` in the terminal or run `npm run web`
- **Android**: Press `a` in the terminal or run `npm run android` (requires Android Studio)
- **iOS**: Press `i` in the terminal or run `npm run ios` (requires macOS and Xcode)

## Project Structure

```
loan-app/
├── src/
│   ├── config/          # Configuration files (Supabase)
│   ├── navigation/      # Navigation setup
│   ├── screens/         # Screen components
│   │   ├── auth/        # Authentication screens
│   │   ├── dashboard/   # Dashboard screen
│   │   ├── loans/       # Loan-related screens
│   │   ├── repayments/  # Repayment screens
│   │   └── settings/    # Settings screen
│   ├── store/           # State management (Zustand)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── supabase/            # Database schema and migrations
├── App.tsx              # Main app component
└── package.json         # Dependencies
```

## Database Schema

The app uses the following main tables:

- **users** - User profiles and settings
- **loans** - Loan records
- **repayments** - Repayment transactions
- **reminders** - Reminder configurations
- **attachments** - File attachments for loans

All tables have Row-Level Security (RLS) enabled to ensure data privacy.

## Key Features Explained

### Interest Calculations

**Simple Interest**
- Formula: Interest = Principal × Rate × Time
- Time calculated using actual/365 day count convention

**Compound Interest**
- Formula: A = P(1 + r/n)^(nt)
- Supports daily, monthly, quarterly, and yearly compounding

### Loan Status

- **Active** - Loan has outstanding balance and is not past due date
- **Overdue** - Loan is past due date with outstanding balance
- **Closed** - Loan is fully repaid

### Real-time Synchronization

The app uses Supabase's real-time subscriptions to sync data across devices:
- Changes made on one device appear on all other devices within 2-3 seconds
- Offline changes are queued and synced when connection is restored

## Security & Privacy

- All data encrypted in transit (HTTPS/TLS)
- Sensitive data encrypted at rest in Supabase
- Row-level security ensures users can only access their own data
- Secure authentication with OAuth 2.0 and OTP
- No third-party data sharing

## Development

### Adding New Features

1. Create new screen components in `src/screens/`
2. Add navigation routes in `src/navigation/AppNavigator.tsx`
3. Update state management in `src/store/` if needed
4. Add database tables/columns in `supabase/schema.sql`

### Testing

```bash
# Run tests (when implemented)
npm test
```

### Building for Production

**Web**
```bash
npm run build:web
```

**Android**
```bash
eas build --platform android
```

**iOS**
```bash
eas build --platform ios
```

## Troubleshooting

### Common Issues

1. **"Supabase URL not configured"**
   - Make sure you've created a `.env` file with your Supabase credentials
   - Restart the Expo development server after adding environment variables

2. **Authentication not working**
   - Verify that authentication providers are enabled in Supabase dashboard
   - Check that OAuth credentials are correctly configured

3. **Data not syncing**
   - Check your internet connection
   - Verify that Row-Level Security policies are correctly set up
   - Check browser console or React Native debugger for errors

## Future Enhancements

- [ ] Shared loan view with borrowers
- [ ] Contact sync for easier borrower selection
- [ ] Multi-currency support with real-time conversion
- [ ] Dark mode
- [ ] Dashboard widgets
- [ ] Voice input for notes
- [ ] Loan templates
- [ ] Analytics and reports
- [ ] Recurring loan schedules
- [ ] Group loans

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React Native and Supabase

