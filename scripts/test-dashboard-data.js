// Simple script to test dashboard data creation
// Run this in browser console on the dashboard page

async function createTestData() {
  try {
    console.log('Creating test data...');
    
    const response = await fetch('/api/debug/create-sample-data', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Test data created:', result);
    
    // Refresh the page to see the data
    window.location.reload();
    
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Call the function
createTestData();
