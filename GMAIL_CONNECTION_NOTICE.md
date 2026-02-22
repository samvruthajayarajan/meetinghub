# Gmail Connection Notice

## Overview
The dashboard displays a prominent notice about Gmail connection to remind users to connect their Gmail account for sending emails.

## Location

### Dashboard (`app/dashboard/page.tsx`)
Dynamic banner that changes based on Gmail connection status.

#### When Gmail is NOT Connected
- Shows a blue/green gradient banner with Gmail icon
- Explains the benefits of connecting Gmail:
  - Send meeting invitations from your email
  - Send agendas from your email
  - Send minutes from your email
  - Send reports from your email
- Provides a "Go to Profile Settings" button that navigates to `/user`
- Includes a "Dismiss" button to hide the banner
- Can be closed with an X button in the top-right corner

#### When Gmail IS Connected
- Shows a green success banner
- Displays "✅ Gmail connected! You can now send emails directly from your account."
- Can be dismissed with an X button

## Implementation Details

### Dashboard
- Checks Gmail connection status on page load
- Fetches user profile to check for `gmailRefreshToken`
- Shows appropriate banner based on connection status
- Banner can be dismissed (stored in component state)

### Profile API (`app/api/users/profile/route.ts`)
- Updated to include `gmailRefreshToken` in the response
- This allows the dashboard to check if Gmail is connected

## User Flow

### New User Registration
1. User creates account
2. Redirected to profile/dashboard
3. Sees dynamic banner prompting to connect Gmail
4. Clicks "Go to Profile Settings"
5. Connects Gmail account
6. Returns to dashboard
7. Success banner appears

### Existing User
1. User logs in and sees the dashboard
2. If Gmail is not connected:
   - Banner appears at the top
   - User clicks "Go to Profile Settings"
   - Redirected to `/user` page
   - User clicks "Connect Gmail Account"
   - Completes OAuth flow
   - Returns to dashboard
   - Success banner appears
3. If Gmail is already connected:
   - Green success banner appears (can be dismissed)

## Banner Designs

### Dashboard - Not Connected Banner
- Background: Blue to green gradient (`from-blue-50 to-green-50`)
- Border: Green left border (4px)
- Icon: Gmail icon
- Actions: "Go to Profile Settings" (primary green button), "Dismiss" (secondary gray button), "X" (close)
- Size: Full width, prominent

### Dashboard - Connected Banner
- Background: Green to emerald gradient (`from-green-50 to-emerald-50`)
- Border: Green left border (4px)
- Icon: Checkmark circle
- Actions: "X" (close)
- Size: Compact, single line

## Customization

The banners can be customized by modifying:
- Colors: Change the gradient classes
- Text: Update the message content
- Persistence: Dashboard banner uses component state, could be changed to localStorage
- Position: Adjust placement in the component tree
- Styling: Modify padding, margins, shadows, etc.
