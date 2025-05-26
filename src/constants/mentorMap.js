// Subject ID to mentor mapping
export const SUBJECT_TO_MENTOR_MAP = {
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

// Helper function to get mentor ID from various inputs
export const getMentorId = (input) => {
  // Direct match for Firebase IDs
  if (SUBJECT_TO_MENTOR_MAP[input]) {
    return SUBJECT_TO_MENTOR_MAP[input].id;
  }
  
  // For numeric IDs (1-based index)
  if (!isNaN(input) && String(input).length < 10) {
    const mentorsList = Object.values(SUBJECT_TO_MENTOR_MAP);
    const index = parseInt(input) - 1;
    
    if (mentorsList[index]) {
      return mentorsList[index].id;
    }
  }
  
  // Match by name
  const inputLower = String(input).toLowerCase();
  const matchingMentor = Object.values(SUBJECT_TO_MENTOR_MAP).find(m => 
    m.name.toLowerCase().includes(inputLower) || 
    m.email.toLowerCase().includes(inputLower)
  );
  
  if (matchingMentor) {
    return matchingMentor.id;
  }
  
  // Fallback to first mentor ID
  return Object.values(SUBJECT_TO_MENTOR_MAP)[0].id;
};