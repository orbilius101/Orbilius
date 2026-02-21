# Firebase Migration Code Examples

Quick reference for migrating Supabase code to Firebase.

## Authentication

### Sign Up

```typescript
// BEFORE - Supabase
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { role, first_name, last_name },
  },
});

// AFTER - Firebase
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { createDocument } from './utils/firebaseHelpers';

const userCredential = await createUserWithEmailAndPassword(auth, email, password);
await sendEmailVerification(userCredential.user);
await createDocument(
  'users',
  {
    email,
    first_name,
    last_name,
    user_type: role,
  },
  userCredential.user.uid
);
```

### Sign In

```typescript
// BEFORE - Supabase
const { data, error } = await supabase.auth.signInWithPassword({ email, password });
const user = data.user;

// AFTER - Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';

const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;
```

### Sign Out

```typescript
// BEFORE - Supabase
await supabase.auth.signOut();

// AFTER - Firebase
import { signOut } from 'firebase/auth';
await signOut(auth);
```

### Get Current User

```typescript
// BEFORE - Supabase
const {
  data: { user },
} = await supabase.auth.getUser();

// AFTER - Firebase
const user = auth.currentUser;
// or listen to auth state
import { onAuthStateChanged } from 'firebase/auth';
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
  } else {
    // User is signed out
  }
});
```

### Password Reset

```typescript
// BEFORE - Supabase
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});

// AFTER - Firebase
import { sendPasswordResetEmail } from 'firebase/auth';
await sendPasswordResetEmail(auth, email, {
  url: `${window.location.origin}/reset-password`,
});
```

## Database Queries

### Select All

```typescript
// BEFORE - Supabase
const { data, error } = await supabase.from('projects').select('*');

// AFTER - Firebase
import { getDocuments } from './utils/firebaseHelpers';

const { data, error } = await getDocuments('projects');
```

### Select with Filter

```typescript
// BEFORE - Supabase
const { data, error } = await supabase.from('projects').select('*').eq('student_id', userId);

// AFTER - Firebase
import { getDocuments, buildConstraints } from './utils/firebaseHelpers';

const { data, error } = await getDocuments(
  'projects',
  buildConstraints({ eq: { student_id: userId } })
);
```

### Select Single Document

```typescript
// BEFORE - Supabase
const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

// AFTER - Firebase
import { getDocument } from './utils/firebaseHelpers';

const { data, error } = await getDocument('users', userId);
```

### Select with Order and Limit

```typescript
// BEFORE - Supabase
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('teacher_id', teacherId)
  .order('created_at', { ascending: false })
  .limit(10);

// AFTER - Firebase
import { getDocuments, buildConstraints } from './utils/firebaseHelpers';

const { data, error } = await getDocuments(
  'projects',
  buildConstraints({
    eq: { teacher_id: teacherId },
    orderBy: { field: 'created_at', direction: 'desc' },
    limit: 10,
  })
);
```

### Insert

```typescript
// BEFORE - Supabase
const { data, error } = await supabase
  .from('projects')
  .insert({
    student_id: userId,
    project_title: title,
    grade: grade,
  })
  .select()
  .single();

// AFTER - Firebase
import { createDocument } from './utils/firebaseHelpers';

const { data, error } = await createDocument('projects', {
  student_id: userId,
  project_title: title,
  grade: grade,
});
```

### Update

```typescript
// BEFORE - Supabase
const { data, error } = await supabase
  .from('projects')
  .update({ step1_status: 'Approved' })
  .eq('project_id', projectId);

// AFTER - Firebase
import { updateDocument } from './utils/firebaseHelpers';

const { data, error } = await updateDocument('projects', projectId, {
  step1_status: 'Approved',
});
```

### Delete

```typescript
// BEFORE - Supabase
const { error } = await supabase.from('projects').delete().eq('project_id', projectId);

// AFTER - Firebase
import { deleteDocument } from './utils/firebaseHelpers';

const { error } = await deleteDocument('projects', projectId);
```

### Complex Query (Multiple Filters)

