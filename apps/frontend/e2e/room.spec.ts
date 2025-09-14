import { test, expect } from '@playwright/test';

test.describe('Planning Poker Room', () => {
  test('Two users can join the same room and vote', async ({ browser }) => {
    // Create two browser contexts for different users
    const moderatorContext = await browser.newContext();
    const participantContext = await browser.newContext();
    
    // Create pages for each user
    const moderatorPage = await moderatorContext.newPage();
    const participantPage = await participantContext.newPage();
    
    // Moderator creates a room
    await moderatorPage.goto('/');
    await moderatorPage.waitForLoadState('networkidle');
    
    await moderatorPage.fill('input#userName', 'Moderator User');
    await moderatorPage.fill('input#roomName', 'Test Room');
    await moderatorPage.click('button[type="submit"]');
    
    // Get the room ID from the URL
    await moderatorPage.waitForURL(/\/room\/.+/);
    const url = moderatorPage.url();
    const roomId = url.split('/').pop();
    
    // Participant joins the room
    await participantPage.goto('/');
    await participantPage.waitForLoadState('networkidle');
    
    await participantPage.click('button:has-text("Join Room")');
    await participantPage.fill('input#userNameJoin', 'Participant User');
    await participantPage.fill('input#roomId', roomId!);
    await participantPage.click('button:has-text("Join Room")');
    
    // Wait for participant to enter the room
    await participantPage.waitForURL(`/room/${roomId}`);
    
    // Verify both users are in the room
    await expect(moderatorPage.locator('text=Moderator User')).toBeVisible();
    await expect(moderatorPage.locator('text=Participant User')).toBeVisible();
    await expect(participantPage.locator('text=Moderator User')).toBeVisible();
    await expect(participantPage.locator('text=Participant User')).toBeVisible();
    
    // Moderator adds a story
    await moderatorPage.click('button:has-text("+ Add")');
    await moderatorPage.fill('input#title', 'Test Story');
    await moderatorPage.fill('textarea#description', 'This is a test story for estimation');
    await moderatorPage.click('button:has-text("Create Story")');
    
    // Verify story is visible to both users
    await expect(moderatorPage.locator('text=Test Story')).toBeVisible();
    await expect(participantPage.locator('text=Test Story')).toBeVisible();
    
    // Both users vote
    await moderatorPage.locator('.vote-card:has-text("5")').click();
    await participantPage.locator('.vote-card:has-text("8")').click();
    
    // Verify both users show voting status
    await expect(moderatorPage.locator('text=You voted: 5')).toBeVisible();
    await expect(participantPage.locator('text=You voted: 8')).toBeVisible();
    
    // Moderator reveals votes
    await moderatorPage.click('button:has-text("Reveal Votes")');
    
    // Verify votes are revealed to both users
    await expect(moderatorPage.locator('text=Average')).toBeVisible();
    await expect(moderatorPage.locator('text=Minimum')).toBeVisible();
    await expect(moderatorPage.locator('text=Maximum')).toBeVisible();
    await expect(participantPage.locator('text=Average')).toBeVisible();
    
    // Clean up
    await moderatorContext.close();
    await participantContext.close();
  });
});
