# UI Update Plan - Apply New Design to Existing Pages

## Current Status
✅ **Completed:**
- Global CSS with pastel colors (green/yellow)
- User Dashboard with sidebar
- Landing page
- Sign in/Register pages
- White background throughout
- Black text
- Pastel buttons

## Pages That Need UI Update

### 1. Meeting Detail Pages (Keep ALL functionality, just update colors)

#### `/meetings/[id]/agenda/page.tsx`
**Functionality to Keep:**
- Create/edit agenda items
- Add objectives
- Add preparation required
- Add action items
- Save agenda
- Generate PDF
- Email agenda
- WhatsApp sharing
- View saved agendas history

**UI Changes Needed:**
- Background: `bg-slate-900` → `bg-white`
- Text colors: `text-slate-300` → `text-gray-800`
- Cards: Dark backgrounds → White with `border-gray-200`
- Buttons: Blue/Purple → Pastel green/yellow
- Input fields: Dark → White with gray borders
- Modals: Dark → White

#### `/meetings/[id]/minutes/page.tsx`
**Functionality to Keep:**
- Record meeting minutes
- Add discussion points
- Add decisions made
- Add action items with assignees
- Save minutes
- Generate PDF
- Email minutes

**UI Changes Needed:**
- Same as agenda page
- Keep all forms and functionality
- Update color scheme only

#### `/meetings/[id]/reports/page.tsx`
**Functionality to Keep:**
- View meeting summary
- Download PDF report
- Email report
- View agenda + minutes combined

**UI Changes Needed:**
- Same color updates
- Keep download/email functionality

#### `/meetings/[id]/edit/page.tsx`
**Functionality to Keep:**
- Edit meeting details
- Update title, date, location
- Update participants
- Save changes

**UI Changes Needed:**
- Form styling updates
- Button color changes

### 2. Create Meeting Page

#### `/meetings/new/page.tsx`
**Current Status:** Already updated with new UI ✅
**Has:** White background, pastel buttons, clean forms

## Color Mapping Guide

### Replace These Colors:

**Backgrounds:**
- `bg-slate-900` → `bg-white`
- `bg-gray-900` → `bg-white`
- `bg-black` → `bg-white`
- `bg-slate-800` → `bg-gray-50`

**Text:**
- `text-slate-300` → `text-gray-800`
- `text-slate-400` → `text-gray-600`
- `text-white` → `text-gray-800` (for main content)
- Keep `text-white` only for buttons with colored backgrounds

**Borders:**
- `border-slate-700` → `border-gray-200`
- `border-gray-800` → `border-gray-200`

**Buttons:**
- Primary: `bg-blue-600` → `bg-green-100 text-green-700 hover:bg-green-200`
- Secondary: `bg-gray-700` → `bg-yellow-100 text-yellow-700 hover:bg-yellow-200`
- Danger: `bg-red-600` → `bg-red-100 text-red-700 hover:bg-red-200`

**Cards:**
- `bg-slate-800` → `bg-white border border-gray-200`
- Add shadow: `shadow-sm`

**Input Fields:**
- `bg-slate-800 border-slate-700` → `bg-white border-gray-300`
- Focus: `focus:ring-blue-500` → `focus:ring-green-500`

**Modals:**
- `bg-slate-900` → `bg-white`
- Overlay: `bg-black/50` (keep as is)

## Implementation Steps

1. **Agenda Page** - Most complex, has many features
2. **Minutes Page** - Similar to agenda
3. **Reports Page** - Simpler, mainly display
4. **Edit Page** - Form updates

## Key Principles

1. **Keep ALL functionality** - Don't remove any features
2. **Only change colors** - Don't restructure components
3. **Maintain accessibility** - Ensure good contrast
4. **Test each page** - Verify all buttons/forms work
5. **Preserve data flow** - Don't break API calls

## Testing Checklist

For each page, verify:
- [ ] Page loads correctly
- [ ] All buttons are visible and clickable
- [ ] Forms submit properly
- [ ] Modals open/close
- [ ] PDF generation works
- [ ] Email sending works
- [ ] Data saves correctly
- [ ] Navigation works
- [ ] Mobile responsive