```typescript
// BEFORE - Supabase
const { data, error } = await supabase
  .from('projects')
  .select('*, users!student_id(first_name, last_name, email)')
  .eq('teacher_id', teacherId)
  .in('current_step_status', ['Submitted', 'In Review']);

// AFTER - Firebase
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const projectsRef = collection(db, 'projects');
const q = query(
  projectsRef,
  where('teacher_id', '==', teacherId),
  where('current_step_status', 'in', ['Submitted', 'In Review'])
);

const querySnapshot = await getDocs(q);
const data = [];

for (const docSnapshot of querySnapshot.docs) {
  const projectData = { id: docSnapshot.id, ...docSnapshot.data() };

  // Manually fetch related user data (Firestore doesn't have joins)
  if (projectData.student_id) {
    const { data: userData } = await getDocument('users', projectData.student_id);
    projectData.student = userData;
  }

  data.push(projectData);
}
```

## File Storage

### Upload File

```typescript
// BEFORE - Supabase
const { data, error } = await supabase.storage
  .from('project-files')
  .upload(`${studentId}/${projectId}/${fileName}`, file);

// AFTER - Firebase
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

const storageRef = ref(storage, `project-files/${studentId}/${projectId}/${fileName}`);
await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(storageRef);
```

### Download File URL

```typescript
// BEFORE - Supabase
const { data, error } = await supabase.storage.from('project-files').createSignedUrl(filePath, 60);
const url = data?.signedUrl;

// AFTER - Firebase
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

const storageRef = ref(storage, `project-files/${filePath}`);
const url = await getDownloadURL(storageRef);
// Note: Firebase download URLs don't expire by default
// For temporary URLs, use Firebase Admin SDK on backend
```

### Delete File

```typescript
// BEFORE - Supabase
await supabase.storage.from('project-files').remove([filePath]);

// AFTER - Firebase
import { ref, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';

const storageRef = ref(storage, `project-files/${filePath}`);
await deleteObject(storageRef);
```

### Download File as Blob

```typescript
// BEFORE - Supabase
const { data, error } = await supabase.storage.from('project-files').download(filePath);

// AFTER - Firebase
import { ref, getBlob } from 'firebase/storage';
import { storage } from './firebaseConfig';

const storageRef = ref(storage, `project-files/${filePath}`);
const blob = await getBlob(storageRef);
```

## Advanced Patterns

### Realtime Subscriptions

```typescript
// BEFORE - Supabase
const subscription = supabase
  .channel('projects')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();

// AFTER - Firebase
import { collection, onSnapshot } from 'firebase/firestore';

const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      console.log('New project:', change.doc.data());
    }
    if (change.type === 'modified') {
      console.log('Modified project:', change.doc.data());
    }
    if (change.type === 'removed') {
      console.log('Removed project:', change.doc.data());
    }
  });
});

// Clean up listener
unsubscribe();
```

### Batch Operations

```typescript
// BEFORE - Supabase
const { data, error } = await supabase
  .from('projects')
  .insert([{ title: 'Project 1' }, { title: 'Project 2' }, { title: 'Project 3' }]);

// AFTER - Firebase
import { writeBatch, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const batch = writeBatch(db);

batch.set(doc(db, 'projects', 'project1'), { title: 'Project 1' });
batch.set(doc(db, 'projects', 'project2'), { title: 'Project 2' });
batch.set(doc(db, 'projects', 'project3'), { title: 'Project 3' });

await batch.commit();
```

## Common Gotchas

### 1. No Joins in Firestore

Firestore doesn't support SQL-like joins. You need to:

- Fetch related data separately
- Denormalize data (duplicate data across collections)
- Use subcollections for nested data

### 2. User ID Consistency

```typescript
// Supabase: auth.users.id is UUID
// Firebase: auth.currentUser.uid is string
// Make sure to use uid consistently as document IDs in Firestore
```

### 3. Timestamps

```typescript
// BEFORE - Supabase returns ISO strings
const createdAt = data.created_at; // "2024-01-01T00:00:00Z"

// AFTER - Firebase returns Timestamp objects
import { Timestamp } from 'firebase/firestore';
const createdAt = data.created_at.toDate(); // JavaScript Date object
```

### 4. Array Queries

```typescript
// BEFORE - Supabase
.contains('tags', ['javascript'])

// AFTER - Firebase
import { where } from 'firebase/firestore';
where('tags', 'array-contains', 'javascript')
```

### 5. Case Sensitivity

```typescript
// Firestore is case-sensitive for field names
// Make sure field names match exactly
// 'user_type' !== 'User_Type'
```
