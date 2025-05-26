import { useState } from 'react';
import { 
  Button, Typography, Card, CardContent, TextField, 
  Tabs, Tab, Box, Chip, Avatar, Divider, Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Check as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Typography variant="h3" component="h1" className="mb-8">
        Component Showcase
      </Typography>
      
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} className="mb-6">
        <Tab label="Buttons" />
        <Tab label="Cards" />
        <Tab label="Forms" />
        <Tab label="Notifications" />
      </Tabs>
      
      {activeTab === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardContent>
              <Typography variant="h5" className="mb-4">Button Variants</Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="contained">Primary</Button>
                <Button variant="outlined">Outlined</Button>
                <Button variant="text">Text</Button>
                <Button variant="contained" color="secondary">Secondary</Button>
                <Button variant="contained" color="error">Error</Button>
                <Button variant="contained" disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h5" className="mb-4">Button with Icons</Typography>
              <div className="flex flex-wrap gap-4">
                <Button variant="contained" startIcon={<AddIcon />}>Add New</Button>
                <Button variant="outlined" endIcon={<CheckIcon />}>Confirm</Button>
                <Button 
                  variant="contained" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Gradient Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Other tab content... */}
    </div>
  );
}

export default ComponentShowcase;