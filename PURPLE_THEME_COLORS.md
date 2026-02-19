# Purple Theme Color Replacements

## Complete Color Mapping for White & Light Purple Theme

### Background Colors
Replace ALL instances:
- `bg-slate-900` → `bg-gradient-to-br from-purple-50 to-white`
- `bg-slate-800` → `bg-white`
- `bg-slate-700` → `bg-purple-50`
- `bg-slate-600` → `bg-purple-100`
- `bg-slate-500` → `bg-purple-200`
- `bg-gray-900` → `bg-white`
- `bg-gray-800` → `bg-purple-50`
- `bg-gray-700` → `bg-purple-100`

### Text Colors
Replace ALL instances:
- `text-white` → `text-purple-900`
- `text-slate-300` → `text-purple-700`
- `text-slate-400` → `text-purple-600`
- `text-slate-500` → `text-purple-500`
- `text-gray-300` → `text-purple-700`
- `text-gray-400` → `text-purple-600`
- `text-gray-500` → `text-purple-500`

### Border Colors
Replace ALL instances:
- `border-slate-700` → `border-purple-200`
- `border-slate-600` → `border-purple-300`
- `border-slate-500` → `border-purple-400`
- `border-gray-700` → `border-purple-200`
- `border-gray-600` → `border-purple-300`

### Button Colors

**Primary Buttons (Blue/Indigo):**
- `bg-blue-600` → `bg-purple-600`
- `hover:bg-blue-700` → `hover:bg-purple-700`
- `bg-indigo-600` → `bg-purple-600`
- `hover:bg-indigo-700` → `hover:bg-purple-700`

**Secondary Buttons:**
- `bg-cyan-600` → `bg-purple-400`
- `hover:bg-cyan-700` → `hover:bg-purple-500`

**Success Buttons (Keep Green):**
- `bg-green-600` → `bg-emerald-500`
- `hover:bg-green-700` → `hover:bg-emerald-600`

**Warning Buttons (Keep Amber):**
- `bg-yellow-500` → `bg-amber-500`
- `hover:bg-yellow-600` → `hover:bg-amber-600`

**Danger Buttons (Keep Red):**
- `bg-red-600` → `bg-rose-600`
- `hover:bg-red-700` → `hover:bg-rose-700`

**Purple Buttons:**
- `bg-purple-600` → `bg-purple-600` (keep)
- `hover:bg-purple-700` → `hover:bg-purple-700` (keep)

### Ring/Focus Colors
Replace ALL instances:
- `focus:ring-blue-500` → `focus:ring-purple-500`
- `focus:ring-indigo-500` → `focus:ring-purple-500`
- `focus:ring-cyan-500` → `focus:ring-purple-400`
- `ring-blue-500` → `ring-purple-500`

### Gradient Backgrounds
Replace ALL instances:
- `from-blue-600 to-cyan-600` → `from-purple-500 to-pink-500`
- `from-blue-500 to-cyan-500` → `from-purple-400 to-pink-400`
- `from-indigo-500 to-purple-600` → `from-purple-500 to-purple-700`
- `from-blue-900 to-purple-900` → `from-purple-600 to-purple-800`

### Hover States
Replace ALL instances:
- `hover:bg-slate-700` → `hover:bg-purple-100`
- `hover:bg-slate-600` → `hover:bg-purple-200`
- `hover:bg-gray-700` → `hover:bg-purple-100`

### Shadow Colors
Replace ALL instances:
- `shadow-blue-500/20` → `shadow-purple-500/20`
- `shadow-blue-500/30` → `shadow-purple-500/30`
- `shadow-cyan-500/10` → `shadow-purple-400/10`

### Special Background Colors
Replace ALL instances:
- `bg-blue-500/20` → `bg-purple-500/20`
- `bg-blue-500/10` → `bg-purple-500/10`
- `bg-cyan-500/20` → `bg-purple-400/20`
- `bg-indigo-500/20` → `bg-purple-500/20`

### Border Accent Colors
Replace ALL instances:
- `border-blue-500` → `border-purple-500`
- `border-blue-500/30` → `border-purple-500/30`
- `border-cyan-500` → `border-purple-400`
- `border-indigo-500` → `border-purple-500`

## Files to Update

### Priority 1 - Main Pages
1. `app/user/page.tsx` - Dashboard
2. `app/meetings/[id]/reports/page.tsx` - Reports
3. `app/meetings/[id]/agenda/page.tsx` - Agenda
4. `app/meetings/[id]/minutes/page.tsx` - Minutes
5. `app/meetings/new/page.tsx` - Create Meeting

### Priority 2 - Auth Pages
6. `app/auth/signin/page.tsx` - Sign In
7. `app/auth/register/page.tsx` - Register

### Priority 3 - Other Pages
8. `app/meetings/[id]/page.tsx` - Meeting Details
9. `app/meetings/[id]/edit/page.tsx` - Edit Meeting
10. `app/dashboard/page.tsx` - Alternative Dashboard
11. `components/Navbar.tsx` - Navigation

## Search & Replace Commands

Use your editor's find and replace (Ctrl+Shift+H in VS Code) with these patterns:

### Round 1: Backgrounds
```
Find: bg-slate-900
Replace: bg-white

Find: bg-slate-800
Replace: bg-white

Find: bg-slate-700
Replace: bg-purple-50

Find: bg-slate-600
Replace: bg-purple-100
```

### Round 2: Text
```
Find: text-white
Replace: text-purple-900

Find: text-slate-300
Replace: text-purple-700

Find: text-slate-400
Replace: text-purple-600
```

### Round 3: Borders
```
Find: border-slate-700
Replace: border-purple-200

Find: border-slate-600
Replace: border-purple-300
```

### Round 4: Buttons
```
Find: bg-blue-600
Replace: bg-purple-600

Find: hover:bg-blue-700
Replace: hover:bg-purple-700

Find: bg-cyan-600
Replace: bg-purple-400

Find: hover:bg-cyan-700
Replace: hover:bg-purple-500
```

### Round 5: Focus States
```
Find: focus:ring-blue-500
Replace: focus:ring-purple-500

Find: ring-blue-500
Replace: ring-purple-500
```

## Manual Adjustments Needed

After automated replacements, manually check:

1. **Gradients** - Update to purple/pink combinations
2. **Shadows** - Ensure purple tint
3. **Icons** - Check color contrast
4. **Status badges** - Keep semantic colors (green=success, red=error)
5. **Charts/Graphs** - Update to purple palette

## Testing Checklist

- [ ] Dashboard loads with purple theme
- [ ] All buttons are visible and styled correctly
- [ ] Text is readable (good contrast)
- [ ] Forms have proper focus states
- [ ] Modals have correct styling
- [ ] Cards have proper shadows
- [ ] Hover states work correctly
- [ ] Mobile responsive design maintained
