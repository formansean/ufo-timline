const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'UFO Timeline API'
  });
});

// Sample events endpoint
app.get('/api/events', (req, res) => {
  const sampleEvents = [
    {
      id: '43',
      title: 'Japan Airlines',
      category: 'Sighting',
      date: 'November 17, 1986',
      time: '5:11 pm',
      location: '',
      city: 'Anchorage ',
      state: 'Alaska',
      country: 'United States',
      latitude: '61.2181',
      longitude: '-149.9003',
      craft_type: 'Saucer, Other',
      craft_size: 'Small, Large',
      entity_type: '',
      close_encounter_scale: '1 - Sighting',
      craft_behavior: 'Hover, Fly By, Instantaneous Acceleration',
      physical_effects: 'None Reported',
      witnesses: 'Captain Kenji Terauchi, First Officer Takanori Tamefuji, Flight Engineer Yoshio Tsukuda',
      eyewitness: 'Yes',
      duration: '50 minutes',
      weather: 'Clear Skies',
      photo: 'No',
      video: 'No',
      color: 'Orange',
      sound_or_noise: 'No',
      radar: 'No',
      credibility: '95',
      notoriety: '61',
      telepathic_communication: 'No',
      recurring_sightings: 'No',
      artifacts_or_relics: 'No',
      government_involvement: 'Yes',
      light_characteristics: 'Constant',
      temporal_distortions: 'No',
      media_link: '',
      detailed_summary: 'The Japan Airlines Cargo Flight 1628 incident is one of the most compelling and well-documented UFO encounters in modern aviation history.',
      symbols: 'No',
      likes: 1,
      dislikes: 0
    },
    // Add more sample events as needed
  ];

  res.json({
    events: sampleEvents,
    total: sampleEvents.length,
    page: 1,
    limit: 100
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

app.listen(PORT, () => {
  console.log(`UFO Timeline API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});