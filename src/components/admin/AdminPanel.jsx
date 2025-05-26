import { cleanupTemporaryMessages } from '../../utils/cleanupUtils';

// Add this to your AdminPanel component
const handleCleanupTemporaryMessages = async () => {
  try {
    setIsCleaning(true);
    const deletedCount = await cleanupTemporaryMessages();
    toast.success(`Successfully deleted ${deletedCount} temporary messages`);
  } catch (error) {
    toast.error(`Error cleaning up messages: ${error.message}`);
  } finally {
    setIsCleaning(false);
  }
};

// Add a button in your UI
<Button
  variant="contained"
  color="secondary"
  startIcon={<CleanupIcon />}
  onClick={handleCleanupTemporaryMessages}
  disabled={isCleaning}
>
  {isCleaning ? 'Cleaning...' : 'Remove Temporary Messages'}
</Button>