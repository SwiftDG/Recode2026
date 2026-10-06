export type RepoFile = {
  path: string
  label: string
  role: string
  detail: string
  position: { left: string; top: string }
}

export const repoFiles: RepoFile[] = [
  { path: 'src/features/profile/ProfileForm.tsx', label: 'ProfileForm', role: 'Component', detail: 'Collects and submits profile edits.', position: { left: '7%', top: '44%' } },
  { path: 'src/features/profile/profileSchema.ts', label: 'profileSchema', role: 'Validation', detail: 'Defines accepted profile fields.', position: { left: '37%', top: '17%' } },
  { path: 'src/api/profile.ts', label: 'updateProfile', role: 'API client', detail: 'Sends the change to the server.', position: { left: '37%', top: '68%' } },
  { path: 'server/routes/profile.ts', label: 'profile route', role: 'Server route', detail: 'Validates and handles profile updates.', position: { left: '67%', top: '44%' } },
  { path: 'server/db/users.ts', label: 'users table', role: 'Data layer', detail: 'Persists profile fields.', position: { left: '88%', top: '44%' } },
]

export const challenge = {
  title: 'Add an emergency contact to a user profile',
  context: 'The product team needs users to save one contact name and phone number from the existing profile screen.',
  success: [
    'The form collects both fields and validates the phone number.',
    'The API accepts the new fields without overwriting existing profile data.',
    'The server persists the contact and returns it to the client.',
  ],
}

export const modelPlan = `I would add the two inputs in ProfileForm.tsx and include them in the request sent by updateProfile. I would also add an emergencyContact object to profileSchema.ts so empty names or invalid phone numbers cannot be submitted. Then I would update the server route and user data update so the contact is saved, and confirm the returned profile populates the form after refresh.`

export const initialPlan = `I would add emergency contact name and phone fields to ProfileForm.tsx, then send both values in the existing updateProfile request.`

export const review = {
  covered: ['Profile form input', 'Client request'],
  missed: [
    { title: 'Validation contract', text: 'The request currently has no rule for a partial contact or malformed phone number.', file: 'src/features/profile/profileSchema.ts' },
    { title: 'Server acceptance', text: 'The server route must accept and validate the new object before it reaches persistence.', file: 'server/routes/profile.ts' },
    { title: 'Data persistence', text: 'The user update must store the contact without replacing unrelated profile fields.', file: 'server/db/users.ts' },
  ],
}
