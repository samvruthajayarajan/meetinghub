# Update All Email/WhatsApp to Direct Navigation

## Pages to Update:
1. ✅ `/meetings/[id]/page.tsx` - Already done
2. `/agenda/page.tsx` - Agenda page
3. `/meetings/[id]/minutes/page.tsx` - Minutes page
4. `/meetings/[id]/reports/page.tsx` - Reports page
5. `/meetings/[id]/view-minutes/page.tsx` - View minutes page

## Changes Needed:

### For Each Page:
1. Remove modal state variables (`showEmailModal`, `showWhatsAppModal`, `emailRecipients`, `whatsappNumbers`, `sending`)
2. Remove modal handler functions (`handleSendEmail`, `handleSendWhatsApp`)
3. Update button onClick to directly open mailto: or wa.me links
4. Remove modal JSX at the bottom

### Email Button Pattern:
```tsx
onClick={() => {
  const subject = `Subject Here`;
  const body = `Content here`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}}
```

### WhatsApp Button Pattern:
```tsx
onClick={() => {
  const message = `Message here`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}}
```

## Benefits:
- No Gmail OAuth needed
- No server-side email sending
- Users send from their own accounts
- Simpler, faster, more reliable
- Works on all devices
