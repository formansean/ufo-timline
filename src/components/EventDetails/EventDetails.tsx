'use client';

import React, { useState } from 'react';
import { UFOEvent, DeepDiveContent } from '@/types/event';
import { CATEGORY_COLORS } from '@/constants/categories';

interface EventDetailsProps {
  event?: UFOEvent | null;
  onClose?: () => void;
  className?: string;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  onClose,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<string>('info');
  
  if (!event) {
    return (
      <div className={`event-details-placeholder p-6 text-center text-gray-500 ${className}`}>
        Select an event to view details
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]?.base || '#999999';
  
  // Check if there's deep dive content
  const hasDeepDive = event.deep_dive_content && 
    Object.keys(event.deep_dive_content).length > 0;
  
  const deepDiveContent = event.deep_dive_content as DeepDiveContent | undefined;
  
  const tabs = [
    { id: 'info', label: 'Event Info', icon: '📊' },
    ...(hasDeepDive ? [{ id: 'deepdive', label: 'Deep Dive', icon: '🔍' }] : [])
  ];

  const renderDeepDiveTab = () => {
    if (!deepDiveContent) return null;

    const contentTabs = Object.keys(deepDiveContent).filter(key => 
      deepDiveContent[key as keyof DeepDiveContent]?.length
    );

    if (contentTabs.length === 0) return <div>No deep dive content available.</div>;

    return (
      <div className="deep-dive-content">
        <div className="flex border-b mb-4">
          {contentTabs.map((contentType) => (
            <button
              key={contentType}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === contentType 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab(contentType)}
            >
              {contentType}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {contentTabs.map((contentType) => (
            <div
              key={contentType}
              className={activeTab === contentType ? 'block' : 'hidden'}
            >
              {renderContentType(contentType, deepDiveContent[contentType as keyof DeepDiveContent])}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContentType = (type: string, content: any) => {
    if (!content) return null;

    switch (type) {
      case 'Videos':
        return (
          <div className="videos-content space-y-4">
            {content.map((item: any, index: number) => (
              <div key={index} className="video-item">
                {item.content?.video?.map((video: any, vIndex: number) => (
                  <div key={vIndex} className="mb-4">
                    <a 
                      href={video.video_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Watch Video {vIndex + 1}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case 'Images':
        return (
          <div className="images-content">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {content.map((item: any, index: number) => {
                if (item.type === 'slider' && Array.isArray(item.content)) {
                  return item.content.map((imageUrl: string, imgIndex: number) => (
                    <div key={`${index}-${imgIndex}`} className="image-item">
                      <img 
                        src={imageUrl} 
                        alt={`Event image ${imgIndex + 1}`}
                        className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                        onClick={() => window.open(imageUrl, '_blank')}
                      />
                    </div>
                  ));
                }
                return null;
              })}
            </div>
          </div>
        );

      case 'Reports':
        return (
          <div className="reports-content space-y-4">
            {content.map((item: any, index: number) => {
              if (item.type === 'report' && item.content) {
                return (
                  <div key={index} className="report-item border rounded p-4">
                    <h4 className="font-semibold">{item.content.title}</h4>
                    <a 
                      href={item.content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Report
                    </a>
                    {item.content.thumbnail && (
                      <img 
                        src={item.content.thumbnail} 
                        alt="Report thumbnail"
                        className="mt-2 w-20 h-20 object-cover rounded"
                      />
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        );

      case 'News Coverage':
        return (
          <div className="news-content space-y-4">
            {content.map((item: any, index: number) => (
              <div key={index} className="news-item border rounded p-4">
                <h4 className="font-semibold">{item.content?.title || `News Item ${index + 1}`}</h4>
                <p className="text-sm text-gray-600">{item.content?.source}</p>
                <a 
                  href={item.content?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Read Article
                </a>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Content type {type} not supported</div>;
    }
  };

  return (
    <div className={`event-details bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="event-header p-6 border-b" style={{ borderLeftColor: categoryColor, borderLeftWidth: '4px' }}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{event.title.toUpperCase()}</h2>
            <p className="text-lg text-gray-600">{event.date}</p>
            <p className="text-gray-500">
              {[event.city, event.state, event.country].filter(Boolean).join(', ')}
            </p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs border-b">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content p-6">
        {activeTab === 'info' && (
          <div className="event-info">
            {/* Basic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Time:</span> {event.time || 'Unknown'}</div>
                  <div><span className="font-medium">Category:</span> {event.category}</div>
                  <div><span className="font-medium">Duration:</span> {event.duration || 'Unknown'}</div>
                  <div><span className="font-medium">Weather:</span> {event.weather || 'Unknown'}</div>
                  <div><span className="font-medium">Witnesses:</span> {event.witnesses || 'Unknown'}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Craft Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Type:</span> {event.craft_type || 'Unknown'}</div>
                  <div><span className="font-medium">Size:</span> {event.craft_size || 'Unknown'}</div>
                  <div><span className="font-medium">Behavior:</span> {event.craft_behavior || 'Unknown'}</div>
                  <div><span className="font-medium">Color:</span> {event.color || 'Unknown'}</div>
                  <div><span className="font-medium">Sound:</span> {event.sound_or_noise || 'Unknown'}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Evidence</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Photos:</span> {event.photo || 'No'}</div>
                  <div><span className="font-medium">Video:</span> {event.video || 'No'}</div>
                  <div><span className="font-medium">Radar:</span> {event.radar || 'No'}</div>
                  <div><span className="font-medium">Physical Effects:</span> {event.physical_effects || 'None Reported'}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Investigation</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Credibility:</span> {event.credibility || 'Unknown'}/100</div>
                  <div><span className="font-medium">Notoriety:</span> {event.notoriety || 'Unknown'}/100</div>
                  <div><span className="font-medium">Government Involvement:</span> {event.government_involvement || 'Unknown'}</div>
                  <div><span className="font-medium">CE Scale:</span> {event.close_encounter_scale || 'Unknown'}</div>
                </div>
              </div>
            </div>

            {/* Detailed Summary */}
            {event.detailed_summary && (
              <div className="detailed-summary">
                <h3 className="font-semibold text-gray-800 mb-3">Detailed Summary</h3>
                <div className="prose max-w-none text-gray-700 text-sm leading-relaxed">
                  {event.detailed_summary.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* User Ratings */}
            <div className="user-ratings mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 mb-3">Community Rating</h3>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50">
                  👍 <span>{event.likes}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50">
                  👎 <span>{event.dislikes}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deepdive' && renderDeepDiveTab()}
      </div>
    </div>
  );
};