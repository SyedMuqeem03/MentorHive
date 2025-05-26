import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Utility to remove temporary/demo messages from the database
 * @returns {Promise<number>} The number of deleted messages
 */
export const cleanupTemporaryMessages = async () => {
  try {
    // We'll identify temporary messages as those:
    // 1. Created with a "demo" or "temp" flag, or
    // 2. Having the exact welcome message text for demonstration
    
    const temporaryMessagesQuery = query(
      collection(db, 'messages'),
      where('isTemporary', '==', true)
    );
    
    const welcomeMessagesQuery = query(
      collection(db, 'messages'),
      where('text', '==', 'Hello! This is a demo message to get you started.')
    );
    
    // Get all temporary messages
    const tempSnapshot = await getDocs(temporaryMessagesQuery);
    const welcomeSnapshot = await getDocs(welcomeMessagesQuery);
    
    // Combine both snapshots
    const messagesToDelete = [...tempSnapshot.docs, ...welcomeSnapshot.docs];
    
    if (messagesToDelete.length === 0) {
      return 0;
    }
    
    // Firestore allows up to 500 operations in a batch
    const batchSize = 499;
    let deletedCount = 0;
    
    // Process in batches to avoid hitting limits
    for (let i = 0; i < messagesToDelete.length; i += batchSize) {
      const batch = writeBatch(db);
      const currentBatch = messagesToDelete.slice(i, i + batchSize);
      
      currentBatch.forEach(messageDoc => {
        batch.delete(doc(db, 'messages', messageDoc.id));
      });
      
      await batch.commit();
      deletedCount += currentBatch.length;
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up temporary messages:', error);
    throw error;
  }
};

/**
 * Corrects mentor IDs in messages collection
 * Maps numeric or short mentor IDs to real mentor IDs based on subjectId
 * @returns {Promise<number>} The number of corrected messages
 */
export const correctMentorIds = async () => {
  try {
    // Query for messages with numeric mentor IDs
    const messagesRef = collection(db, 'messages');
    const messagesSnapshot = await getDocs(messagesRef);
    
    let correctedCount = 0;
    const batch = writeBatch(db);
    let batchCount = 0;
    
    const SUBJECT_TO_MENTOR_MAP = {
      'Syo20eOFoyLVGfJu6opHYoVoRFy1': { 
        id: 'Syo20eOFoyLVGfJu6opHYoVoRFy1', 
        name: 'Machine Learning Mentor', 
        email: 'machine@gmail.com'
      },
      'NtFHYdkiduZsUcAXtmTbvHYIka53': { 
        id: 'NtFHYdkiduZsUcAXtmTbvHYIka53', 
        name: 'Environmental Science Mentor', 
        email: 'teacher@gmail.com'
      },
      '7OHzrzbo0FZYSpiMAAz9J5f3fCM2': { 
        id: '7OHzrzbo0FZYSpiMAAz9J5f3fCM2', 
        name: 'Scripting Languages Mentor', 
        email: 'Script@gmail.com'
      },
      'j1rXcFroIPdKcPO6MVpbqW0xebk1': { 
        id: 'j1rXcFroIPdKcPO6MVpbqW0xebk1', 
        name: 'Formal Languages Mentor', 
        email: 'Flat@gmail.com'
      },
      'mZvqjUvNAUZlWxq8dlGx446wa5i1': { 
        id: 'mZvqjUvNAUZlWxq8dlGx446wa5i1', 
        name: 'Artificial Intelligence Mentor', 
        email: 'Artificial@gmail.com'
      },
      'dot6tsUEEBaxgRZwRX2LTx7wIj62': { 
        id: 'dot6tsUEEBaxgRZwRX2LTx7wIj62', 
        name: 'IOMP Mentor', 
        email: 'iopm@gmail.com'
      },
      'uXhkGWF2I6OffMY1d9xknFpdJxp1': { 
        id: 'uXhkGWF2I6OffMY1d9xknFpdJxp1', 
        name: 'IoT Mentor', 
        email: 'teacher@gmail.com'
      }
    };
    
    for (const doc of messagesSnapshot.docs) {
      const data = doc.data();
      let needsUpdate = false;
      
      // Check if we have a subjectId that should be mapped to a real mentor ID
      if (data.subjectId && SUBJECT_TO_MENTOR_MAP[data.subjectId]) {
        // Check participants array for wrong mentor IDs
        if (data.participants && Array.isArray(data.participants)) {
          const updatedParticipants = data.participants.map(p => {
            // If this is a mentor with a numeric/short ID, replace it
            if (p.role === 'mentor' && (!isNaN(p.id) || p.id.length < 5)) {
              return {
                id: SUBJECT_TO_MENTOR_MAP[data.subjectId].id,
                role: 'mentor'
              };
            }
            return p;
          });
          
          // Only update if something changed
          if (JSON.stringify(updatedParticipants) !== JSON.stringify(data.participants)) {
            batch.update(doc.ref, { participants: updatedParticipants });
            needsUpdate = true;
          }
        }
      }
      
      if (needsUpdate) {
        correctedCount++;
        batchCount++;
        
        // Commit batch when it reaches limit
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }
    
    return correctedCount;
  } catch (error) {
    console.error("Error correcting mentor IDs:", error);
    throw error;
  }
};