// Debug utility to test authentication and database connectivity
// Run this in your browser console or as a test script

export async function testBookCreationAuth() {
  try {
    console.log('🔍 Testing Book Creation Authentication...');

    // Test 1: Create a test book first
    console.log('📚 Step 1: Creating test book...');
    const createResponse = await fetch('/api/books/creation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Book',
        profileIds: [], // Empty for testing
      }),
    });

    console.log('Create Response Status:', createResponse.status);
    const createResult = await createResponse.json();
    console.log('Create Result:', createResult);

    if (!createResponse.ok) {
      console.error('❌ Failed to create test book');
      return;
    }

    const bookId = createResult.book?.id;
    if (!bookId) {
      console.error('❌ No book ID returned');
      return;
    }

    console.log('✅ Test book created with ID:', bookId);

    // Test 2: Try to update the theme
    console.log('🎨 Step 2: Testing theme update...');
    const themeResponse = await fetch('/api/books/creation', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookId,
        theme: 'Test Adventure Theme',
      }),
    });

    console.log('Theme Update Status:', themeResponse.status);
    const themeResult = await themeResponse.json();
    console.log('Theme Update Result:', themeResult);

    if (themeResponse.ok) {
      console.log('✅ Theme update successful!');
    } else {
      console.error('❌ Theme update failed:', themeResult.error);
    }

    return {
      createSuccess: createResponse.ok,
      themeUpdateSuccess: themeResponse.ok,
      bookId,
      errors: {
        create: createResponse.ok ? null : createResult.error,
        themeUpdate: themeResponse.ok ? null : themeResult.error,
      },
    };
  } catch (error) {
    console.error('🚨 Test failed with exception:', error);
    return {
      createSuccess: false,
      themeUpdateSuccess: false,
      bookId: null,
      errors: {
        exception: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Simple auth check function
export async function checkAuthStatus() {
  try {
    console.log('🔐 Checking authentication status...');

    const response = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include',
    });

    console.log('Auth check status:', response.status);

    if (response.ok) {
      const user = await response.json();
      console.log('✅ User authenticated:', user);
      return user;
    } else {
      console.log('❌ User not authenticated');
      return null;
    }
  } catch (error) {
    console.error('🚨 Auth check failed:', error);
    return null;
  }
}

// Quick database column check (for debugging)
export function logDatabaseMigrationStatus() {
  console.log(`
📋 Database Migration Checklist:

1. ✅ Run SUPABASE_INITIAL_MIGRATION.sql
   - Creates books table with basic columns
   - Sets up RLS policies

2. 🔧 Run SUPABASE_BOOK_CREATION_MIGRATION.sql  
   - Adds theme, qualities, magical_details columns
   - This is likely MISSING if you're getting errors

3. 📝 Run SUPABASE_AUTH_SETUP.sql (optional)
   - Creates profiles table
   - Enhanced auth policies

4. 🗂️ Run SUPABASE_BUCKET_CREATION.sql (for images)
   - Creates storage buckets

To test: Run testBookCreationAuth() in your browser console
`);
}

// Call this in browser console to debug
if (typeof window !== 'undefined') {
  (window as any).debugBookAuth = {
    testBookCreationAuth,
    checkAuthStatus,
    logDatabaseMigrationStatus,
  };
  console.log('🛠️ Debug tools available: window.debugBookAuth');
}
